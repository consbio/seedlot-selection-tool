import glob
import os
import shutil
from tempfile import mkdtemp
from zipfile import ZipFile

import fiona
from django.contrib.gis.geos import LinearRing, Polygon
from django.contrib.gis.geos.collections import MultiPolygon
from django.core.management.base import BaseCommand
from django.db import transaction
from rasterio.warp import transform_geom

from seedsource_core.django.seedsource.models import Region


class Command(BaseCommand):
    help = "Adds a region to the database, using polygon data from the specified shapefile."

    def add_arguments(self, parser):
        parser.add_argument("name", nargs=1, type=str)
        parser.add_argument("file", nargs=1, type=str)

    def handle(self, name, file, *args, **options):
        name = name[0]
        file = file[0]

        if Region.objects.filter(name__iexact=name).exists():
            message = (
                "WARNING: This will replace an existing region with the same name: {}. Do you want to continue? [y/n]"
            ).format(name)
            if input(message).lower() not in {"y", "yes"}:
                return

        temp_dir = None

        try:
            if file.endswith(".zip"):
                temp_dir = mkdtemp()

                with ZipFile(file) as zf:
                    zf.extractall(temp_dir)

                    try:
                        file = glob.glob(os.path.join(temp_dir, "*.shp"))[0]
                    except IndexError:
                        raise ValueError("No shapefile in zip archive")

            polygons = []

            with fiona.open(file, "r") as shp:
                for feature in shp:
                    geometry = transform_geom(shp.crs, {"init": "EPSG:4326"}, feature["geometry"])

                    if geometry["type"] == "MultiPolygon":
                        coordinate_set = geometry["coordinates"]
                    else:
                        coordinate_set = [geometry["coordinates"]]

                    for coordinates in coordinate_set:
                        polygons.append(Polygon(*[LinearRing(x) for x in coordinates]))

            with transaction.atomic():
                Region.objects.filter(name__iexact=name).delete()
                # Buffer by 0 to make polygons valid
                Region.objects.create(name=name, polygons=MultiPolygon(polygons).buffer(0))

        finally:
            if temp_dir is not None:
                try:
                    shutil.rmtree(temp_dir)
                except OSError:
                    pass
