# Development Install & Project Setup

These instructions cover setting up a development environment only.

## Clone Project

Choose a location for the project directory (e.g., `/home/sst/apps/`).
Navigate to the directory, and clone the repository:

```text
$ git checkout https://github.com/consbio/seedlot-selection-tool.git
```

## Setup & Configuration

### Configure Django

Create a file in `seedlot-selection-tool` directory called
`config.json`. Add the following to this file, and fill out the values:

```json
{
  "amqp_username": "",
  "amqp_password": "",
  "django_secret_key": "",
  "db_password": ""
}
```

You can also add the following optional keys to your `config.json`:

```json
{
  "raven_dsn": "",
  "logfile_path": "",
  "db_name": "",
  "db_user": "",
  "db_host": ""
}
```

These keys are needed for social authentication:

```json
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

Also, to have feedback forms function, add optional email keys (the host/user/pass is only needed to route through an external server):

```json
{
  "admin_email": "",
  "email_host": "",
  "email_user": "",
  "email_password": ""
}
```

As long as `DEBUG = True` (default in Django), email functionality will output to console.

Create a new Python module in
`seedlot-selection-tool/source/sst_project/settings` called `custom.py`.
Add the following to this new file:

```python
from .local import *

ALLOWED_HOSTS = []  # Add your host name or names here. E.g., 'local.seedlotselectiontool.org'

# Set this to the directory you will serve GeoTIFF downloads from. It must be writable by the application user
# and readable by the nginx user.
DATASET_DOWNLOAD_DIR = 'downloads/'
```

Note: You can also add additional settings to `custom.py` or override settings specified in `local.py` and `base.py` as needed.

### Setup data folder

By default, data files are expected to be within
`data/ncdjango/services/` relative to the project root.

The folder structure of this directory is covered in the
[import data](import-data.md)` document.

### Javascript

Navigate to the `javascript` directory in the root of this project,
install the node dependencies, and run the build script:

```text
$ pnpm install
$ pnpm merge-regions
$ pnpm start
```

### Start containers

Start docker containers using docker-compose:

```
$ docker-compose up
```

### Run migrations and server static content

Once your docker containers are built and running.

Start a shell inside the server container:

```
$ docker exec -it -- <server-container-id> bash
```

Then run migrations:

```
$ ./manage.py migrate
```

Once migrations have run the `collectstatic` command:

```
$ ./manage.py collectstatic
```

You should now be able to access the tool at
`http://<your-server>/sst/`. Of course, for it to be useful, you will
need data. This is covered in the [import-data](import-data.md) document.

### Setup data folder

By default, data files are expected to be within
`data/ncdjango/services/` relative to the project root.

For local development, override the value of `NC_SERVICE_DATA_ROOT` in `custom.py`:

```python
NC_SERVICE_DATA_ROOT = '/project/data/ncdjango/services/'
```

(The `/project/` prefix is used by Docker)

The folder structure of this directory is covered in the
`import-data` document.
