# Adding Data

The Seedlot Selection Tool depends on three types of data: climate data,
as NetCDF files; region boundary data, as shapefiles; and seed zone
data, also as shapefiles.

## Climate Data

Climate data is represented as ncdjango services. To import the data,
first place your data in your `NC_SERVICE_DATA_ROOT` directory (see
`setup-install`) under a directory named `regions`. The data should be
in a directory matching the region the data are for. The DEM should be
placed in the directory for the region and named `<region>_dem.nc`.
Sub-directories should be created for each period / climate scenario. For
example, the directory structure for the `west2` region should be:

``` text
<NC_SERVICE_DATA_ROOT>
+-- regions
|   +-- west2
|   |   +-- 1961_1990SY
|   |   +-- 1981_2010SY
|   |   +-- 1991_2020SY
|   |   +-- ssp245_2011-2040SY
|   |   +-- ssp245_2041-2070SY
|   |   +-- ssp245_2071-2100SY
|   |   +-- ssp370_2011-2040SY
|   |   +-- ssp370_2041-2070SY
|   |   +-- ssp370_2071-2100SY
|   |   +-- ssp585_2011-2040SY
|   |   +-- ssp585_2041-2070SY
|   |   +-- ssp585_2071-2100SY
|   |   +-- west2_dem.nc
```

Inside each directory for a period/scenario, each climate variable dataset
should be named according to region, RCP, period, and variable name in the
following format: `<region>_<ssp245/ssp370/ssp585>_<period>SY_<variable>.nc`. The
current (1991_2020) and historic (1961_1990/1981_2010) periods should not include an
RCP. For example, the contents of the `1961_1990SY` and `ssp245_2011-2040SY`
directories for the `west2` region should be:

``` text
+-- 1961_1990SY
|   +-- west2_1961_1990SY_AHM.nc
|   +-- west2_1961_1990SY_bFFP.nc
|   +-- west2_1961_1990SY_CMD_at.nc
|   +-- <...>
+-- ssp245_2011-2040SY
|   +-- west2_ssp245_2011-2040SY_AHM.nc
|   +-- west2_ssp245_2011-2040SY_bFFP.nc
|   +-- west2_ssp245_2011-2040SY_CMD_at.nc
```

Run the following command to import the region elevation and all climate
variables:

``` text
$ python source/manage.py populate_climate_data <region>
```

The command will assume the variables and periods fround in
`source/seedsource_core/django/seedsource/management/constants.py`.
If you are using different variables and/or periods, you will need to edit that file.

## Region Boundary Data

You should simplify your boundary data before importing it into the
tool. Next, import the region into the tool:

``` text
$ python source/manage.py add_region <region> <path to shapefile>
```
Note: the shapefile can be a zipfile

If it doesn't already exist, you should also convert the region boundary to GeoJSON and add it to the
directory `sst/static/geometry/<region>_boundary.json`, and re-run:

``` text
$ npm run-script merge-regions
```

## Seed Zone Data

Seed zones are expected to be contained in `data/seedzones`. You can
configure this by setting the value of `SEEDZONES_LOCATION` in your
`custom.py` settings file (described in `setup-install` setup document).

Seed zones are stored in a ZIP file, which includes a `config.py` file
with configuration options for the seed zones.

You can import a prepared seed zone set with the following command:

``` text
$ python source/manage.py import_seedzones <base name of seed zones zipfile>
```

After importing the zones, you should run the `calculate_zone_transfers`
command to generate transfer limits for each zone and elevation band
(you will need to have service data for the appropriate region loaded
first). Running the command with no arguments will process all zone
sets:

``` text
$ python manage.py calculate_zone_transfers --clear
```

Running the command with a `--zones` argument will process only zones for
a single set:

``` text
$ python manage.py calculate_zone_transfers --zones region9
```

Constraints files should be named following the format:
```text
<species-code>_15gcm_<climate-model>_<period>_pa.nc
# psme_15gcm_ssp370_2011_2040_pa.nc
```
-or-
```text
<species-code>_p<period>_800m_pa.nc
# psme_p1981_2010_800m_pa.nc
```
See `src/config.ts:serializeSpeciesConstraint` to update formatting.

Place your constraints data in `/data/constraints` and run:

```text
python manage.py publish_netcdf --overwrite ../data/constraints/*.nc
```
## Species Range Constraints Data