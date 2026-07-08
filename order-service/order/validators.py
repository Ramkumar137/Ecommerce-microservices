# order/validators.py

from rest_framework import serializers

VALID_ORDER_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED"
]


def validate_user_id(user_id):
    """
    Validate user_id.
    """
    if not user_id or not str(user_id).strip():
        raise serializers.ValidationError(
            "User ID is required."
        )

    return user_id


def validate_order_id(order_id):
    """
    Validate order_id.
    """
    if not order_id or not str(order_id).strip():
        raise serializers.ValidationError(
            "Order ID is required."
        )

    return order_id


def validate_product_id(product_id):
    """
    Validate product_id.
    """
    if not product_id or not str(product_id).strip():
        raise serializers.ValidationError(
            "Product ID is required."
        )

    return product_id


def validate_quantity(quantity):
    """
    Validate quantity.
    """

    try:
        quantity = int(quantity)
    except (TypeError, ValueError):
        raise serializers.ValidationError(
            "Quantity must be an integer."
        )

    if quantity <= 0:
        raise serializers.ValidationError(
            "Quantity must be greater than zero."
        )

    return quantity


def validate_price(price):
    """
    Validate price.
    """

    try:
        price = float(price)
    except (TypeError, ValueError):
        raise serializers.ValidationError(
            "Price must be a number."
        )

    if price <= 0:
        raise serializers.ValidationError(
            "Price must be greater than zero."
        )

    return price


def validate_order_status(status):
    """
    Validate order status.
    """

    if status not in VALID_ORDER_STATUSES:
        raise serializers.ValidationError(
            f"Invalid order status. Allowed values are {VALID_ORDER_STATUSES}"
        )

    return status


def validate_order_items(items):
    """
    Validate order items.
    """

    if len(items) == 0:
        raise serializers.ValidationError(
            "Order must contain at least one item."
        )

    return items

def validate_unit_price(price):
    """
    Validate unit price.
    """

    try:
        price = float(price)
    except (TypeError, ValueError):
        raise serializers.ValidationError(
            "Unit price must be numeric."
        )

    if price <= 0:
        raise serializers.ValidationError(
            "Unit price must be greater than zero."
        )

    return price