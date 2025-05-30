from django.core.management.base import BaseCommand
from django.conf import settings
from tempfile import mkdtemp
import shutil
import subprocess
import os

class Command(BaseCommand):
    help = 'Import vector data to be served as mapbox vectortiles. Viewable on front-end in "Layers" tab.'

    def add_arguments(self, parser):
        parser.add_argument('shapefile', nargs=1, type=str)

    def _write_out(self, output):
        self.stdout.write('\033[0;33m' + output + '\033[0m')

    def handle(self, shapefile, *args, **options):
        tiles_dir = os.path.join(settings.BASE_DIR, "tiles")
        layers_dir = os.path.join(tiles_dir, "layers")
        file_path = os.path.abspath(shapefile[0])
        zip_option = ""
        name = os.path.splitext(os.path.basename(file_path))[0]

        if file_path.endswith('.zip'):
            zip_option = '/vsizip/'

        if not os.path.exists(layers_dir):
            os.makedirs(layers_dir)

        tmp_dir = mkdtemp()

        try:
            self._write_out(f'Converting {name} to EPSG:4326 GeoJSON for processing...')
            subprocess.run([
                'ogr2ogr',
                '-f',
                'GeoJSON',
                '-t_srs',
                'EPSG:4326',
                os.path.join(tmp_dir, 'output.json'),
                zip_option + file_path
            ])

            self._write_out('Processing into mbtiles...')
            tippecanoe = subprocess.run([
                'tippecanoe',
                '-o',
                f'layers/{name}.mbtiles',
                '-f',
                '--layer=data',
                '--name',
                name,
                '--drop-densest-as-needed',
                os.path.join(tmp_dir, 'output.json')],
                cwd=tiles_dir)

        finally:
            try:
                shutil.rmtree(tmp_dir)
            except OSError:
                print(f'Could not remove temp dir "{tmp_dir}"')

        if tippecanoe.returncode == 0:
            self.stdout.write(self.style.SUCCESS("Success\n"))

        else:
            self.stdout.write(self.style.ERROR("Error processing file\n"))

            try:
                self._write_out(f'Removing {name}...\n')
                os.remove(os.path.join(layers_dir, f'{name}.mbtiles'))
            except OSError:
                print(f'Could not remove .../layers/{name}.mbtiles')

            self._write_out("Done.")