# auth/urls.py

from django.urls import path

from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    RefreshTokenView,
    ProfileView,
    HealthView,
    UserListView,
    UserDetailView,
)

urlpatterns = [
    path("health/", HealthView.as_view(), name="auth-health"),
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("refresh/", RefreshTokenView.as_view(), name="auth-refresh"),
    path("profile/", ProfileView.as_view(), name="auth-profile"),
    path("users/", UserListView.as_view(), name="user-list"),
    path("users/<str:user_id>/", UserDetailView.as_view(), name="user-detail"),
]