from django.conf import settings
from django.conf.urls import url, include

urlpatterns = [
    url(r'^sst/', include('seedsource_core.django.seedsource.urls')),
    url(r'^accounts/', include('seedsource_core.django.accounts.urls')),
    url(r'^', include('ncdjango.urls'))
]

# For local development, use staticfiles to serve downloads
if settings.DEBUG:
    from django.views.static import serve

    urlpatterns += [
        url(r'^downloads/(?P<path>.*)$', serve, {'document_root': settings.DATASET_DOWNLOAD_DIR})
    ]
