from django.urls import path

from .views import HealthView, ProductDetailView, ProductListCreateView

urlpatterns = [
    path("v1/products/health", HealthView.as_view(), name="health"),
    path("v1/products/<str:product_id>/", ProductDetailView.as_view(), name="product-detail"),
    path("v1/products/", ProductListCreateView.as_view(), name="products"),
]