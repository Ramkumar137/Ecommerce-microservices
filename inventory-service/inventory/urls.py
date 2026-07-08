from django.urls import path

from .views import (
    InventoryListView,
    InventoryDetailView,
    ReserveStockView,
    ReleaseStockView,
    HealthView,
    # DeductStockView,
)

urlpatterns = [
    path("health/", HealthView.as_view()),
    path("", InventoryListView.as_view()),
    path("<str:product_id>/reserve/", ReserveStockView.as_view()),
    path("<str:product_id>/release/", ReleaseStockView.as_view()),
    # path("<str:product_id>/deduct/", DeductStockView.as_view()),
    path("<str:product_id>/", InventoryDetailView.as_view()),
]