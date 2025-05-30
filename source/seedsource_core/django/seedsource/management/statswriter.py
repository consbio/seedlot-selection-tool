from csv import DictWriter
import os

import numpy


# Header for output file
HEADER = [
    "zone",  # zone unique identifier with actual band elevation range
    "zone_input",  # zone unique identifier with input band elevation range
    "period",
    "zone_set",
    "species",
    "zone_unit",
    "zone_unit_ctr_x",
    "zone_unit_ctr_y",
    "zone_unit_xmin",
    "zone_unit_ymin",
    "zone_unit_xmax",
    "zone_unit_ymax",
    "zone_unit_poly_acres",
    "zone_unit_raster_pixels",
    "zone_unit_raster_acres",
    "zone_unit_acres",
    "zone_unit_pixels",
    "zone_unit_low",
    "zone_unit_high",
    "zone_exists",  # if 0, zone (band) does not exist in the zone set
    "zone_label",
    "zone_input_low",  # band low limit from source
    "zone_input_high",  # band high limit from source
    "zone_low",  # band observed low limit from elevation data
    "zone_high",  # band observed high limit from elevation data
    "zone_acres",
    "zone_pixels",  # zone band pixels
    "median",
    "mean",
    "min",
    "max",
    "range",
    "transfer",
    "center",
    "p1",
    "p5",
    "p95",
    "p99",
    "p5_95_transfer",
    "p5_95_center",
    "p5_95_range",
    "p1_99_transfer",
    "p1_99_center",
    "p1_99_range",
    "samples",
]


class StatsWriter(object):
    """Provides a lightweight wrapper around a DictWriter for a given climate
    variable.
    """

    def __init__(self, path, variable):
        """Creates a StatsWriter instance.

        Parameters
        ----------
        path : str
            output directory: output files are named variable.csv in this directory
        variable : str
            name of variable
        """
        self._fp = open(os.path.join(path, "{}.csv".format(variable)), "w")
        self.variable = variable

        self.writer = DictWriter(self._fp, fieldnames=HEADER,)
        self.writer.writeheader()

    def __enter__(self):
        return self

    def __exit__(self, exception_type, exception_value, traceback):
        self.close()

    def close(self):
        self._fp.close()

    def write_row(self, id, band, band_range, data, **kwargs):
        """Writes a row of climate stats to the writer.

        Parameters
        ----------
        id : str
            zone unit id
        band : list [low, high, label(optional)]
            elevation band
        band_range : list [low, high]
            elevation range actually observed within band
        data : ndarray
            data for variable within zone unit and elevation band

        Other parameters can be passed in as keywords that align with the header
        of this writer.
        """
        data = data[data != numpy.nan]

        min_value = data.min()
        max_value = data.max()
        transfer = (max_value - min_value) / 2.0
        center = max_value - transfer

        p1, p5, p50, p95, p99 = numpy.percentile(data, [1, 5, 50, 95, 99])

        p5_95_transfer = (p95 - p5) / 2.0
        p5_95_center = p95 - p5_95_transfer
        p5_95_range = p95 - p5

        p1_99_transfer = (p99 - p1) / 2.0
        p1_99_center = p99 - p1_99_transfer
        p1_99_range = p99 - p1

        low, high = band[:2]
        label = None
        if len(band) > 2:
            label = band[2]

        obs_low, obs_high = band_range

        zone_exists = 1
        if label and "new:" in label:
            # per guidance from Glenn, if zone was added, code as 0 for below and 2 as above
            if "new: below min band" in label:
                zone_exists = 0
            else:
                zone_exists = 2
            label = ""

        # zone is defined as an elevation band within a zone unit
        zone_id = "{}_{}_{}".format(id, obs_low, obs_high)
        zone_input_id = "{}_{}_{}".format(id, low, high)

        results = {
            "zone": zone_id,
            "zone_input": zone_input_id,
            "zone_exists": zone_exists,
            "zone_label": label,
            "zone_input_low": low,
            "zone_input_high": high,
            "zone_low": obs_low,
            "zone_high": obs_high,
            "median": p50,
            "mean": data.mean(),
            "min": min_value,
            "max": max_value,
            "range": max_value - min_value,
            "transfer": transfer,
            "center": center,
            "p1": p1,
            "p5": p5,
            "p95": p95,
            "p99": p99,
            "p5_95_transfer": p5_95_transfer,
            "p5_95_center": p5_95_center,
            "p5_95_range": p5_95_range,
            "p1_99_transfer": p1_99_transfer,
            "p1_99_center": p1_99_center,
            "p1_99_range": p1_99_range,
            "samples": os.path.join("{}.txt".format(zone_id)),
        }

        # add in other values
        results.update(**kwargs)

        self.writer.writerow(results)


class StatsWriters(object):
    """ Lightweight wrapper around a collection of StatsWriter instances """

    def __init__(self, path, variables):
        self.writers = {v: StatsWriter(path, v) for v in variables}

    def __enter__(self):
        return self

    def __exit__(self, exception_type, exception_value, traceback):
        self.close()

    def close(self):
        for writer in self.writers.values():
            writer.close()

    def write_row(self, variable, *args, **kwargs):
        """Writes a row of climate stats to the writer for a given variable.

        All args and kwargs are passed to the underlying writer
        """
        self.writers[variable].write_row(*args, **kwargs)
