import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from shared.authentication import JWTAuthentication
from shared.permissions import (
    IsCustomer, IsAdmin, IsAuthenticatedUser
)

from .serializers import (
    InventorySerializer,
    ReserveStockSerializer,
    ReleaseStockSerializer,
    UpdateStockSerializer,
)

from .services import InventoryService

logger = logging.getLogger(__name__)


def serialize_item(item):
    """Normalize DynamoDB item for API response.
    Exposes 'stock' as 'total_stock' to match frontend contract.
    Converts Decimal to int.
    """
    return {
        "product_id": item.get("product_id"),
        "total_stock": int(item.get("stock", 0)),
        "available_stock": int(item.get("available_stock", 0)),
        "reserved_stock": int(item.get("reserved_stock", 0)),
        "created_at": item.get("created_at"),
        "updated_at": item.get("updated_at"),
    }


class InventoryListView(APIView):

    authentication_classes = [JWTAuthentication]

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticatedUser()]
        return [IsAdmin()]

    def get(self, request):
        try:
            items = InventoryService.list_inventory()
            return Response(
                [serialize_item(i) for i in items],
                status=status.HTTP_200_OK,
            )

        except Exception:
            logger.exception("Failed to list inventory")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):

        serializer = InventorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:

            item = InventoryService.create_inventory(
                serializer.validated_data
            )

            return Response(
                item,
                status=status.HTTP_201_CREATED
            )

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception:
            logger.exception("Failed to create inventory")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class InventoryDetailView(APIView):

    authentication_classes = [JWTAuthentication]

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticatedUser()]
        return [IsAdmin()]

    def get(self, request, product_id):

        item = InventoryService.get_inventory(product_id)

        if not item:
            return Response(
                {"error": "Out of Stock"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(serialize_item(item))

    def put(self, request, product_id):

        serializer = UpdateStockSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:

            item = InventoryService.update_inventory(
                product_id,
                serializer.validated_data,
            )

            if not item:
                return Response(
                    {"error": "Inventory not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            return Response(serialize_item(item))

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception:
            logger.exception("Failed to update inventory")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def delete(self, request, product_id):

        try:

            deleted = InventoryService.delete_inventory(product_id)

            if not deleted:
                return Response(
                    {"error": "Inventory not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            return Response(
                status=status.HTTP_204_NO_CONTENT
            )

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception:
            logger.exception("Failed to delete inventory")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ReserveStockView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsCustomer]

    def patch(self, request, product_id):

        serializer = ReserveStockSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:

            item = InventoryService.reserve_stock(
                product_id,
                serializer.validated_data["quantity"]
            )

            if not item:
                return Response(
                    {"error": "Inventory not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            return Response(
                item,
                status=status.HTTP_200_OK
            )

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception:
            logger.exception("Failed to reserve stock")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ReleaseStockView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsCustomer]

    def patch(self, request, product_id):

        serializer = ReleaseStockSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:

            item = InventoryService.release_stock(
                product_id,
                serializer.validated_data["quantity"]
            )

            if not item:
                return Response(
                    {"error": "Inventory not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            return Response(
                item,
                status=status.HTTP_200_OK
            )

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception:
            logger.exception("Failed to release stock")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class HealthView(APIView):
    def get(self, request):
        return Response({
                "status": "UP",
                "service": "inventory",
                "version": "V2",
            },
            status=status.HTTP_200_OK,
        )