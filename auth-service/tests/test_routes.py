import pytest
from django.urls import reverse, resolve
from authentication import views


def test_register_route_reverses_and_resolves():
    url = reverse("auth-register")
    assert url == "/api/auth/register/"
    resolved = resolve(url)
    assert resolved.func.view_class == views.RegisterView


def test_login_route_reverses_and_resolves():
    url = reverse("auth-login")
    assert url == "/api/auth/login/"
    resolved = resolve(url)
    assert resolved.func.view_class == views.LoginView


def test_logout_route_reverses_and_resolves():
    url = reverse("logout")
    assert url == "/api/auth/logout/"
    resolved = resolve(url)
    assert resolved.func.view_class == views.LogoutView


def test_refresh_token_route_reverses_and_resolves():
    url = reverse("auth-refresh")
    assert url == "/api/auth/refresh/"
    resolved = resolve(url)
    assert resolved.func.view_class == views.RefreshTokenView


def test_profile_route_reverses_and_resolves():
    url = reverse("auth-profile")
    assert url == "/api/auth/profile/"
    resolved = resolve(url)
    assert resolved.func.view_class == views.ProfileView


def test_health_route_reverses_and_resolves():
    url = reverse("auth-health")
    assert url == "/api/auth/health/"
    resolved = resolve(url)
    assert resolved.func.view_class == views.HealthView


def test_user_list_route_reverses_and_resolves():
    url = reverse("user-list")
    assert url == "/api/auth/users/"
    resolved = resolve(url)
    assert resolved.func.view_class == views.UserListView


def test_user_detail_route_reverses_and_resolves():
    url = reverse("user-detail", kwargs={"user_id": "usr-100"})
    assert url == "/api/auth/users/usr-100/"
    resolved = resolve(url)
    assert resolved.func.view_class == views.UserDetailView
