from django.conf.urls import url, include

urlpatterns = [
    url(r'^sst/', include('seedsource_core.django.seedsource.urls')),
    url(r'^accounts/', include('seedsource_core.django.accounts.urls')),
    url(r'^', include('ncdjango.urls'))
]
