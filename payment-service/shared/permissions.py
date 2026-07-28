from rest_framework.permissions import BasePermission


class IsAuthenticatedUser(BasePermission):

    def has_permission(self, request, view):
        return isinstance(request.user, dict)


class IsAdmin(BasePermission):

    def has_permission(self, request, view):
        return (
            isinstance(request.user, dict)
            and request.user.get("role") == "ADMIN"
        )


class IsCustomer(BasePermission):

    def has_permission(self, request, view):
        if not isinstance(request.user, dict):
            return False

        role = str(request.user.get("role", "")).upper()

        return role in ["CUSTOMER", "ADMIN", "ADMINISTRATOR"]