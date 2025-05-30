import uuid

from django.conf import settings
from django.contrib.auth import (
    login,
    authenticate,
    update_session_auth_hash,
    logout,
    get_user_model,
)
from django.core.mail import send_mail
from django.db import transaction
from django.shortcuts import render
from django.template import loader
from django.urls import reverse, reverse_lazy
from django.utils.translation import gettext as _
from django.views.generic.edit import FormView
from rest_framework.generics import (
    CreateAPIView,
    UpdateAPIView,
    GenericAPIView,
    RetrieveAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .forms import PasswordResetForm
from .models import PasswordResetToken
from . import serializers

PREVIEW_MODE = getattr(settings, "PREVIEW_MODE", False)


class CreateAccountView(CreateAPIView):
    serializer_class = serializers.CreateAccountSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        user = authenticate(user=user)
        login(
            self.request,
            user,
            backend="seedsource_core.django.accounts.backends.IdentityBackend",
        )


class UpdateEmailView(UpdateAPIView):
    serializer_class = serializers.ChangeEmailSerializer
    permission_classes = (IsAuthenticated,)

    def put(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def get_object(self):
        return self.request.user


class UpdatePasswordView(GenericAPIView):
    serializer_class = serializers.ChangePasswordSerializer
    permission_classes = (IsAuthenticated,)

    def put(self, request, *args, **kwargs):
        serializer = self.get_serializer(request.user, data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        update_session_auth_hash(request, user)

        return Response()


class LoginView(GenericAPIView):
    serializer_class = serializers.LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = authenticate(email=data["email"], password=data["password"])
        if user:
            login(request, user)
            return Response()
        else:
            return Response(status=401)


class LogoutView(GenericAPIView):
    def get(self, request, *args, **kwargs):
        logout(request)

        if PREVIEW_MODE:
            request.session["authorized_for_preview"] = (
                True  # Prevent exiting preview mode
            )

        return Response()


class UserInfoView(RetrieveAPIView):
    serializer_class = serializers.UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user


class LostPasswordView(GenericAPIView):
    serializer_class = serializers.LostPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        user = get_user_model().objects.get(email=email)
        token = PasswordResetToken.objects.create(user=user, token=str(uuid.uuid4()))

        body = loader.render_to_string(
            "emails/password_reset.txt",
            {
                "email": user.email,
                "url": request.build_absolute_uri(
                    reverse("reset_password", args=(token.token,))
                ),
            },
            request,
        )

        send_mail(
            _("Seedlot Selection Tool: Reset Password"),
            body,
            "donotreply@seedlotselectiontool.org",
            [user.email],
        )

        return Response()


class PasswordResetView(FormView):
    template_name = "password_reset_form.html"
    form_class = PasswordResetForm
    success_url = reverse_lazy("reset_password_success")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["token"] = self.kwargs.get("token")
        return context

    def form_valid(self, form):
        data = form.cleaned_data

        with transaction.atomic():
            token = PasswordResetToken.objects.get(token=data["token"])
            user = token.user

            user.set_password(data["password"])
            user.save()

            token.used = True
            token.save()

        return super().form_valid(form)
