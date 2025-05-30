from django.urls import include, re_path
from django.views.generic.base import TemplateView

from . import views

urlpatterns = [
    re_path(r"^create-account/$", views.CreateAccountView.as_view()),
    re_path(r"^change-email/$", views.UpdateEmailView.as_view()),
    re_path(r"^change-password/$", views.UpdatePasswordView.as_view()),
    re_path(r"^login/$", views.LoginView.as_view()),
    re_path(r"^logout/$", views.LogoutView.as_view()),
    re_path(r"^user-info/$", views.UserInfoView.as_view()),
    re_path(r"^lost-password/$", views.LostPasswordView.as_view()),
    re_path(
        r"^reset-password/(?P<token>[0-9A-Za-z\-]{36})/",
        views.PasswordResetView.as_view(),
        name="reset_password",
    ),
    re_path(
        r"^reset-password-success/",
        TemplateView.as_view(template_name="password_reset_success.html"),
        name="reset_password_success",
    ),
    re_path("", include("social_django.urls", namespace="social")),
]
