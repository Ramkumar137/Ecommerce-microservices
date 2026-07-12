from rest_framework import serializers

from .validators import (
    validate_notification_id,
    validate_user_id,
    validate_notification_type,
    validate_channel,
    validate_title,
    validate_message,
    validate_notification_status,
)


class CreateNotificationSerializer(serializers.Serializer):
    """
    Used for creating a notification.
    """

    user_id = serializers.CharField(
        max_length=100,
        validators=[validate_user_id],
    )

    type = serializers.CharField()

    title = serializers.CharField(
        max_length=150,
        validators=[validate_title],
    )

    message = serializers.CharField(
        validators=[validate_message],
    )

    channel = serializers.CharField(
        default="IN_APP",
    )

    def validate_type(self, value):
        return validate_notification_type(value)

    def validate_channel(self, value):
        return validate_channel(value)


class MarkReadSerializer(serializers.Serializer):
    """
    Used for marking a notification as READ.
    """

    status = serializers.CharField(default="READ")

    def validate_status(self, value):
        return validate_notification_status(value)


class NotificationResponseSerializer(serializers.Serializer):
    """
    Notification response.
    """

    notification_id = serializers.CharField(
        validators=[validate_notification_id]
    )

    user_id = serializers.CharField()

    type = serializers.CharField()

    title = serializers.CharField()

    message = serializers.CharField()

    channel = serializers.CharField()

    status = serializers.CharField()

    created_at = serializers.CharField()

    read_at = serializers.CharField(
        allow_null=True,
        required=False,
    )


class ErrorSerializer(serializers.Serializer):
    error = serializers.CharField()