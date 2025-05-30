import json

from rest_framework import serializers


class GeometryField(serializers.DictField):
    def to_representation(self, value):
        return super().to_representation(json.loads(value.geojson))
