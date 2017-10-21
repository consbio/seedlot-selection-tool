import datetime

import pytz

from .local import *

ALLOWED_HOSTS = ['127.0.0.1', 'iris.corvallis.consbio.org']

NC_SERVICE_DATA_ROOT = '/Users/nikmolnar/projects/seedsource/materials/ncdjango/services/'
MEDIA_ROOT = '/Users/nikmolnar/projects/seedsource/materials/ncdjango/'
NC_TEMPORARY_FILE_LOCATION = 'tmp/'

INTERNAL_IPS = ['127.0.0.1', '10.5.1.4', '10.5.1.185']

INSTALLED_APPS += ('seedsource_core.django.preview',)

MIDDLEWARE_CLASSES += ('seedsource_core.django.preview.middleware.PreviewAccessMiddleware',)

PREVIEW_MODE = False
PREVIEW_PASSWORD = 'sstearlyaccess'
PREVIEW_EXPIRES = datetime.datetime(2016, 9, 23, tzinfo=pytz.timezone('US/Pacific'))

PORT = 8001

DATASET_DOWNLOAD_DIR = os.path.join(os.path.dirname(BASE_DIR), 'materials', 'downloads/')
STATICFILES_DIRS = [DATASET_DOWNLOAD_DIR]
