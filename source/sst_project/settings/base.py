import json
import os

import random
import string
from datetime import timedelta

from django.urls import reverse_lazy
from trefoil.render.renderers.stretched import StretchedRenderer
from trefoil.utilities.color import Color


# Starting at this file, walk back up the directory tree to the project root
BASE_DIR = os.path.abspath(__file__)
for __ in range(4):
    BASE_DIR = os.path.dirname(BASE_DIR)

CONFIG = {}
config_file = os.environ.get('SEEDSOURCE_CONF_FILE') or os.path.join(BASE_DIR, 'config.json')
if config_file and os.path.isfile(config_file):
    with open(config_file) as f:
        CONFIG = json.loads(f.read())

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = CONFIG.get(
        'django_secret_key', ''.join(
                [random.SystemRandom().choice(string.ascii_letters + string.digits) for _ in range(50)]
        ))  # This results in a random secret key every time the settings are loaded. Not appropriate for production.

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []

# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',

    'waffle',
    'ncdjango',
    'rest_framework',
    'tastypie',
    'django_celery_results',
    'social_django',
    'webpack_loader',

    'sst',
    'seedsource_core.django.seedsource',
    'seedsource_core.django.accounts'
)

MIDDLEWARE = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'social_django.middleware.SocialAuthExceptionMiddleware',
    'waffle.middleware.WaffleMiddleware'
)

ROOT_URLCONF = 'sst_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'social_django.context_processors.backends',
                'social_django.context_processors.login_redirect',
                'sst_project.context_processors.google_analytics'
            ],
        },
    },
]

WSGI_APPLICATION = 'sst_project.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': CONFIG.get('db_name', 'seedsource'),
        'USER': CONFIG.get('db_user', 'seedsource'),
        'PASSWORD': CONFIG.get('db_password'),
        'HOST': CONFIG.get('db_host', '127.0.0.1')
    }
}

AUTHENTICATION_BACKENDS = (
    'social_core.backends.google.GoogleOAuth2',
    'social_core.backends.facebook.FacebookOAuth2',
    'social_core.backends.twitter.TwitterOAuth',
    'seedsource_core.django.accounts.backends.EmailAuthenticationBackend',
    'seedsource_core.django.accounts.backends.IdentityBackend',
)

SOCIAL_AUTH_USERNAME_IS_FULL_EMAIL = False
SOCIAL_AUTH_RAISE_EXCEPTIONS = False
SOCIAL_AUTH_LOGIN_REDIRECT_URL = reverse_lazy('tool_page')
SOCIAL_AUTH_LOGIN_ERROR_URL = reverse_lazy('tool_page')
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = CONFIG.get('google_oauth2_key', '')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = CONFIG.get('google_oauth2_secret', '')
SOCIAL_AUTH_FACEBOOK_KEY = CONFIG.get('facebook_key', '')
SOCIAL_AUTH_FACEBOOK_SECRET = CONFIG.get('facebook_secret', '')
SOCIAL_AUTH_FACEBOOK_SCOPE = ['email']
SOCIAL_AUTH_FACEBOOK_PROFILE_EXTRA_PARAMS = {
  'fields': 'id, name, email'
}
SOCIAL_AUTH_TWITTER_KEY = CONFIG.get('twitter_key', '')
SOCIAL_AUTH_TWITTER_SECRET = CONFIG.get('twitter_secret', '')
SOCIAL_AUTH_PIPELINE = (
    'social_core.pipeline.social_auth.social_details',
    'social_core.pipeline.social_auth.social_uid',
    'social_core.pipeline.social_auth.auth_allowed',
    'social_core.pipeline.social_auth.social_user',
    'social_core.pipeline.user.get_username',
    'social_core.pipeline.social_auth.associate_by_email',
    'social_core.pipeline.user.create_user',
    'social_core.pipeline.social_auth.associate_user',
    'social_core.pipeline.social_auth.load_extra_data',
    'social_core.pipeline.user.user_details'
)

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'America/Los_Angeles'
USE_I18N = True
USE_L10N = True
USE_TZ = True

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

GOOGLE_ANALYTICS_ID = CONFIG.get('ga_id')
ENABLE_GOOGLE_ANALYTICS = bool(GOOGLE_ANALYTICS_ID)


REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 100
}

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
BABEL_CMD = '/usr/local/bin/babel'
UGLIFY_CMD = '/usr/local/bin/uglifyjs'

CELERY_TRACK_STARTED = True
CELERYBEAT_SCHEDULE = {
    'cleanup_temporary_services': {
        'task': 'ncdjango.geoprocessing.celery_tasks.cleanup_temporary_services',
        'schedule': timedelta(hours=1),
        'options': {
            'expires': 7200  # 2 hrs
        }
    },
    'cleanup_password_reset_tokens': {
        'task': 'accounts.tasks.cleanup_password_reset_tokens',
        'schedule': timedelta(hours=1),
        'options': {
            'expires': 7200  # 2 hrs
        }
    },
    'cleanup_temp_tif_files': {
        'task': 'seedsource.tasks.cleanup_tifs.cleanup_temp_tif_files',
        'schedule': timedelta(hours=1),
        'options': {
            'expires': 7200  # 2 hrs
        },
        'kwargs': {'age': 7200},
    },

}

WEBPACK_LOADER = {
    'DEFAULT': {
        'CACHE': not DEBUG,
        'BUNDLE_DIR_NAME': 'webpack_bundles/',  # must end with slash
        'STATS_FILE': os.path.join(BASE_DIR, 'webpack-stats.json'),
        'POLL_INTERVAL': 0.1,
        'TIMEOUT': None,
        'IGNORE': ['.+\.hot-update.js', '.+\.map']
    }
}

if not DEBUG:
    WEBPACK_LOADER['DEFAULT']['BUNDLE_DIR_NAME'] = '/'

NC_REGISTERED_JOBS = {
    'generate_scores': {
        'type': 'task',
        'task': 'seedsource_core.django.seedsource.tasks.generate_scores.GenerateScores',
        'publish_raster_results': True,
        'results_renderer': StretchedRenderer([
            (100, Color(240, 59, 32)),
            (50, Color(254, 178, 76)),
            (0, Color(255, 237, 160))
        ])
    },
    'write_tif': {
        'type': 'task',
        'task': 'seedsource_core.django.seedsource.tasks.write_tif.WriteTIF',
    },

}

NC_INSTALLED_INTERFACES = (
    'ncdjango.interfaces.data',
    'ncdjango.interfaces.arcgis_extended',
    'ncdjango.interfaces.arcgis',
    'seedsource_core.interfaces.tiles'
)

NC_ENABLE_STRIDING = True
NC_SERVICE_DATA_ROOT = 'data/ncdjango/services/'
DATASET_DOWNLOAD_DIR = 'data/downloads'

SEEDSOURCE_TITLE = 'Seedlot Selection Tool'
