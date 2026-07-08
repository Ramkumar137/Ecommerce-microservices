from django.shortcuts import render
# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import traceback
from .serializers import (
    CreateOrderSerializer,
    UpdateOrderStatusSerializer,
)

from .services import OrderService


class OrderListCreateView(APIView):
    """
    GET  /api/v1/orders/
    POST /api/v1/orders/
    """

    def get(self, request):
        try:
            orders = OrderService.get_all_orders()
            return Response(
                orders,
                status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):

        serializer = CreateOrderSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        try:

            order = OrderService.create_order(
                user_id=serializer.validated_data["user_id"],
                items=serializer.validated_data["items"]
            )

            return Response(
                order,
                status=status.HTTP_201_CREATED
            )

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OrderDetailView(APIView):
    """
    GET /api/v1/orders/<order_id>/
    DELETE /api/v1/orders/<order_id>/
    """

    def get(self, request, order_id):

        order = OrderService.get_order(order_id)

        if not order:

            return Response(
                {"error": "Order not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(order)

    def delete(self, request, order_id):

        try:

            OrderService.delete_order(order_id)

            return Response(
                status=status.HTTP_204_NO_CONTENT
            )

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception:
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class OrderStatusView(APIView):
    """
    PUT /api/v1/orders/<order_id>/status/
    """

    def patch(self, request, order_id):

        serializer = UpdateOrderStatusSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        try:

            order = OrderService.update_status(
                order_id,
                serializer.validated_data["status"]
            )

            if not order:
                return Response(
                    {"error": "Order not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            return Response(
                order,
                status=status.HTTP_200_OK
            )

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception:
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserOrdersView(APIView):
    """
    GET /api/v1/orders/user/<user_id>/
    """

    def get(self, request, user_id):

        orders = OrderService.get_orders_by_user(user_id)

        return Response(
            orders,
            status=status.HTTP_200_OK
        )


class HealthView(APIView):
    """
    GET /api/v1/orders/health/
    """

    def get(self, request):

        return Response(
            OrderService.health(),
            status=status.HTTP_200_OK
        )