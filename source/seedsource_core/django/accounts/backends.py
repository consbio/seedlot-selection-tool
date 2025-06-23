from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist


class IdentityBackend:
    """Authenticate a user based on a `User` object (used to manually authenticate a user)"""

    def authenticate(self, request, user=None):
        return user if isinstance(user, get_user_model()) else None

    def get_user(self, user_id):
        try:
            return get_user_model().objects.get(pk=user_id)
        except ObjectDoesNotExist:
            return None


class EmailAuthenticationBackend:
    def authenticate(self, request, email, password):
        try:
            user = get_user_model().objects.get(email=email)

            if user.check_password(password):
                return user
        except ObjectDoesNotExist:
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a non-existing user (#20760).
            get_user_model()().set_password(password)

    def get_user(self, user_id):
        try:
            return get_user_model().objects.get(pk=user_id)
        except ObjectDoesNotExist:
            return None
