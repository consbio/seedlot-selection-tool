# Production Install & Project Setup

These instructions cover deployment to a production environment.

## Infrastructure Requirements

The following services are required to run the Seedlot Selection Tool.

-   PostgreSQL (<https://www.postgresql.org/>)
-   PostGIS (<http://postgis.net/>)
-   NodeJS (<https://nodejs.org/en/>)
-   Nginx (<https://nginx.org/en/>) (production only)
-   Supervisor (<http://supervisord.org/>) (production only)
-   RabbitMQ (<https://www.rabbitmq.com/>)

## Installation

This document covers installing the application stack on Linux using
Nginx for a webserver proxy and Gunicorn for a WSGI server. You can
certainly use other software to fill these needs.

It's a good idea to be familiar with deploying Django in a production
environment:
<https://docs.djangoproject.com/en/1.11/howto/deployment/wsgi/>

### Clone Project

Choose a location for the project directory (e.g., `/home/sst/apps/`).
Navigate to the directory, and clone the repository:

``` text
git checkout https://github.com/consbio/seedlot-selection-tool.git
```

### Install Dependencies

Install all infrastructure requirements first. Install
[Pipenv](https://github.com/pypa/pipenv) and use it to set up your
Python environment and install dependencies:

``` text
pipenv install
```

You may find that some packages fail to install, complaining about
missing libraries (`.so` files, or `.dll` on Windows). If this happens,
install those libraries using your system's package manager, for example
(for `psycopg2`):

``` text
sudo apt-get install libpq-dev
```

Note: It's recommended that you not use the root account to run your
application or web server. Instead, use one account for nginx (if you
install nginx through a package manager, this should be done
automatically) and another account for the application itself (e.g.,
`seedsource`). It's also recommended to create a Python [virtual
environment](https://virtualenv.pypa.io/en/stable/) as the application
user and use it to install all Python dependencies and run all Python
commands.

>`GDAL` will probably be the most challenging dependency to get
installed. You will likely need to have the GDAL development libraries
for the version of GDAL required by the dependencies of this project
(see <span class="title-ref">Pipfile.lock</span> entry for <span
class="title-ref">gdal</span> to determine the required version).

Note: If you get stuck, search for installing the required version of GDAL Python for your platform. Once GDAL is installed, everything else should be easier.

## Setup & Configuration

Make sure PostgreSQL (+PostGIS), Nginx, Supervisor, and RabbitMQ are
installed, running, and configured to start at launch. Create a
spatially-enabled database, and a database user for the application
(e.g., `seedsource`).

### Configure Django

Create a file in `seedlot-selection-tool` directory called
`config.json`. Add the following to this file, and fill out the values:

``` json
{
  "amqp_username": "",
  "amqp_password": "",
  "django_secret_key": "",
  "db_password": ""
}
```

You can also add the following optional keys to your `config.json`:

``` json
{
    "raven_dsn": "",
    "logfile_path": "",
    "db_name": "",
    "db_user": "",
    "db_host": ""
}
```

These keys are needed for social authentication:

``` json
{
    "google_oauth2_key": "",
    "google_oauth2_secret": "",
    "facebook_key": "",
    "facebook_secret": "",
    "twitter_key": "",
    "twitter_secret": ""
}
```

For social auth to work, make sure access to user email is activated by
the OAuth providers.

Create a new Python module in
`seedlot-selection-tool/source/sst_project/settings` called `custom.py`.
Add the following to this new file:

``` python
from .production import *  # For development, import from .local instead

ALLOWED_HOSTS = []  # Add your host name or names here. E.g., 'seedlotselectiontool.org'

# Set this to the directory you will serve GeoTIFF downloads from. It must be writable by the application user
# and readable by the nginx user.
DATASET_DOWNLOAD_DIR = '/var/www/downloads/'
```

Note: You can also add additional settings to `custom.py` or override settings specified in `production.py` and `base.py` as needed.

From the root of the project, run the database migrations:

``` text
python source/manage.py migrate
```

### Setup data folder

By default, data files are expected to be within
`data/ncdjango/services/` relative to the project root.

You can override this setting within `custom.py` by setting the value of
`NC_SERVICE_DATA_ROOT`:

``` python
NC_SERVICE_DATA_ROOT = '/custom/data/directory'
```

The folder structure of this directory is covered in the
`import-data` document.


If you don't have a supervisor configuration file already, create one
with:

``` text
echo_supervisord_conf > /etc/supervisord.conf
```

Edit `/etc/supervisord.conf` and add programs for gunicorn, celery, and
celery beat, filling in the paths as needed:

``` ini
[program:gunicorn]
user=seedsource
directory=/path/to/seedsource/source
command=/path/to/bin/gunicorn --bind=127.0.0.1:8000 --pid=/path/to/gunicorn.pid --error-logfile=/path/to/error.log --timeout=180 --graceful-timeout=180 --workers=4 seedsource_project.wsgi:application
autorestart=true

[program:django-celery-worker]
user=seedsource
directory=/path/to/seedsource/source
command=/path/to/bin/celery -A seedsource_project worker --loglevel=info --concurrency=1

[program:django-celerybeat-worker]
user=seedsource
directory=/path/to/seedsource/source
command=/path/to/bin/celery -A seedsource_project beat --loglevel=info
```

Restart the supervisord process.

Configure Nginx (production only) ^^^^^^^^^^^^^^^

Edit your nginx configuration and add a location directive for the
seedsource application, a location directive for your static files, and
a location directive for dataset downloads:

``` nginx
location / {
    proxy_set_header Host $http_host;
    proxy_pass http://app_server;
}

location /static/ {
    alias /var/www/static/;
}

location /downloads/ {
    alias /var/www/downloads/;
}
```

Note: If you want to store the static files in another location, you will also need to override the `STATIC_ROOT` setting in `custom.py`.

Restart or reload nginx.

### Build & Deploy Static Content

Navigate to the `javascript` directory in the root of this project,
install the node dependencies, and run the build script:

``` text
pnpm install
pnpm webpack_production
pnpm merge-regions
```

One this completes, navigate to the `source` folder and run the
`collectstatic` manage command (production only):

``` text
python manage.py collectstatic
```

You should now be able to access the tool at
`http://<your-server>/sst/`. Of course, for it to be useful, you will
need data. This is covered in the `setup-add-data` document.
