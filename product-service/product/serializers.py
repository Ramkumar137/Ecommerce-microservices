from rest_framework import serializers


class ProductSerializer(serializers.Serializer):
    name = serializers.CharField(
        required=True,
        min_length=3,
        max_length=150,
        allow_blank=False,
        trim_whitespace=True,
    )

    description = serializers.CharField(
        required=True,
        min_length=10,
        max_length=3000,
        allow_blank=False,
        trim_whitespace=True,
    )

    brand = serializers.CharField(
        required=True,
        min_length=2,
        max_length=100,
        allow_blank=False,
        trim_whitespace=True,
    )

    category = serializers.CharField(
        required=True,
        min_length=2,
        max_length=100,
        allow_blank=False,
        trim_whitespace=True,
    )

    price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=True,
    )

    stock = serializers.IntegerField(
        required=True,
        min_value=0,
    )

    image_url = serializers.URLField(
        required=False,
        allow_blank=True,
    )

    is_active = serializers.BooleanField(
        required=False,
        default=True,
    )

    def validate_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Product name cannot be empty."
            )

        return value

    def validate_description(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Description cannot be empty."
            )

        return value

    def validate_brand(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Brand cannot be empty."
            )

        return value

    def validate_category(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Category cannot be empty."
            )

        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Price must be greater than zero."
            )

        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Stock cannot be negative."
            )

        return value