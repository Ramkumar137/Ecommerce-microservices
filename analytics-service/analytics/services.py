# analytics/services.py

import os
from datetime import datetime, timezone
from decimal import Decimal
from boto3.dynamodb.conditions import Key

from utils.dynamodb import get_table
from .constants import (
    MetricType,
    MetricId,
    RECENT_ORDERS_LIMIT,
    TOP_PRODUCTS_LIMIT,
)


class AnalyticsService:

    @staticmethod
    def get_table():
        table_name = os.getenv("ANALYTICS_TABLE")
        if not table_name:
            raise ValueError("ANALYTICS_TABLE environment variable not set")
        return get_table(table_name)

    @staticmethod
    def _timestamp():
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def _serialize_value(value):
        """Recursively convert Decimal to float for JSON serialization."""
        if isinstance(value, Decimal):
            return float(value)
        if isinstance(value, list):
            return [AnalyticsService._serialize_value(i) for i in value]
        if isinstance(value, dict):
            return {k: AnalyticsService._serialize_value(v) for k, v in value.items()}
        return value

    @staticmethod
    def _serialize(item):
        """Convert all Decimal fields in a DynamoDB item to float."""
        if not item:
            return item
        return {k: AnalyticsService._serialize_value(v) for k, v in item.items()}

    # -------------------------------------------------------------------------
    # Helper Methods
    # -------------------------------------------------------------------------

    @classmethod
    def increment_counter(cls, metric_type, metric_id, field, amount=1):
        """Atomically increment a numeric counter field on a metric record."""
        table = cls.get_table()
        table.update_item(
            Key={
                "metric_type": metric_type,
                "metric_id": metric_id,
            },
            UpdateExpression="ADD #field :amount SET updated_at = :updated",
            ExpressionAttributeNames={"#field": field},
            ExpressionAttributeValues={
                ":amount": Decimal(str(amount)),
                ":updated": cls._timestamp(),
            },
        )

    @classmethod
    def decrement_counter(cls, metric_type, metric_id, field, amount=1):
        """Atomically decrement a numeric counter field on a metric record."""
        table = cls.get_table()
        table.update_item(
            Key={
                "metric_type": metric_type,
                "metric_id": metric_id,
            },
            UpdateExpression="ADD #field :amount SET updated_at = :updated",
            ExpressionAttributeNames={"#field": field},
            ExpressionAttributeValues={
                ":amount": Decimal(str(-amount)),
                ":updated": cls._timestamp(),
            },
        )

    @classmethod
    def update_revenue(cls, amount):
        """Add to total revenue on the REVENUE summary record."""
        table = cls.get_table()
        table.update_item(
            Key={
                "metric_type": MetricType.REVENUE,
                "metric_id": MetricId.SUMMARY,
            },
            UpdateExpression="ADD total_revenue :amount SET updated_at = :updated",
            ExpressionAttributeValues={
                ":amount": Decimal(str(amount)),
                ":updated": cls._timestamp(),
            },
        )

    @classmethod
    def update_top_products(cls, product_id, product_name, quantity):
        """
        Upsert a product row under metric_type=PRODUCT.
        Increments total_sold for the product.
        """
        table = cls.get_table()
        table.update_item(
            Key={
                "metric_type": MetricType.PRODUCT,
                "metric_id": product_id,
            },
            UpdateExpression=(
                "ADD total_sold :qty "
                "SET product_name = :name, updated_at = :updated"
            ),
            ExpressionAttributeValues={
                ":qty": Decimal(str(quantity)),
                ":name": product_name,
                ":updated": cls._timestamp(),
            },
        )

    @classmethod
    def update_recent_orders(cls, order_id, user_id, total_amount, status):
        """
        Upsert a recent order row under metric_type=RECENT_ORDER.
        Each order is stored as its own item keyed by order_id.
        """
        table = cls.get_table()
        table.put_item(
            Item={
                "metric_type": MetricType.RECENT_ORDER,
                "metric_id": order_id,
                "user_id": user_id,
                "total_amount": Decimal(str(total_amount)),
                "status": status,
                "updated_at": cls._timestamp(),
            }
        )

    # -------------------------------------------------------------------------
    # Initialisation
    # -------------------------------------------------------------------------

    @classmethod
    def initialize_dashboard_metrics(cls):
        """
        Seed all summary records with zero values if they do not exist.
        Uses ConditionExpression to avoid overwriting existing data.
        """
        table = cls.get_table()
        now = cls._timestamp()

        seeds = [
            {
                "metric_type": MetricType.DASHBOARD,
                "metric_id": MetricId.SUMMARY,
                "total_revenue": Decimal("0"),
                "total_orders": Decimal("0"),
                "total_customers": Decimal("0"),
                "total_products": Decimal("0"),
                "successful_payments": Decimal("0"),
                "failed_payments": Decimal("0"),
                "created_at": now,
                "updated_at": now,
            },
            {
                "metric_type": MetricType.ORDER,
                "metric_id": MetricId.SUMMARY,
                "total_orders": Decimal("0"),
                "pending": Decimal("0"),
                "confirmed": Decimal("0"),
                "processing": Decimal("0"),
                "shipped": Decimal("0"),
                "delivered": Decimal("0"),
                "cancelled": Decimal("0"),
                "created_at": now,
                "updated_at": now,
            },
            {
                "metric_type": MetricType.PAYMENT,
                "metric_id": MetricId.SUMMARY,
                "total_payments": Decimal("0"),
                "successful_payments": Decimal("0"),
                "failed_payments": Decimal("0"),
                "refunded_payments": Decimal("0"),
                "created_at": now,
                "updated_at": now,
            },
            {
                "metric_type": MetricType.REVENUE,
                "metric_id": MetricId.SUMMARY,
                "total_revenue": Decimal("0"),
                "created_at": now,
                "updated_at": now,
            },
            {
                "metric_type": MetricType.CUSTOMER,
                "metric_id": MetricId.SUMMARY,
                "total_customers": Decimal("0"),
                "created_at": now,
                "updated_at": now,
            },
        ]

        for seed in seeds:
            try:
                table.put_item(
                    Item=seed,
                    ConditionExpression=(
                        "attribute_not_exists(metric_type)"
                    ),
                )
            except table.meta.client.exceptions.ConditionalCheckFailedException:
                pass

        return True

    # -------------------------------------------------------------------------
    # Update Methods (called by event handlers)
    # -------------------------------------------------------------------------

    @classmethod
    def update_order_metrics(cls, order_id, user_id, total_amount, status, items, is_new_order=False):
        """
        Called on ORDER_CREATED and ORDER_STATUS_UPDATED events.
        total_orders is only incremented when is_new_order=True (ORDER_CREATED).
        Status-specific counters are always incremented.
        """
        status_field = status.lower()

        if is_new_order:
            cls.increment_counter(MetricType.ORDER, MetricId.SUMMARY, "total_orders")
            cls.increment_counter(MetricType.DASHBOARD, MetricId.SUMMARY, "total_orders")

        cls.increment_counter(MetricType.ORDER, MetricId.SUMMARY, status_field)

        cls.update_recent_orders(order_id, user_id, total_amount, status)

        for item in items:
            cls.update_top_products(
                item["product_id"],
                item.get("product_name", ""),
                item.get("quantity", 1),
            )

    @classmethod
    def update_payment_metrics(cls, amount, status):
        """
        Called on PAYMENT_SUCCESS and PAYMENT_FAILED events.
        Increments payment counters and updates revenue on success.
        """
        cls.increment_counter(
            MetricType.PAYMENT,
            MetricId.SUMMARY,
            "total_payments",
        )

        if status == "SUCCESS":
            cls.increment_counter(MetricType.PAYMENT, MetricId.SUMMARY, "successful_payments")
            cls.increment_counter(MetricType.DASHBOARD, MetricId.SUMMARY, "successful_payments")
            cls.update_revenue(amount)

        elif status == "FAILED":
            cls.increment_counter(
                MetricType.PAYMENT,
                MetricId.SUMMARY,
                "failed_payments",
            )
            cls.increment_counter(
                MetricType.DASHBOARD,
                MetricId.SUMMARY,
                "failed_payments",
            )

    @classmethod
    def update_product_metrics(cls, product_id, product_name, event_type):
        """
        Called on PRODUCT_CREATED and PRODUCT_UPDATED events.
        Increments total_products counter on creation.
        """
        if event_type == "PRODUCT_CREATED":
            cls.increment_counter(
                MetricType.DASHBOARD,
                MetricId.SUMMARY,
                "total_products",
            )
            table = cls.get_table()
            now = cls._timestamp()
            try:
                table.put_item(
                    Item={
                        "metric_type": MetricType.PRODUCT,
                        "metric_id": product_id,
                        "product_name": product_name,
                        "total_sold": Decimal("0"),
                        "created_at": now,
                        "updated_at": now,
                    },
                    ConditionExpression="attribute_not_exists(metric_type)",
                )
            except table.meta.client.exceptions.ConditionalCheckFailedException:
                pass

        elif event_type == "PRODUCT_UPDATED":
            table = cls.get_table()
            table.update_item(
                Key={
                    "metric_type": MetricType.PRODUCT,
                    "metric_id": product_id,
                },
                UpdateExpression="SET product_name = :name, updated_at = :updated",
                ExpressionAttributeValues={
                    ":name": product_name,
                    ":updated": cls._timestamp(),
                },
            )

    @classmethod
    def update_customer_metrics(cls, user_id):
        """
        Called when a new unique customer places their first order.
        Increments total_customers on both CUSTOMER and DASHBOARD summaries.
        """
        cls.increment_counter(
            MetricType.CUSTOMER,
            MetricId.SUMMARY,
            "total_customers",
        )
        cls.increment_counter(
            MetricType.DASHBOARD,
            MetricId.SUMMARY,
            "total_customers",
        )

    # -------------------------------------------------------------------------
    # Read Methods (called by views)
    # -------------------------------------------------------------------------

    @classmethod
    def get_dashboard_metrics(cls):
        """
        Returns the DASHBOARD summary record enriched with
        top selling products and recent orders.
        """
        table = cls.get_table()

        response = table.get_item(
            Key={
                "metric_type": MetricType.DASHBOARD,
                "metric_id": MetricId.SUMMARY,
            }
        )
        dashboard = cls._serialize(response.get("Item", {}))

        dashboard["top_selling_products"] = cls._get_top_products()
        dashboard["recent_orders"] = cls._get_recent_orders()

        return dashboard

    @classmethod
    def get_sales_metrics(cls):
        """
        Returns combined revenue and payment summary.
        """
        revenue = cls.get_revenue_metrics()
        payment = cls.get_payment_metrics()

        return {
            "total_revenue": revenue.get("total_revenue", 0),
            "successful_payments": payment.get("successful_payments", 0),
            "failed_payments": payment.get("failed_payments", 0),
            "total_payments": payment.get("total_payments", 0),
            "updated_at": revenue.get("updated_at"),
        }

    @classmethod
    def get_order_metrics(cls):
        """Returns the ORDER summary record."""
        table = cls.get_table()
        response = table.get_item(
            Key={
                "metric_type": MetricType.ORDER,
                "metric_id": MetricId.SUMMARY,
            }
        )
        return cls._serialize(response.get("Item", {}))

    @classmethod
    def get_payment_metrics(cls):
        """Returns the PAYMENT summary record."""
        table = cls.get_table()
        response = table.get_item(
            Key={
                "metric_type": MetricType.PAYMENT,
                "metric_id": MetricId.SUMMARY,
            }
        )
        return cls._serialize(response.get("Item", {}))

    @classmethod
    def get_product_metrics(cls):
        """
        Returns all product rows sorted by total_sold descending.
        """
        products = cls._get_top_products(limit=None)
        return {"products": products, "total": len(products)}

    @classmethod
    def get_revenue_metrics(cls):
        """Returns the REVENUE summary record."""
        table = cls.get_table()
        response = table.get_item(
            Key={
                "metric_type": MetricType.REVENUE,
                "metric_id": MetricId.SUMMARY,
            }
        )
        return cls._serialize(response.get("Item", {}))

    # -------------------------------------------------------------------------
    # Private Read Helpers
    # -------------------------------------------------------------------------

    @classmethod
    def _get_top_products(cls, limit=TOP_PRODUCTS_LIMIT):
        """Query all PRODUCT rows and return sorted by total_sold."""
        table = cls.get_table()
        items = []
        last_key = None

        while True:
            kwargs = {
                "KeyConditionExpression": Key("metric_type").eq(
                    MetricType.PRODUCT
                )
            }
            if last_key:
                kwargs["ExclusiveStartKey"] = last_key

            response = table.query(**kwargs)
            items.extend(response.get("Items", []))
            last_key = response.get("LastEvaluatedKey")

            if not last_key:
                break

        serialized = [cls._serialize(i) for i in items]
        serialized.sort(key=lambda x: x.get("total_sold", 0), reverse=True)

        if limit is not None:
            return serialized[:limit]
        return serialized

    @classmethod
    def _get_recent_orders(cls, limit=RECENT_ORDERS_LIMIT):
        """Query all RECENT_ORDER rows and return sorted by updated_at."""
        table = cls.get_table()
        items = []
        last_key = None

        while True:
            kwargs = {
                "KeyConditionExpression": Key("metric_type").eq(
                    MetricType.RECENT_ORDER
                )
            }
            if last_key:
                kwargs["ExclusiveStartKey"] = last_key

            response = table.query(**kwargs)
            items.extend(response.get("Items", []))
            last_key = response.get("LastEvaluatedKey")

            if not last_key:
                break

        serialized = [cls._serialize(i) for i in items]
        serialized.sort(key=lambda x: x.get("updated_at", ""), reverse=True)

        return serialized[:limit]

    @staticmethod
    def health():
        return {"status": "UP", "service": "analytics"}
