from unittest.mock import patch

from django.test import TestCase

from notification.message_builder import MessageBuilder
from notification.services import NotificationService


class NotificationServiceTests(TestCase):
    def test_message_builder_returns_expected_content_for_customer_order(self):
        payload = {
            "userId": "user-123",
            "role": "CUSTOMER",
            "type": "ORDER_PLACED",
            "channels": ["EMAIL", "IN_APP"],
            "email": "customer@example.com",
            "data": {"orderId": "ORD-1001"},
        }

        content = MessageBuilder.build(payload)

        self.assertEqual(content["subject"], "Order placed successfully")
        self.assertIn("ORD-1001", content["message"])
        self.assertIn("order", content["body"].lower())

    @patch("notification.services.EmailService.send_email")
    @patch("notification.services.DynamoService.store_notification")
    def test_handle_payload_sends_email_and_stores_in_app(self, store_notification, send_email):
        payload = {
            "userId": "user-123",
            "role": "CUSTOMER",
            "type": "PAYMENT_SUCCESS",
            "channels": ["EMAIL"],
            "email": "customer@example.com",
            "data": {"orderId": "ORD-2002"},
        }

        result = NotificationService.handle_payload(payload)

        self.assertEqual(result["status"], "SUCCESS")
        self.assertEqual(result["channels"], ["EMAIL"])
        send_email.assert_called_once()
        store_notification.assert_not_called()

    @patch("notification.services.DynamoService.fetch_notifications")
    def test_fetch_notifications_returns_latest_first(self, fetch_notifications):
        fetch_notifications.return_value = [
            {"notificationId": "2", "createdAt": "2024-01-02T00:00:00Z"},
            {"notificationId": "1", "createdAt": "2024-01-01T00:00:00Z"},
        ]

        result = NotificationService.fetch_notifications("user-123")

        self.assertEqual([item["notificationId"] for item in result], ["2", "1"])
