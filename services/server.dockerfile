FROM ghcr.io/osgeo/gdal:ubuntu-full-3.11.0

SHELL ["/bin/bash", "-ce"]

RUN apt-get update
RUN apt-get install python3 python3-dev make build-essential libssl-dev zlib1g-dev \
  libbz2-dev libreadline-dev libsqlite3-dev curl git openmpi-common libopenmpi-dev openmpi-bin libhdf5-openmpi-dev \
  libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev -y

RUN git clone https://github.com/pyenv/pyenv.git /.pyenv
ENV PATH /.pyenv/shims:/.pyenv/bin:$PATH

RUN pyenv install 3.10

RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="/root/.local/bin:${PATH}"

RUN mkdir /project
WORKDIR /project

COPY ../pyproject.toml ./
COPY ../poetry.lock ./

RUN poetry env use 3.10
RUN poetry run pip install gdal==3.11
RUN poetry install --no-root

# FIX / Adapt to Docker code
RUN wget https://parallel-netcdf.github.io/Release/pnetcdf-${PNETCDF_VERSION}.tar.gz
RUN tar -xzf pnetcdf-${PNETCDF_VERSION}.tar.gz
WORKDIR pnetcdf-${PNETCDF_VERSION}
RUN ./configure --prefix $NETCDF_DIR --enable-shared --disable-fortran --disable-cxx
RUN make -j 2
RUN make install

WORKDIR /
RUN wget https://downloads.unidata.ucar.edu/netcdf-c/${NETCDF_VERSION}/netcdf-c-${NETCDF_VERSION}.tar.gz
RUN tar -xzf netcdf-c-${NETCDF_VERSION}.tar.gz

WORKDIR netcdf-c-${NETCDF_VERSION}
RUN export CPPFLAGS="-I/usr/include/hdf5/openmpi -I${NETCDF_DIR}/include"
RUN export LDFLAGS="-L${NETCDF_DIR}/lib"
RUN export LIBS="-lhdf5_openmpi_hl -lhdf5_openmpi -lm -lz"
RUN which $CC
RUN ./configure --prefix $NETCDF_DIR --enable-netcdf-4 --enable-shared --enable-dap --enable-parallel4 $NETCDF_EXTRA_CONFIG
RUN make -j 2
RUN make install

WORKDIR /

#FIX ^

RUN git clone https://github.com/Unidata/netcdf4-python.git
WORKDIR netcdf4-python
RUN git submodule update --init

RUN eval $(poetry env activate) && pip install mpi4py && pip install cython && pip install -v --no-build-isolation .

VOLUME /project/app
WORKDIR /project

ENTRYPOINT eval $(poetry env activate) && cd app/source && ./manage.py runserver 0.0.0.0:8000