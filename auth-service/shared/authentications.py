from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .jwt_utils import JWTService


class JWTAuthentication(BaseAuthentication):
    """
    JWT Authentication
    """

    def authenticate(self, request):

        auth_header = None
        if hasattr(request, "headers") and request.headers and isinstance(request.headers, dict):
            auth_header = request.headers.get("Authorization") or request.headers.get("authorization")
        if not auth_header and hasattr(request, "META") and isinstance(request.META, dict):
            auth_header = request.META.get("HTTP_AUTHORIZATION")
        if not auth_header and hasattr(request, "headers"):
            try:
                auth_header = request.headers.get("Authorization")
            except Exception:
                pass

        token = None

        if auth_header and isinstance(auth_header, str):
            if not auth_header.startswith("Bearer "):
                return None

            parts = auth_header.split()

            if len(parts) != 2 or parts[0] != "Bearer":
                return None

            token = parts[1]

        # Fallback: Extract JWT from cookies if Authorization header is missing
        cookies = getattr(request, "COOKIES", None)
        if not token and cookies and isinstance(cookies, dict):
            token = (
                cookies.get("access_token")
                or cookies.get("admin_access_token")
                or cookies.get("token")
                or cookies.get("jwt")
            )

        if not token or token == "undefined" or token == "null" or not isinstance(token, str):
            return None

        try:
            payload = JWTService.verify_token(token)
            request_user = {
                "user_id": payload["user_id"],
                "email": payload.get("email"),
                "role": str(payload.get("role") or "").upper().strip(),
            }

            return (request_user, token)

        except ValueError as e:
            raise AuthenticationFailed(str(e))
        except AuthenticationFailed:
            raise
        except Exception:
            raise AuthenticationFailed("Invalid token.")