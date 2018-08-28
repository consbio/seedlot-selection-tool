#!/usr/bin/env bash

systemctl reload gunicorn
systemctl reload celery
systemctl restart mbtileserver
