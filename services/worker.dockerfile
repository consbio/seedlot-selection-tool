FROM seedlot-selection-tool-server

ENTRYPOINT eval $(poetry env activate) && cd app/source && celery -A sst_project worker -l info