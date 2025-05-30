from django.conf import settings

SEEDZONES_LOCATION = getattr(settings, "SEEDZONES_LOCATION", "data/seedzones")

VARIABLES = (
    "AHM",
    "CMD",
    "DD5",
    "DD_0",
    "EMT",
    "Eref",
    "EXT",
    "FFP",
    "MAP",
    "MAT",
    "MCMT",
    "MSP",
    "MWMT",
    "PAS",
    "SHM",
    "TD",
)

PERIODS = ("1961_1990", "1981_2010", "rcp45_2025", "rcp45_2055", "rcp45_2085", "rcp85_2025", "rcp85_2055", "rcp85_2085")

