from rest_framework import serializers


class ProductSerializer(serializers.Serializer):
    name = serializers.CharField(required=True, allow_blank=False, trim_whitespace=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    stock = serializers.IntegerField(required=True)
    # category = serializers.CharField(required=False,allow_blank=True,max_length=100)

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Name cannot be empty")
        return value.strip()

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock must be greater than or equal to zero")
        return value
