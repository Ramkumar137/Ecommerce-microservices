import os
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from utils.dynamodb import get_table
from integrations.order_client import OrderClient

class PaymentService:

    @staticmethod
    def get_table():
        table_name = os.getenv("PAYMENT_TABLE")

        if not table_name:
            raise ValueError("PAYMENT_TABLE environment variable not set")

        return get_table(table_name)
    
    @staticmethod
    def _timestamp():
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def _generate_payment_id():
        return f"pay-{uuid.uuid4().hex[:8]}"
    
    @staticmethod
    def _serialize_payment(payment):
        result = dict(payment)
        result["amount"] = float(result["amount"])
        return result

    @classmethod
    def create_payment(cls,order_id,user_id,payment_method,token):

        table = cls.get_table()

        order = OrderClient.get_order(order_id, token)

        if not order:
            raise ValueError("Order not found.")

        existing = cls.get_payment_by_order(order_id)

        if existing:
            raise ValueError(
                "Payment already exists for this order."
            )

        amount = Decimal(str(order["total_amount"]))

        now = cls._timestamp()

        currency = "INR"

        payment = {
            "payment_id": cls._generate_payment_id(),
            "order_id": order_id,
            "user_id": user_id,
            "amount": amount,
            "currency": currency,
            "payment_method": payment_method,
            "status": "PENDING",
            "transaction_id": "",
            "gateway": "MockGateway",
            "created_at": now,
            "updated_at": now,
        }

        table.put_item(Item=payment)

        return cls._serialize_payment(payment)
    
    @staticmethod
    def get_payment(payment_id):
        table = PaymentService.get_table()
        response = table.get_item(
            Key={
                "payment_id": payment_id
            }
        )
        item = response.get("Item")
        return PaymentService._serialize_payment(item) if item else None
        
    @staticmethod
    def get_all_payments():
        table = PaymentService.get_table()

        response = table.scan()
        return [
            PaymentService._serialize_payment(item)
            for item in response.get("Items", [])
        ]
    
    @classmethod
    def get_payments_by_user(cls, user_id):

        table = cls.get_table()

        items = []
        last_key = None

        while True:

            kwargs = {}

            if last_key:
                kwargs["ExclusiveStartKey"] = last_key

            response = table.scan(**kwargs)

            items.extend(response.get("Items", []))

            last_key = response.get("LastEvaluatedKey")

            if not last_key:
                break

        return [
            cls._serialize_payment(item)
            for item in items
            if item["user_id"] == user_id
        ]

    @classmethod
    def get_payment_by_order(cls, order_id):

        table = cls.get_table()

        items = []
        last_key = None

        while True:

            kwargs = {}

            if last_key:
                kwargs["ExclusiveStartKey"] = last_key

            response = table.scan(**kwargs)

            items.extend(response.get("Items", []))

            last_key = response.get("LastEvaluatedKey")

            if not last_key:
                break

        for payment in items:
            if payment["order_id"] == order_id:
                return cls._serialize_payment(payment)

        return None

    @classmethod
    def update_status(
        cls,
        payment_id,
        status,
        transaction_id=""
    ):

        table = cls.get_table()

        payment = cls.get_payment(payment_id)

        if not payment:
            raise ValueError("Payment not found.")

        VALID_TRANSITIONS = {
            "PENDING": ["SUCCESS", "FAILED", "CANCELLED"],
            "SUCCESS": ["REFUNDED"],
            "FAILED": [],
            "REFUNDED": [],
            "CANCELLED": [],
        }

        current_status = payment["status"]

        if status not in VALID_TRANSITIONS[current_status]:
            raise ValueError(
                f"Cannot change status from "
                f"{current_status} to {status}"
            )

        now = cls._timestamp()

        table.update_item(
            Key={
                "payment_id": payment_id
            },
            UpdateExpression="""
                SET #status=:status,
                    transaction_id=:txn,
                    updated_at=:updated
            """,
            ExpressionAttributeNames={
                "#status": "status"
            },
            ExpressionAttributeValues={
                ":status": status,
                ":txn": transaction_id,
                ":updated": now
            }
        )

        payment["status"] = status
        payment["transaction_id"] = transaction_id
        payment["updated_at"] = now

        return payment

    @staticmethod
    def delete_payment(payment_id):

        table = PaymentService.get_table()
        payment = PaymentService.get_payment(payment_id)
        if not payment:
            raise ValueError("Payment not found.")

        table.delete_item(
            Key={
                "payment_id": payment_id
            }
        )

        return True

    @staticmethod
    def health():

        return {
            "status": "UP",
            "service": "payment"
        }