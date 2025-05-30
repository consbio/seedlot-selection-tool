import errno
import json
import math
import os
import time
from collections import defaultdict
from csv import DictWriter
import warnings

import numpy
from progress.bar import Bar
from django.conf import settings
from django.core.management import BaseCommand, CommandError
from django.contrib.gis.db.models.functions import Area
from rasterio.features import rasterize

from seedsource_core.django.seedsource.models import SeedZone, Region, ZoneSource

from ..constants import PERIODS, VARIABLES
from ..utils import get_regions_for_zone, calculate_pixel_area, generate_missing_bands
from ..dataset import (
    ElevationDataset,
    ClimateDatasets,
)
from ..statswriter import StatsWriters
from ..zoneconfig import ZoneConfig


class Command(BaseCommand):
    help = "Export seed zone statistics and sample data"

    def add_arguments(self, parser):
        parser.add_argument("output_directory", nargs=1, type=str)

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
            help="Comma delimited list of variables analyze. (default is to analyze all available variables: {})".format(
                ",".join(VARIABLES)
            ),
        )

        parser.add_argument(
            "--periods",
            dest="periods",
            default=None,
            help="Comma delimited list of time periods analyze. (default is to analyze all available time periods: {})".format(
                ",".join(PERIODS)
            ),
        )

        parser.add_argument(
            "--seed",
            dest="seed",
            default=None,
            help="Seed for random number generator, to reproduce previous random samples",
            type=int,
        )

    def _write_sample(self, output_directory, variable, id, zone_id, data, low, high):
        sample = data.copy()
        numpy.random.shuffle(sample)
        sample = sample[:1000]

        filename = "{}_{}_{}.txt".format(id, low, high)

        with open(os.path.join(output_directory, "{}_samples".format(variable), filename), "w") as f:
            f.write(",".join(str(x) for x in sample))
            f.write(os.linesep)

    def handle(self, output_directory, zoneset, variables, periods, seed, *args, **kwargs):
        output_directory = output_directory[0]

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
            variables = set(variables.split(","))
            missing = variables.difference(VARIABLES)
            if missing:
                raise CommandError("These variables are not available: {}".format(",".join(missing)))

        if periods is None:
            periods = PERIODS

        else:
            periods = set(periods.split(","))
            missing = periods.difference(PERIODS)
            if missing:
                raise CommandError("These periods are not available: {}".format(",".join(missing)))

        ### Initialize random seed
        if seed is None:
            seed = int(time.time())
            print("Using random seed: {}".format(seed))

        numpy.random.seed(seed)

        ### Create output directories
        if not os.path.exists(output_directory):
            os.makedirs(output_directory)

        for period in periods:
            print("----------------------\nProcessing period {}\n".format(period))

            period_dir = os.path.join(output_directory, period)

            for variable in variables:
                sample_dir = os.path.join(period_dir, "{}_samples".format(variable))
                if not os.path.exists(sample_dir):
                    os.makedirs(sample_dir)

            with StatsWriters(period_dir, variables) as writer:
                for source in sources:
                    zones = source.seedzone_set.annotate(area_meters=Area("polygon")).all().order_by("zone_id")

                    with ZoneConfig(source.name) as config, ElevationDataset() as elevation_ds, ClimateDatasets(
                        period=period, variables=variables
                    ) as climate:
                        for zone in Bar(
                            "Processing {} zones".format(source.name), max=source.seedzone_set.count(),
                        ).iter(zones):

                            # calculate area of zone polygon in acres
                            poly_acres = round(zone.area_meters.sq_m * 0.000247105, 1)
                            zone_xmin, zone_ymin, zone_xmax, zone_ymax = zone.polygon.extent
                            zone_ctr_x = round(((zone_xmax - zone_xmin) / 2) + zone_xmin, 5)
                            zone_ctr_y = round(((zone_ymax - zone_ymin) / 2) + zone_ymin, 5)

                            region = get_regions_for_zone(zone)
                            elevation_ds.load_region(region.name)
                            climate.load_region(region.name)

                            window, coords = elevation_ds.get_read_window(zone.polygon.extent)
                            transform = coords.affine

                            elevation = elevation_ds.data[window]

                            # calculate pixel area based on UTM centered on window
                            pixel_area = round(
                                calculate_pixel_area(transform, elevation.shape[1], elevation.shape[0]) * 0.000247105,
                                1,
                            )

                            zone_mask = rasterize(
                                (json.loads(zone.polygon.geojson),),
                                out_shape=elevation.shape,
                                transform=transform,
                                fill=1,  # mask is True OUTSIDE the zone
                                default_value=0,
                                dtype=numpy.dtype("uint8"),
                            ).astype("bool")

                            # count rasterized pixels
                            raster_pixels = (zone_mask == 0).sum()

                            nodata_mask = elevation == elevation_ds.nodata_value
                            mask = nodata_mask | zone_mask

                            # extract all data not masked out as nodata or outside zone
                            # convert to feet
                            elevation = (elevation[~mask] / 0.3048).round().astype("int")

                            # if there are no pixels in the mask, skip this zone
                            if elevation.size == 0:
                                continue

                            min_elevation = math.floor(numpy.nanmin(elevation))
                            max_elevation = math.ceil(numpy.nanmax(elevation))

                            bands = list(config.get_elevation_bands(zone, min_elevation, max_elevation))
                            bands = generate_missing_bands(bands, min_elevation, max_elevation)

                            if not bands:
                                # min / max elevation outside defined bands
                                raise ValueError(
                                    "Elevation range {} - {} ft outside defined bands\n".format(
                                        min_elevation, max_elevation
                                    )
                                )

                            ### Extract data for each variable within each band
                            for variable, ds in climate.items():
                                # extract data with same shape as elevation above
                                data = ds.data[window][~mask]

                                # count the non-masked data pixels
                                # variables may be masked even if elevation is valid
                                zone_unit_pixels = data[data != ds.nodata_value].size

                                for band in bands:
                                    low, high = band[:2]
                                    band_mask = (elevation >= low) & (elevation <= high)

                                    if not numpy.any(band_mask):
                                        continue

                                    # extract actual elevation range within the mask as integer feet
                                    band_elevation = elevation[band_mask]
                                    band_range = [
                                        math.floor(numpy.nanmin(band_elevation)),
                                        math.ceil(numpy.nanmax(band_elevation)),
                                    ]

                                    # extract data within elevation range
                                    band_data = data[band_mask]

                                    # then apply variable's nodata mask
                                    band_data = band_data[band_data != ds.nodata_value]

                                    if not band_data.size:
                                        continue

                                    writer.write_row(
                                        variable,
                                        zone.zone_uid,
                                        band,
                                        band_range,
                                        band_data,
                                        period=period,
                                        zone_set=zone.source,
                                        species=zone.species.upper() if zone.species != "generic" else zone.species,
                                        zone_unit=zone.zone_id,
                                        zone_unit_poly_acres=poly_acres,
                                        zone_unit_raster_pixels=raster_pixels,
                                        zone_unit_raster_acres=raster_pixels * pixel_area,
                                        zone_unit_pixels=zone_unit_pixels,
                                        zone_unit_acres=zone_unit_pixels * pixel_area,
                                        zone_unit_low=min_elevation,
                                        zone_unit_high=max_elevation,
                                        zone_pixels=band_data.size,
                                        zone_acres=band_data.size * pixel_area,
                                        zone_unit_ctr_x=zone_ctr_x,
                                        zone_unit_ctr_y=zone_ctr_y,
                                        zone_unit_xmin=round(zone_xmin, 5),
                                        zone_unit_ymin=round(zone_ymin, 5),
                                        zone_unit_xmax=round(zone_xmax, 5),
                                        zone_unit_ymax=round(zone_ymax, 5),
                                    )

                                    self._write_sample(
                                        period_dir, variable, zone.zone_uid, zone.zone_id, band_data, *band_range
                                    )
