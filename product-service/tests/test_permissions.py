import pytest
from unittest.mock import MagicMock
from shared.permissions import IsAdmin, AllowAny


def test_is_admin_permission():
    perm = IsAdmin()
    request = MagicMock()
    request.user = {"user_id": "usr-admin-1", "role": "ADMIN"}
    assert perm.has_permission(request, None) is True

    request.user = {"user_id": "usr-cust-1", "role": "CUSTOMER"}
    assert perm.has_permission(request, None) is False

    request.user = None
    assert perm.has_permission(request, None) is False
