import logging

from .services import AnalyticsService
from .constants import EventType, PaymentStatus

logger = logging.getLogger(__name__)


def handle_product_created(data):
    """
    Handles PRODUCT_CREATED event.
    Registers the product in analytics and increments total_products.
    """
    product_id = data["product_id"]
    product_name = data.get("name", "")

    AnalyticsService.update_product_metrics(
        product_id=product_id,
        product_name=product_name,
        event_type=EventType.PRODUCT_CREATED,
    )

    logger.info(
        f"REAL_DATA_PIPELINE [PRODUCT_CREATED] product_id={product_id} name={product_name}"
    )


def handle_product_updated(data):
    """
    Handles PRODUCT_UPDATED event.
    Updates the product name in analytics.
    """
    product_id = data["product_id"]
    product_name = data.get("name", "")

    AnalyticsService.update_product_metrics(
        product_id=product_id,
        product_name=product_name,
        event_type=EventType.PRODUCT_UPDATED,
    )

    logger.info(
        f"REAL_DATA_PIPELINE [PRODUCT_UPDATED] product_id={product_id} name={product_name}"
    )


def handle_order_created(data):
    """
    Handles ORDER_CREATED event.
    Increments order counters, updates recent orders and top products.
    Tracks unique customers.
    """
    order_id = data["order_id"]
    user_id = data["user_id"]
    total_amount = data.get("total_amount", 0)
    status = data.get("status", "PENDING")
    items = data.get("items", [])

    AnalyticsService.update_order_metrics(
        order_id=order_id,
        user_id=user_id,
        total_amount=total_amount,
        status=status,
        items=items,
        is_new_order=True,
    )

    AnalyticsService.update_customer_metrics(user_id=user_id)

    logger.info(
        f"REAL_DATA_PIPELINE [ORDER_CREATED] order_id={order_id} user_id={user_id} "
        f"total_amount={total_amount} items_count={len(items)}"
    )


def handle_order_status_updated(data):
    """
    Handles ORDER_STATUS_UPDATED event.
    Updates order status counters and refreshes the recent orders entry.
    """
    order_id = data["order_id"]
    user_id = data.get("user_id", "")
    total_amount = data.get("total_amount", 0)
    status = data["status"]
    items = data.get("items", [])

    AnalyticsService.update_order_metrics(
        order_id=order_id,
        user_id=user_id,
        total_amount=total_amount,
        status=status,
        items=items,
        is_new_order=False,
    )

    logger.info(
        f"REAL_DATA_PIPELINE [ORDER_STATUS_UPDATED] order_id={order_id} status={status}"
    )


def handle_payment_success(data):
    """
    Handles PAYMENT_SUCCESS event.
    Increments successful payment counter and adds to total revenue.
    """
    amount = data.get("amount", 0)
    payment_id = data.get("payment_id", "")
    order_id = data.get("order_id", "")

    AnalyticsService.update_payment_metrics(
        amount=amount,
        status=PaymentStatus.SUCCESS,
    )

    logger.info(
        f"REAL_DATA_PIPELINE [PAYMENT_SUCCESS] payment_id={payment_id} "
        f"order_id={order_id} amount={amount}"
    )


def handle_payment_failed(data):
    """
    Handles PAYMENT_FAILED event.
    Increments failed payment counter.
    """
    payment_id = data.get("payment_id", "")
    order_id = data.get("order_id", "")

    AnalyticsService.update_payment_metrics(
        amount=0,
        status=PaymentStatus.FAILED,
    )

    logger.info(
        f"REAL_DATA_PIPELINE [PAYMENT_FAILED] payment_id={payment_id} order_id={order_id}"
    )
