import datetime
import math
import os
from functools import partial

import numpy
import pyproj
import rasterio
from django.conf import settings
from ncdjango.models import Service
from netCDF4 import Dataset
from rasterio.crs import CRS
from rasterio.enums import Resampling
from rasterio.features import rasterize
from rasterio.vrt import WarpedVRT
from shapely.geometry import Point
from shapely.ops import transform
from trefoil.netcdf.variable import SpatialCoordinateVariables


class Constraint(object):
    def __init__(self, data, region):
        self.data = data
        self.region = region
        self.mask = None
        self.slice = None

    @staticmethod
    def by_name(constraint):
        return {
            'elevation': ElevationConstraint,
            'photoperiod': PhotoperiodConstraint,
            'latitude': LatitudeConstraint,
            'longitude': LongitudeConstraint,
            'distance': DistanceConstraint,
            'shapefile': GeometryConstraint,
            'raster': RasterConstraint
        }[constraint]

    def apply_constraint(self, **kwargs):
        if self.mask is None:
            self.mask = self.get_mask(**kwargs)

            crop = numpy.argwhere(self.mask == False)

            if crop.any():
                (y_start, x_start), (y_stop, x_stop) = crop.min(0), crop.max(0) + 1

                self.slice = (slice(x_start, x_stop), slice(y_start, y_stop))
                self.mask = self.mask[self.slice[1], self.slice[0]]

        mask = self.data.mask[self.slice[1], self.slice[0]] if self.slice else self.data.mask
        data = self.data[self.slice[1], self.slice[0]] if self.slice else self.data

        return numpy.ma.masked_where(self.mask | mask, data)

    def get_mask(self, **kwargs):
        raise NotImplemented


class ElevationConstraint(Constraint):
    def get_mask(self, **kwargs):
        try:
            min_elevation = kwargs['min']
            max_elevation = kwargs['max']
        except KeyError:
            raise ValueError('Missing constraint arguments')

        service = Service.objects.get(name='{}_dem'.format(self.region))
        with Dataset(os.path.join(settings.NC_SERVICE_DATA_ROOT, service.data_path)) as ds:
            v = service.variable_set.first()
            coords = SpatialCoordinateVariables.from_bbox(
                v.full_extent, ds.variables[v.x_dimension].size, ds.variables[v.y_dimension].size, dtype='float64'
            )
            window = coords.get_window_for_bbox(self.data.extent)
            elevation = ds.variables['elevation'][window.y_slice, window.x_slice]

        mask = elevation < min_elevation
        mask |= elevation > max_elevation

        return mask


