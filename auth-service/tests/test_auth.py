import pytest
from unittest.mock import MagicMock
from rest_framework.exceptions import AuthenticationFailed
from shared.authentications import JWTAuthentication
from shared_testing.jwt_fixtures import create_test_jwt, create_expired_jwt


def test_jwt_authentication_success():
    auth = JWTAuthentication()
    token = create_test_jwt(user_id="usr-123", email="user@example.com", role="CUSTOMER")

    request = MagicMock()
    request.headers = {"Authorization": f"Bearer {token}"}

    user, token_out = auth.authenticate(request)
    assert user["user_id"] == "usr-123"
    assert user["email"] == "user@example.com"
    assert user["role"] == "CUSTOMER"
    assert token_out == token


def test_jwt_authentication_no_header():
    auth = JWTAuthentication()
    request = MagicMock()
    request.headers = {}
    assert auth.authenticate(request) is None


def test_jwt_authentication_invalid_header_format():
    auth = JWTAuthentication()
    request = MagicMock()
    request.headers = {"Authorization": "Basic invalid_format"}
    assert auth.authenticate(request) is None


def test_jwt_authentication_expired_token():
    auth = JWTAuthentication()
    token = create_expired_jwt()
    request = MagicMock()
    request.headers = {"Authorization": f"Bearer {token}"}

    with pytest.raises(AuthenticationFailed, match="Token has expired"):
        auth.authenticate(request)


def test_jwt_authentication_invalid_token():
    auth = JWTAuthentication()
    request = MagicMock()
    request.headers = {"Authorization": "Bearer invalid.token.str"}

    with pytest.raises(AuthenticationFailed, match="Invalid token"):
        auth.authenticate(request)
