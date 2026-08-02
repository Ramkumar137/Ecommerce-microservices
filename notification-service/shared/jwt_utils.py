import jwt
from django.conf import settings


class JWTService:

    @staticmethod
    def verify_token(token):
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
    def get_user_id(token):
        payload = JWTService.verify_token(token)
        return payload["user_id"]
