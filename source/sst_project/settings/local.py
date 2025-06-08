from .base import *

INTERNAL_IPS = ['127.0.0.1']

CELERY_RESULT_BACKEND = 'django-db'
CELERY_BROKER_URL = 'amqp://rabbit:5672'

BABEL_CMD = 'babel'
UGLIFY_CMD = 'uglifyjs'
