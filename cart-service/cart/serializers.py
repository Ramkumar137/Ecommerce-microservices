from rest_framework import serializers

from .validators import (
    validate_user_id,
    validate_product_id,
    validate_quantity,
)


class AddItemSerializer(serializers.Serializer):
    """
    Serializer for adding an item to a user's cart.
    """

    product_id = serializers.CharField(
        max_length=100,
        validators=[validate_product_id],
    )

    quantity = serializers.IntegerField(
        validators=[validate_quantity],
    )


class UpdateQuantitySerializer(serializers.Serializer):
    """
    Serializer for updating an item's quantity.
    """

    quantity = serializers.IntegerField(
        validators=[validate_quantity],
    )


class CartItemResponseSerializer(serializers.Serializer):
    """
    Serializer for a single cart item.
    """

    user_id = serializers.CharField(
        validators=[validate_user_id],
    )

    product_id = serializers.CharField(
        validators=[validate_product_id],
    )

    quantity = serializers.IntegerField()

    created_at = serializers.DateTimeField()

    updated_at = serializers.DateTimeField()


class CartListResponseSerializer(serializers.Serializer):
    """
    Serializer for returning all items in a user's cart.
    """

    user_id = serializers.CharField(
        validators=[validate_user_id],
    )

    items = CartItemResponseSerializer(
        many=True
    )


class ErrorSerializer(serializers.Serializer):
    """
    Standard error response.
    """

    error = serializers.CharField()