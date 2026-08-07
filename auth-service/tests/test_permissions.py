import pytest
from unittest.mock import MagicMock
from shared.permissions import IsAuthenticatedUser, IsAdmin


def test_is_authenticated_user_permission():
    perm = IsAuthenticatedUser()
    request = MagicMock()
    request.user = {"user_id": "usr-1", "role": "CUSTOMER"}
    assert perm.has_permission(request, None) is True

    request.user = None
    assert perm.has_permission(request, None) is False


def test_is_admin_permission():
    perm = IsAdmin()
    request = MagicMock()
    request.user = {"user_id": "usr-1", "role": "ADMIN"}
    assert perm.has_permission(request, None) is True

    request.user = {"user_id": "usr-2", "role": "CUSTOMER"}
    assert perm.has_permission(request, None) is False

    request.user = None
    assert perm.has_permission(request, None) is False
