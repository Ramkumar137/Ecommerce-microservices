import pytest
from django.urls import reverse
from rest_framework import status


def test_register_view_success(api_client, mocker):
    mocker.patch(
        "authentication.views.AuthService.register_user",
        return_value={"user_id": "usr-1", "email": "test@example.com"}
    )
    url = reverse("auth-register")
    payload = {
        "first_name": "Jane",
        "last_name": "Doe",
        "username": "janedoe",
        "email": "test@example.com",
        "phone": "+1234567890",
        "password": "Password123!",
        "role": "CUSTOMER",
    }
    response = api_client.post(url, payload, format="json")
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["user_id"] == "usr-1"


def test_register_view_value_error(api_client, mocker):
    mocker.patch(
        "authentication.views.AuthService.register_user",
        side_effect=ValueError("User with this email already exists.")
    )
    url = reverse("auth-register")
    payload = {
        "first_name": "Jane",
        "last_name": "Doe",
        "username": "janedoe",
        "email": "test@example.com",
        "phone": "+1234567890",
        "password": "Password123!",
        "role": "CUSTOMER",
    }
    response = api_client.post(url, payload, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "error" in response.data


def test_register_view_unexpected_error(api_client, mocker):
    mocker.patch(
        "authentication.views.AuthService.register_user",
        side_effect=RuntimeError("Database failure")
    )
    url = reverse("auth-register")
    payload = {
        "first_name": "Jane",
        "last_name": "Doe",
        "username": "janedoe",
        "email": "test@example.com",
        "phone": "+1234567890",
        "password": "Password123!",
        "role": "CUSTOMER",
    }
    response = api_client.post(url, payload, format="json")
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR


def test_login_view_success(api_client, mocker):
    mocker.patch(
        "authentication.views.AuthService.login_user",
        return_value={"access_token": "access", "refresh_token": "refresh"}
    )
    url = reverse("auth-login")
    response = api_client.post(url, {"email": "test@example.com", "password": "Password123!"}, format="json")
    assert response.status_code == status.HTTP_200_OK
    assert "access_token" in response.data


def test_login_view_value_error(api_client, mocker):
    mocker.patch(
        "authentication.views.AuthService.login_user",
        side_effect=ValueError("Invalid email or password")
    )
    url = reverse("auth-login")
    response = api_client.post(url, {"email": "test@example.com", "password": "Password123!"}, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_login_view_unexpected_error(api_client, mocker):
    mocker.patch(
        "authentication.views.AuthService.login_user",
        side_effect=RuntimeError("Unexpected error")
    )
    url = reverse("auth-login")
    response = api_client.post(url, {"email": "test@example.com", "password": "Password123!"}, format="json")
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR


def test_logout_view(api_client, customer_headers):
    url = reverse("logout")
    response = api_client.post(url, **customer_headers)
    assert response.status_code == status.HTTP_200_OK
    assert "message" in response.data


def test_refresh_token_view_success(api_client, mocker):
    mocker.patch(
        "authentication.views.JWTService.refresh_access_token",
        return_value="new-access-token"
    )
    url = reverse("auth-refresh")
    response = api_client.post(url, {"refresh_token": "valid-refresh-token"}, format="json")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["access_token"] == "new-access-token"


def test_refresh_token_view_value_error(api_client, mocker):
    mocker.patch(
        "authentication.views.JWTService.refresh_access_token",
        side_effect=ValueError("Invalid or expired refresh token")
    )
    url = reverse("auth-refresh")
    response = api_client.post(url, {"refresh_token": "invalid-token"}, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_refresh_token_view_unexpected_error(api_client, mocker):
    mocker.patch(
        "authentication.views.JWTService.refresh_access_token",
        side_effect=RuntimeError("Internal error")
    )
    url = reverse("auth-refresh")
    response = api_client.post(url, {"refresh_token": "valid-token"}, format="json")
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR


def test_profile_view_get_success(api_client, customer_headers, mocker):
    mocker.patch(
        "authentication.views.AuthService.get_user",
        return_value={"user_id": "usr-customer-1", "email": "customer@example.com"}
    )
    url = reverse("auth-profile")
    response = api_client.get(url, **customer_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["user_id"] == "usr-customer-1"


def test_profile_view_put_success(api_client, customer_headers, mocker):
    mocker.patch(
        "authentication.views.AuthService.update_profile",
        return_value={"user_id": "usr-customer-1", "first_name": "Updated"}
    )
    url = reverse("auth-profile")
    response = api_client.put(url, {"first_name": "Updated"}, format="json", **customer_headers)
    assert response.status_code == status.HTTP_200_OK


def test_profile_view_delete_success(api_client, customer_headers, mocker):
    mocker.patch("authentication.views.AuthService.delete_user")
    url = reverse("auth-profile")
    response = api_client.delete(url, **customer_headers)
    assert response.status_code == status.HTTP_204_NO_CONTENT


def test_health_view(api_client):
    url = reverse("auth-health")
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["status"] == "UP"


def test_user_list_view_admin_success(api_client, admin_headers, mocker):
    mocker.patch("authentication.views.AuthService.get_all_users", return_value=[])
    url = reverse("user-list")
    response = api_client.get(url, **admin_headers)
    assert response.status_code == status.HTTP_200_OK


def test_user_list_view_forbidden_for_customer(api_client, customer_headers):
    url = reverse("user-list")
    response = api_client.get(url, **customer_headers)
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_user_detail_view_admin_success(api_client, admin_headers, mocker):
    mocker.patch("authentication.views.AuthService.get_user", return_value={"user_id": "usr-123"})
    url = reverse("user-detail", kwargs={"user_id": "usr-123"})
    response = api_client.get(url, **admin_headers)
    assert response.status_code == status.HTTP_200_OK


def test_user_detail_view_not_found(api_client, admin_headers, mocker):
    mocker.patch("authentication.views.AuthService.get_user", side_effect=ValueError("User not found"))
    url = reverse("user-detail", kwargs={"user_id": "usr-999"})
    response = api_client.get(url, **admin_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND
