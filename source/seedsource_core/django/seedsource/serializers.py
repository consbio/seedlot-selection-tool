import hashlib
import json
import string
import sys

from django.contrib.gis.geos import Point
from rest_framework import serializers
from rest_framework.exceptions import ParseError

from .models import SeedZone, TransferLimit, Region, RunConfiguration, ShareURL
from .utils import get_elevation_at_point

B62_CHARS = string.digits + string.ascii_letters


class RunConfigurationSerializer(serializers.ModelSerializer):
    configuration = serializers.JSONField()

    class Meta:
        model = RunConfiguration
        fields = ('uuid', 'created', 'modified', 'title', 'version', 'configuration')
        read_only_fields = ('uuid', 'created', 'modified')


class SeedZoneSerializer(serializers.ModelSerializer):
    elevation_at_point = serializers.SerializerMethodField()
    elevation_band = serializers.SerializerMethodField()
    elevation_service = serializers.SerializerMethodField()

    class Meta:
        model = SeedZone
        fields = (
            'id', 'name', 'species', 'zone_id', 'zone_uid', 'elevation_at_point', 'elevation_band', 'elevation_service'
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self._elevation_at_point_mem = None

    @property
    def _elevation_at_point(self):
        if self._elevation_at_point_mem is None:
            request = self.context['request']

            if not request.query_params.get('point'):
                return None
            else:
                try:
                    x, y = [float(x) for x in request.query_params['point'].split(',')]
                except ValueError:
                    raise ParseError()

                point = Point(x, y)
                self._elevation_at_point_mem = get_elevation_at_point(point)

        return self._elevation_at_point_mem

    def _transfer_limit(self, obj):
        if self._elevation_at_point is None:
            return None

        elevation = self._elevation_at_point / 0.3048  # Elevation bands are stored in feet, elevation is in meters

        return obj.transferlimit_set.filter(low__lt=elevation, high__gte=elevation).first()

    def get_elevation_at_point(self, obj):
        return self._elevation_at_point

    def get_elevation_band(self, obj: SeedZone):
        transfer = self._transfer_limit(obj)
        if transfer is None:
            return None

        band = [0 if transfer.low == -1 else transfer.low, transfer.high]

        if transfer.label is not None:
            band.append(transfer.label)

        return band

    def get_elevation_service(self, obj):
        transfer = self._transfer_limit(obj)
        if transfer is None:
            return None

        return transfer.elevation.name if transfer.elevation else None


class TransferLimitSerializer(serializers.ModelSerializer):
    zone = SeedZoneSerializer()
    elevation_service = serializers.SerializerMethodField()

    class Meta:
        model = TransferLimit
        fields = (
            'variable', 'zone', 'transfer', 'avg_transfer', 'center', 'low', 'high', 'time_period', 'label',
            'elevation_service'
        )

    def get_elevation_service(self, obj: TransferLimit):
        return obj.elevation.name if obj.elevation else None


class GenerateReportSerializer(serializers.Serializer):
    configuration = serializers.JSONField()
    tile_layers = serializers.JSONField()
    zoom = serializers.IntegerField()
    center = serializers.ListField(child=serializers.FloatField())
    opacity = serializers.FloatField()


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ('name',)


class ShareURLSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShareURL
        fields = ('configuration', 'version', 'hash', 'created', 'accessed')
        read_only_fields = ('hash', 'created', 'accessed')

    def create(self, validated_data):
        configuration = validated_data['configuration']
        version = validated_data['version']
        string_to_hash = configuration + str(version)
        hash_as_bytes = hashlib.sha256(string_to_hash.encode()).digest()
        hash_as_integer = int.from_bytes(hash_as_bytes, sys.byteorder)
        hash_as_b62_truncated = ''
        for i in range(8):
            hash_as_b62_truncated += B62_CHARS[hash_as_integer % 62]
            hash_as_integer //= 62

        return ShareURL.objects.get_or_create(
            hash=hash_as_b62_truncated,
            defaults={'configuration': json.loads(configuration), 'version': version}
        )[0]
