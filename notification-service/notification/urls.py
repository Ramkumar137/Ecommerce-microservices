from django.urls import path

from .views import (
    HealthView,
    NotificationListCreateView,
    NotificationDetailView,
    NotificationReadView,
    NotificationReadAllView,
    NotificationDeleteView,
)

urlpatterns = [
    path("health/", HealthView.as_view(), name="notification-health",),
    path("", NotificationListCreateView.as_view(), name="notification-list-create",),
    path("read-all/", NotificationReadAllView.as_view(), name="notification-read-all",),
    path("<str:notification_id>/", NotificationDetailView.as_view(), name="notification-detail",),
    path("<str:notification_id>/read/", NotificationReadView.as_view(), name="notification-read",),
    path("<str:notification_id>/delete/", NotificationDeleteView.as_view(), name="notification-delete",),
]