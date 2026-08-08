from django.shortcuts import render
# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import (
    CreateOrderSerializer,
    UpdateOrderStatusSerializer,
)
from shared.authentication import JWTAuthentication
from shared.permissions import IsCustomer, IsAdmin
from .services import OrderService
from integrations.sns_client import SNSClient


class OrderListCreateView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsCustomer]

    def get(self, request):

        role = str(request.user.get("role", "")).upper().strip()

        if role in ["ADMIN", "ADMINISTRATOR"]:
            orders = OrderService.get_all_orders()
        else:
            orders = OrderService.get_orders_by_user(
                request.user["user_id"]
            )

        return Response(orders)

    def post(self, request):

        serializer = CreateOrderSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        try:
            auth = request.headers.get("Authorization")
            token = auth.split(" ")[1]

            order = OrderService.create_order(
                user_id=request.user["user_id"],
                items=serializer.validated_data["items"],
                token=token
            )
            SNSClient().publish(
                event_type="ORDER_CREATED",
                data={
                    "order_id": order["order_id"],
                    "user_id": order["user_id"],
                    "email": request.user.get("email"),
                    "items": order["items"],
                    "total_amount": float(order["total_amount"]),
                    "status": order["status"]
                }
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
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OrderDetailView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsCustomer]

    def get(self, request, order_id):
        order = OrderService.get_order(order_id)
        if not order:
            return Response(
                {"error": "Order not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if order["user_id"] != request.user["user_id"]:
            return Response(
                {"error": "Forbidden"},
                status=status.HTTP_403_FORBIDDEN
            )

        return Response(order)

    def delete(self, request, order_id):

        try:
            order = OrderService.get_order(order_id)
            if not order:
                return Response(
                    {"error": "Order not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            if order["user_id"] != request.user["user_id"]:
                return Response(
                    {"error": "Forbidden"},
                    status=status.HTTP_403_FORBIDDEN
                )

            OrderService.delete_order(order_id)

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

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdmin]
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
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsCustomer]
    def get(self, request, user_id):

        orders = OrderService.get_orders_by_user(request.user["user_id"])

        return Response(
            orders,
            status=status.HTTP_200_OK
        )


class HealthView(APIView):
    def get(self, request):

        return Response(
            OrderService.health(),
            status=status.HTTP_200_OK
        )