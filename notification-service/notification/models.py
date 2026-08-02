from django.db import models


class Notification(models.Model):
    user_id = models.CharField(max_length=255)
    type = models.CharField(max_length=100)
    message = models.TextField()
    status = models.CharField(max_length=20, default="UNREAD")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
