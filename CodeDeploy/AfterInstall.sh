#!/usr/bin/env bash
set -eo pipefail

cd /home/sst/build/ansible

cat <<EOF > inventory.yml
webservers:
  hosts:
    localhost:
      ansible_host: 127.0.0.1
      ansible_user: ec2-user
EOF

ansible-playbook deploy.yml --inventory=inventory.yml --connection=local
ansible-playbook post_deploy.yml --inventory=inventory.yml --connection=local

rm -Rf /home/sst/build
