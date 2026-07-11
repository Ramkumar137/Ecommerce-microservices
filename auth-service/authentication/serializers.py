# auth/serializers.py

from rest_framework import serializers
from .validators import (
    validate_first_name,
    validate_last_name,
    validate_username,
    validate_email,
    validate_phone,
    validate_password,
    validate_role,
)

class RegisterSerializer(serializers.Serializer):
    """
    Register new user.
    """
    first_name = serializers.CharField(
        max_length=100,
        validators=[validate_first_name]
    )

    last_name = serializers.CharField(
        max_length=100,
        validators=[validate_last_name]
    )

    username = serializers.CharField(
        max_length=100,
        validators=[validate_username]
    )

    email = serializers.CharField(
        max_length=255,
        validators=[validate_email]
    )

    phone = serializers.CharField(
        max_length=10,
        validators=[validate_phone]
    )

    password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )

    role = serializers.CharField(
        default="CUSTOMER"
    )

    def validate_role(self, value):
        return validate_role(value)


class LoginSerializer(serializers.Serializer):
    """
    Login serializer.
    """
    email = serializers.CharField(validators=[validate_email])
    password = serializers.CharField(write_only=True)


class RefreshTokenSerializer(serializers.Serializer):
    """
    Refresh JWT token.
    """
    refresh_token = serializers.CharField()

class UpdateProfileSerializer(serializers.Serializer):
    """
    Update profile.
    """

    first_name = serializers.CharField(
        required=False,
        validators=[validate_first_name]
    )

    last_name = serializers.CharField(
        required=False,
        validators=[validate_last_name]
    )

    phone = serializers.CharField(
        required=False,
        validators=[validate_phone]
    )


class UserResponseSerializer(serializers.Serializer):
    """
    User response.
    """
    user_id = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    username = serializers.CharField()
    email = serializers.CharField()
    phone = serializers.CharField()
    role = serializers.CharField()
    is_active = serializers.BooleanField()
    created_at = serializers.CharField()
    updated_at = serializers.CharField()


class LoginResponseSerializer(serializers.Serializer):
    """
    Login response.
    """

    access_token = serializers.CharField()
    refresh_token = serializers.CharField()
    user = UserResponseSerializer()

class ErrorSerializer(serializers.Serializer):
    """
    Error response.
    """
    error = serializers.CharField()