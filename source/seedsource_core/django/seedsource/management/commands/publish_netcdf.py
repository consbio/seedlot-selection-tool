import glob
import os
import shutil
from pathlib import Path

from django.conf import settings
from django.core.management import BaseCommand, CommandError
from django.db import transaction
from ncdjango.models import Service, Variable
from netCDF4 import Dataset
from pyproj import Proj
from trefoil.netcdf.describe import describe
from trefoil.netcdf.variable import SpatialCoordinateVariables
from trefoil.render.renderers.stretched import StretchedRenderer
from trefoil.utilities.color import Color

SERVICE_DIR = getattr(settings, 'NC_SERVICE_DATA_ROOT', 'data/ncdjango/services')


class Command(BaseCommand):
    help = (
        'Publish a NetCDF dataset as a map service (use `populate_climate_data` for publishing climate variable ' +
        'datasets)'
    )

    def add_arguments(self, parser):
        parser.add_argument('datasets',  nargs='+', type=str)
        parser.add_argument('-d', '--directory', default=None, type=str)
        parser.add_argument('--overwrite', action='store_true', dest='overwrite')

    def handle(self, datasets, directory, overwrite, *args, **options):
        old_files = []

        for dataset in datasets:
            filename = os.path.basename(dataset)
            name = os.path.splitext(filename)[0]

            if directory is not None:
                filename = '{}/{}'.format(directory.strip('/'), filename)
                name = '{}/{}'.format(directory.strip('/'), name)

            with transaction.atomic():
                existing = Service.objects.filter(name__iexact=name)
                if existing.exists():
                    if overwrite:
                        old_files.append(os.path.join(SERVICE_DIR, existing.get().data_path))
                        existing.delete()
                    else:
                        raise CommandError("A service named '{}' already exists".format(name))

                with Dataset(dataset, 'r') as ds:
                    variables = []
                    x_dimension = None
                    y_dimension = None
                    projection = None

                    desc = describe(ds)
                    for variable, variable_info in desc['variables'].items():
                        if 'spatial_grid' in variable_info:
                            variables.append(variable)
                            spatial_grid = variable_info['spatial_grid']
                            x_dimension = spatial_grid['x_dimension']
                            y_dimension = spatial_grid['y_dimension']
                            projection = Proj(variable_info['proj4'])

                    if not variables:
                        raise CommandError('No usable variables found')

                    coords = SpatialCoordinateVariables.from_dataset(
                        ds, x_dimension, y_dimension, projection=projection
                    )

                service = Service.objects.create(
                    name=name,
                    data_path=filename,
                    projection=coords.projection,
                    full_extent=coords.bbox,
                    initial_extent=coords.bbox
                )
                for variable in variables:
                    Variable.objects.create(
                        service=service,
                        index=0,
                        variable=variable,
                        projection=projection,
                        x_dimension=x_dimension,
                        y_dimension=y_dimension,
                        name=variable,
                        renderer=StretchedRenderer(
                            [(variable_info['min'], Color(0, 0, 0)), (variable_info['max'], Color(255, 255, 255))]
                        ),
                        full_extent=coords.bbox
                    )
                print('Added {}...'.format(name))

        for path in old_files:
            if os.path.exists(path):
                os.remove(path)

        for dataset in datasets:
            target_dir = Path(SERVICE_DIR) / (directory or '')
            if not os.path.exists(target_dir):
                os.makedirs(target_dir)
            shutil.copy(dataset, target_dir)
