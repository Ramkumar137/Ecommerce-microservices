# shared_testing/fixtures.py

import os
import pytest
from rest_framework.test import APIClient
from .aws_mocks import (
    MockBoto3Resource,
    get_mock_sns_client,
    get_mock_sqs_client,
    get_mock_ses_client,
    get_mock_s3_client,
)
from .jwt_fixtures import (
    create_test_jwt,
    create_expired_jwt,
    create_invalid_signature_jwt,
    get_auth_headers,
    TEST_SECRET_KEY,
)
from .factories import (
    SampleUserPayloadFactory,
    SampleProductPayloadFactory,
    SampleInventoryItemFactory,
    SampleCartItemFactory,
    SampleOrderPayloadFactory,
    SamplePaymentPayloadFactory,
    SampleNotificationPayloadFactory,
)


@pytest.fixture(autouse=True)
def aws_credentials(monkeypatch):
    """Mock AWS Credentials for boto3/botocore."""
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "testing")
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "testing")
    monkeypatch.setenv("AWS_SECURITY_TOKEN", "testing")
    monkeypatch.setenv("AWS_SESSION_TOKEN", "testing")
    monkeypatch.setenv("AWS_DEFAULT_REGION", "us-east-1")
    monkeypatch.setenv("AWS_REGION", "us-east-1")
    monkeypatch.setenv("JWT_SECRET_KEY", TEST_SECRET_KEY)
    monkeypatch.setenv("USER_TABLE", "test-auth-users")
    monkeypatch.setenv("PRODUCT_TABLE", "test-products")
    monkeypatch.setenv("INVENTORY_TABLE", "test-inventory")
    monkeypatch.setenv("CART_TABLE", "test-cart")
    monkeypatch.setenv("ORDER_TABLE", "test-orders")
    monkeypatch.setenv("PAYMENT_TABLE", "test-payments")
    monkeypatch.setenv("NOTIFICATION_TABLE", "test-notifications")
    monkeypatch.setenv("ANALYTICS_TABLE", "test-analytics")
    monkeypatch.setenv("PRODUCT_EVENTS_TOPIC_ARN", "arn:aws:sns:us-east-1:123456789012:product-events")
    monkeypatch.setenv("ORDER_EVENTS_TOPIC_ARN", "arn:aws:sns:us-east-1:123456789012:order-events")
    monkeypatch.setenv("PAYMENT_EVENTS_TOPIC_ARN", "arn:aws:sns:us-east-1:123456789012:payment-events")
    monkeypatch.setenv("S3_BUCKET_NAME", "test-product-images")


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def customer_user():
    return {"user_id": "usr-customer-1", "email": "customer@example.com", "role": "CUSTOMER", "username": "customer1"}


@pytest.fixture
def admin_user():
    return {"user_id": "usr-admin-1", "email": "admin@example.com", "role": "ADMIN", "username": "admin1"}


@pytest.fixture
def customer_token(customer_user):
    return create_test_jwt(user_id=customer_user["user_id"], email=customer_user["email"], role=customer_user["role"])


@pytest.fixture
def admin_token(admin_user):
    return create_test_jwt(user_id=admin_user["user_id"], email=admin_user["email"], role=admin_user["role"])


@pytest.fixture
def customer_headers(customer_token):
    return get_auth_headers(customer_token)


@pytest.fixture
def admin_headers(admin_token):
    return get_auth_headers(admin_token)


@pytest.fixture
def mock_dynamodb_resource():
    return MockBoto3Resource()


@pytest.fixture
def mock_sns():
    return get_mock_sns_client()


@pytest.fixture
def mock_sqs():
    return get_mock_sqs_client()


@pytest.fixture
def mock_ses():
    return get_mock_ses_client()


@pytest.fixture
def mock_s3():
    return get_mock_s3_client()
