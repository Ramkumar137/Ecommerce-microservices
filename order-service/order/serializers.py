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
    
    quantity = serializers.IntegerField(
        validators=[validate_quantity]
    )
    price = serializers.FloatField(required=False, allow_null=True)
    unit_price = serializers.FloatField(required=False, allow_null=True)
    product_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    subtotal = serializers.FloatField(required=False, allow_null=True)


class CreateOrderSerializer(serializers.Serializer):

    items = OrderItemSerializer(
        many=True
    )
    contact = serializers.DictField(required=False, allow_null=True)
    shipping = serializers.DictField(required=False, allow_null=True)
    shipping_address = serializers.DictField(required=False, allow_null=True)
    delivery = serializers.DictField(required=False, allow_null=True)
    totalAmount = serializers.FloatField(required=False, allow_null=True)
    total_amount = serializers.FloatField(required=False, allow_null=True)

    def validate_items(self, value):
        return validate_order_items(value)


class UpdateOrderStatusSerializer(serializers.Serializer):

    status = serializers.CharField()

    def validate_status(self, value):
        return validate_order_status(value)


class OrderResponseSerializer(serializers.Serializer):

    order_id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(required=False, allow_null=True)
    email = serializers.CharField(required=False, allow_null=True)
    first_name = serializers.CharField(required=False, allow_null=True)
    last_name = serializers.CharField(required=False, allow_null=True)
    status = serializers.CharField()
    total_amount = serializers.FloatField()
    shipping_address = serializers.DictField(required=False, allow_null=True)
    items = OrderItemSerializer(many=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)


class ErrorSerializer(serializers.Serializer):
    error = serializers.CharField()