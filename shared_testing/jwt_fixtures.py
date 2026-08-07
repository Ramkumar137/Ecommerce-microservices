# shared_testing/jwt_fixtures.py

import jwt
from datetime import datetime, timezone, timedelta

TEST_SECRET_KEY = "django-insecure-shared-ecommerce-jwt-secret-key-2026"
TEST_ALGORITHM = "HS256"


def create_test_jwt(user_id="usr-123", email="user@example.com", role="CUSTOMER", token_type="access", expires_in_seconds=3600, secret_key=TEST_SECRET_KEY):
    now = datetime.now(timezone.utc)
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "type": token_type,
        "iat": now,
        "exp": now + timedelta(seconds=expires_in_seconds),
    }
    return jwt.encode(payload, secret_key, algorithm=TEST_ALGORITHM)


def create_expired_jwt(user_id="usr-123", email="user@example.com", role="CUSTOMER", token_type="access"):
    now = datetime.now(timezone.utc) - timedelta(hours=2)
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "type": token_type,
        "iat": now - timedelta(hours=1),
        "exp": now,
    }
    return jwt.encode(payload, TEST_SECRET_KEY, algorithm=TEST_ALGORITHM)


def create_invalid_signature_jwt(user_id="usr-123", email="user@example.com", role="CUSTOMER"):
    return create_test_jwt(user_id=user_id, email=email, role=role, secret_key="wrong-secret-key")


def get_auth_headers(token):
    return {"HTTP_AUTHORIZATION": f"Bearer {token}"}
