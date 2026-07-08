# payment/urls.py

from django.urls import path

from .views import (
    PaymentListCreateView,
    PaymentDetailView,
    PaymentStatusView,
    PaymentByOrderView,
    HealthView,
)

urlpatterns = [
    path("health/",HealthView.as_view(),name="payment-health",),
    path("",PaymentListCreateView.as_view(),name="payment-list-create",),
    path("order/<str:order_id>/",PaymentByOrderView.as_view(),name="payment-by-order",),
    path("<str:payment_id>/",PaymentDetailView.as_view(),name="payment-detail",),
    path("<str:payment_id>/status/",PaymentStatusView.as_view(),name="payment-status",),
]