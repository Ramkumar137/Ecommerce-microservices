import os
import uuid
from datetime import datetime, timezone

from utils.dynamodb import get_table


class NotificationService:

    @staticmethod
    def get_table():

        table_name = os.getenv("NOTIFICATION_TABLE")

        if not table_name:
            raise ValueError(
                "NOTIFICATION_TABLE environment variable not set."
            )

        return get_table(table_name)

    @staticmethod
    def _timestamp():
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def _generate_notification_id():
        return f"not-{uuid.uuid4().hex[:8]}"

    @staticmethod
    def create_notification(data):

        table = NotificationService.get_table()

        now = NotificationService._timestamp()

        notification = {
            "notification_id": NotificationService._generate_notification_id(),
            "user_id": data["user_id"],
            "type": data["type"],
            "title": data["title"],
            "message": data["message"],
            "channel": data.get("channel", "IN_APP"),
            "status": "UNREAD",
            "created_at": now,
            "read_at": None,
        }

        table.put_item(
            Item=notification
        )

        return notification

    @staticmethod
    def get_notification(notification_id):

        table = NotificationService.get_table()

        response = table.get_item(
            Key={
                "notification_id": notification_id
            }
        )

        return response.get("Item")

    @classmethod
    def get_notifications_by_user(cls, user_id):

        table = cls.get_table()

        items = []
        last_key = None

        while True:

            kwargs = {}

            if last_key:
                kwargs["ExclusiveStartKey"] = last_key

            response = table.scan(**kwargs)

            items.extend(
                response.get("Items", [])
            )

            last_key = response.get(
                "LastEvaluatedKey"
            )

            if not last_key:
                break

        user_notifications = [
            item
            for item in items
            if item["user_id"] == user_id
        ]

        user_notifications.sort(
            key=lambda x: x["created_at"],
            reverse=True
        )

        return user_notifications

    @staticmethod
    def mark_as_read(notification_id):

        table = NotificationService.get_table()

        notification = NotificationService.get_notification(
            notification_id
        )

        if not notification:
            raise ValueError(
                "Notification not found."
            )

        now = NotificationService._timestamp()

        table.update_item(
            Key={
                "notification_id": notification_id
            },
            UpdateExpression="""
                SET #status=:status,
                    read_at=:read_at
            """,
            ExpressionAttributeNames={
                "#status": "status"
            },
            ExpressionAttributeValues={
                ":status": "READ",
                ":read_at": now
            }
        )

        notification["status"] = "READ"
        notification["read_at"] = now

        return notification

    @classmethod
    def mark_all_as_read(cls, user_id):

        notifications = cls.get_notifications_by_user(
            user_id
        )

        count = 0

        for notification in notifications:

            if notification["status"] == "UNREAD":

                cls.mark_as_read(
                    notification["notification_id"]
                )

                count += 1

        return {
            "message": "Notifications marked as read.",
            "updated": count
        }

    @staticmethod
    def delete_notification(notification_id):

        table = NotificationService.get_table()

        notification = NotificationService.get_notification(
            notification_id
        )

        if not notification:
            raise ValueError(
                "Notification not found."
            )

        table.delete_item(
            Key={
                "notification_id": notification_id
            }
        )

        return True

    @staticmethod
    def health():

        return {
            "status": "UP",
            "service": "notification"
        }