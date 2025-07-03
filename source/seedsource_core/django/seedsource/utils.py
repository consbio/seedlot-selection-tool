import os

from django.conf import settings
from ncdjango.geoprocessing.data import Raster
from ncdjango.models import Service
from netCDF4 import Dataset

from .models import Region


def get_elevation_at_point(point):
    try:
        region = get_regions_for_point(point)[0]
    except IndexError:
        return None

    service = Service.objects.get(name="{}_dem".format(region.name))
    variable = service.variable_set.all().get()

    with Dataset(os.path.join(settings.NC_SERVICE_DATA_ROOT, service.data_path)) as ds:
        data = ds.variables[variable.variable]
        y_values = ds.variables[variable.y_dimension]
        x_dim = data.dimensions.index(variable.x_dimension)
        y_dim = data.dimensions.index(variable.y_dimension)
        raster = Raster(
            data,
            variable.full_extent,
            x_dim,
            y_dim,
            y_increasing=y_values[1] > y_values[0],
        )

        try:
            elevation = raster[raster.index(point.x, point.y)]
            return elevation
        except IndexError:
            return None


def get_regions_for_point(point):
    regions = Region.objects.filter(polygons__intersects=point)
    return sorted(list(regions), key=lambda r: point.distance(r.polygons.centroid))
