# auth/jwt_utils.py

import jwt
from datetime import datetime, timedelta, timezone
from django.conf import settings

now = datetime.now(timezone.utc)

class JWTService:
    """
    JWT utility class.
    """

    @staticmethod
    def generate_access_token(user):
        """
        Generate Access Token.
        """
        
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
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM,
        )

    @staticmethod
    def generate_refresh_token(user):
        """
        Generate Refresh Token.
        """
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
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM,
        )

    @staticmethod
    def verify_token(token):
        """
        Verify JWT token.
        """

        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM],
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

        now = datetime.now(timezone.utc)

        new_payload = {
            "user_id": payload["user_id"],
            "email": payload["email"],
            "role": payload["role"],
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
        """
        Extract user_id from token.
        """

        payload = JWTService.verify_token(token)

        return payload["user_id"]