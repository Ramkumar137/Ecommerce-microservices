from django.contrib import admin
from django.urls import path, include
from analytics.views import AdminAnalyticsView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/admin/analytics', AdminAnalyticsView.as_view(), name='api-admin-analytics-no-slash'),
    path('api/admin/analytics/', AdminAnalyticsView.as_view(), name='api-admin-analytics'),
    path('api/v1/analytics/', include('analytics.urls')),
]
