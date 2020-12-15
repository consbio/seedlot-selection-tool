import datetime

import pytz

from .base import *

if CONFIG.get('sentry_url'):
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration

    sentry_sdk.init(
        CONFIG.get('sentry_dsn'),
        integrations=[DjangoIntegration()],

        # Set traces_sample_rate to 1.0 to capture 100%
        # of transactions for performance monitoring.
        # We recommend adjusting this value in production.
        traces_sample_rate=1.0,
    )

DEBUG = False

ALLOWED_HOSTS = ['seedlotselectiontool.org']

BROKER_URL = 'amqp://{}:{}@localhost:5672'.format(
        CONFIG.get('amqp_username', ''), CONFIG.get('amqp_password', '')
)
CELERY_RESULT_BACKEND = 'django-db'

NC_GEOPROCESSING_JOBS_QUEUE = 'gp'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[%(levelname)s] [%(asctime)s:%(msecs).0f] [%(process)d] %(message)s\n',
            'datefmt': '%Y/%m/%d %H:%M:%S'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler'
        },
        'file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.TimedRotatingFileHandler',
            'filename': CONFIG.get('logfile_path', '/tmp/seedsource.log'),
            'when': 'midnight',
            'formatter': 'verbose'
        }
    },
    'loggers': {
        'django.request': {
            'level': 'WARNING',
            'handlers': ['file']
        },
        '': {
            'level': 'DEBUG',
            'handlers': ['file']
        }
    }
}

STATIC_ROOT = '/var/www/static/'
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'javascript/build'),
)

WEBPACK_LOADER['DEFAULT']['BUNDLE_DIR_NAME'] = '/'

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = CONFIG.get('email_host')
EMAIL_HOST_USER = CONFIG.get('email_user')
EMAIL_HOST_PASSWORD = CONFIG.get('email_password')
EMAIL_USE_TLS = True

NC_SERVICE_DATA_ROOT = '/ncdjango/services/'
MEDIA_ROOT = '/ncdjango/'
NC_TEMPORARY_FILE_LOCATION = 'tmp/'
DATASET_DOWNLOAD_DIR = '/ncdjango/downloads/'

# Preview mode
INSTALLED_APPS += ('seedsource_core.django.preview',)

MIDDLEWARE += ('seedsource_core.django.preview.middleware.PreviewAccessMiddleware',)

PREVIEW_MODE = True
PREVIEW_PASSWORD = 'sstearlyaccess'
PREVIEW_EXPIRES = datetime.datetime(2016, 9, 23, tzinfo=pytz.timezone('US/Pacific'))
