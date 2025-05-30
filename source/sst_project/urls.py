from django.conf import settings
from django.urls import re_path, include

urlpatterns = [
    re_path(r"^sst/", include("seedsource_core.django.seedsource.urls")),
    re_path(r"^accounts/", include("seedsource_core.django.accounts.urls")),
    re_path(r"^", include("ncdjango.urls")),
]

# For local development, use staticfiles to serve downloads
if settings.DEBUG:
    from django.views.static import serve

    urlpatterns += [
        re_path(
            r"^downloads/(?P<path>.*)$",
            serve,
            {"document_root": settings.DATASET_DOWNLOAD_DIR},
        )
    ]
