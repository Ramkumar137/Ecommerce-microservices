import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from utils.dynamodb import get_table


class DynamoService:
    TABLE_NAME = os.getenv("NOTIFICATION_TABLE", "ram-notifications")

    @classmethod
    def get_table(cls):
        return get_table(cls.TABLE_NAME)

    @staticmethod
    def _timestamp() -> str:
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def _generate_notification_id() -> str:
        return f"not-{uuid.uuid4().hex[:8]}"

    @classmethod
    def store_notification(cls, payload: Dict[str, Any]) -> Dict[str, Any]:
        table = cls.get_table()
        notification = {
            "notificationId": cls._generate_notification_id(),
            "userId": payload["userId"],
            "type": payload["type"],
            "message": payload["message"],
            "status": "UNREAD",
            "role": payload.get("role", "CUSTOMER"),
            "createdAt": cls._timestamp(),
        }
        table.put_item(Item=notification)
        return notification

    @classmethod
    def fetch_notifications(cls, user_id: str) -> List[Dict[str, Any]]:
        table = cls.get_table()
        items: List[Dict[str, Any]] = []
        last_key: Optional[Dict[str, Any]] = None

        while True:
            kwargs: Dict[str, Any] = {}
            if last_key:
                kwargs["ExclusiveStartKey"] = last_key
            response = table.scan(**kwargs)
            items.extend(response.get("Items", []))
            last_key = response.get("LastEvaluatedKey")
            if not last_key:
                break

        user_items = [item for item in items if item.get("userId") == user_id]
        user_items.sort(key=lambda item: item.get("createdAt", ""), reverse=True)
        return user_items

    @classmethod
    def mark_as_read(cls, user_id: str, notification_id: str) -> Dict[str, Any]:
        table = cls.get_table()
        response = table.get_item(Key={"notificationId": notification_id})
        item = response.get("Item")
        if not item or item.get("userId") != user_id:
            raise ValueError("Notification not found")

        table.update_item(
            Key={"notificationId": notification_id},
            UpdateExpression="SET #status = :status",
            ExpressionAttributeNames={"#status": "status"},
            ExpressionAttributeValues={":status": "READ"},
        )
        item["status"] = "READ"
        return item

    @classmethod
    def mark_as_read_by_id(cls, notification_id: str) -> Dict[str, Any]:
        table = cls.get_table()
        response = table.get_item(Key={"notificationId": notification_id})
        item = response.get("Item")
        if not item:
            raise ValueError("Notification not found")

        table.update_item(
            Key={"notificationId": notification_id},
            UpdateExpression="SET #status = :status",
            ExpressionAttributeNames={"#status": "status"},
            ExpressionAttributeValues={":status": "READ"},
        )
        item["status"] = "READ"
        return item

    @classmethod
    def get_notification(cls, notification_id: str) -> Optional[Dict[str, Any]]:
        table = cls.get_table()
        response = table.get_item(Key={"notificationId": notification_id})
        return response.get("Item")

    @classmethod
    def delete_notification(cls, notification_id: str) -> bool:
        table = cls.get_table()
        table.delete_item(Key={"notificationId": notification_id})
        return True
