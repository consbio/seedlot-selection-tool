import json
import os
from pathlib import Path

import boto3


class Config:
    @staticmethod
    def secrets_manager():
        """Load config from AWS Systems Manager parameter store"""

        return SecretsManagerConfig()

    @staticmethod
    def json():
        """Load config form local `config.json` file"""

        return JSONConfig()

    @staticmethod
    def get_instance():
        """Get the appropriate config for the environment"""

        is_production = bool(os.environ.get("AWS_SECRETS_KEY"))

        if is_production:
            return Config.secrets_manager()
        else:
            return Config.json()

    def __init__(self):
        self.items = {}

    def __getitem__(self, item):
        return self.items[item]

    def get(self, item, default=None):
        return self.items.get(item, default)


class SecretsManagerConfig(Config):
    def __init__(self):
        super().__init__()

        secrets_key = os.environ.get("AWS_SECRETS_KEY")
        if not secrets_key:
            raise ValueError("Environment variable AWS_SECRETS_KEY must be set")

        client = boto3.client("secretsmanager")
        value = client.get_secret_value(SecretId=secrets_key)

        self.items = json.loads(value["SecretString"])


class JSONConfig(Config):
    def __init__(self):
        super().__init__()

        base_dir = Path(__file__).parent.parent.parent.parent
        config_file = os.environ.get("SEEDSOURCE_CONF_FILE") or base_dir / "config.json"

        try:
            with open(config_file) as f:
                self.items = json.loads(f.read())
        except FileNotFoundError:
            self.items = {}
