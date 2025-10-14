from django.urls import re_path, include
from rest_framework.routers import DefaultRouter

from . import views
from . import tasks  # Make sure tasks are registered

router = DefaultRouter()
router.register("run-configurations", views.RunConfigurationViewset)
router.register("seedzones", views.SeedZoneViewset)
router.register("transfer-limits", views.TransferLimitViewset)
router.register("share-urls", views.ShareURLViewset)

urlpatterns = [
    re_path(r"^$", views.ToolView.as_view(), name="tool_page"),
    re_path(r"^", include(router.urls)),
    re_path(r"^create-pdf/$", views.GeneratePDFView.as_view(), name="create_pdf"),
    re_path(
        r"^create-ppt/$", views.GeneratePowerPointView.as_view(), name="create_ppt"
    ),
    re_path(r"^regions/$", views.RegionsView.as_view(), name="regions"),
    re_path(r"^feedback/$", views.FeedbackView.as_view(), name="feedback"),
]
