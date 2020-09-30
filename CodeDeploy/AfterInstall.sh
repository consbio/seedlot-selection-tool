#!/usr/bin/env bash

source $HOME/.local/share/virtualenvs/seedlot-selection-tool-TR6qkXtJ/bin/activate

cd $HOME/apps/seedlot-selection-tool
pipenv install
cd source
python manage.py migrate --noinput
python manage.py collectstatic --noinput
