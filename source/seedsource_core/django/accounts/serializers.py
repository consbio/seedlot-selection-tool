from django.contrib.auth import get_user_model
from django.utils.translation import gettext as _
from rest_framework import serializers


class UniqueEmailMixin(object):
    def validate_email(self, value):
        if get_user_model().objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                _("An account with this email address already exists.")
            )
        return value.lower()


class CreateAccountSerializer(UniqueEmailMixin, serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        base_username = validated_data["email"].split("@")[0][:25]
        username = base_username
        postfix = 0

        while get_user_model().objects.filter(username__iexact=username).exists():
            postfix += 1
            username = "{}_{}".format(base_username, postfix)

        return get_user_model().objects.create_user(
            username, validated_data["email"], validated_data["password"]
        )


class ChangeEmailSerializer(UniqueEmailMixin, serializers.Serializer):
    email = serializers.EmailField()

    def update(self, instance, validated_data):
        instance.email = validated_data["email"]
        instance.save()

        return instance


class ChangePasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)

    def update(self, instance, validated_data):
        instance.set_password(validated_data["password"])
        instance.save()

        return instance


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField()

    def validate_email(self, value):
        return value.lower()


class UserSerializer(serializers.Serializer):
    email = serializers.EmailField()


class LostPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not get_user_model().objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                _(
                    "No account with this email address exists. Please create a new account."
                )
            )
        return value.lower()
