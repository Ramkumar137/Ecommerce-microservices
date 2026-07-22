from django.urls import path

from .views import HealthView, ProductDetailView, ProductListCreateView, UploadImageView

urlpatterns = [
    path("health", HealthView.as_view(), name="health"),
    path("upload-image/", UploadImageView.as_view(), name="upload-image"),
    path("<str:product_id>/", ProductDetailView.as_view(), name="product-detail"),
    path("", ProductListCreateView.as_view(), name="products"),
]