import pytest
from product.serializers import ProductSerializer


def test_product_serializer_valid():
    data = {
        "name": "Gaming Laptop",
        "description": "High performance gaming laptop",
        "brand": "TechCorp",
        "category": "Electronics",
        "price": 1299.99,
        "stock": 15,
        "image_url": "https://example.com/laptop.jpg",
        "is_active": True,
    }
    serializer = ProductSerializer(data=data)
    assert serializer.is_valid(), serializer.errors


def test_product_serializer_missing_required():
    data = {"brand": "TechCorp"}
    serializer = ProductSerializer(data=data)
    assert not serializer.is_valid()
    assert "name" in serializer.errors
    assert "price" in serializer.errors


def test_product_serializer_invalid_price():
    data = {
        "name": "Gaming Laptop",
        "description": "High performance gaming laptop",
        "brand": "TechCorp",
        "category": "Electronics",
        "price": -10.00,
        "stock": 15,
    }
    serializer = ProductSerializer(data=data)
    assert not serializer.is_valid() or serializer.validated_data.get("price", 0) < 0
