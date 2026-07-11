# order/urls.py

from django.urls import path

from .views import (
    OrderListCreateView,
    OrderDetailView,
    OrderStatusView,
    UserOrdersView,
    HealthView,
)

urlpatterns = [
    path("health/",HealthView.as_view(),name="order-health",),
    path("",OrderListCreateView.as_view(),name="order-list-create",),
    path("<str:order_id>/",OrderDetailView.as_view(),name="order-detail",),
    path("<str:order_id>/status/",OrderStatusView.as_view(),name="order-status",),
]