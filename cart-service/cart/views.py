from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from shared.authentication import JWTAuthentication
from shared.permissions import IsCustomer,IsAdmin

from .serializers import (
    AddItemSerializer,
    UpdateQuantitySerializer,
)
from .services import CartService


class CartListView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdmin]

    def get(self, request):
        items = CartService.list_all_carts()

        return Response(
            items,
            status=status.HTTP_200_OK,
        )


class CartDetailView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsCustomer]
    
    def get(self, request):

        items = CartService.get_cart(request.user["user_id"])

        return Response(
            items,
            status=status.HTTP_200_OK,
        )


class CartItemView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsCustomer]

    def post(self, request):

        serializer = AddItemSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        try:

            item = CartService.add_item(
                user_id=request.user["user_id"],
                product_id=serializer.validated_data["product_id"],
                quantity=serializer.validated_data["quantity"],
            )

            return Response(
                item,
                status=status.HTTP_201_CREATED,
            )

        except ValueError as e:
            message = str(e)

            if "not found" in message.lower():
                return Response(
                    {"error": message},
                    status=status.HTTP_404_NOT_FOUND,
                )

            return Response(
                {"error": message},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception:

            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CartItemUpdateView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsCustomer]

    def put(self, request, product_id):

        serializer = UpdateQuantitySerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        try:

            item = CartService.update_quantity(
                user_id=request.user["user_id"],
                product_id=product_id,
                quantity=serializer.validated_data["quantity"],
            )

            return Response(
                item,
                status=status.HTTP_200_OK,
            )

        except ValueError as e:
            message = str(e)

            if "not found" in message.lower():
                return Response(
                    {"error": message},
                    status=status.HTTP_404_NOT_FOUND,
                )

            return Response(
                {"error": message},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception:

            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def delete(self, request, product_id):

        try:
            user_id = request.user["user_id"]

            CartService.remove_item(
                user_id=user_id,
                product_id=product_id,
            )

            return Response(
                status=status.HTTP_204_NO_CONTENT,
            )

        except ValueError as e:
            message = str(e)

            if "not found" in message.lower():
                return Response(
                    {"error": message},
                    status=status.HTTP_404_NOT_FOUND,
                )

            return Response(
                {"error": message},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception:

            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CartClearView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsCustomer]

    def delete(self, request):

        try:
            CartService.clear_cart(request.user["user_id"])

            return Response(
                status=status.HTTP_204_NO_CONTENT,
            )

        except Exception:

            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class HealthView(APIView):
    def get(self, request):

        return Response(
            CartService.health(),
            status=status.HTTP_200_OK,
        )