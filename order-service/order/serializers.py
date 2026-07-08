# order/serializers.py

from rest_framework import serializers
from decimal import Decimal
from .validators import (
    validate_user_id,
    validate_product_id,
    validate_quantity,
    validate_order_status,
    validate_order_items,
)


class OrderItemSerializer(serializers.Serializer):
    """
    Order item snapshot.
    """

    product_id = serializers.CharField(
        max_length=100,
        validators=[validate_product_id]
    )

    product_name = serializers.CharField(
        max_length=255
    )

    unit_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=Decimal("0.01"),
    )

    quantity = serializers.IntegerField(
        validators=[validate_quantity]
    )


class CreateOrderSerializer(serializers.Serializer):
    """
    Create Order Serializer
    """

    user_id = serializers.CharField(
        max_length=100,
        validators=[validate_user_id]
    )

    items = OrderItemSerializer(
        many=True
    )

    def validate_items(self, value):
        return validate_order_items(value)


class UpdateOrderStatusSerializer(serializers.Serializer):

    status = serializers.CharField()

    def validate_status(self, value):
        return validate_order_status(value)


class OrderResponseSerializer(serializers.Serializer):

    order_id = serializers.CharField(read_only=True)

    user_id = serializers.CharField()

    status = serializers.CharField()

    total_amount = serializers.FloatField()

    items = OrderItemSerializer(
        many=True
    )

    created_at = serializers.DateTimeField(read_only=True)

    updated_at = serializers.DateTimeField(read_only=True)


class ErrorSerializer(serializers.Serializer):
    error = serializers.CharField()