# cart/validators.py

from rest_framework import serializers


def validate_user_id(user_id):
    """
    Validate user_id.
    """
    if not user_id or not str(user_id).strip():
        raise serializers.ValidationError(
            "User ID is required."
        )

    return user_id


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
