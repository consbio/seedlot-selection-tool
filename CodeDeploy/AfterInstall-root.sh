#!/usr/bin/env bash

systemctl reload gunicorn
systemctl restart celery
