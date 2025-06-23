import json
import math
import os
from statistics import mean

import numpy
from django.conf import settings
from django.contrib.gis.geos import Polygon
from django.core.management import BaseCommand, CommandError
from django.db.models import Avg
from ncdjango.models import Service, SERVICE_DATA_ROOT, Variable
from netCDF4 import Dataset
from progress.bar import Bar
from pyproj import Proj
from rasterio.features import rasterize
from rasterio import windows
from seedsource_core.django.seedsource.models import TransferLimit, Region, ZoneSource
from trefoil.geometry.bbox import BBox
from trefoil.netcdf.crs import set_crs

from trefoil.render.renderers.stretched import StretchedRenderer
from trefoil.utilities.color import Color
from trefoil.utilities.window import Window

from ..constants import VARIABLES
from ..utils import (
    get_regions_for_zone,
    calculate_pixel_area,
)
from ..dataset import (
    ElevationDataset,
    ClimateDatasets,
)
from ..zoneconfig import ZoneConfig


PERIODS = ("1961_1990", "1981_2010")


class Command(BaseCommand):
    help = "Calculates default variable transfer limits for each available seed zone"

    def __init__(self, *args, **kwargs):
        self.transfers_by_source = {}

        super().__init__(*args, **kwargs)

    def add_arguments(self, parser):

        parser.add_argument(
            "--zones",
            dest="zoneset",
            default=None,
            help="Comma delimited list of zones sets to analyze. (default is to analyze all available zone sets)",
        )

        parser.add_argument(
            "--variables",
            dest="variables",
            default=None,
            help="Comma delimited list of variables analyze. (default is to analyze all available variables)",
        )

        parser.add_argument(
            "--clear",
            dest="clear",
            action="store_true",
            default=False,
            help="If True, will automatically delete all transfer limits before calculating new ones",
        )

    def _write_limit(self, variable, time_period, zone, data, band, elevation_service):
        """Write the transfer limit to the database for this zone and elevation band.

        NOTE: data must be extracted in advance to only contain non-masked values.

        Parameters
        ----------
        variable : str
            Climate variable
        time_period : str
            time period for the transfer limit
        zone : str
            zone ID
        data : ndarray
            Contains data used to calculate transfer limit stats; must be an
            ndarray of valid values NOT a masked array
        band : list-like
            [min elevation, max elevation, <optional> ]
        elevation_service : Service
            elevation service

        """
        min_value = data.min()
        max_value = data.max()
        transfer = (max_value - min_value) / 2.0
        center = max_value - transfer

        low, high = band[:2]
        label = ""
        if len(band) > 2:
            label = band[2]

        tl = TransferLimit.objects.create(
            variable=variable,
            time_period=time_period,
            zone=zone,
            transfer=transfer,
            center=center,
            low=low,
            high=high,
            label=label,
            elevation=elevation_service,
        )

    def _create_elevation_service(self, zone, band, data, nodata_value, coords):
        low, high = band[:2]
        elevation_service_name = "zones/elevation/{}_{}_{}".format(zone.zone_uid, low, high)

        bbox = coords.bbox

        # Delete and recreate service as needed
        service = Service.objects.filter(name=elevation_service_name)
        if service.exists():
            return service.first()

        rel_path = elevation_service_name + ".nc"
        abs_path = os.path.join(SERVICE_DATA_ROOT, rel_path)

        if not os.path.exists(os.path.dirname(abs_path)):
            os.makedirs(os.path.dirname(abs_path))

        with Dataset(abs_path, "w", format="NETCDF4") as ds:
            coords.add_to_dataset(ds, "longitude", "latitude")
            data_var = ds.createVariable(
                "data", data.dtype, dimensions=("latitude", "longitude"), fill_value=nodata_value,
            )
            data_var[:] = data
            set_crs(ds, "data", Proj("epsg:4326"))

        # extract out unmasked data
        masked_data = data[data != nodata_value]
        renderer = StretchedRenderer(
            [(masked_data.min().item(), Color(46, 173, 60),), (masked_data.max().item(), Color(46, 173, 60),),]
        )

        service = Service.objects.create(
            name=elevation_service_name,
            description="Elevation for zone {}, {} - {}".format(zone.name, low, high),
            data_path=rel_path,
            projection="epsg:4326",
            full_extent=bbox,
            initial_extent=bbox,
        )

        Variable.objects.create(
            service=service,
            index=0,
            variable="data",
            projection="epsg:4326",
            x_dimension="longitude",
            y_dimension="latitude",
            name="data",
            renderer=renderer,
            full_extent=bbox,
        )

        return service

    def handle(self, zoneset, variables, clear, *args, **kwargs):
        if zoneset is None or zoneset.strip() == "":
            sources = ZoneSource.objects.all().order_by("name")
            if len(sources) == 0:
                raise CommandError("No zonesets available to analyze")

        else:
            sources = ZoneSource.objects.filter(name__in=zoneset.split(",")).order_by("name")
            if len(sources) == 0:
                raise CommandError("No zonesets available to analyze that match --zones values")

        if variables is None:
            variables = VARIABLES

        else:
            variables = [v for v in variables.split(",") if v in set(VARIABLES)]
            if len(variables) == 0:
                raise CommandError("No variables available to analyze that match --variables values")

        existing_limits = TransferLimit.objects.filter(zone__zone_source__in=[s.id for s in sources])

        if clear:
            message = "WARNING: This will replace ALL transfer limits. Do you want to continue? [y/n]"
            if input(message).lower() not in {"y", "yes"}:
                return

            TransferLimit.objects.all().delete()

        elif existing_limits.exists():
            message = 'WARNING: This will replace "{}" transfer limits. Do you want to continue? [y/n]'.format(
                [s.name for s in sources]
            )
            if input(message).lower() not in {"y", "yes"}:
                return

            existing_limits.delete()

        for time_period in PERIODS:
            self.transfers_by_source = {}

            for source in sources:
                zones = source.seedzone_set.all().order_by("zone_id")

                with ZoneConfig(source.name) as config, ElevationDataset() as elevation_ds, ClimateDatasets(
                    period=time_period, variables=variables
                ) as climate:

                    for zone in Bar(
                        "Processing {} zones for {}".format(source.name, time_period), max=source.seedzone_set.count(),
                    ).iter(zones):
                        regions = get_regions_for_zone(zone)
                        if elevation_ds.region in regions:
                            region = regions.pop(regions.index(elevation_ds.region))
                        else:
                            try:
                                region = regions.pop(0)
                            except IndexError:
                                raise CommandError(
                                    "The following seedzone has no suitable region: {}".format(zone.zone_uid)
                                )

                        while True:
                            elevation_ds.load_region(region.name)
                            climate.load_region(region.name)

                            window, coords = elevation_ds.get_read_window(zone.polygon.extent)
                            transform = coords.affine

                            elevation = elevation_ds.data[window]

                            zone_mask = rasterize(
                                (json.loads(zone.polygon.geojson),),
                                out_shape=elevation.shape,
                                transform=transform,
                                fill=1,  # mask is True OUTSIDE the zone
                                default_value=0,
                                dtype=numpy.dtype("uint8"),
                            ).astype("bool")

                            # if zone_mask is empty (all True), try again with all_touched=True
                            if zone_mask.all():
                                zone_mask = rasterize(
                                    (json.loads(zone.polygon.geojson),),
                                    out_shape=elevation.shape,
                                    transform=transform,
                                    fill=1,  # mask is True OUTSIDE the zone
                                    default_value=0,
                                    dtype=numpy.dtype("uint8"),
                                    all_touched=True,
                                ).astype("bool")

                            if zone_mask.all():
                                break

                            # extract all data not masked out as nodata or outside zone
                            nodata_mask = elevation == elevation_ds.nodata_value
                            mask = nodata_mask | zone_mask

                            # Create a 2D array for extracting to new dataset, in integer feet
                            elevation2d = (
                                numpy.where(~mask, elevation / 0.3048, elevation_ds.nodata_value).round().astype("int")
                            )

                            # Create a 1D array for quantitative analysis, in integer feet
                            elevation = (elevation[~mask] / 0.3048).round().astype("int")

                            if elevation.size == 0 and regions:
                                region = regions.pop(0)
                                continue
                            break

                        # if still note, this is not really a valid zone
                        if zone_mask.all():
                            continue

                        # If there are no pixels in the mask, skip this zone
                        if elevation.size == 0:
                            continue

                        min_elevation = max(math.floor(numpy.nanmin(elevation)), 0)
                        max_elevation = math.ceil(numpy.nanmax(elevation))

                        bands = list(config.get_elevation_bands(zone, min_elevation, max_elevation))

                        if not bands:
                            # min / max elevation outside defined bands
                            continue

                        for band in bands:
                            low, high = band[:2]
                            band_data_mask = (elevation >= low) & (elevation <= high)

                            if not numpy.any(band_data_mask):
                                continue

                            # extract 2D version of elevation within the band
                            band_elevation2d = numpy.where(
                                (elevation2d != elevation_ds.nodata_value)
                                & (elevation2d >= low)
                                & (elevation2d <= high),
                                elevation2d,
                                elevation_ds.nodata_value,
                                )

                            # extract data window for a smaller output dataset
                            band_window = (
                                windows.get_data_window(band_elevation2d, elevation_ds.nodata_value)
                                    .round_offsets(op="floor")
                                    .round_lengths(op="ceil")
                            )

                            if band_window.height > 1 and band_window.width > 1:
                                band_elevation2d = band_elevation2d[band_window.toslices()]
                                band_coords = coords.slice_by_window(Window(*band_window.toslices()))
                            else:
                                # if band is too small, just use the original mask
                                band_coords = coords

                            elevation_service = self._create_elevation_service(
                                zone, band, band_elevation2d, elevation_ds.nodata_value, band_coords,
                            )

                            for variable, ds in climate.items():
                                # extract data with same shape as elevation above
                                data = ds.data[window][~mask]

                                # extract data within elevation range
                                band_data = data[band_data_mask]

                                # then apply variable's nodata mask
                                band_data = band_data[band_data != ds.nodata_value]

                                # no data in band, skip this band
                                if not band_data.size:
                                    continue

                                self._write_limit(
                                    variable, time_period, zone, band_data, band, elevation_service,
                                )

                # Calculate average transfer limit across zones in source
                for variable in variables:
                    transfers = TransferLimit.objects.filter(
                        zone__zone_source=source, variable=variable, time_period=time_period,
                    ).all()

                    avg_transfer = transfers.aggregate(avg_transfer=Avg("transfer"))["avg_transfer"]

                    transfers.update(avg_transfer=avg_transfer)
