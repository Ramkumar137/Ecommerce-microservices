from rest_framework import serializers


VALID_NOTIFICATION_TYPES = (
    # Order events
    "ORDER_CREATED",
    "ORDER_CONFIRMED",
    "ORDER_CANCELLED",
    "ORDER_SHIPPED",
    "ORDER_DELIVERED",
    # Payment events
    "PAYMENT_SUCCESS",
    "PAYMENT_FAILED",
    "PAYMENT_REFUNDED",
    # Account events
    "WELCOME",
    "FORGOT_PASSWORD",
    "PROFILE_UPDATED",
    # Cart events
    "CART_UPDATED",
    # Admin events
    "SUPPORT_REQUEST",
    "INVENTORY_LOW",
    "LOW_STOCK",
    "NEW_USER",
    "FEEDBACK",
)

VALID_NOTIFICATION_CHANNELS = (
    "IN_APP",
    "EMAIL",
    "SMS",
)

VALID_NOTIFICATION_STATUS = (
    "READ",
    "UNREAD",
)


def validate_notification_id(notification_id):
    if not notification_id or not str(notification_id).strip():
        raise serializers.ValidationError(
            "Notification ID is required."
        )

    return notification_id


def validate_user_id(user_id):
    if not user_id or not str(user_id).strip():
        raise serializers.ValidationError(
            "User ID is required."
        )

    return user_id


def validate_notification_type(notification_type):
    if not notification_type:
        raise serializers.ValidationError(
            "Notification type is required."
        )

    notification_type = notification_type.upper()

    if notification_type not in VALID_NOTIFICATION_TYPES:
        raise serializers.ValidationError(
            f"Allowed notification types: {', '.join(VALID_NOTIFICATION_TYPES)}"
        )

    return notification_type


def validate_channel(channel):
    if not channel:
        raise serializers.ValidationError(
            "Notification channel is required."
        )

    channel = channel.upper()

    if channel not in VALID_NOTIFICATION_CHANNELS:
        raise serializers.ValidationError(
            f"Allowed channels: {', '.join(VALID_NOTIFICATION_CHANNELS)}"
        )

    return channel


def validate_title(title):
    if not title or not str(title).strip():
        raise serializers.ValidationError(
            "Title is required."
        )

    title = title.strip()

    if len(title) > 150:
        raise serializers.ValidationError(
            "Title cannot exceed 150 characters."
        )

    return title


def validate_message(message):
    if not message or not str(message).strip():
        raise serializers.ValidationError(
            "Message is required."
        )

    message = message.strip()

    if len(message) > 1000:
        raise serializers.ValidationError(
            "Message cannot exceed 1000 characters."
        )

    return message


def validate_notification_status(status):
    if not status:
        raise serializers.ValidationError(
            "Status is required."
        )

    status = status.upper()

    if status not in VALID_NOTIFICATION_STATUS:
        raise serializers.ValidationError(
            f"Allowed status: {', '.join(VALID_NOTIFICATION_STATUS)}"
        )

    return status