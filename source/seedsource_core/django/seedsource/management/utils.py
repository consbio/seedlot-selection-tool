from django.contrib.gis.db.models.functions import Area, Intersection
from django.contrib.gis.geos import Polygon
from rasterio.warp import transform as transform_coords

from seedsource_core.django.seedsource.models import Region


def get_regions_for_zone(zone):
    """Returns the best region for the zone based on amount of overlap with the zone's bounding box.

    If the zone only falls within one region, that region is returned.

    Otherwise, this calculates the amount of overlap between the zone's bounding box and the region
    and returns the one with the highest amount of overlap, as an approximation of the region that
    contains most or all of the zone polygon.

    Parameters
    ----------
    extent : SeedZone instance

    Returns
    -------
    Region instance
    """

    extent = Polygon.from_bbox(zone.polygon.extent)
    regions = Region.objects.filter(polygons__intersects=extent)

    if len(regions) == 1:
        return list(regions)

    # calculate amount of overlap and return one with highest overlap with extent
    return list(regions.annotate(overlap=Area(Intersection("polygons", extent))).order_by("-overlap"))


def calculate_pixel_area(transform, width, height):
    """Calculates an approximate pixel area based on finding the UTM zone that
    contains the center latitude / longitude of the window.

    Parameters
    ----------
    transform : Affine object
    width : int
        number of pixels in window
    height : int
        number of pixels in window

    Returns
    -------
    area of a pixel (in meters)
    """

    src_crs = "EPSG:4326"

    cell_x = transform.a
    cell_y = abs(transform.e)

    xmin = transform.c
    xmax = transform.c + ((width + 0) * cell_x)
    center_x = ((xmax - xmin) / 2) + xmin

    ymax = transform.f if transform.e < 0 else transform.f + cell_y * (height + 0)
    ymin = transform.f if transform.e > 0 else transform.f + transform.e * (height + 0)
    center_y = ((ymax - ymin) / 2) + ymin

    ### to use UTM
    # UTM zones start numbered at 1 at -180 degrees, in 6 degree bands
    zone = int(round((center_x - -180) / 6.0)) + 1
    dst_crs = "+proj=utm +zone={} +ellps=GRS80 +datum=NAD83 +units=m +no_defs".format(zone)

    ### to use a custom Albers
    # inset = (ymax - ymin) / 6.0
    # lat1 = ymin + inset
    # lat2 = ymax - inset
    # dst_crs = "+proj=aea +lat_1={:.1f} +lat_2={:.1f} +lat_0={:.1f} +lon_0={:.1f} +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs".format(
    #     lat1, lat2, center_y, center_x
    # )

    xs = [center_x, center_x + cell_x]
    ys = [center_y, center_y + cell_y]
    (x1, x2), (y1, y2) = transform_coords(src_crs, dst_crs, xs, ys)
    area = abs(x1 - x2) * abs(y1 - y2)

    return area


def generate_bands(low, high, increment):
    """Returns a list of bands within low-high based on the increment.
    If low is not at an even increment (e.g., 1378), the first band is between
    low and the next even increment, e.g., [1378, 1500].

    If low is 0, it will be used as is.  Otherwise, 1 will be added to it so
    that bands are generated in the range:
    [[0, 500], [501, 1000], ...]
    or
    [[1001, 1500], [2001, 2500], ...]


    Parameters
    ----------
    low : int
        lower elevation limit of bands
    high : int
        upper elevation limit of bands
    increment : int
        elevation range of each band

    Returns
    -------
    list
        [[band_low, band_high, ], ...]
    """

    if high < low:
        return []

    if (low + increment) > high:
        return [[low, high]]

    # coerce most bands into even multiples of increments
    start = low - (low % increment)
    if start <= low:
        start = start + increment

    bands = [[low if low == 0 else low + 1, start]] + [
        [x + 1, x + increment] for i, x in enumerate(range(start, high, increment))
    ]

    return bands


def generate_missing_bands(bands, min_elevation, max_elevation):
    """Create new bands for gaps in the defined elevation bands, in 500 ft
    increments.
    These identify elevation ranges within the zone that may
    be appropriate as bands in the future (esp. at upper range)

    Parameters
    ----------
    bands : list
        list of band pairs: [[min_elev, max_elev], [...], ...]
    min_elevation : int
        minimum observed elevation in larger zone unit, in feet
    max_elevation : int
        maximum observed elevation in larger zone unit, in feet

    Returns
    -------
    list
        list of band pairs: [[min_elev, max_elev], [...], ...], including
        new bands generated above and below the defined bands.
    """
    lowest_band = bands[0][0]
    highest_band = bands[-1][1]

    if min_elevation < lowest_band:
        # create bands for anything below the lower limit
        new_bands = []
        if min_elevation < 0:
            new_bands.append([-500, -1, "new: below min band"])

        if lowest_band > 0:
            # lowest band will be an odd number (e.g., 2501),
            # subtract 1 to make sure we stay under it.
            for band in generate_bands(0, lowest_band - 1, 500):
                band.append("new: below min band")
                new_bands.append(band)

        bands = new_bands + bands

    if max_elevation > highest_band:
        # create a band for anything above the upper band in 500ft increments
        for band in generate_bands(highest_band, max_elevation, 500):
            band.append("new: above max band")
            bands.append(band)

    return bands
