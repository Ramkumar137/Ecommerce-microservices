import os
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from utils.dynamodb import get_table

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
    def create_payment(
        cls,
        order_id,
        user_id,
        amount,
        currency,
        payment_method
    ):

        table = cls.get_table()
        now = cls._timestamp()
        amount = Decimal(str(amount))

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
            "updated_at": now
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

    @staticmethod
    def get_payment_by_order(order_id):

        table = PaymentService.get_table()
        response = table.scan()
        payments = response.get("Items", [])

        for payment in payments:
            if payment["order_id"] == order_id:
                return payment

        return PaymentService._serialize_payment(payment)

    @classmethod
    def update_status(
        cls,
        payment_id,
        status,
        transaction_id=""
    ):
        table = cls.get_table()
        payment = cls.get_payment(payment_id)
        now = cls._timestamp()

        if not payment:
            raise ValueError("Payment not found.")

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