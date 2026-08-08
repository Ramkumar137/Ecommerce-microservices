import pytest
import bcrypt
from authentication.services import AuthService


def test_register_user_success(mocker):
    mock_table = mocker.MagicMock()
    mock_table.query.return_value = {"Items": []}
    mock_table.scan.return_value = {"Items": []}
    mocker.patch("authentication.services.get_table", return_value=mock_table)

    user = AuthService.register_user(
        first_name="Jane",
        last_name="Doe",
        username="janedoe",
        email="jane@example.com",
        phone="+1234567890",
        password="Password123!",
        role="CUSTOMER",
    )

    assert user["email"] == "jane@example.com"
    assert user["username"] == "janedoe"
    assert mock_table.put_item.called


def test_register_user_duplicate_email(mocker):
    mock_table = mocker.MagicMock()
    mock_table.scan.return_value = {"Items": [{"email": "jane@example.com", "username": "other"}]}
    mocker.patch("authentication.services.get_table", return_value=mock_table)

    with pytest.raises(ValueError, match="already exists"):
        AuthService.register_user(
            first_name="Jane",
            last_name="Doe",
            username="janedoe",
            email="jane@example.com",
            phone="+1234567890",
            password="Password123!",
            role="CUSTOMER",
        )


def test_login_user_success(mocker):
    hashed = bcrypt.hashpw(b"Password123!", bcrypt.gensalt()).decode("utf-8")
    existing_user = {
        "user_id": "usr-123",
        "email": "jane@example.com",
        "password": hashed,
        "role": "CUSTOMER",
    }
    mock_table = mocker.MagicMock()
    mock_table.scan.return_value = {"Items": [existing_user]}
    mocker.patch("authentication.services.get_table", return_value=mock_table)

    tokens = AuthService.login_user("jane@example.com", "Password123!")
    assert "access_token" in tokens
    assert "refresh_token" in tokens


def test_login_user_invalid_credentials(mocker):
    mock_table = mocker.MagicMock()
    mock_table.scan.return_value = {"Items": []}
    mocker.patch("authentication.services.get_table", return_value=mock_table)

    with pytest.raises(ValueError, match="Invalid email or password"):
        AuthService.login_user("jane@example.com", "WrongPassword")


def test_get_user_found(mocker):
    existing_user = {"user_id": "usr-123", "email": "jane@example.com", "password": "secret_hash"}
    mock_table = mocker.MagicMock()
    mock_table.get_item.return_value = {"Item": existing_user}
    mocker.patch("authentication.services.get_table", return_value=mock_table)

    user = AuthService.get_user("usr-123")
    assert user["user_id"] == "usr-123"
    assert "password" not in user


def test_get_user_not_found(mocker):
    mock_table = mocker.MagicMock()
    mock_table.get_item.return_value = {}
    mocker.patch("authentication.services.get_table", return_value=mock_table)

    with pytest.raises(ValueError, match="User not found"):
        AuthService.get_user("usr-999")


def test_update_profile_success(mocker):
    existing_user = {"user_id": "usr-123", "email": "jane@example.com", "first_name": "Jane"}
    mock_table = mocker.MagicMock()
    mock_table.get_item.return_value = {"Item": existing_user}
    mocker.patch("authentication.services.get_table", return_value=mock_table)

    updated = AuthService.update_profile("usr-123", {"first_name": "Janet"})
    assert updated["first_name"] == "Janet"
    assert mock_table.update_item.called


def test_delete_user(mocker):
    mock_table = mocker.MagicMock()
    mock_table.get_item.return_value = {"Item": {"user_id": "usr-123"}}
    mocker.patch("authentication.services.get_table", return_value=mock_table)

    AuthService.delete_user("usr-123")
    assert mock_table.delete_item.called


def test_health_check():
    health = AuthService.health()
    assert health["status"] == "UP"
    assert health["service"] == "auth"


def test_get_all_users(mocker):
    mock_table = mocker.MagicMock()
    mock_table.scan.return_value = {"Items": [{"user_id": "usr-1", "password": "pw"}, {"user_id": "usr-2", "password": "pw"}]}
    mocker.patch("authentication.services.get_table", return_value=mock_table)

    users = AuthService.get_all_users()
    assert len(users) == 2
    assert "password" not in users[0]
