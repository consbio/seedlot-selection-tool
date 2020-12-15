#!/usr/bin/env bash

cd $HOME/apps/seedlot-selection-tool
poetry install
cd source
poetry run python manage.py migrate --noinput
poetry run python manage.py collectstatic --noinput
