from django.urls import path
from .views import (
    HealthView,
    DashboardView,
    AdminAnalyticsView,
    SalesView,
    OrdersAnalyticsView,
    PaymentsAnalyticsView,
    ProductsAnalyticsView,
    RevenueView,
)

urlpatterns = [
    path('health/', HealthView.as_view(), name='analytics-health'),
    path('dashboard/', DashboardView.as_view(), name='analytics-dashboard'),
    path('admin/', AdminAnalyticsView.as_view(), name='analytics-admin'),
    path('sales/', SalesView.as_view(), name='analytics-sales'),
    path('orders/', OrdersAnalyticsView.as_view(), name='analytics-orders'),
    path('payments/', PaymentsAnalyticsView.as_view(), name='analytics-payments'),
    path('products/', ProductsAnalyticsView.as_view(), name='analytics-products'),
    path('revenue/', RevenueView.as_view(), name='analytics-revenue'),
]
