import secrets
import zipfile

import netCDF4
import numpy as np
import os.path
import rasterio
from django.conf import settings
from io import BytesIO

from django.template.loader import render_to_string
from django.utils.translation import activate
from ncdjango.geoprocessing.params import StringParameter
from ncdjango.geoprocessing.workflow import Task
from ncdjango.models import Service, Variable, SERVICE_DATA_ROOT
from rasterio.transform import Affine


class WriteTIF(Task):
    name = "write_tif"
    inputs = [
        StringParameter("service_id"),
        StringParameter("language_code", required=False),
    ]
    outputs = [StringParameter("filename")]

    def execute(self, service_id, language_code=None):
        if language_code is None:
            language_code = settings.LANGUAGE_CODE
        activate(language_code)

        svc = Service.objects.get(name=service_id)
        var = Variable.objects.get(service_id=svc.id)
        data_path = svc.data_path
        with netCDF4.Dataset(os.path.join(SERVICE_DATA_ROOT, data_path), "r") as nc:
            data = nc.variables[var.name][:].astype("uint8")
            y_data = nc.variables[var.y_dimension]
            y_increasing = y_data[0] < y_data[1]

        height, width = data.shape
        ex = var.full_extent
        x_step = (ex.xmax - ex.xmin) / width
        y_step = (ex.ymax - ex.ymin) / height
        transform = Affine.from_gdal(
            ex.xmin,
            x_step,
            0,
            ex.ymin if y_increasing else ex.ymax,
            0,
            y_step if y_increasing else -y_step,
        )
        dtype = np.uint8
        nodata = 128

        if not settings.DATASET_DOWNLOAD_DIR.exists():
            settings.DATASET_DOWNLOAD_DIR.mkdir()

        filename = settings.DATASET_DOWNLOAD_DIR / f"tmp{secrets.token_urlsafe(5)}.zip"

        with zipfile.ZipFile(filename, mode="w") as zf:
            tif_data = BytesIO()

            with rasterio.Env(GDAL_TIFF_INTERNAL_MASK=True):
                opts = dict(
                    driver="GTiff",
                    height=height,
                    width=width,
                    crs=var.projection,
                    transform=transform,
                    count=1,
                    dtype=dtype,
                    nodata=nodata,
                )
                with rasterio.open(tif_data, "w", **opts) as dst:
                    dst.write(np.array(data, dtype=dtype), 1)
                    dst.write_mask(np.logical_not(data.mask))

                zf.writestr(
                    "SST Results/results.tif",
                    tif_data.getvalue(),
                    compress_type=zipfile.ZIP_DEFLATED,
                )
                zf.writestr(
                    "SST Results/README.txt",
                    render_to_string(
                        "txt/download_readme.txt", {"language_code": language_code}
                    ),
                    compress_type=zipfile.ZIP_DEFLATED,
                )

        return os.path.basename(filename)
