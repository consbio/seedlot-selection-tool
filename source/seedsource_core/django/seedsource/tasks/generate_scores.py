import math
import os

import numpy
from django.conf import settings
from ncdjango.geoprocessing.data import Raster
from ncdjango.geoprocessing.evaluation import Parser, Lexer
from ncdjango.geoprocessing.params import RasterParameter, DictParameter, StringParameter, ParameterCollection
from ncdjango.geoprocessing.workflow import Task
from ncdjango.models import Service
from ncdjango.views import NetCdfDatasetMixin
from netCDF4 import Dataset
from numpy.ma import is_masked
from trefoil.netcdf.variable import SpatialCoordinateVariables

from seedsource_core.django.seedsource.tasks.utils import create_latitude_data
from .constraints import Constraint

NC_SERVICE_DIR = settings.NC_SERVICE_DATA_ROOT
Y_INCREASING = False


class GenerateScores(NetCdfDatasetMixin, Task):
    name = 'sst:generate_scores'
    inputs = [
        StringParameter('region'),
        StringParameter('year'),
        StringParameter('model', required=False),
        DictParameter('variables', required=False),
        DictParameter('functions', required=False),
        DictParameter('constraints', required=False),
        DictParameter('points', required=False)
    ]
    outputs = [RasterParameter('raster_out'), DictParameter('points')]

    def __init__(self):
        self.service = None
        self.dataset = None

    def load_variable_data(self, variable, region, year, model=None):
        if variable == 'LAT':
            with Dataset(os.path.join(NC_SERVICE_DIR, 'regions', region, '{}_dem.nc'.format(region))) as ds:
                return create_latitude_data(SpatialCoordinateVariables.from_dataset(ds))

        if model is not None:
            year = '{model}_{year}'.format(model=model, year=year)

        service = Service.objects.get(
            name='{region}_{year}Y_{variable}'.format(region=region, year=year, variable=variable)
        )
        variable = service.variable_set.first()
        self.service = variable.service
        self.dataset = None
        data = self.get_grid_for_variable(variable)
        return Raster(data, variable.full_extent, 1, 0, Y_INCREASING)

    def apply_constraints(self, data, constraints, region):
        if constraints is None:
            return data

        for constraint in constraints:
            name, kwargs = constraint['name'], constraint['args']
            data = Constraint.by_name(name)(data, region).apply_constraint(**kwargs)

        return data

    def execute(self, region, year, model=None, variables=[], functions=[], constraints=None, points=None):
        data = {}

        points_out = None
        if points:
            points_out = [{**p, 'deltas': {}} for p in points['points']]

        variable_names = {v['name'] for v in variables}

        if points:
            x_col = points['headers']['x']
            y_col = points['headers']['y']

        for func in functions:
            def loader_fn(variable):
                def load():
                    return self.load_variable_data(variable, region, year, model)

                return load

            fn = func['fn']
            names = Lexer().get_names(fn)
            context = {
                **{x: loader_fn(x) for x in names},
                'math_e': math.e
            }
            data[func['name']] = Parser().evaluate(fn, context)
            data.update({k: v for k, v in context.items() if k in variable_names})

        sum_rasters = None
        sum_masks = None

        for item in variables + functions:
            limit = item['limit']
            limit_min = limit['min']
            limit_max = limit['max']
            half = (limit_max - limit_min) / 2
            midpoint = limit_min + half
            factor = 100 / half
            mid_factor = factor * midpoint

            if item['name'] in data:
                raster = data[item['name']]
                del data[item['name']]
            else:
                raster = self.load_variable_data(item['name'], region, year, model)

            if points:
                for i, point in enumerate(points['points']):
                    idx = raster.index(point[x_col], point[y_col])
                    value = raster[idx]
                    value = value.item() if not is_masked(value) else 0

                    if year in ('1961_1990', '1981_2010'):
                        delta = midpoint - value
                    else:
                        delta = value - midpoint

                    points_out[i]['deltas'][item['name']] = delta

            raster = self.apply_constraints(raster, constraints, region)
            extent = raster.extent
            mask = raster.mask if is_masked(raster) else numpy.zeros_like(raster, 'bool')

            mask |= raster < limit_min
            mask |= raster > limit_max

            if sum_masks is not None:
                sum_masks |= mask
            else:
                sum_masks = mask

            raster = raster.view(numpy.ndarray).astype('float32')
            raster *= factor
            raster -= mid_factor
            raster **= 2
            raster = numpy.floor(raster, raster)

            if sum_rasters is not None:
                sum_rasters += raster
            else:
                sum_rasters = raster

        sum_rasters += 0.4
        sum_rasters **= 0.5

        sum_masks |= sum_rasters > 100
        sum_rasters = numpy.ma.masked_where(sum_masks, sum_rasters)
        sum_rasters = 100 - sum_rasters.astype('int8')
        sum_rasters.fill_value = -128

        ret = ParameterCollection(self.outputs)
        ret['raster_out'] = Raster(sum_rasters, extent, 1, 0, Y_INCREASING)

        if points:
            for i, point in enumerate(points['points']):
                idx = ret['raster_out'].index(point[x_col], point[y_col])
                value = ret['raster_out'][idx]
                points_out[i]['score'] = value.item() if not is_masked(value) else 0

            ret['points'] = points_out

        return ret
