import os

import numpy
import pyproj
from django.core.management.base import BaseCommand
from django.db import transaction
from ncdjango.models import Service, Variable
from netCDF4 import Dataset
from trefoil.geometry.bbox import BBox
from trefoil.render.renderers.stretched import StretchedRenderer
from trefoil.utilities.color import Color
from ..constants import PERIODS

VARS = (
    "MAT",
    "MWMT",
    "MCMT",
    "TD",
    "MAP",
    "MSP",
    "AHM",
    "SHM",
    "DD_0",
    "DD5",
    "DD_18",
    "bFFP",
    "FFP",
    "PAS",
    "EMT",
    "EXT",
    "Eref",
    "CMD",
    "PPT_sm",
    "eFFP",
    "Tave_wt",
    "Tave_sm",
    "PPT_wt",
    "Tmin_sp",
)
WGS84 = "+proj=latlong +datum=WGS84 +no_defs"


class Command(BaseCommand):
    help = (
        "Populates a region's services with a DEM and ClimateNA clipped to the region."
    )

    def add_arguments(self, parser):
        parser.add_argument("region_name", nargs=1, type=str)

    def handle(self, region_name, *args, **options):
        name = region_name[0]

        from django.conf import settings

        BASE_DIR = settings.NC_SERVICE_DATA_ROOT

        # determine extent and lat/lon variable names from DEM
        dem_path = os.path.join(BASE_DIR, "regions", name, "{}_dem.nc".format(name))
        with Dataset(dem_path, "r") as ds:
            dims = ds.dimensions.keys()
            lat = "lat" if "lat" in dims else "latitude"
            lon = "lon" if "lon" in dims else "longitude"
            l = float(ds.variables[lon][:].min())
            b = float(ds.variables[lat][:].min())
            r = float(ds.variables[lon][:].max())
            t = float(ds.variables[lat][:].max())
            extent = BBox((l, b, r, t), projection=pyproj.Proj(WGS84))

        # Generate DEM service
        with transaction.atomic():
            print("Adding {}".format(name))
            print("---")
            print("elevation")

            service_name = "{}_dem".format(name)
            if Service.objects.filter(name__iexact=service_name).exists():
                print("{} already exists, skipping.".format(service_name))
            else:
                dem_service = Service.objects.create(
                    name=service_name,
                    data_path="regions/{name}/{name}_dem.nc".format(name=name),
                    projection=WGS84,
                    full_extent=extent,
                    initial_extent=extent,
                )
                with Dataset(dem_path, "r") as ds:
                    v_min = numpy.nanmin(ds.variables["elevation"][:]).item()
                    v_max = numpy.nanmax(ds.variables["elevation"][:]).item()
                    renderer = StretchedRenderer(
                        [(v_min, Color(0, 0, 0)), (v_max, Color(255, 255, 255))]
                    )
                    Variable.objects.create(
                        service=dem_service,
                        index=0,
                        variable="elevation",
                        projection=WGS84,
                        x_dimension=lon,
                        y_dimension=lat,
                        name="elevation",
                        renderer=renderer,
                        full_extent=extent,
                    )

        # Generate ClimateNA services
        with transaction.atomic():
            for year in PERIODS:

                print("")
                print(year)
                print("---")
                for var in VARS:
                    print(var)

                    service_name = "{}_{}Y_{}".format(name, year, var)
                    if not Service.objects.filter(name__iexact=service_name).exists():
                        data_path = (
                            "regions/{name}/{year}Y/{name}_{year}Y_{var}.nc".format(
                                name=name, year=year, var=var
                            )
                        )

                        if not os.path.exists(os.path.join(BASE_DIR, data_path)):
                            print("{} does not exist, skipping.".format(service_name))
                            continue

                        service = Service.objects.create(
                            name=service_name,
                            data_path=data_path,
                            projection=WGS84,
                            full_extent=extent,
                            initial_extent=extent,
                        )

                        with Dataset(
                            os.path.join(BASE_DIR, service.data_path), "r"
                        ) as ds:
                            dims = ds.dimensions.keys()
                            lat = "lat" if "lat" in dims else "latitude"
                            lon = "lon" if "lon" in dims else "longitude"
                            v_min = numpy.nanmin(ds.variables[var][:]).item()
                            v_max = numpy.nanmax(ds.variables[var][:]).item()
                            renderer = StretchedRenderer(
                                [(v_min, Color(0, 0, 0)), (v_max, Color(255, 255, 255))]
                            )
                            variable = Variable.objects.create(
                                service=service,
                                index=0,
                                variable=var,
                                projection=WGS84,
                                x_dimension=lon,
                                y_dimension=lat,
                                name=var,
                                renderer=renderer,
                                full_extent=extent,
                            )
                    else:
                        print("{} already exists, skipping.".format(service_name))