class PhotoperiodConstraint(Constraint):
    def get_julian_day(self, date):
        a = (14 - date.month) // 12
        y = date.year + 4800 - a
        m = date.month + 12 * a - 3
        julian_date = date.day + (153 * m + 2) // 5 + 365 * y + y // 4 - y // 100 + y // 400 - 32045

        return julian_date - 2451545 + .0008

    def daylight(self, date, lat, lon):
        """ Returns daylight hours for a single lat/lon point """

        julian_day = self.get_julian_day(date)
        solar_noon = julian_day - lon//360
        solar_anomaly = (357.5291 + 0.98560028*solar_noon) % 360
        equation_of_center = (
            1.9148*math.sin(math.radians(solar_anomaly)) +
            0.0200*math.sin(math.radians(2*solar_anomaly)) +
            0.0003*math.sin(math.radians(3*solar_anomaly))
        )
        ecliptic_longitude = (solar_anomaly + equation_of_center + 180 + 102.9372) % 360
        solar_transit = (
            2451545.5 + solar_noon + 0.0053*math.sin(math.radians(solar_anomaly)) -
            0.0069*math.sin(math.radians(2*ecliptic_longitude))
        )
        declination = math.asin(math.sin(math.radians(ecliptic_longitude))*math.sin(math.radians(23.44)))
        hour_angle = math.acos(
            (math.sin(math.radians(-.83)) - math.sin(math.radians(lat))*math.sin(declination)) /
            (math.cos(math.radians(lat))*math.cos(declination))
        )

        sunrise = solar_transit - math.degrees(hour_angle)/360
        sunset = solar_transit + math.degrees(hour_angle)/360

        return (sunset - sunrise) * 24

    def daylight_array(self, date, lat, lon):
        """ Returns daylight hours for arrays of lat/lon points """

        julian_day = self.get_julian_day(date)

        lat_arr = numpy.tile(lat.reshape(len(lat), 1), (1, len(lon)))
        lon_arr = numpy.tile(lon, (len(lat), 1))

        # solar_noon = julian_day - lon//360
        solar_noon = lon_arr
        del lon_arr
        solar_noon //= 360
        solar_noon -= julian_day
        solar_noon *= -1

        # solar_anomaly = (357.5291 + 0.98560028 * solar_noon) % 360
        solar_anomaly = solar_noon * 0.98560028
        solar_anomaly += 357.5291
        solar_anomaly %= 360

        # equation_of_center = (
        #     1.9148 * math.sin(math.radians(solar_anomaly)) +
        #     0.0200 * math.sin(math.radians(2 * solar_anomaly)) +
        #     0.0003 * math.sin(math.radians(3 * solar_anomaly))
        # )
        equation_of_center = numpy.radians(solar_anomaly)
        numpy.sin(equation_of_center, equation_of_center)
        equation_of_center *= 1.9148
        equation_of_center_2 = solar_anomaly * 2
        numpy.radians(equation_of_center_2, equation_of_center_2)
        numpy.sin(equation_of_center_2, equation_of_center_2)
        equation_of_center_2 *= 0.0200
        equation_of_center += equation_of_center_2
        equation_of_center_2 = solar_anomaly * 3
        numpy.radians(equation_of_center_2, equation_of_center_2)
        numpy.sin(equation_of_center_2, equation_of_center_2)
        equation_of_center_2 *= 0.0003
        equation_of_center += equation_of_center_2
        del equation_of_center_2

        # ecliptic_longitude = (solar_anomaly + equation_of_center + 180 + 102.9372) % 360
        ecliptic_longitude = equation_of_center
        del equation_of_center
        ecliptic_longitude += solar_anomaly
        ecliptic_longitude += 282.9372  # 180 + 102.9372
        ecliptic_longitude %= 360

        # solar_transit = (
        #     2451545.5 + solar_noon + 0.0053*math.sin(math.radians(solar_anomaly)) -
        #     0.0069*math.sin(math.radians(2*ecliptic_longitude))
        # )
        solar_transit = solar_noon
        del solar_noon
        solar_transit += 2451545.5
        numpy.radians(solar_anomaly, solar_anomaly)
        numpy.sin(solar_anomaly, solar_anomaly)
        solar_anomaly *= 0.0053
        solar_transit += solar_anomaly
        del solar_anomaly
        solar_transit_2 = ecliptic_longitude * 2
        numpy.radians(solar_transit_2, solar_transit_2)
        numpy.sin(solar_transit_2, solar_transit_2)
        solar_transit_2 *= 0.0069
        solar_transit -= solar_transit_2
        del solar_transit_2

        # declination = math.asin(math.sin(math.radians(ecliptic_longitude))*math.sin(math.radians(23.44)))
        declination = ecliptic_longitude
        del ecliptic_longitude
        numpy.radians(declination, declination)
        numpy.sin(declination, declination)
        declination *= math.sin(math.radians(23.44))
        numpy.arcsin(declination, declination)

        # hour_angle = math.acos(
        #     (math.sin(math.radians(-.83)) - math.sin(math.radians(lat)) * math.sin(declination)) /
        #     math.cos(math.radians(lat)) * math.cos(declination)
        # )
        hour_angle = numpy.radians(lat_arr)
        numpy.sin(hour_angle, hour_angle)
        hour_angle *= numpy.sin(declination)
        hour_angle -= math.sin(math.radians(-.83))
        hour_angle *= -1
        numpy.radians(lat_arr, lat_arr)
        numpy.cos(lat_arr, lat_arr)
        numpy.cos(declination, declination)
        lat_arr *= declination
        del declination
        hour_angle /= lat_arr
        del lat_arr
        numpy.arccos(hour_angle, hour_angle)

        # sunrise = solar_transit - math.degrees(hour_angle) / 360
        # sunset = solar_transit + math.degrees(hour_angle) / 360
        # return (sunset - sunrise) * 24
        numpy.degrees(hour_angle, hour_angle)
        hour_angle /= 360
        solar_transit = solar_transit.astype('float64')
        days = (solar_transit + hour_angle) - (solar_transit - hour_angle)
        days *= 24
        return days

    def get_mask(self, hours, lat, lon, year, month, day):
        date = datetime.date(year, month, day)

        daylight = self.daylight(date, lat, lon)

        service = Service.objects.get(name='{}_dem'.format(self.region))
        with Dataset(os.path.join(settings.NC_SERVICE_DATA_ROOT, service.data_path)) as ds:
            lat_arr = ds['lat'][:]
            lon_arr = ds['lon'][:]
            coords = SpatialCoordinateVariables.from_bbox(
                service.full_extent, ds.variables['lon'].size, ds.variables['lat'].size, dtype='float64'
            )

        window = coords.get_window_for_bbox(self.data.extent)

        daylight_arr = self.daylight_array(date, lat_arr[window.y_slice], lon_arr[window.x_slice])

        mask = daylight_arr < (daylight - hours)
        mask |= daylight_arr > (daylight + hours)

        return mask


