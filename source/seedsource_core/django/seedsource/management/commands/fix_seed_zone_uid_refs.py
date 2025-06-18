from django.core.management import BaseCommand
from seedsource_core.django.seedsource.models import RunConfiguration, ShareURL, SeedZone
import json
import re

class Command(BaseCommand):
    help = "Loads polygon data from seed zone shapefiles into the database."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            dest="dryrun",
            action="store_true",
            default=False,
            help="If True, will show a dry run of the zones and check if they match a zone that exists.",
        )

    def handle(self, dryrun, *args, **options):
        #zones_to_fix = ['or_seed_zones', 'r9_breeding_zones', 'ca_seed_zones', 'nesma_ontario_seed_zones', 'or_wa_historic']

        run_configurations = RunConfiguration.objects.all()

        for run_config in run_configurations:
            config_json = json.loads(run_config.configuration)
            # Add checks for old zone_uids and the associated modifications
            matches = config_json["zones"]["matched"]
            selected_uid = config_json["zones"]["selected"]

            for match in matches:
                zone_uid = match["zone_uid"]

                or_wa_historic_pattern = r'wa_or_historic(.*)'
                or_wa_historic_repl_pattern = r'or_wa_historic\1'

                or_pattern = r'or(.*)'
                def or_repl(match: re.Match):
                    new_uid = "or_seed_zones" + match.group(1)
                    seedzone_matches = SeedZone.objects.filter(zone_uid__contains=new_uid)
                    if (len(seedzone_matches)):
                        new_uid = seedzone_matches[0].zone_uid
                    return new_uid
                
                r6_breeding_pattern = r'r6_breeding_zone(.*)'
                def r6_repl(match: re.Match):
                    new_uid = "r6_breeding_zones" + match.group(1)
                    seedzone_matches = SeedZone.objects.filter(zone_uid__contains=new_uid)
                    if (len(seedzone_matches)):
                        new_uid = seedzone_matches[0].zone_uid
                    return new_uid

                ca_pattern = r'ca(.*)'
                def ca_repl(match: re.Match):
                    new_uid = "ca_seed_zones" + match.group(1)
                    seedzone_matches = SeedZone.objects.filter(zone_uid__contains=new_uid)
                    if (len(seedzone_matches)):
                        new_uid = seedzone_matches[0].zone_uid
                    return new_uid

                if re.search(or_wa_historic_pattern, zone_uid):
                    zone_uid = re.sub(or_wa_historic_pattern, or_wa_historic_repl_pattern, zone_uid)
                elif re.search(or_pattern, zone_uid):
                    zone_uid = re.sub(or_pattern, or_repl, zone_uid)
                elif re.search(r6_breeding_pattern, zone_uid):
                    zone_uid = re.sub(r6_breeding_pattern, r6_repl, zone_uid)
                elif re.search(ca_pattern, zone_uid):
                    zone_uid = re.sub(ca_pattern, ca_repl, zone_uid)

                if match['zone_uid'] != zone_uid:
                    if not SeedZone.objects.filter(zone_uid=zone_uid).exists():
                        print(f"Failed ({run_config.id}): {match['zone_uid']} -> {zone_uid}")

            
            # Print the changes.
        
        if not dryrun:
            for run_config in run_configurations:
                print("SAved")
                #run_config.save()

        share_url = ShareURL.objects.all()

        for url in share_url:
            # Add checks for old zone_uids and the associated modifications
            print(url)