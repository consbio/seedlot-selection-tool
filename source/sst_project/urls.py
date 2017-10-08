from django.conf.urls import url, include

urlpatterns = [
    url(r'^sst/', include('seedsource_core.django.seedsource.urls')),
]
