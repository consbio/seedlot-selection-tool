#!/usr/bin/env bash

export PATH=/usr/local/bin:$PATH
export LD_LIBRARY_PATH=/usr/local/lib:/usr/local/lib64

cd $HOME/apps/seedlot-selection-tool
poetry install
cd source
poetry run python manage.py migrate --noinput
poetry run python manage.py collectstatic --noinput
poetry run python manage.py compilemessages
