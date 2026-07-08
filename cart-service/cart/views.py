from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    AddItemSerializer,
    UpdateQuantitySerializer,
)
from .services import CartService


class CartListView(APIView):
    """
    GET /api/v1/cart/
    Admin endpoint - List all cart items.
    """

    def get(self, request):
        items = CartService.list_all_carts()

        return Response(
            items,
            status=status.HTTP_200_OK,
        )


class CartDetailView(APIView):
    """
    GET /api/v1/cart/<user_id>/
    Return all items for a user's cart.
    """

    def get(self, request, user_id):

        items = CartService.get_cart(user_id)

        return Response(
            items,
            status=status.HTTP_200_OK,
        )


class CartItemView(APIView):
    """
    POST /api/v1/cart/<user_id>/items/
    Add product to cart.
    """

    def post(self, request, user_id):

        serializer = AddItemSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        try:

            item = CartService.add_item(
                user_id=user_id,
                product_id=serializer.validated_data["product_id"],
                quantity=serializer.validated_data["quantity"],
            )

            return Response(
                item,
                status=status.HTTP_201_CREATED,
            )

        except ValueError as e:

            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception:

            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CartItemUpdateView(APIView):
    """
    PUT /api/v1/cart/<user_id>/items/<product_id>/
    Update quantity.
    """

    def put(self, request, user_id, product_id):

        serializer = UpdateQuantitySerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        try:

            item = CartService.update_quantity(
                user_id=user_id,
                product_id=product_id,
                quantity=serializer.validated_data["quantity"],
            )

            return Response(
                item,
                status=status.HTTP_200_OK,
            )

        except ValueError as e:

            return Response(
                {"error": str(e)},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception:

            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CartItemDeleteView(APIView):
    """
    DELETE /api/v1/cart/<user_id>/items/<product_id>/
    Remove a single product from the cart.
    """

    def delete(self, request, user_id, product_id):

        try:

            CartService.remove_item(
                user_id=user_id,
                product_id=product_id,
            )

            return Response(
                status=status.HTTP_204_NO_CONTENT,
            )

        except ValueError as e:

            return Response(
                {"error": str(e)},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception:

            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CartClearView(APIView):
    """
    DELETE /api/v1/cart/<user_id>/
    Remove all items from the user's cart.
    """

    def delete(self, request, user_id):

        try:

            CartService.clear_cart(user_id)

            return Response(
                status=status.HTTP_204_NO_CONTENT,
            )

        except Exception:

            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class HealthView(APIView):
    """
    GET /api/v1/cart/health/
    """

    def get(self, request):

        return Response(
            CartService.health(),
            status=status.HTTP_200_OK,
        )