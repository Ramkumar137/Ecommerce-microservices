# payment/validators.py

from rest_framework import serializers
from decimal import Decimal

VALID_PAYMENT_METHODS = [
    "CARD",
    "UPI",
    "NET_BANKING",
    "WALLET",
    "COD"
]

VALID_PAYMENT_STATUSES = [
    "PENDING",
    "SUCCESS",
    "FAILED",
    "REFUNDED",
    "CANCELLED"
]


def validate_order_id(order_id):
    if not order_id or not str(order_id).strip():
        raise serializers.ValidationError("Order ID is required.")
    return order_id


def validate_user_id(user_id):
    if not user_id or not str(user_id).strip():
        raise serializers.ValidationError("User ID is required.")
    return user_id


def validate_amount(amount):
    try:
        amount = Decimal(str(amount))
    except (TypeError, ValueError):
        raise serializers.ValidationError("Amount must be numeric.")

    if amount <= 0:
        raise serializers.ValidationError(
            "Amount must be greater than zero."
        )

    return amount


def validate_currency(currency):
    if not currency or not str(currency).strip():
        raise serializers.ValidationError(
            "Currency is required."
        )

    return currency.upper()


def validate_payment_method(method):
    method = method.upper()

    if method not in VALID_PAYMENT_METHODS:
        raise serializers.ValidationError(
            f"Allowed methods: {', '.join(VALID_PAYMENT_METHODS)}"
        )

    return method


def validate_payment_status(status):
    status = status.upper()

    if status not in VALID_PAYMENT_STATUSES:
        raise serializers.ValidationError(
            f"Allowed statuses: {', '.join(VALID_PAYMENT_STATUSES)}"
        )

    return status