import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    InventorySerializer,
    UpdateStockSerializer,
    ReserveStockSerializer,
    ReleaseStockSerializer,
)

from .services import InventoryService

logger = logging.getLogger(__name__)


class InventoryListView(APIView):
    """List all inventory items or create a new inventory entry."""

    def get(self, request):
        """Retrieve all inventory items with pagination support."""
        try:
            items = InventoryService.list_inventory()
            return Response(items, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("Failed to list inventory")
            return Response(
                {"error": "Failed to fetch inventory"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        """Create a new inventory entry."""
        serializer = InventorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            item = InventoryService.create_inventory(
                serializer.validated_data
            )
            logger.info(f"Created inventory for product {serializer.validated_data['product_id']}")
            return Response(item, status=status.HTTP_201_CREATED)
        except ValueError as e:
            logger.warning(f"Invalid inventory creation: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class InventoryDetailView(APIView):
    """Retrieve, update, or delete a specific inventory entry."""

    def get(self, request, product_id):
        """Retrieve inventory for a specific product."""
        item = InventoryService.get_inventory(product_id)

        if not item:
            return Response(
                {"error": "Inventory not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(item, status=status.HTTP_200_OK)

    def put(self, request, product_id):
        """Update inventory for a specific product."""
        serializer = InventorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        item = InventoryService.update_inventory(
            product_id,
            serializer.validated_data,
        )

        if not item:
            return Response(
                {"error": "Inventory not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        logger.info(f"Updated inventory for product {product_id}")
        return Response(item, status=status.HTTP_200_OK)

    def delete(self, request, product_id):
        """Delete inventory for a specific product."""
        deleted = InventoryService.delete_inventory(product_id)

        if not deleted:
            return Response(
                {"error": "Inventory not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        logger.info(f"Deleted inventory for product {product_id}")
        return Response(status=status.HTTP_204_NO_CONTENT)


class ReserveStockView(APIView):
    """Reserve stock for a product."""

    def patch(self, request, product_id):
        """Reserve specified quantity of stock for a product."""
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
            
            logger.info(f"Reserved {serializer.validated_data['quantity']} units for product {product_id}")
            return Response(item, status=status.HTTP_200_OK)
        except ValueError as e:
            logger.warning(f"Failed to reserve stock for {product_id}: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class ReleaseStockView(APIView):
    """Release reserved stock for a product."""

    def patch(self, request, product_id):
        """Release specified quantity of reserved stock for a product."""
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
            
            logger.info(f"Released {serializer.validated_data['quantity']} units for product {product_id}")
            return Response(item, status=status.HTTP_200_OK)
        except ValueError as e:
            logger.warning(f"Failed to release stock for {product_id}: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class HealthView(APIView):
    """Health check endpoint for the inventory service."""

    def get(self, request):
        """Return service health status."""
        return Response(
            {
                "status": "UP",
                "service": "inventory"
            },
            status=status.HTTP_200_OK
        )