from __future__ import annotations

import logging
from typing import Any, Dict, List

from notification.dynamo_service import DynamoService
from notification.email.email_service import EmailService
from notification.message_builder import MessageBuilder

logger = logging.getLogger(__name__)


class NotificationService:
    @staticmethod
    def handle_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
        role = (payload.get("role") or payload.get("user_role") or "CUSTOMER").upper()
        notification_type = (payload.get("type") or "").upper()
        channels = payload.get("channels") or []

        logger.info(
            "[NotificationService] handle_payload: type=%s role=%s channels=%s userId=%s",
            notification_type,
            role,
            channels,
            payload.get("userId") or payload.get("user_id"),
        )

        if role not in {"CUSTOMER", "ADMIN"}:
            raise ValueError("Unsupported role")

        if not notification_type:
            raise ValueError("Notification type is required")

        content = MessageBuilder.build(payload)

        if "EMAIL" in channels:
            to_email = payload.get("email") or payload.get("emailAddress") or ""
            logger.info("[NotificationService] Sending email to=%s subject=%s", to_email, content["subject"])
            try:
                EmailService.send_notification_email(
                    to_email=to_email,
                    subject=content["subject"],
                    message=content["message"],
                )
                logger.info("[NotificationService] Email sent successfully to=%s", to_email)
            except Exception as exc:
                logger.exception("[NotificationService] Email send failed to=%s error=%s", to_email, exc)

        if "IN_APP" in channels:
            DynamoService.store_notification(
                {
                    "userId": payload.get("userId") or payload.get("user_id"),
                    "role": role,
                    "type": notification_type,
                    "title": payload.get("title", ""),
                    "message": content["message"],
                }
            )

        return {
            "status": "SUCCESS",
            "type": notification_type,
            "channels": channels,
            "message": content["message"],
        }

    @staticmethod
    def create_notification(data: Dict[str, Any]) -> Dict[str, Any]:
        # Support both a single "channel" string and a "channels" list
        channels = data.get("channels") or [data.get("channel") or "IN_APP"]
        normalized_payload = {
            "userId": data.get("user_id") or data.get("userId"),
            "role": (data.get("role") or "CUSTOMER").upper(),
            "type": (data.get("type") or "").upper(),
            "title": data.get("title", ""),
            "channels": channels,
            "email": data.get("email"),
            "data": data.get("data") or {},
        }
        return NotificationService.handle_payload(normalized_payload)

    @staticmethod
    def get_notification(notification_id: str) -> Dict[str, Any]:
        return DynamoService.get_notification(notification_id)

    @staticmethod
    def get_notifications_by_user(user_id: str) -> List[Dict[str, Any]]:
        return NotificationService.fetch_notifications(user_id)

    @staticmethod
    def fetch_notifications(user_id: str) -> List[Dict[str, Any]]:
        notifications = DynamoService.fetch_notifications(user_id)
        return sorted(notifications, key=lambda item: item.get("createdAt", ""), reverse=True)

    @staticmethod
    def mark_as_read(notification_id: str) -> Dict[str, Any]:
        return DynamoService.mark_as_read_by_id(notification_id)

    @staticmethod
    def mark_all_as_read(user_id: str) -> Dict[str, Any]:
        notifications = NotificationService.fetch_notifications(user_id)
        updated = 0
        for notification in notifications:
            if notification.get("status") == "UNREAD":
                DynamoService.mark_as_read_by_id(notification["notificationId"])
                updated += 1
        return {"message": "Notifications marked as read.", "updated": updated}

    @staticmethod
    def delete_notification(notification_id: str) -> bool:
        return DynamoService.delete_notification(notification_id)

    @staticmethod
    def health() -> Dict[str, Any]:
        return {"status": "UP", "service": "notification"}
