import os
import subprocess

from django.conf import settings
from django.contrib.staticfiles.storage import StaticFilesStorage

BABEL_CMD = settings.BABEL_CMD
UGLIFY_CMD = settings.UGLIFY_CMD
STATIC_ROOT = settings.STATIC_ROOT


class SSTStaticFilesStorage(StaticFilesStorage):
    def post_process(self, paths, **options):
        results = []

        for path in paths:
            orig_path = path
            processed = False

            if path.endswith('.jsx'):
                print('Building {}...'.format(path))

                new_path = '{}.js'.format(os.path.splitext(path)[0])
                p = subprocess.Popen(' '.join([
                    BABEL_CMD, '--presets', 'react', os.path.join(STATIC_ROOT, path), '--out-file',
                    os.path.join(STATIC_ROOT, new_path)
                ]), shell=True, stdout=subprocess.PIPE, stdin=subprocess.PIPE)
                p.wait()
                if p.returncode:
                    raise IOError('Babel command failed for file {} (exit code {})'.format(path, p.returncode))

                processed = True
                path = new_path

            if path.endswith('.js') and not path.endswith('.min.js'):
                print('Minifying {}...'.format(path))

                new_path = '{}.min.js'.format(os.path.splitext(path)[0])
                p = subprocess.Popen(' '.join([
                    UGLIFY_CMD, os.path.join(STATIC_ROOT, path), '-o', os.path.join(STATIC_ROOT, new_path)
                ]), shell=True, stdout=subprocess.PIPE, stdin=subprocess.PIPE)
                p.wait()
                if p.returncode:
                    raise IOError('Uglify command failed for file {} (exit code {})'.format(path, p.returncode))

                processed = True
                path = new_path

            results.append((orig_path, path, processed))

        return results
