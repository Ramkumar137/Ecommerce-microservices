import pytest
from authentication.serializers import (
    RegisterSerializer,
    LoginSerializer,
    RefreshTokenSerializer,
    UpdateProfileSerializer,
)


def test_register_serializer_valid():
    data = {
        "first_name": "John",
        "last_name": "Doe",
        "username": "johndoe",
        "email": "john@example.com",
        "phone": "1234567890",
        "password": "StrongPassword123!",
        "role": "CUSTOMER",
    }
    serializer = RegisterSerializer(data=data)
    assert serializer.is_valid(), serializer.errors


def test_register_serializer_missing_fields():
    data = {"first_name": "John"}
    serializer = RegisterSerializer(data=data)
    assert not serializer.is_valid()
    assert "email" in serializer.errors
    assert "password" in serializer.errors


def test_register_serializer_invalid_email():
    data = {
        "first_name": "John",
        "last_name": "Doe",
        "username": "johndoe",
        "email": "invalid-email",
        "phone": "1234567890",
        "password": "StrongPassword123!",
        "role": "CUSTOMER",
    }
    serializer = RegisterSerializer(data=data)
    assert not serializer.is_valid()
    assert "email" in serializer.errors


def test_login_serializer_valid():
    data = {"email": "john@example.com", "password": "Password123!"}
    serializer = LoginSerializer(data=data)
    assert serializer.is_valid()


def test_login_serializer_missing_password():
    data = {"email": "john@example.com"}
    serializer = LoginSerializer(data=data)
    assert not serializer.is_valid()
    assert "password" in serializer.errors


def test_refresh_token_serializer_valid():
    data = {"refresh_token": "some-valid-token"}
    serializer = RefreshTokenSerializer(data=data)
    assert serializer.is_valid()


def test_refresh_token_serializer_missing():
    data = {}
    serializer = RefreshTokenSerializer(data=data)
    assert not serializer.is_valid()
    assert "refresh_token" in serializer.errors


def test_update_profile_serializer_valid():
    data = {"first_name": "Jane", "last_name": "Smith", "phone": "9876543210"}
    serializer = UpdateProfileSerializer(data=data)
    assert serializer.is_valid()
