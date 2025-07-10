import os

from django.conf import settings
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
    extent = variable.full_extent

    with Dataset(os.path.join(settings.NC_SERVICE_DATA_ROOT, service.data_path)) as ds:
        data = ds.variables[variable.variable]
        x_dim = data.dimensions.index(variable.x_dimension)
        y_dim = data.dimensions.index(variable.y_dimension)

        cell_size = (
            extent.width / data.shape[x_dim],
            extent.height / data.shape[y_dim],
        )
        cell_index = [
            int(float(point.x - extent.xmin) / cell_size[0]),
            int(float(point.y - extent.ymin) / cell_size[1]),
        ]
        y_increasing = (
            ds.variables[variable.y_dimension][1]
            > ds.variables[variable.y_dimension][0]
        )

        if not y_increasing:
            cell_index[1] = data.shape[y_dim] - cell_index[1] - 1

        if x_dim != 0:
            cell_index = cell_index[1], cell_index[0]

        try:
            elevation = data[cell_index]
            return elevation
        except IndexError:
            return None


def get_regions_for_point(point):
    regions = Region.objects.filter(polygons__intersects=point)
    return sorted(list(regions), key=lambda r: point.distance(r.polygons.centroid))
