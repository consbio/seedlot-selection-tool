import numpy


def create_latitude_data(coords):
    """ Given spatial coordinates, create a 2D grid of latitude values to match """

    lat = coords.y.values
    lon = coords.x.values

    return numpy.tile(lat.reshape(len(lat), 1), (1, len(lon)))
