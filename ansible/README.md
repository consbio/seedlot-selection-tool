# Server Setup & Deployment

The [Ansible](https://docs.ansible.com/ansible/latest/index.html) playbooks in this directory are used to automate initial server setup, server updates, and application deployment.

## Scripts

* `deploy.yml` -- Copies sources from the project directory to the remote server, and can also be used to copy files locally which is used during the AWS CodeDeploy process. Files and directories in `.gitignore` are not copied, except for `javascript/build` and `webpack-stats.json`, which _are_ copied.
* `post_deploy.yml` -- Performs tasks that need to happen after a deployment such as installing new dependencies, applying database migrations, and restarting services.
* `setup_webservers.yml` -- Will setup or update an Amazon Linux server to be able to host the application by building and installing dependencies, setting up users and directories, and creating systemd services. If changes need to be made to a production webserver, this playbook should be updated; the server should not be changed manually.

## Usage

In order to run the playbooks, create an `inventory.yml` file in this directory with the following contents:

```yml
webservers:
  hosts:
    production:
      ansible_host: <server public IP>
      ansible_user: ec2-user
```

You'll need to be able to SSH into the server, and you'll need to update your `~/.ssh/config` to automatically use the correct SSH key for the host.

### Setting up a new server

The `setup_webserver.yml` playbook will handle most of the server setup for you. You only need to launch a new Amazon Linux EC2 instance and upload climate data to the server (you can do this by creating a volume from the latest `SST_DATA_<date>` snapshot and attaching and mounting it to the instance at the path `/mnt/data`). Then make sure the new server's public IP is in your `inventory.yml` file and run the playbook:

```bash
ansible-playbook -i inventory.yml setup_webservers.yml
```

### Updating the server

To update the server environment (for example, if you need a new package installed or you need to change a service file or the nginx config), edit the `setup_webservers.yml` playbook and/or the appropriate file(s) in the `resources` directory. Then run the `setup_webserver.yml` playbook to enact the changes on the server. Don't modify the server directly. Always use the playbook so that the playbook and the server are in sync. If we need to create a new server at any point, we want to be able to simply run the playbook and have a fully configured server when it's finished.

### Manually deploying the application

_You shouldn't need to do this in most cases. Typically, it's better to commit changes to the git repository and run the AWS CodePipeline to deploy the changes (this should start automatically on push to `master` and you'll only need to approve the deployment)._

First, stop the webpack dev server if you're running it and build the javascript application:

```bash
(cd ../javascript && pnpm build)
```

Next, make sure you have an `inventory.yml` file with the server you want to deploy to, and run the `deploy` and `post_deploy` playbooks:

```bash
ansible-playbook -i inventory.yml deploy.yml
ansible-playbook -i inventory.yml post_deploy.yml
```

The first will copy all files to the correct place on the server. The second will install Python dependencies, apply database migrations, and restart services. When this is finished, load the site in your web browser to ensure everything is working correctly. 
