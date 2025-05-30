from django.conf import settings
import os
import os.path
import time
import re
from celery.task import task

@task
def cleanup_temp_tif_files(age=7200):
    temp_dir = settings.DATASET_DOWNLOAD_DIR
    cutoff = time.time() - age
    t_files = os.listdir(temp_dir)
    for t_file in t_files:
        if re.search('.zip$', t_file):
            path = os.path.join(temp_dir, t_file)
            if os.path.getctime(path) < cutoff:
                try:
                    os.remove(path)
                except OSError:
                    pass
