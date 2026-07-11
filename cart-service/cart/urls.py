from django.urls import path

from .views import (
    CartListView,
    CartDetailView,
    CartItemView,
    CartItemUpdateView,
    CartClearView,
    HealthView,
)

urlpatterns = [
    path("health/",HealthView.as_view(),name="cart-health",),
    path("all/",CartListView.as_view(),name="cart-list",),
    path("",CartDetailView.as_view(),name="cart-detail",),
    path("clear/",CartClearView.as_view(),name="cart-clear",),
    path("items/",CartItemView.as_view(),name="cart-item-add",),
    path("items/<str:product_id>/",CartItemUpdateView.as_view(),name="cart-item-update",),
    path("items/<str:product_id>/",CartItemUpdateView.as_view(),name="cart-item-delete",),
]