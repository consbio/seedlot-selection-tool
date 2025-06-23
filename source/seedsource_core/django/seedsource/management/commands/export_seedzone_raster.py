import errno
import json
import math
import os
import time
from collections import defaultdict
import csv
import warnings

from django.conf import settings
from django.core.management import BaseCommand, CommandError
from django.contrib.gis.db.models.functions import Area
import numpy
from netCDF4 import Dataset
from progress.bar import Bar
from pyproj import Proj
from rasterio.features import rasterize
from rasterio import windows
from trefoil.netcdf.crs import set_crs
from trefoil.utilities.window import Window

from seedsource_core.django.seedsource.models import SeedZone, Region, ZoneSource

from ..constants import VARIABLES
from ..utils import get_regions_for_zone, calculate_pixel_area, generate_missing_bands
from ..dataset import (
    ElevationDataset,
    ClimateDatasets,
)
from ..statswriter import StatsWriters
from ..zoneconfig import ZoneConfig


NODATA = 65535


class Command(BaseCommand):
    help = "Export seed zone / elevation band rasters within a region.  You must manually select the right seedzones for each region"

    def add_arguments(self, parser):
        parser.add_argument("output_directory", nargs=1, type=str)

        parser.add_argument("region_name", nargs=1, type=str)

        parser.add_argument(
            "--zones",
            dest="zoneset",
            default=None,
            help="Comma delimited list of zones sets to analyze. (default is to analyze all available zone sets)",
        )

    def handle(self, output_directory, region_name, zoneset, *args, **kwargs):
        output_directory = output_directory[0]
        region_name = region_name[0]

        if zoneset is None or zoneset.strip() == "":
            sources = ZoneSource.objects.all().order_by("name")
            if len(sources) == 0:
                raise CommandError("No zonesets available")

        else:
            sources = ZoneSource.objects.filter(name__in=zoneset.split(",")).order_by("name")
            if len(sources) == 0:
                raise CommandError("No zonesets available to analyze that match --zones values")

        region = Region.objects.filter(name=region_name)
        if not region.exists():
            raise CommandError("Region {} is not available".format(region_name))

        region = region.first()

        ### Create output directories
        if not os.path.exists(output_directory):
            os.makedirs(output_directory)

        with ElevationDataset() as elevation_ds:
            elevation_ds.load_region(region.name)

            for source in sources:
                all_species = [e["species"] for e in source.seedzone_set.values("species").distinct()]

                for species in all_species:
                    zones = source.seedzone_set.filter(species=species).order_by("zone_id")

                    out_index = 0
                    zone_ids = []
                    zone_input_ids = []
                    out = numpy.empty(shape=elevation_ds.data.shape, dtype="uint16")
                    out.fill(NODATA)

                    with ZoneConfig(source.name) as config:
                        for zone in Bar(
                            "Processing {} - {} zones".format(source.name, species), max=source.seedzone_set.count(),
                        ).iter(zones):

                            source_name = zone.source

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

                            nodata_mask = elevation == elevation_ds.nodata_value
                            mask = nodata_mask | zone_mask

                            # Create a 2D array for extracting to new dataset, in integer feet
                            elevation = (
                                numpy.where(~mask, elevation / 0.3048, elevation_ds.nodata_value).round().astype("int")
                            )

                            # if there are no pixels in the mask, skip this zone
                            if elevation.size == 0:
                                continue

                            elevation_data = elevation[elevation != elevation_ds.nodata_value]
                            min_elevation = math.floor(numpy.nanmin(elevation_data))
                            max_elevation = math.ceil(numpy.nanmax(elevation_data))

                            bands = list(config.get_elevation_bands(zone, min_elevation, max_elevation))
                            bands = generate_missing_bands(bands, min_elevation, max_elevation)

                            if not bands:
                                # min / max elevation outside defined bands
                                warnings.warn(
                                    "\nElevation range {} - {} ft outside defined bands\n".format(
                                        min_elevation, max_elevation
                                    )
                                )
                                continue

                            for band in bands:
                                low, high = band[:2]
                                band_mask = (elevation >= low) & (elevation <= high)

                                if not numpy.any(band_mask):
                                    continue

                                # extract actual elevation range within the mask as integer feet
                                band_elevation = elevation.flat[band_mask.flatten()]
                                band_range = [
                                    math.floor(numpy.nanmin(band_elevation)),
                                    math.ceil(numpy.nanmax(band_elevation)),
                                ]

                                # extract 2D version of elevation within the band
                                value = numpy.where((~mask) & band_mask, out_index, out[window],)

                                if not numpy.any(value == out_index):
                                    continue

                                out[window] = value
                                # zone ids are based on actual elevation range
                                zone_ids.append("{}_{}_{}".format(zone.zone_uid, *band_range))
                                # zone_input is based on input elevation range
                                zone_input_ids.append("{}_{}_{}".format(zone.zone_uid, low, high))

                                out_index += 1

                    if out_index > NODATA - 1:
                        raise ValueError("Too many zone / band combinations for uint16")

                    # Find the data window of the zones
                    data_window = (
                        windows.get_data_window(out, NODATA).round_offsets(op="floor").round_lengths(op="ceil")
                    )
                    out = out[data_window.toslices()]
                    data_coords = elevation_ds.coords.slice_by_window(Window(*data_window.toslices()))

                    filename = os.path.join(output_directory, "{}_{}_zones.nc".format(source_name, species))

                    with Dataset(filename, "w", format="NETCDF4") as ds:
                        # create ID variable
                        ds.createDimension("zone", len(zone_ids))
                        id_var = ds.createVariable("zone", str, dimensions=("zone",))
                        id_var[:] = numpy.array(zone_ids)

                        data_coords.add_to_dataset(ds, "longitude", "latitude")
                        data_var = ds.createVariable(
                            "zones", "uint16", dimensions=("latitude", "longitude"), fill_value=NODATA,
                        )
                        data_var[:] = out
                        set_crs(ds, "zones", Proj({"init": "EPSG:4326"}))

                    with open(filename.replace(".nc", ".csv"), "w") as fp:
                        writer = csv.writer(fp)
                        writer.writerow(["value", "zone", "zone_input"])
                        writer.writerows([[i, zone_ids[i], zone_input_ids[i]] for i in range(len(zone_ids))])

