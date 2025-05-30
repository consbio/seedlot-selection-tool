from collections import namedtuple
from django.utils.translation import gettext as _, pgettext

Variable = namedtuple(
    "Variable",
    [
        "label",
        "multiplier",
        "format_value",
        "format_transfer",
        "metric_label",
        "imperial_label",
    ],
)

Constraint = namedtuple("Constraint", ["label", "format_value", "format_range"])


def convert_to_f(value):
    return value * 1.8 + 32


def convert_relative_to_f(value):
    return value * 1.8


def convert_to_in(value):
    return value / 25.4


def convert_to_feet(value):
    return value / 0.3048


def convert_to_miles(value):
    return value / 1.60934


def format_temperature_value(value, is_imperial):
    return "{:.1f}".format(round(convert_to_f(value) if is_imperial else value, 1))


def format_relative_temperature_value(value, is_imperial):
    return "{:.1f}".format(
        round(convert_relative_to_f(value) if is_imperial else value, 1)
    )


def format_temperature_transfer(value, is_imperial):
    return "{:.2f}".format(
        round(convert_relative_to_f(value) if is_imperial else value, 2)
    )


def format_precip_value(value, is_imperial):
    return "{:.1f}".format(
        round(convert_to_in(value), 1) if is_imperial else round(value)
    )


def format_whole_value(value, is_imperial):
    return str(round(value))


def format_no_units(value, is_imperial):
    return "{:.1f}".format(round(value, 1))


VARIABLE_CONFIG = {
    "MAT": Variable(
        _("Mean annual temperature"),
        10,
        format_temperature_value,
        format_temperature_transfer,
        "&deg;C",
        "&deg;F",
    ),
    "MWMT": Variable(
        _("Mean warmest month temperature"),
        10,
        format_temperature_value,
        format_temperature_transfer,
        "&deg;C",
        "°F",
    ),
    "MCMT": Variable(
        _("Mean coldest month temperature"),
        10,
        format_temperature_value,
        format_temperature_transfer,
        "&deg;C",
        "°F",
    ),
    "TD": Variable(
        _("Temperature difference between MWMT and MCMT, or continentality"),
        10,
        format_relative_temperature_value,
        format_temperature_transfer,
        "°C",
        "°F",
    ),
    "MAP": Variable(
        _("Mean annual precipitation"),
        1,
        format_precip_value,
        format_precip_value,
        pgettext("mm", "Abbreviation of 'millimeters'"),
        pgettext("in", "Abbreviation of 'inches'"),
    ),
    "MSP": Variable(
        _("Mean summer precipitation, May to September"),
        1,
        format_precip_value,
        format_precip_value,
        pgettext("mm", "Abbreviation of 'millimeters'"),
        pgettext("in", "Abbreviation of 'inches'"),
    ),
    "AHM": Variable(
        _("Annual heat-moisture index"),
        10,
        format_whole_value,
        format_whole_value,
        "",
        "",
    ),
    "SHM": Variable(
        _("Summer heat-moisture index"),
        10,
        format_whole_value,
        format_whole_value,
        "",
        "",
    ),
    "DD_0": Variable(
        _("Degree-days below 0°C"),
        1,
        format_whole_value,
        format_whole_value,
        "dd",
        "dd",
    ),
    "DD5": Variable(
        _("Degree-days above 5°C"),
        1,
        format_whole_value,
        format_whole_value,
        "dd",
        "dd",
    ),
    "FFP": Variable(
        _("Frost-free period"),
        1,
        format_whole_value,
        format_whole_value,
        _("days"),
        _("days"),
    ),
    "PAS": Variable(
        _("Precipitation as snow, August to July"),
        1,
        format_precip_value,
        format_precip_value,
        pgettext("mm", "Abbreviation of 'millimeters'"),
        pgettext("in", "Abbreviation of 'inches'"),
    ),
    "EMT": Variable(
        _("Extreme minimum temperature over 30 years"),
        10,
        format_temperature_value,
        format_temperature_transfer,
        "&deg;C",
        "&deg;F",
    ),
    "EXT": Variable(
        _("Extreme maximum temperature over 30 years"),
        10,
        format_temperature_value,
        format_temperature_transfer,
        "&deg;C",
        "&deg;F",
    ),
    "Eref": Variable(
        _("Hargreaves reference evaporation"),
        1,
        format_precip_value,
        format_precip_value,
        pgettext("mm", "Abbreviation of 'millimeters'"),
        pgettext("in", "Abbreviation of 'inches'"),
    ),
    "CMD": Variable(
        _("Hargreaves climatic moisture deficit"),
        1,
        format_precip_value,
        format_precip_value,
        pgettext("mm", "Abbreviation of 'millimeters'"),
        pgettext("in", "Abbreviation of 'inches'"),
    ),
}


