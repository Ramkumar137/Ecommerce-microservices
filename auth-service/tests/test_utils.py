import os
import pytest
import jwt
from shared.jwt_utils import JWTService
from utils.dynamodb import get_dynamodb_resource, get_table, dynamodb


def test_jwt_service_generate_tokens():
    user = {"user_id": "usr-test-1", "email": "test@example.com", "role": "CUSTOMER"}
    access = JWTService.generate_access_token(user)
    refresh = JWTService.generate_refresh_token(user)
    assert isinstance(access, str)
    assert isinstance(refresh, str)

    payload = JWTService.verify_token(access)
    assert payload["user_id"] == "usr-test-1"
    assert payload["email"] == "test@example.com"
    assert payload["role"] == "CUSTOMER"


def test_jwt_service_refresh_access_token():
    user = {"user_id": "usr-test-1", "email": "test@example.com", "role": "CUSTOMER"}
    refresh = JWTService.generate_refresh_token(user)
    new_access = JWTService.refresh_access_token(refresh)
    assert isinstance(new_access, str)

    payload = JWTService.verify_token(new_access)
    assert payload["user_id"] == "usr-test-1"


def test_jwt_service_decode_expired_token():
    from shared_testing.jwt_fixtures import create_expired_jwt
    expired_token = create_expired_jwt()
    with pytest.raises(ValueError, match="Token has expired"):
        JWTService.verify_token(expired_token)


def test_jwt_service_decode_invalid_signature():
    from shared_testing.jwt_fixtures import create_invalid_signature_jwt
    invalid_token = create_invalid_signature_jwt()
    with pytest.raises(ValueError, match="Invalid token"):
        JWTService.verify_token(invalid_token)


def test_jwt_service_decode_malformed_token():
    with pytest.raises(ValueError, match="Invalid token"):
        JWTService.verify_token("not.a.valid.jwt.token")


def test_dynamodb_utils(mocker):
    mocker.patch("utils.dynamodb._dynamodb_resource", None)
    mock_resource = mocker.patch("utils.dynamodb.boto3.resource")
    get_dynamodb_resource()
    assert mock_resource.called

    tbl = get_table("test-table")
    assert tbl is not None

    tbl2 = dynamodb.Table("test-table-2")
    assert tbl2 is not None
