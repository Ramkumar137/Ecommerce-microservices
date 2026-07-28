from rest_framework import serializers


class InventorySerializer(serializers.Serializer):
    product_id = serializers.CharField(
        max_length=100,
        min_length=1,
        required=True,
        allow_blank=False,
        trim_whitespace=True
    )

    stock = serializers.IntegerField(
        min_value=0,
        required=True
    )

    reserved_stock = serializers.IntegerField(
        min_value=0,
        default=0,
        required=False
    )

    available_stock = serializers.IntegerField(
        read_only=True
    )

    created_at = serializers.DateTimeField(read_only=True)

    updated_at = serializers.DateTimeField(read_only=True)

    def validate(self, attrs):
        """Validate that reserved stock does not exceed total stock."""
        stock = attrs.get("stock", 0)
        reserved = attrs.get("reserved_stock", 0)

        if reserved > stock:
            raise serializers.ValidationError(
                "Reserved stock cannot exceed total stock."
            )

        return attrs


# class UpdateStockSerializer(serializers.Serializer):
#     stock = serializers.IntegerField(min_value=0)

class UpdateStockSerializer(serializers.Serializer):
    # Accept both 'stock' (internal) and 'total_stock' (frontend alias).
    # 'total_stock' takes precedence when both are provided.
    stock = serializers.IntegerField(min_value=0, required=False)
    total_stock = serializers.IntegerField(min_value=0, required=False)

    reserved_stock = serializers.IntegerField(
        min_value=0,
        required=False
    )

    def validate(self, attrs):
        # Resolve stock: prefer total_stock if provided
        stock = attrs.pop("total_stock", None)
        if stock is None:
            stock = attrs.get("stock")
        if stock is None:
            raise serializers.ValidationError(
                {"stock": "This field is required."}
            )
        attrs["stock"] = stock

        reserved = attrs.get("reserved_stock", 0)
        if reserved > stock:
            raise serializers.ValidationError(
                "Reserved stock cannot exceed total stock."
            )

        return attrs


class ReserveStockSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)


class ReleaseStockSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)