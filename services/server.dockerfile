FROM ghcr.io/osgeo/gdal:ubuntu-full-3.11.0

SHELL ["/bin/bash", "-ce"]

ENV LD_LIBRARY_PATH="/usr/local/lib"
ENV PATH="/.pyenv/shims:/.pyenv/bin:/root/.local/bin:/usr/local/bin:${PATH}"
ENV HDF5_VERSION="1.14.6"
ENV NETCDF_VERSION="4.9.3"
ENV NETCDF_PYTHON_VERSION="1.6.2"


RUN apt-get update
RUN apt-get install python3 python3-dev make build-essential libssl-dev zlib1g-dev \
  libbz2-dev libreadline-dev libsqlite3-dev curl git libcurl4-openssl-dev m4 \
  libncurses-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev -y

RUN git clone https://github.com/pyenv/pyenv.git /.pyenv

RUN pyenv install 3.10

RUN curl -sSL https://install.python-poetry.org | python3 -

RUN mkdir /project
WORKDIR /project

COPY ../pyproject.toml ./
COPY ../poetry.lock ./

RUN poetry env use 3.10
RUN poetry run pip install gdal==3.11
RUN poetry install --no-root

WORKDIR /root

RUN wget "https://github.com/HDFGroup/hdf5/releases/download/hdf5_${HDF5_VERSION}/hdf5-${HDF5_VERSION}.tar.gz"
RUN tar -xf hdf5-${HDF5_VERSION}.tar.gz
RUN cd hdf5-${HDF5_VERSION} && \
    ./configure --prefix=/usr/local --enable-threadsafe --enable-unsupported && \
    make -j4 && make install
RUN rm -Rf hdf5-*

RUN wget "https://downloads.unidata.ucar.edu/netcdf-c/4.9.3/netcdf-c-${NETCDF_VERSION}.tar.gz"
RUN tar -xf netcdf-c-${NETCDF_VERSION}.tar.gz
RUN cd netcdf-c-${NETCDF_VERSION} && \
    ./configure --prefix=/usr/local && \
    make -j4 && make install
RUN rm -Rf netcdf-c-*

RUN git clone https://github.com/Unidata/netcdf4-python.git
WORKDIR netcdf4-python
RUN git checkout "v${NETCDF_PYTHON_VERSION}"
RUN git submodule update --init
RUN eval $(cd /project && poetry env activate) && pip install cython && pip install -v --no-build-isolation .

VOLUME /project
WORKDIR /project/source
