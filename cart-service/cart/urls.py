from django.urls import path

from .views import (
    CartListView,
    CartDetailView,
    CartItemView,
    CartItemUpdateView,
    CartItemDeleteView,
    CartClearView,
    HealthView,
)

urlpatterns = [
    path("health/",HealthView.as_view(),name="cart-health",),
    path("",CartListView.as_view(),name="cart-list",),
    path("<str:user_id>/",CartDetailView.as_view(),name="cart-detail",),
    path("<str:user_id>/clear/",CartClearView.as_view(),name="cart-clear",),
    path("<str:user_id>/items/",CartItemView.as_view(),name="cart-item-add",),
    path("<str:user_id>/items/<str:product_id>/",CartItemUpdateView.as_view(),name="cart-item-update",),
    path("<str:user_id>/items/<str:product_id>/delete/",CartItemDeleteView.as_view(),name="cart-item-delete",),
]