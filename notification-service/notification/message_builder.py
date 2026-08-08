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
        product_name = data.get("productName") or data.get("product_name") or "the product"
        customer_name = data.get("customerName") or data.get("customer_name") or "A customer"
        amount = data.get("amount") or ""

        templates = {
            "CUSTOMER": {
                "WELCOME": {
                    "subject": "Welcome to HeisernHub!",
                    "message": "Your account has been created successfully.",
                    "body": "Start exploring our products and enjoy a seamless shopping experience.",
                },
                "FORGOT_PASSWORD": {
                    "subject": "Reset your password",
                    "message": "A password reset was requested for your account.",
                    "body": "Use the reset link to continue with your password update.",
                },
                "ORDER_CREATED": {
                    "subject": "Order placed successfully",
                    "message": f"Your order {order_id} has been placed successfully.",
                    "body": "We will keep you updated as your order moves through processing.",
                },
                "ORDER_CONFIRMED": {
                    "subject": "Order confirmed",
                    "message": f"Your order {order_id} has been confirmed.",
                    "body": "We are preparing your order and will notify you once it ships.",
                },
                "ORDER_SHIPPED": {
                    "subject": "Your order has been shipped",
                    "message": f"Your order {order_id} has been shipped and is on its way.",
                    "body": "You can track your shipment from your Orders page.",
                },
                "ORDER_DELIVERED": {
                    "subject": "Your order has been delivered",
                    "message": f"Your order {order_id} has been delivered successfully.",
                    "body": "We hope you enjoy your purchase. Please leave a review if you are happy with your order.",
                },
                "ORDER_CANCELLED": {
                    "subject": "Order cancelled",
                    "message": f"Your order {order_id} has been cancelled.",
                    "body": "If you did not request this cancellation, please contact our support team.",
                },
                "PAYMENT_SUCCESS": {
                    "subject": "Payment successful",
                    "message": f"Payment of {amount} for order {order_id} was received successfully.".strip(),
                    "body": "Your transaction has been completed successfully.",
                },
                "PAYMENT_FAILED": {
                    "subject": "Payment failed",
                    "message": f"Payment for order {order_id} could not be completed.",
                    "body": "Please retry your payment or choose another payment method.",
                },
                "PAYMENT_REFUNDED": {
                    "subject": "Payment refunded",
                    "message": f"Your payment for order {order_id} has been refunded.",
                    "body": "The refunded amount will be credited to your original payment method within 5-7 business days.",
                },
                "PROFILE_UPDATED": {
                    "subject": "Profile updated",
                    "message": "Your profile information was updated successfully.",
                    "body": "Your profile changes have been saved.",
                },
                "CART_UPDATED": {
                    "subject": "Cart updated",
                    "message": "Your cart was updated successfully.",
                    "body": "Please review your updated cart before checkout.",
                },
            },
            "ADMIN": {
                "FORGOT_PASSWORD": {
                    "subject": "Admin password reset",
                    "message": "An administrator password reset was requested.",
                    "body": "Please follow the reset instructions to continue.",
                },
                "NEW_USER": {
                    "subject": "New user registered",
                    "message": f"{customer_name} has registered a new account.",
                    "body": "Please review the account details for onboarding.",
                },
                "LOW_STOCK": {
                    "subject": "Low stock alert",
                    "message": f"Product '{product_name}' is running low on stock.",
                    "body": "Please replenish inventory before it goes out of stock.",
                },
                "SUPPORT_REQUEST": {
                    "subject": "New support request",
                    "message": f"A support request requires attention for user {user_id}.",
                    "body": "Please review the request and provide a response.",
                },
                "ORDER_CREATED": {
                    "subject": "New order received",
                    "message": f"A new order {order_id} has been placed.",
                    "body": "Please review the order details and fulfill the request.",
                },
                "FEEDBACK": {
                    "subject": "New feedback received",
                    "message": f"{customer_name} submitted new feedback.",
                    "body": "Please review the feedback and follow up with the user.",
                },
            },
        }

        templates["ADMIN"]["NEW_USER_LOGIN"] = {
            "subject": "New user login",
            "message": f"User {customer_name} ({user_id}) logged into the application.",
            "body": "A user login activity was recorded.",
        }
        templates["ADMIN"]["NEW_ORDER"] = templates["ADMIN"]["ORDER_CREATED"]
        templates["CUSTOMER"]["ORDER_PLACED"] = templates["CUSTOMER"]["ORDER_CREATED"]
        templates["CUSTOMER"]["ORDER_UPDATED"] = {
            "subject": "Order status updated",
            "message": f"Status for order {order_id} has been updated.",
            "body": "Check your Orders page for updated tracking information.",
        }
        templates["CUSTOMER"]["ORDER_STATUS_UPDATE"] = templates["CUSTOMER"]["ORDER_UPDATED"]

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
