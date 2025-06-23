from django.core.management import BaseCommand
from django.conf import settings
from seedsource_core.django.seedsource.models import SeedZone
from tempfile import mkdtemp
import os
import subprocess
import json
import shutil


class Command(BaseCommand):
    help = 'Facilitates converting of vector data into vector tiles.'

    def _write_out(self, output):
        self.stdout.write('\033[0;33m' + output + '\033[0m')

    def handle(self, *args, **options):
        tiles_dir = os.path.join(settings.BASE_DIR, "tiles")
        seedzone_dir = os.path.join(tiles_dir, "seedzones")
        errors = []
        sources = SeedZone.objects.values_list('source').distinct()

        if not os.path.exists(seedzone_dir):
            os.makedirs(seedzone_dir)

        for source in sources:
            zones = SeedZone.objects.filter(source=source[0])
            formatted_source = os.path.splitext(source[0].replace("/", "-").lower())[0]
            path = 'seedzones/{}.mbtiles'.format(formatted_source)

            if os.path.exists(os.path.join(tiles_dir, path)):
                self._write_out('{} already exists...'.format(formatted_source))
                continue

            tmp_dir = mkdtemp()

            try:
                self._write_out(f'Loading seedzones of source "{source[0]}" ...')
                geojson = {
                    'type': 'FeatureCollection',
                    'features': [json.loads(sz.polygon.geojson) for sz in zones]
                }

                with open(os.path.join(tmp_dir, 'zones.json'), "w") as f:
                    f.write(json.dumps(geojson))

                self._write_out("Processing...")

                process = subprocess.run([
                    'tippecanoe',
                    '-o',
                    path,
                    '-f',
                    '--layer=data',
                    '--name',
                    formatted_source,
                    '--drop-densest-as-needed',
                    os.path.join(tmp_dir, 'zones.json')],
                    cwd=tiles_dir)

            finally:
                try:
                    shutil.rmtree(tmp_dir)
                except OSError:
                    print(f'Could not remove temp dir "{tmp_dir}"')

            if process.returncode == 0:
                self.stdout.write(self.style.SUCCESS("Success\n"))
            else:
                errors.append(formatted_source)
                self.stdout.write(self.style.ERROR("Error\n"))

        if errors:
            self._write_out("There were errors with the following:\n")
            self.stdout.write(self.style.ERROR("\n".join(errors)))

        else:
            self._write_out("Done\n")
