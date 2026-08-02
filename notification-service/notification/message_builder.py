from __future__ import annotations

from typing import Any, Dict, List


class MessageBuilder:
    @staticmethod
    def build(payload: Dict[str, Any]) -> Dict[str, str]:
        role = (payload.get("role") or "CUSTOMER").upper()
        notification_type = (payload.get("type") or "").upper()
        data = payload.get("data") or {}
        order_id = data.get("orderId") or data.get("order_id") or ""
        user_id = payload.get("userId") or ""

        templates = {
            "CUSTOMER": {
                "FORGOT_PASSWORD": {
                    "subject": "Reset your password",
                    "message": "A password reset was requested for your account.",
                    "body": "Use the reset link to continue with your password update.",
                },
                "ORDER_PLACED": {
                    "subject": "Order placed successfully",
                    "message": f"Your order {order_id} has been placed successfully.",
                    "body": "We will keep you updated as your order moves through processing.",
                },
                "PAYMENT_SUCCESS": {
                    "subject": "Payment successful",
                    "message": f"Payment for order {order_id} was received successfully.",
                    "body": "Your transaction has been completed successfully.",
                },
                "CART_UPDATED": {
                    "subject": "Cart updated",
                    "message": "Your cart was updated successfully.",
                    "body": "Please review your updated cart before checkout.",
                },
                "PROFILE_UPDATED": {
                    "subject": "Profile updated",
                    "message": "Your profile information was updated successfully.",
                    "body": "Your profile changes have been saved.",
                },
            },
            "ADMIN": {
                "FORGOT_PASSWORD": {
                    "subject": "Admin password reset",
                    "message": "An administrator password reset was requested.",
                    "body": "Please follow the reset instructions to continue.",
                },
                "SUPPORT_REQUEST": {
                    "subject": "New support request",
                    "message": f"A support request requires attention for user {user_id}.",
                    "body": "Please review the request and provide a response.",
                },
                "INVENTORY_LOW": {
                    "subject": "Inventory alert",
                    "message": "Inventory levels are running low for one or more products.",
                    "body": "Please review stock levels and replenish inventory.",
                },
                "NEW_USER": {
                    "subject": "New user registered",
                    "message": "A new user has registered and requires review.",
                    "body": "Please review the account details for onboarding.",
                },
                "ORDER_PLACED": {
                    "subject": "New order received",
                    "message": f"A new order {order_id} has been placed.",
                    "body": "Please review the order details and fulfill the request.",
                },
                "FEEDBACK": {
                    "subject": "New feedback received",
                    "message": "A new feedback submission was received.",
                    "body": "Please review the feedback and follow up with the user.",
                },
            },
        }

        template = templates.get(role, {}).get(notification_type)
        if template is None:
            template = {
                "subject": "Notification",
                "message": "You have a new notification.",
                "body": "Please review the latest update.",
            }

        return {
            "subject": template["subject"],
            "message": template["message"],
            "body": template["body"],
        }
