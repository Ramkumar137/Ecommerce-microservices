import jwt
from datetime import datetime, timedelta, timezone
from django.conf import settings

now = datetime.now(timezone.utc)


class JWTService:

    @staticmethod
    def get_secret_key():
        import os
        return (
            getattr(settings, "JWT_SECRET_KEY", None)
            or os.getenv("JWT_SECRET_KEY")
            or os.getenv("SECRET_KEY")
            or "django-insecure-shared-ecommerce-jwt-secret-key-2026"
        )

    @staticmethod
    def get_algorithm():
        return getattr(settings, "JWT_ALGORITHM", "HS256")

    @staticmethod
    def generate_access_token(user):
        payload = {
            "user_id": user["user_id"],
            "email": user["email"],
            "role": user["role"],
            "type": "access",
            "exp": now + settings.ACCESS_TOKEN_EXPIRE,
            "iat": now,
        }
        return jwt.encode(
            payload,
            JWTService.get_secret_key(),
            algorithm=JWTService.get_algorithm(),
        )

    @staticmethod
    def generate_refresh_token(user):
        payload = {
            "user_id": user["user_id"],
            "email": user["email"],
            "role": user["role"],
            "type": "refresh",
            "exp": now + settings.REFRESH_TOKEN_EXPIRE,
            "iat": now,
        }
        return jwt.encode(
            payload,
            JWTService.get_secret_key(),
            algorithm=JWTService.get_algorithm(),
        )

    @staticmethod
    def verify_token(token):
        secret = JWTService.get_secret_key()
        algorithm = JWTService.get_algorithm()
        try:
            payload = jwt.decode(
                token,
                secret,
                algorithms=[algorithm],
            )
            return payload

        except jwt.ExpiredSignatureError:
            raise ValueError("Token has expired.")

        except jwt.InvalidTokenError:
            raise ValueError("Invalid token.")

    @staticmethod
    def refresh_access_token(refresh_token):
        payload = JWTService.verify_token(refresh_token)

        if payload["type"] != "refresh":
            raise ValueError("Invalid refresh token.")

        new_payload = {
            "user_id": payload["user_id"],
            "type": "access",
            "exp": now + settings.ACCESS_TOKEN_EXPIRE,
            "iat": now,
        }
        return jwt.encode(
            new_payload,
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM,
        )

    @staticmethod
    def get_user_id(token):
        payload = JWTService.verify_token(token)
        return payload["user_id"]
