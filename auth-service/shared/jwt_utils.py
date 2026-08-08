# auth/jwt_utils.py

import jwt
from datetime import datetime, timedelta, timezone
from django.conf import settings

class JWTService:
    """
    JWT utility class.
    """

    @staticmethod
    def get_secret_key():
        import os
        key = (
            os.getenv("JWT_SECRET_KEY")
            or getattr(settings, "JWT_SECRET_KEY", None)
        )
        if key and key != getattr(settings, "SECRET_KEY", None):
            return key
        return "django-insecure-shared-ecommerce-jwt-secret-key-2026"

    @staticmethod
    def get_algorithm():
        return getattr(settings, "JWT_ALGORITHM", "HS256")

    @staticmethod
    def generate_access_token(user):
        """
        Generate Access Token.
        """
        current_time = datetime.now(timezone.utc)
        
        payload = {
            "user_id": user["user_id"],
            "email": user["email"],
            "role": user["role"],
            "type": "access",
            "exp": current_time + settings.ACCESS_TOKEN_EXPIRE,
            "iat": current_time,
        }

        return jwt.encode(
            payload,
            JWTService.get_secret_key(),
            algorithm=JWTService.get_algorithm(),
        )

    @staticmethod
    def generate_refresh_token(user):
        """
        Generate Refresh Token.
        """
        current_time = datetime.now(timezone.utc)
        payload = {
            "user_id": user["user_id"],
            "email": user["email"],
            "role": user["role"],
            "type": "refresh",
            "exp": current_time + settings.REFRESH_TOKEN_EXPIRE,
            "iat": current_time,
        }

        return jwt.encode(
            payload,
            JWTService.get_secret_key(),
            algorithm=JWTService.get_algorithm(),
        )

    @staticmethod
    def verify_token(token):
        """
        Verify JWT token.
        """

        try:
            payload = jwt.decode(
                token,
                JWTService.get_secret_key(),
                algorithms=[JWTService.get_algorithm()],
            )

            return payload

        except jwt.ExpiredSignatureError:
            raise ValueError("Token has expired.")

        except jwt.InvalidTokenError:
            raise ValueError("Invalid token.")

    @staticmethod
    def refresh_access_token(refresh_token):
        """
        Generate new access token using refresh token.
        """
        current_time = datetime.now(timezone.utc)
        payload = JWTService.verify_token(refresh_token)

        if payload["type"] != "refresh":
            raise ValueError("Invalid refresh token.")

        new_payload = {
            "user_id": payload["user_id"],
            "type": "access",
            "exp": current_time + settings.ACCESS_TOKEN_EXPIRE,
            "iat": current_time,
        }

        return jwt.encode(
            new_payload,
            JWTService.get_secret_key(),
            algorithm=JWTService.get_algorithm(),
        )

    @staticmethod
    def get_user_id(token):
        """
        Extract user_id from token.
        """

        payload = JWTService.verify_token(token)

        return payload["user_id"]