TRAIT_CONFIG = {
    "FD": Variable(
        _("Flower Date"),
        1,
        format_temperature_value,
        format_temperature_value,
        _("days"),
        _("days"),
    ),
    "S": Variable(_("Survival"), 1, format_no_units, format_no_units, "", ""),
    "S-atva": Variable(_("Survival"), 1, format_no_units, format_no_units, "", ""),
    "PC1": Variable("PC1", 1, format_no_units, format_no_units, "", ""),
    "PC2": Variable("PC2", 1, format_no_units, format_no_units, "", ""),
    "PC3": Variable("PC3", 1, format_no_units, format_no_units, "", ""),
    "HGT": Variable(_("Scaled Height"), 1, format_no_units, format_no_units, "", ""),
    "HT": Variable(_("Height"), 1, format_no_units, format_no_units, "", ""),
}


def format_elevation_value(config, is_imperial):
    elevation = config["point"]["elevation"]
    return (
        "{:.1f} {}".format(
            convert_to_feet(elevation), pgettext("ft", "Abbreviation of 'feet'")
        )
        if is_imperial
        else "{:.1f} {}".format(elevation, pgettext("m", "Abbreviation of 'meters'"))
    )


def format_elevation_range(values, is_imperial):
    return (
        "{:.1f} {}".format(
            convert_to_feet(values["range"]), pgettext("ft", "Abbreviation of 'feet'")
        )
        if is_imperial
        else "{:.1f} {}".format(
            values["range"], pgettext("m", "Abbreviation of 'meters'")
        )
    )


def format_photoperiod_value(config, is_imperial):
    return "{y:.2f}, {x:.2f}".format(**config["point"])


def format_photoperiod_range(values, is_imperial):
    return "{hours:.1f} {hours_label}, {day} {month}".format(
        hours_label=_("hours"), **values
    )


def format_latitude_value(config, is_imperial):
    return "{y:.2f} &deg;N".format(**config["point"])


def format_latitude_range(values, is_imperial):
    return "{range:.2f} &deg;".format(**values)


def format_longitude_value(config, is_imperial):
    return "{x:.2f} &deg;E".format(**config["point"])


def format_longitude_range(values, is_imperial):
    return "{range:.2f} &deg;".format(**values)


def format_distance_range(values, is_imperial):
    return (
        "{} {}".format(
            convert_to_miles(values["range"]), pgettext("mi", "Abbreviation of 'miles'")
        )
        if is_imperial
        else "{} {}".format(
            values["range"], pgettext("km", "Abbreviation of 'kilometers'")
        )
    )


CONSTRAINT_CONFIG = {
    "elevation": Constraint(
        _("Elevation"), format_elevation_value, format_elevation_range
    ),
    "photoperiod": Constraint(
        _("Photoperiod"), format_photoperiod_value, format_photoperiod_range
    ),
    "latitude": Constraint(
        _("Latitutde"), format_latitude_value, format_latitude_range
    ),
    "longitude": Constraint(
        _("Longitude"), format_longitude_value, format_longitude_range
    ),
    "distance": Constraint(
        _("Distance"), format_photoperiod_value, format_distance_range
    ),
    "shapefile": Constraint("Shapefile", None, None),
    "raster": Constraint(_("Raster"), None, None),
}
