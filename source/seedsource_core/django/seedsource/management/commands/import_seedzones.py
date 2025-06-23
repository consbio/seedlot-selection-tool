from pathlib import Path
from django.conf import settings
from django.contrib.gis.db.models.functions import MakeValid
from django.core.management import BaseCommand, CommandError
from django.db import transaction
from django.db.models import Q
from seedsource_core.django.seedsource.models import SeedZone, ZoneSource

from ..zoneconfig import ZoneConfig

SEEDZONES_LOCATION = getattr(settings, "SEEDZONES_LOCATION", "data/seedzones")


class Command(BaseCommand):
    help = "Loads polygon data from seed zone shapefiles into the database."

    def add_arguments(self, parser):
        parser.add_argument(
            "zone_name",
            nargs="?",
            type=str,
            default="",
            help="Zone set name to import (default: import all in seedzones directory",
        )

        parser.add_argument(
            "--overwrite",
            dest="overwrite",
            action="store_true",
            default=False,
            help="If True, will automatically delete and replace any existing zones",
        )

        parser.add_argument(
            "--clear",
            dest="clear",
            action="store_true",
            default=False,
            help="If True, will automatically delete all zone sets and zones before importing new ones",
        )

    def handle(self, zone_name, overwrite, clear, *args, **options):
        if clear:
            message = (
                "WARNING: This will delete all zone sets and zones, including all transfer limits and other data."
                "Do you want to continue? [y/n]"
            )
            if input(message).lower() not in {"y", "yes"}:
                return

            self.stdout.write("Deleting all zone sets and zones.  This might take a while...")
            ZoneSource.objects.all().delete()

        if zone_name:
            zone_names = [zone_name]
        else:
            self.stdout.write("Importing all zones in {}".format(SEEDZONES_LOCATION))
            zone_names = sorted(
                [p.stem for p in Path(SEEDZONES_LOCATION).iterdir() if p.is_dir and len(list(p.glob("config.py")))]
            )

        for zone_name in zone_names:
            with ZoneConfig(zone_name) as config:
                source = ZoneSource.objects.get_or_create(name=zone_name)[0]
                if source.seedzone_set.all().exists():
                    if not overwrite:
                        message = (
                            "WARNING: This will replace {} seed zone records and remove associated transfer limits. "
                            "Do you want to continue? [y/n]".format(config.label)
                        )
                        if input(message).lower() not in {"y", "yes"}:
                            return

                source.order = getattr(config.config, "order", 0)
                source.save()

                self.stdout.write("Loading seed zones in {}...".format(zone_name))

                with transaction.atomic():
                    source.seedzone_set.all().delete()
                    for polygon, info in config.get_zones():
                        zone_uid = "{}_{}_{}".format(config.source, info["species"], info["zone_id"])

                        if SeedZone.objects.filter(zone_uid=zone_uid).exists():
                            raise CommandError(
                                "ERROR: multiple zones in {} have the same zone_id value."
                                "Check the inputs and dissolve if needed.".format(zone_name)
                            )

                        SeedZone.objects.create(
                            zone_source=source,
                            source=config.source,
                            name=info["label"],
                            species=info["species"],
                            zone_id=info["zone_id"],
                            zone_uid=zone_uid,
                            polygon=polygon.buffer(0),
                        )
