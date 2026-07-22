import logging
import os
import uuid

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from shared.authentication import JWTAuthentication
from shared.permissions import IsAdmin

from product.serializers import ProductSerializer
from utils.dynamodb import get_table
from datetime import datetime, timezone
from decimal import Decimal

from rest_framework.parsers import MultiPartParser, FormParser
from utils.s3 import upload_product_image

logger = logging.getLogger(__name__)


def generate_product_id():
    return f"p-{uuid.uuid4().hex[:8]}"

def serialize_product(item):
    return {
        "product_id": item.get("product_id"),
        "name": item.get("name"),
        "description": item.get("description"),
        "brand": item.get("brand"),
        "category": item.get("category"),
        "price": str(item.get("price")) if isinstance(item.get("price"), Decimal) else item.get("price"),
        "stock": item.get("stock"),
        "image_url": item.get("image_url"),
        "is_active": item.get("is_active", True),
        "created_at": item.get("created_at"),
        "updated_at": item.get("updated_at"),
    }

def extract_error_message(errors):

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

    authentication_classes = [JWTAuthentication]
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdmin()]

        return [AllowAny()]

    def get(self, request):
        try:
            table = get_table(os.getenv("PRODUCT_TABLE"))
            items = []
            last_key = None
            while True:
                kwargs = {}
                if last_key:
                    kwargs["ExclusiveStartKey"] = last_key

                response = table.scan(**kwargs)

                items.extend(response.get("Items", []))

                last_key = response.get("LastEvaluatedKey")

                if not last_key:
                    break

            return Response(
                [serialize_product(item) for item in items],
                status=200,
            )

        except Exception:
            logger.exception("Failed to list products")
            return Response(
                {"error": "Internal server error"},
                status=500,
            )

    def post(self, request):

        serializer = ProductSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            table = get_table(os.getenv("PRODUCT_TABLE"))

            current_time = datetime.now(timezone.utc).isoformat()

            product = {
                "product_id": generate_product_id(),
                "name": serializer.validated_data["name"],
                "description": serializer.validated_data["description"],
                "brand": serializer.validated_data["brand"],
                "category": serializer.validated_data["category"],
                "price": serializer.validated_data["price"],
                "stock": serializer.validated_data["stock"],
                "image_url": serializer.validated_data.get("image_url", ""),
                "is_active": serializer.validated_data.get("is_active", True),
                "created_at": current_time,
                "updated_at": current_time,
            }

            table.put_item(Item=product)

            return Response(
                serialize_product(product),
                status=201,
            )

        except Exception as exc:
            logger.exception("Failed to create product")
            import traceback
            traceback.print_exc()

            return Response(
                {"error": str(exc)},
                status=500,
            )
    
class ProductDetailView(APIView):
    authentication_classes = [JWTAuthentication]

    def get_permissions(self):
        if self.request.method in ["PUT", "DELETE"]:
            return [IsAdmin()]
        return [AllowAny()]

    def get(self, request, product_id):

        try:
            table = get_table(os.getenv("PRODUCT_TABLE"))
            response = table.get_item(
                Key={
                    "product_id": product_id
                }
            )

            item = response.get("Item")

            if not item:
                return Response(
                    {"error": "Product not found"},
                    status=404,
                )

            return Response(
                serialize_product(item),
                status=200,
            )

        except Exception:
            logger.exception("Failed to retrieve product")

            return Response(
                {"error": "Internal server error"},
                status=500,
            )

    def put(self, request, product_id):

        serializer = ProductSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            table = get_table(os.getenv("PRODUCT_TABLE"))
            response = table.get_item(
                Key={
                    "product_id": product_id
                }
            )

            product = response.get("Item")

            if not product:
                return Response(
                    {"error": "Product not found"},
                    status=404,
                )

            product.update({
                "name": serializer.validated_data["name"],
                "description": serializer.validated_data["description"],
                "brand": serializer.validated_data["brand"],
                "category": serializer.validated_data["category"],
                "price": serializer.validated_data["price"],
                "stock": serializer.validated_data["stock"],
                "image_url": serializer.validated_data.get("image_url", ""),
                "is_active": serializer.validated_data.get("is_active", True),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            })

            table.put_item(Item=product)

            return Response(
                serialize_product(product),
                status=200,
            )

        except Exception:
            logger.exception("Failed to update product")

            return Response(
                {"error": "Internal server error"},
                status=500,
            )

    def delete(self, request, product_id):

        try:

            table = get_table(os.getenv("PRODUCT_TABLE"))

            response = table.get_item(
                Key={
                    "product_id": product_id
                }
            )

            if "Item" not in response:
                return Response(
                    {"error": "Product not found"},
                    status=404,
                )

            table.delete_item(
                Key={
                    "product_id": product_id
                }
            )

            return Response(status=204)

        except Exception:
            logger.exception("Failed to delete product")

            return Response(
                {"error": "Internal server error"},
                status=500,
            )

class UploadImageView(APIView):
    """
    Upload product image to S3.
    """

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdmin]

    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):

        image = request.FILES.get("image")

        if not image:
            return Response(
                {
                    "error": "Image is required."
                },
                status=400,
            )

        try:

            image_url = upload_product_image(image)

            return Response(
                {
                    "image_url": image_url
                },
                status=201,
            )

        except Exception as exc:
            logger.exception("Failed to upload image")

            return Response(
                {
                    "error": str(exc)
                },
                status=500,
            )


class HealthView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):

        return Response(
            {
                "status": "UP",
                "service": "product",
            },
            status=200,
        )


ProductView = ProductListCreateView