class LatitudeConstraint(Constraint):
    def get_mask(self, **kwargs):
        try:
            min_lat = kwargs['min']
            max_lat = kwargs['max']
        except KeyError:
            raise ValueError('Missing constraint arguments')

        min_lat, max_lat = sorted((min_lat, max_lat))

        coords = SpatialCoordinateVariables.from_bbox(self.data.extent, *reversed(self.data.shape))
        half_pixel_size = float(coords.y.pixel_size) / 2
        start, stop = coords.y.indices_for_range(min_lat + half_pixel_size, max_lat - half_pixel_size)

        mask = numpy.zeros_like(self.data, 'bool')
        mask[:start][:] = True
        mask[stop+1:][:] = True

        return mask


class LongitudeConstraint(Constraint):
    def get_mask(self, **kwargs):
        try:
            min_lon = kwargs['min']
            max_lon = kwargs['max']
        except KeyError:
            raise ValueError('Missing constraint arguments')

        min_lon, max_lon = sorted((min_lon, max_lon))

        coords = SpatialCoordinateVariables.from_bbox(self.data.extent, *reversed(self.data.shape))
        half_pixel_size = float(coords.x.pixel_size) / 2
        start, stop = coords.x.indices_for_range(min_lon + half_pixel_size, max_lon - half_pixel_size)

        mask = numpy.zeros_like(self.data, 'bool')
        mask[:,:start] = True
        mask[:,stop+1:] = True

        return mask


class DistanceConstraint(Constraint):
    def get_mask(self, lat, lon, distance):
        wgs84 = pyproj.Proj('+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs')

        p = pyproj.Proj({
            'proj': 'tmerc',
            'lat_0': lat,
            'lon_0': lon,
            'k': 1,
            'x_0': 0,
            'y_0': 0,
            'ellps': 'WGS84',
            'towgs84': '0,0,0,0,0,0,0',
            'units': 'm'
        })

        # Snap point to nearest cell center
        coords = SpatialCoordinateVariables.from_bbox(self.data.extent, *reversed(self.data.shape))
        lat_pixel_size = coords.y.pixel_size if coords.y.is_ascending_order() else -1 * coords.y.pixel_size
        lat = (
            sorted(coords.y.values)[
                int((lat - coords.y.pixel_size * 1.5 - self.data.extent.ymin) / coords.y.pixel_size)
            ] - lat_pixel_size/2
        )
        lon = (
            sorted(coords.x.values)[
                int((lon - coords.x.pixel_size * 1.5 - self.data.extent.xmin) / coords.x.pixel_size)
            ] - coords.x.pixel_size/2
        )

        project_to_custom = partial(pyproj.transform, wgs84, p)
        project_to_data = partial(pyproj.transform, p, self.data.extent.projection)

        shape = transform(
            project_to_data, transform(project_to_custom, Point(lon, lat)).buffer(distance * 1000, resolution=64)
        )

        return rasterize(
            [shape], out_shape=self.data.shape, fill=1, transform=coords.affine, all_touched=True, default_value=0,
            dtype=numpy.uint8
        )
    

class GeometryConstraint(Constraint): 
    def get_mask(self, **kwargs):
        try:
            geoJSON = kwargs['geoJSON']
        except ValueError:
            raise ValueError('Missing constraint arguments')

        features = geoJSON['features']
        geometries = [f['geometry'] for f in features]
        coords = SpatialCoordinateVariables.from_bbox(self.data.extent, *reversed(self.data.shape))
        return rasterize(
            geometries, out_shape=self.data.shape, fill=1, transform=coords.affine, all_touched=True, default_value=0,
            dtype=numpy.uint8 
        )


class RasterConstraint(Constraint):
    def warp_to_grid(self, path):
        with rasterio.open(path) as dataset:
            bbox = self.data.extent
            vrt_options = {
                'resampling': Resampling.nearest,
                'dst_crs': CRS.from_string(bbox.projection.srs),
                'dst_transform': SpatialCoordinateVariables.from_bbox(
                    bbox, self.data.shape[1], self.data.shape[0]
                ).affine,
                'dst_height': self.data.shape[self.data.y_dim],
                'dst_width': self.data.shape[self.data.x_dim]
            }

            with WarpedVRT(dataset, **vrt_options) as vrt:
                return vrt.read(1, masked=True)

    def get_mask(self, **kwargs):
        try:
            service_name = kwargs['service']
        except ValueError:
            raise ValueError('Missing constraint arguments')

        try:
            service = Service.objects.get(name=service_name)
        except Service.DoesNotExist:
            raise ValueError('Service {} does not exist'.format(service_name))

        raster = self.warp_to_grid(os.path.join(settings.NC_SERVICE_DATA_ROOT, service.data_path))

        return raster < 1
