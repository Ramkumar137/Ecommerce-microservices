import logging
import uuid
import os
from rest_framework.response import Response
from rest_framework.views import APIView

from product.serializers import ProductSerializer
from utils.dynamodb import dynamodb, get_table

logger = logging.getLogger(__name__)



def generate_product_id():
    """Create a readable unique identifier for a product."""
    return f"p-{uuid.uuid4().hex[:8]}"


def serialize_product(item):
    """Return a safe API payload for a product item."""
    return {
        "product_id": item.get("product_id"),
        "name": item.get("name"),
        "price": item.get("price"),
        "stock": item.get("stock"),
        "category": item.get("category"),
    }


def extract_error_message(errors):
    """Convert serializer errors to a single human-readable string."""
    if not errors:
        return "Invalid request"

    if isinstance(errors, dict):
        for key in ("name", "price", "stock"):
            if key in errors:
                return str(errors[key][0])

        for value in errors.values():
            if isinstance(value, list) and value:
                return str(value[0])

    return str(errors)


class ProductListCreateView(APIView):
    """List all products or create a new one."""

    def get(self, request):
        try:
            table = get_table(os.getenv("PRODUCT_TABLE"))
            response = table.scan()
            items = response.get("Items", [])
            return Response([serialize_product(item) for item in items], status=200)
        except Exception as exc:
            logger.exception("Failed to list products")
            return Response({"error": "Unexpected error"}, status=500)

    def post(self, request):
        try:
            serializer = ProductSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({"error": extract_error_message(serializer.errors)}, status=400)

            validated_data = serializer.validated_data
            product = {
                "product_id": request.data.get("product_id") or generate_product_id(),
                "name": validated_data["name"],
                "price": validated_data["price"],
                "stock": validated_data["stock"],
            }

            if "category" in request.data:
                product["category"] = request.data.get("category")


            table = get_table(os.getenv("PRODUCT_TABLE"))
            table.put_item(Item=product)
            return Response(serialize_product(product), status=201)
        except Exception as exc:
            logger.exception("Failed to create product")
            return Response({"error": "Unexpected error"}, status=500)


class ProductDetailView(APIView):
    """Retrieve, update, or delete a single product."""
 
    def get(self, request, product_id):
        try:

            table = get_table(os.getenv("PRODUCT_TABLE"))
            response = table.get_item(Key={"product_id": product_id})
            item = response.get("Item")
            if not item:
                return Response({"error": "Product not found"}, status=404)
            return Response(serialize_product(item), status=200)
        except Exception as exc:
            logger.exception("Failed to get product")
            return Response({"error": "Unexpected error"}, status=500)

    def put(self, request, product_id):
        try:
            serializer = ProductSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({"error": extract_error_message(serializer.errors)}, status=400)

            table = get_table(os.getenv("PRODUCT_TABLE"))
            response = table.get_item(Key={"product_id": product_id})
            existing_item = response.get("Item")
            if not existing_item:
                return Response({"error": "Product not found"}, status=404)

            updated_product = dict(existing_item)
            updated_product.update(
                {
                    "name": serializer.validated_data["name"],
                    "price": serializer.validated_data["price"],
                    "stock": serializer.validated_data["stock"],
                }
            )
            if "category" in request.data:
                updated_product["category"] = request.data.get("category")

            table.put_item(Item=updated_product)
            return Response(serialize_product(updated_product), status=200)
        except Exception as exc:
            logger.exception("Failed to update product")
            return Response({"error": "Unexpected error"}, status=500)

    def delete(self, request, product_id):
        try:
            
            table = get_table(os.getenv("PRODUCT_TABLE"))
            response = table.get_item(Key={"product_id": product_id})
            if not response.get("Item"):
                return Response({"error": "Product not found"}, status=404)

            table.delete_item(Key={"product_id": product_id})
            return Response({"message":"Product deleted successfully!"}, status=204)
        except Exception as exc:
            logger.exception("Failed to delete product")
            return Response({"error": "Unexpected error"}, status=500)


class HealthView(APIView):
    """Simple health-check endpoint for the product service."""

    def get(self, request):
        return Response({"status": "UP", "service": "product"}, status=200)


ProductView = ProductListCreateView