# payment/serializers.py

from rest_framework import serializers
from decimal import Decimal
from .validators import (
    validate_order_id,
    validate_user_id,
    validate_amount,
    validate_currency,
    validate_payment_method,
    validate_payment_status,
)


class CreatePaymentSerializer(serializers.Serializer):

    order_id = serializers.CharField(max_length=100,validators=[validate_order_id])
    user_id = serializers.CharField(max_length=100,validators=[validate_user_id])
    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=Decimal("0.01")
    )
    currency = serializers.CharField(default="INR",validators=[validate_currency])
    payment_method = serializers.CharField(validators=[validate_payment_method])


class UpdatePaymentStatusSerializer(serializers.Serializer):

    status = serializers.CharField()
    transaction_id = serializers.CharField(required=False,allow_blank=True,default="")

    def validate_status(self, value):
        return validate_payment_status(value)


class PaymentResponseSerializer(serializers.Serializer):

    payment_id = serializers.CharField()
    order_id = serializers.CharField()
    user_id = serializers.CharField()
    amount = serializers.FloatField()
    currency = serializers.CharField()
    payment_method = serializers.CharField()
    status = serializers.CharField()
    transaction_id = serializers.CharField()
    created_at = serializers.CharField()
    updated_at = serializers.CharField()


class ErrorSerializer(serializers.Serializer):
    error = serializers.CharField()