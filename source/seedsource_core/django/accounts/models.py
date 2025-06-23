from django.conf import settings
from django.db import models


class PasswordResetToken(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    token = models.CharField(max_length=36, db_index=True, unique=True)
    created = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)
