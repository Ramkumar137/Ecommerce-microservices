from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .jwt_utils import JWTService


class JWTAuthentication(BaseAuthentication):

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        token = None

        if auth_header:
            if not auth_header.startswith("Bearer "):
                raise AuthenticationFailed("Invalid authorization header.")

            parts = auth_header.split()

            if len(parts) != 2 or parts[0] != "Bearer":
                raise AuthenticationFailed("Invalid authorization header.")

            token = parts[1]

        # Fallback: Extract JWT token from cookies if Authorization header is missing
        if not token and hasattr(request, "COOKIES") and request.COOKIES:
            token = (
                request.COOKIES.get("admin_access_token")
                or request.COOKIES.get("access_token")
                or request.COOKIES.get("token")
                or request.COOKIES.get("jwt")
            )

        if not token or token == "undefined" or token == "null":
            return None

        try:
            payload = JWTService.verify_token(token)
            request_user = {
                "user_id": payload["user_id"],
                "email": payload.get("email"),
                "role": str(payload.get("role") or "").upper().strip(),
            }
            return (request_user, None)

        except Exception:
            raise AuthenticationFailed("Invalid or expired token.")
