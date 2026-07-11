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
        return (
            isinstance(request.user, dict)
            and request.user.get("role") == "CUSTOMER"
        )