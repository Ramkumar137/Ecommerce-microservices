from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .jwt_utils import JWTService


class JWTAuthentication(BaseAuthentication):
    """
    JWT Authentication
    """

    def authenticate(self, request):

        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return None

        if not auth_header.startswith("Bearer "):
            raise AuthenticationFailed(
                "Invalid authorization header."
            )

        parts = auth_header.split()

        if len(parts) != 2 or parts[0] != "Bearer":
            raise AuthenticationFailed("Invalid authorization header.")

        token = parts[1]

        try:
            payload = JWTService.verify_token(token)
            request_user = {
                "user_id": payload["user_id"],
                "email": payload.get("email"),
                "role": str(payload.get("role") or "").upper().strip(),
            }

            return (request_user, None)

        except Exception:
            raise AuthenticationFailed(
                "Invalid or expired token."
            )