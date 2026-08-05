from rest_framework.permissions import BasePermission

class IsAuthenticatedUser(BasePermission):
    
    def has_permission(self, request, view):
        return request.user is not None

class IsAdmin(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user is not None
            and str(request.user.get("role", "")).upper() == "ADMIN"
        )

class IsCustomer(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user is not None
            and str(request.user.get("role", "")).upper() == "CUSTOMER"
        )