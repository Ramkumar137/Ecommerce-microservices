from rest_framework.permissions import BasePermission

class IsAuthenticatedUser(BasePermission):
    def has_permission(self, request, view):
        return request.user is not None

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user:
            return False
        role = str(request.user.get("role", "")).upper().strip()
        return role in ["ADMIN", "ADMINISTRATOR"]

class IsCustomer(BasePermission):
    def has_permission(self, request, view):
        if not request.user:
            return False
        role = str(request.user.get("role", "")).upper().strip()
        return role in ["CUSTOMER", "ADMIN", "ADMINISTRATOR"]
