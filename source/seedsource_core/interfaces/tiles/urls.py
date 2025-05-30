from django.urls import re_path

from .views import GetImageView

urlpatterns = [
    re_path(
        r"^tiles/(?P<service_name>[\w\-/]+?)/(?P<z>\d+)/(?P<x>\d+)/(?P<y>\d+).png$",
        GetImageView.as_view(),
        name="tiles_get_image",
    )
]
