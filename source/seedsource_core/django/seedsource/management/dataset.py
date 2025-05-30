from pathlib import Path

from django.conf import settings
from django.contrib.gis.geos import Polygon
from django.contrib.gis.db.models.functions import Area, Intersection
from ncdjango.models import Service
from netCDF4 import Dataset
from pyproj import Proj
from trefoil.geometry.bbox import BBox
from trefoil.netcdf.variable import SpatialCoordinateVariables
from trefoil.utilities.window import Window

from seedsource_core.django.seedsource.models import Region


DATA_PATH = Path(settings.NC_SERVICE_DATA_ROOT)


class DatasetWrapper(object):
    """Wrapper around a netCDF4 dataset, which provides a region loader and context
    manager for easier management of files.
    """

    def __init__(self):
        self.region = None
        self.dataset = None
        self.coords = None
        self.data = None
        self.nodata_value = None

    def __enter__(self):
        return self

    def __exit__(self, exception_type, exception_value, traceback):
        self.close()

    def load_region(self, region_name):
        raise NotImplementedError("Must be implemented by child class")

    def close(self):
        if self.dataset is not None:
            self.dataset.close()
            self.dataset = None


class ElevationDataset(DatasetWrapper):
    """ Lightweight wrapper around the elevation dataset, with a context manager
    and region loader.

    Usage
    -----

    with ElevationDataset() as elevation_ds:
    """

    def __init__(self):
        self.region = None
        self.dataset = None
        self.coords = None
        self.data = None
        self.nodata_value = None

    def load_region(self, region_name):
        """Loads data for a region if not already loaded, closing previous
        region as needed.

        Parameters
        ----------
        region_name : str
        """
        if region_name == self.region:
            return

        self.close()

        elevation_service = Service.objects.get(name="{}_dem".format(region_name))
        elevation_record = elevation_service.variable_set.first()

        self.dataset = Dataset(DATA_PATH / elevation_service.data_path)
        self.coords = SpatialCoordinateVariables.from_dataset(
            self.dataset,
            x_name=elevation_record.x_dimension,
            y_name=elevation_record.y_dimension,
            projection=Proj(elevation_service.projection),
        )

        self.data = self.dataset.variables[elevation_record.name]
        self.data.set_auto_mask(False)
        self.nodata_value = self.data._FillValue
        self.region = region_name

    def get_read_window(self, extent):
        """Calculates a read window and transform to read data within the extent.

        Example
        -------
        window, transform = instance.get_read_window(extent)
        data = instance.data[window]

        Parameters
        ----------
        extent : (xmin, ymin, xmax, ymax)

        Returns
        -------
        (y_slice, x_slice), SpatialCoordinateVariables
        """
        # Calculate indexes to slice based on extent
        bbox = BBox(extent)
        x_slice = slice(*self.coords.x.indices_for_range(bbox.xmin, bbox.xmax))
        y_slice = slice(*self.coords.y.indices_for_range(bbox.ymin, bbox.ymax))

        # expand by 1px in all directions to make sure something isn't getting cut off
        # if bounds fall very close to pixel edges
        x_slice = slice(max(x_slice.start - 1, 0), min(x_slice.stop + 1, len(self.coords.x)), x_slice.step)
        y_slice = slice(max(y_slice.start - 1, 0), min(y_slice.stop + 1, len(self.coords.y)), y_slice.step)

        # get updated coords for the slices
        coords = self.coords.slice_by_window(Window(y_slice, x_slice))

        return (y_slice, x_slice), coords


class ClimateDataset(DatasetWrapper):
    """Lightweight wrapper around a climate dataset for a specific time period
    and climate variable.
    """

    def __init__(self, period, variable):
        """Create a ClimateDataset instance.

        Parameters
        ----------
        period : str
            Time period: "1961_1990"
        variable : str
            variable name: "MAT"
        """
        self.period = period
        self.variable = variable
        super(ClimateDataset, self).__init__()

    def load_region(self, region_name):
        """Loads data for a region if not already loaded, closing previous
        region as needed.

        Parameters
        ----------
        region_name : str
        """
        if region_name == self.region:
            return

        self.close()

        variable_service = Service.objects.get(name="{}_{}Y_{}".format(region_name, self.period, self.variable))

        self.dataset = Dataset(DATA_PATH / variable_service.data_path)
        self.data = self.dataset.variables[self.variable]
        self.data.set_auto_mask(False)
        self.nodata_value = self.data._FillValue
        self.region = region_name


class ClimateDatasets(object):
    """Wrapper around a collection of climate datasets for a particular period.

    Usage
    -----

    with ClimateDatasets(period="1961_1990", variables=["MAT"]) as climate:
    """

    def __init__(self, period, variables):
        """Creates a collection of ClimateDataset instances.

        Parameters
        ----------
        period : str
            Time period: "1961_1990"
        variable : str
            variable name: "MAT"
        """
        self.region = None
        self.variables = {v: ClimateDataset(period, v) for v in variables}

    def __enter__(self):
        return self

    def __exit__(self, exception_type, exception_value, traceback):
        self.close()

    def close(self):
        for v, dataset in self.variables.items():
            dataset.close()

    def items(self):
        return self.variables.items()

    def load_region(self, region_name):
        """Loads climate data for all variables in region if not already loaded,
        closing previous region as needed.

        Parameters
        ----------
        region_name : str
        """
        if region_name == self.region:
            return

        self.close()
        for dataset in self.variables.values():
            dataset.load_region(region_name)
        self.region = region_name
