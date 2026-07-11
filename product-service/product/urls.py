from django.urls import path

from .views import HealthView, ProductDetailView, ProductListCreateView

urlpatterns = [
    path("health", HealthView.as_view(), name="health"),
    path("<str:product_id>/", ProductDetailView.as_view(), name="product-detail"),
    path("", ProductListCreateView.as_view(), name="products"),
]