import json

from django.conf import settings
from django.contrib.gis.db.models.functions import AsGeoJSON
from django.contrib.gis.geos import Point
from django.db.models import Q
from django.http import HttpResponse
from django.utils.timezone import now
from django.views.generic.base import TemplateView
from numpy.ma.core import is_masked
from rest_framework import viewsets, mixins
from rest_framework.decorators import action
from rest_framework.exceptions import ParseError
from rest_framework.generics import GenericAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import TransferLimit, SeedZone, RunConfiguration, Region, ShareURL
from .report import Report
from .serializers import (
    RunConfigurationSerializer,
    SeedZoneSerializer,
    GenerateReportSerializer,
    ShareURLSerializer,
)
from .serializers import TransferLimitSerializer, RegionSerializer
from .utils import get_elevation_at_point, get_regions_for_point

SEEDSOURCE_TITLE = getattr(settings, "SEEDSOURCE_TITLE", "seedsource-core")
MBTILESERVER_ROOT = getattr(settings, "MBTILESERVER_ROOT", None)


class ToolView(TemplateView):
    template_name = "seedsource.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = SEEDSOURCE_TITLE
        context["mbtileserverRoot"] = MBTILESERVER_ROOT
        return context


class RunConfigurationViewset(viewsets.ModelViewSet):
    queryset = RunConfiguration.objects.all()
    serializer_class = RunConfigurationSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "uuid"

    def get_queryset(self):
        return RunConfiguration.objects.filter(owner=self.request.user).order_by(
            "-modified"
        )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class SeedZoneViewset(viewsets.ReadOnlyModelViewSet):
    queryset = SeedZone.objects.all()
    serializer_class = SeedZoneSerializer
    filter_fields = ("species",)
    lookup_field = "zone_uid"

    def get_queryset(self):
        queryset = self.queryset
        if self.request.path.endswith("/geometry/"):
            queryset = queryset.annotate(geojson=AsGeoJSON("polygon"))

        if not self.request.query_params.get("point"):
            return queryset
        else:
            try:
                x, y = [float(x) for x in self.request.query_params["point"].split(",")]
            except ValueError:
                raise ParseError()
            point = Point(x, y)

            return queryset.filter(polygon__contains=point).order_by(
                "zone_source__order"
            )

    @action(detail=True, methods=["get"])
    def geometry(self, *args, **kwargs):
        return Response(json.loads(self.get_object().geojson))


class TransferLimitViewset(viewsets.ReadOnlyModelViewSet):
    queryset = TransferLimit.objects.all().select_related("zone").defer("zone__polygon")
    serializer_class = TransferLimitSerializer
    filter_fields = ("variable", "time_period", "zone_id", "zone")

    def get_queryset(self):
        if not self.request.query_params.get("point"):
            return self.queryset
        else:
            try:
                x, y = [float(x) for x in self.request.query_params["point"].split(",")]
            except ValueError:
                raise ParseError()

            elevation = get_elevation_at_point(Point(x, y))

            if elevation is None or is_masked(elevation):
                return self.queryset.none()

            # Elevation bands are stored in feet
            return self.queryset.filter(
                Q(low__lt=elevation / 0.3048, high__gte=elevation / 0.3048)
                | Q(low__isnull=True, high__isnull=True)
            )


class ReportViewBase(GenericAPIView):
    serializer_class = GenerateReportSerializer

    def _response(self, report):
        raise NotImplementedError

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        return self._response(
            Report(
                data["configuration"],
                data["zoom"],
                data["center"],
                data["tile_layers"],
                data["opacity"],
                request,
            )
        )


class GeneratePDFView(ReportViewBase):
    def _response(self, report):
        pdf_data = report.get_pdf_data()
        response = HttpResponse(
            content=pdf_data.getvalue(), content_type="application/x-pdf"
        )
        response["Content-disposition"] = (
            'attachment; filename="SST Report {}.pdf"'.format(
                now().strftime("%b %-d, %Y")
            )
        )
        return response


class GeneratePowerPointView(ReportViewBase):
    def _response(self, report):
        pptx_data = report.get_pptx_data()
        response = HttpResponse(
            content=pptx_data.getvalue(), content_type="application/vnd.ms-powerpoint"
        )
        response["Content-disposition"] = (
            'attachment; filename="SST Report {}.pptx"'.format(
                now().strftime("%b %-d, %Y")
            )
        )
        return response


class RegionsView(ListAPIView):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer

    def get_queryset(self):
        if not self.request.query_params.get("point"):
            return self.queryset
        else:
            try:
                x, y = [float(x) for x in self.request.query_params["point"].split(",")]
            except ValueError:
                raise ParseError()

            point = Point(x, y)
            return get_regions_for_point(point)


class ShareURLViewset(
    mixins.CreateModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet
):
    queryset = ShareURL.objects.all()
    serializer_class = ShareURLSerializer
    lookup_field = "hash"

    def retrieve(self, request, hash):
        share_url = ShareURL.objects.get(hash=hash)
        share_url.accessed = now()
        share_url.save()
        return super().retrieve(request, hash)
