import json
import pytest
from lambda_handler import lambda_handler


def test_lambda_handler_api_gateway_event(mocker):
    mock_mangum = mocker.patch("lambda_handler._mangum_handler")
    mock_mangum.return_value = {"statusCode": 200, "body": json.dumps({"status": "UP"})}

    event = {
        "httpMethod": "GET",
        "path": "/api/auth/health/",
        "headers": {},
        "requestContext": {},
    }
    response = lambda_handler(event, None)
    assert response["statusCode"] == 200
    assert mock_mangum.called


def test_lambda_handler_direct_invocation_health():
    event = {"action": "health"}
    response = lambda_handler(event, None)
    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["status"] == "UP"
    assert body["service"] == "auth"


def test_lambda_handler_direct_invocation_default():
    event = {"action": "other", "data": 123}
    response = lambda_handler(event, None)
    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["success"] is True


def test_lambda_handler_exception(mocker):
    mocker.patch("lambda_handler._mangum_handler", side_effect=Exception("Mangum error"))
    event = {"httpMethod": "GET", "path": "/api/auth/health/"}
    # Direct handler invocation without mangum error
    mocker.patch("json.dumps", side_effect=Exception("JSON error"))
    event_direct = {"action": "health"}
    res = lambda_handler(event_direct, None)
    assert res["statusCode"] == 500
    body = json.loads(res["body"])
    assert body["success"] is False
