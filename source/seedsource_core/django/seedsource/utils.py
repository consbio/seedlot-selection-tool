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

    service = Service.objects.get(name='{}_dem'.format(region.name))
    variable = service.variable_set.all().get()

    with Dataset(os.path.join(settings.NC_SERVICE_DATA_ROOT, service.data_path)) as ds:
        data = ds.variables[variable.variable]

        cell_size = (
            float(variable.full_extent.width) / data.shape[1],
            float(variable.full_extent.height) / data.shape[0]
        )

        cell_index = [
            int(float(point.x - variable.full_extent.xmin) / cell_size[0]),
            int(float(point.y - variable.full_extent.ymin) / cell_size[1])
        ]

        y_increasing = data[0][1] > data[0][0]

        if not y_increasing:
            cell_index[1] = data.shape[0] - cell_index[1] - 1

        try:
            return data[cell_index[1]][cell_index[0]]
        except IndexError:
            return None


def get_regions_for_point(point):
    regions = Region.objects.filter(polygons__intersects=point)
    return sorted(list(regions), key=lambda r: point.distance(r.polygons.centroid))
