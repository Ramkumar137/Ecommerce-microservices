# analytics/direct_aggregator.py

import os
import logging
from datetime import datetime, timezone
from decimal import Decimal
from utils.dynamodb import get_table

logger = logging.getLogger(__name__)


def _timestamp():
    return datetime.now(timezone.utc).isoformat()


def _serialize_value(val):
    """Recursively convert Decimal to float/int for JSON safety."""
    if isinstance(val, Decimal):
        return int(val) if val % 1 == 0 else float(val)
    if isinstance(val, list):
        return [_serialize_value(item) for item in val]
    if isinstance(val, dict):
        return {k: _serialize_value(v) for k, v in val.items()}
    return val


def _to_float(val, default=0.0):
    if val is None:
        return default
    try:
        return float(val)
    except (ValueError, TypeError):
        return default


def _to_int(val, default=0):
    if val is None:
        return default
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return default


def _extract_amount(item):
    """Extract numeric monetary amount from payment or order dictionary."""
    if not isinstance(item, dict):
        return 0.0

    # Priority key search
    for key in ("amount", "total_amount", "total", "payment_amount", "price", "value"):
        if key in item and item[key] is not None:
            return _to_float(item[key])

    # Case-insensitive key search fallback
    for k, v in item.items():
        if k.lower() in ("amount", "total_amount", "total", "payment_amount", "price", "value") and v is not None:
            return _to_float(v)

    return 0.0


def _is_successful_payment(status):
    """Check if payment status is successful (case-insensitive)."""
    if not status:
        return False
    st = str(status).strip().upper()
    return st in ("SUCCESS", "COMPLETED", "PAID", "APPROVED")


def _is_failed_payment(status):
    """Check if payment status is failed (case-insensitive)."""
    if not status:
        return False
    st = str(status).strip().upper()
    return st in ("FAILED", "FAILURE", "DECLINED", "REJECTED")


class DirectDynamoDBAggregator:
    """
    Directly scans microservice DynamoDB tables to perform live real-time
    aggregations for analytics metrics without depending on event streams.
    """

    @staticmethod
    def _scan_all_items(table_name):
        """
        Perform paginated scan to retrieve all items from a DynamoDB table.
        Loops using LastEvaluatedKey to guarantee complete data extraction.
        """
        try:
            table = get_table(table_name)
            items = []
            last_key = None

            while True:
                kwargs = {}
                if last_key:
                    kwargs["ExclusiveStartKey"] = last_key
                response = table.scan(**kwargs)
                fetched = response.get("Items", [])
                items.extend(fetched)
                last_key = response.get("LastEvaluatedKey")
                if not last_key:
                    break

            logger.info(f"[DynamoDB Scan] Table '{table_name}' fetched {len(items)} items total.")
            return [_serialize_value(item) for item in items]
        except Exception as e:
            logger.error(
                f"[DynamoDB Scan ERROR] Failed to scan table '{table_name}': {e}. "
                "Verify AWS credentials and table permissions.",
                exc_info=True,
            )
            return []

    # -------------------------------------------------------------------------
    # Microservice Table Loaders
    # -------------------------------------------------------------------------

    @classmethod
    def get_orders(cls):
        table_name = os.getenv("ORDER_TABLE", "ram-orders")
        return cls._scan_all_items(table_name)

    @classmethod
    def get_payments(cls):
        table_name = os.getenv("PAYMENT_TABLE", "ram-payments")
        return cls._scan_all_items(table_name)

    @classmethod
    def get_products(cls):
        table_name = os.getenv("PRODUCT_TABLE", "ram-products")
        return cls._scan_all_items(table_name)

    @classmethod
    def get_inventory(cls):
        table_name = os.getenv("INVENTORY_TABLE", "ram-inventory")
        return cls._scan_all_items(table_name)

    @classmethod
    def get_users(cls):
        table_name = os.getenv("USER_TABLE", "ram-users")
        return cls._scan_all_items(table_name)

    # -------------------------------------------------------------------------
    # Aggregation Calculations
    # -------------------------------------------------------------------------

    @classmethod
    def compute_dashboard_metrics(cls):
        orders = cls.get_orders()
        payments = cls.get_payments()
        products = cls.get_products()
        users = cls.get_users()

        logger.info(
            f"[Analytics Summary] Fetched counts -> Payments: {len(payments)}, "
            f"Orders: {len(orders)}, Products: {len(products)}, Users: {len(users)}."
        )

        if payments:
            logger.info(f"[Analytics Debug] Sample Payment Record: {payments[0]}")
        if orders:
            logger.info(f"[Analytics Debug] Sample Order Record: {orders[0]}")

        # 1. Revenue & Payment Counts
        successful_payments = [
            p for p in payments
            if _is_successful_payment(p.get("status"))
        ]
        failed_payments = [
            p for p in payments
            if _is_failed_payment(p.get("status"))
        ]

        total_revenue = sum(_extract_amount(p) for p in successful_payments)
        logger.info(
            f"[Analytics] Computed total revenue from {len(successful_payments)} successful payment(s): {total_revenue}"
        )

        # Fallback revenue from non-cancelled orders if payments table has 0 successful payments
        if total_revenue == 0.0 and orders:
            valid_orders = [
                o for o in orders
                if str(o.get("status", "")).strip().upper() not in ("CANCELLED", "FAILED")
            ]
            total_revenue = sum(_extract_amount(o) for o in valid_orders)
            logger.info(
                f"[Analytics Fallback] Computed total revenue from {len(valid_orders)} non-cancelled order(s): {total_revenue}"
            )

        # 2. Total Orders & Customer Count
        total_orders = len(orders)
        order_user_ids = {str(o.get("user_id")) for o in orders if o.get("user_id")}
        user_ids = {str(u.get("user_id")) for u in users if u.get("user_id")}
        total_customers = len(user_ids | order_user_ids)

        # 3. Product Metrics
        total_products = len(products)
        active_products = sum(
            1 for p in products
            if p.get("is_active") is True or str(p.get("is_active", "")).lower() in ("true", "1")
        )

        # 4. Top Selling Products
        product_sales = {}
        for order in orders:
            items = order.get("items", [])
            if isinstance(items, list):
                for item in items:
                    if isinstance(item, dict):
                        pid = str(item.get("product_id") or "")
                        pname = str(item.get("product_name") or "")
                        qty = _to_int(item.get("quantity"), 1)
                        if pid not in product_sales:
                            product_sales[pid] = {
                                "metric_type": "PRODUCT",
                                "metric_id": pid,
                                "product_name": pname,
                                "total_sold": 0,
                                "updated_at": _timestamp(),
                            }
                        product_sales[pid]["total_sold"] += qty

        top_selling_products = sorted(
            list(product_sales.values()),
            key=lambda x: x["total_sold"],
            reverse=True,
        )[:10]

        # 5. Recent Orders
        sorted_orders = sorted(
            orders,
            key=lambda o: str(o.get("created_at") or o.get("updated_at") or ""),
            reverse=True,
        )[:10]

        recent_orders = [
            {
                "metric_type": "RECENT_ORDER",
                "metric_id": str(o.get("order_id") or ""),
                "user_id": str(o.get("user_id") or ""),
                "total_amount": round(_extract_amount(o), 2),
                "status": str(o.get("status") or ""),
                "updated_at": str(o.get("updated_at") or o.get("created_at") or _timestamp()),
            }
            for o in sorted_orders
        ]

        now = _timestamp()
        return {
            "total_revenue": round(total_revenue, 2),
            "total_orders": total_orders,
            "total_customers": total_customers,
            "total_products": total_products,
            "active_products": active_products,
            "successful_payments": len(successful_payments),
            "failed_payments": len(failed_payments),
            "top_selling_products": top_selling_products,
            "recent_orders": recent_orders,
            "updated_at": now,
        }

    @classmethod
    def compute_admin_analytics(cls):
        dash = cls.compute_dashboard_metrics()
        orders = cls.get_orders()
        payments = cls.get_payments()

        top_products = [
            {
                "id": str(p.get("metric_id") or ""),
                "name": str(p.get("product_name") or ""),
                "totalSold": _to_int(p.get("total_sold")),
            }
            for p in dash.get("top_selling_products", [])
        ]

        # Time-series trends
        by_date = {}
        records = payments if payments else orders
        for r in records:
            dt_str = str(r.get("created_at") or r.get("updated_at") or "")
            if len(dt_str) >= 10:
                date_key = dt_str[:10]
                by_date[date_key] = by_date.get(date_key, 0) + 1

        if by_date:
            sorted_dates = sorted(by_date.keys())
            trends = [
                {"date": d, "orders": by_date[d]}
                for d in sorted_dates
            ]
        else:
            now_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            trends = [{"date": now_date, "orders": dash.get("total_orders", 0)}]

        return {
            "revenue": dash.get("total_revenue", 0.0),
            "totalOrders": dash.get("total_orders", 0),
            "totalUsers": dash.get("total_customers", 0),
            "topProducts": top_products,
            "trends": trends,
        }

    @classmethod
    def compute_order_metrics(cls):
        orders = cls.get_orders()
        counts = {
            "pending": 0,
            "confirmed": 0,
            "processing": 0,
            "shipped": 0,
            "delivered": 0,
            "cancelled": 0,
        }
        for o in orders:
            st = str(o.get("status", "")).lower()
            if st in counts:
                counts[st] += 1

        return {
            "total_orders": len(orders),
            "pending": counts["pending"],
            "confirmed": counts["confirmed"],
            "processing": counts["processing"],
            "shipped": counts["shipped"],
            "delivered": counts["delivered"],
            "cancelled": counts["cancelled"],
            "updated_at": _timestamp(),
        }

    @classmethod
    def compute_payment_metrics(cls):
        payments = cls.get_payments()
        successful = 0
        failed = 0
        refunded = 0

        for p in payments:
            st = str(p.get("status", "")).upper()
            if _is_successful_payment(st):
                successful += 1
            elif _is_failed_payment(st):
                failed += 1
            elif st == "REFUNDED":
                refunded += 1

        return {
            "total_payments": len(payments),
            "successful_payments": successful,
            "failed_payments": failed,
            "refunded_payments": refunded,
            "updated_at": _timestamp(),
        }

    @classmethod
    def compute_sales_metrics(cls):
        pay_metrics = cls.compute_payment_metrics()
        dash = cls.compute_dashboard_metrics()
        return {
            "total_revenue": dash["total_revenue"],
            "total_payments": pay_metrics["total_payments"],
            "successful_payments": pay_metrics["successful_payments"],
            "failed_payments": pay_metrics["failed_payments"],
            "updated_at": _timestamp(),
        }

    @classmethod
    def compute_inventory_metrics(cls):
        inv_items = cls.get_inventory()
        total_stock = 0
        available_stock = 0
        reserved_stock = 0
        low_stock_products = 0
        out_of_stock_products = 0

        for item in inv_items:
            s = _to_int(item.get("stock"))
            a = _to_int(item.get("available_stock"), default=s)
            r = _to_int(item.get("reserved_stock"))

            total_stock += s
            available_stock += a
            reserved_stock += r

            if a <= 0:
                out_of_stock_products += 1
            elif a <= 5:
                low_stock_products += 1

        return {
            "total_stock": total_stock,
            "available_stock": available_stock,
            "reserved_stock": reserved_stock,
            "low_stock_products": low_stock_products,
            "out_of_stock_products": out_of_stock_products,
            "updated_at": _timestamp(),
        }

    @classmethod
    def compute_product_metrics(cls):
        products = cls.get_products()
        orders = cls.get_orders()

        sales = {}
        for order in orders:
            items = order.get("items", [])
            if isinstance(items, list):
                for item in items:
                    if isinstance(item, dict):
                        pid = str(item.get("product_id") or "")
                        qty = _to_int(item.get("quantity"), 1)
                        sales[pid] = sales.get(pid, 0) + qty

        product_list = []
        for p in products:
            pid = str(p.get("product_id") or "")
            product_list.append({
                "metric_type": "PRODUCT",
                "metric_id": pid,
                "product_name": str(p.get("name") or p.get("product_name") or ""),
                "total_sold": sales.get(pid, 0),
                "is_active": p.get("is_active", True),
                "updated_at": str(p.get("updated_at") or _timestamp()),
            })

        product_list.sort(key=lambda x: x["total_sold"], reverse=True)
        return {
            "products": product_list,
            "total": len(product_list),
        }

    @classmethod
    def compute_customer_metrics(cls):
        dash = cls.compute_dashboard_metrics()
        users = cls.get_users()

        active_cust = dash.get("total_customers", 0)
        return {
            "cart_abandonment_rate": 0.0,
            "active_customers": active_cust,
            "returning_customers": max(0, len(users) - 1),
            "new_customers": min(1, len(users)),
            "updated_at": _timestamp(),
        }

    @classmethod
    def compute_revenue_metrics(cls):
        payments = cls.get_payments()
        orders = cls.get_orders()

        by_date = {}
        successful_payments = [
            p for p in payments
            if _is_successful_payment(p.get("status"))
        ]

        source = successful_payments if successful_payments else orders

        for item in source:
            dt_str = str(item.get("created_at") or item.get("updated_at") or "")
            amt = _extract_amount(item)
            if len(dt_str) >= 10:
                date_key = dt_str[:10]
                by_date[date_key] = by_date.get(date_key, 0.0) + amt

        if by_date:
            sorted_dates = sorted(by_date.keys())
            return [
                {"date": d, "revenue": round(by_date[d], 2)}
                for d in sorted_dates
            ]

        now_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        dash = cls.compute_dashboard_metrics()
        return [{"date": now_date, "revenue": dash.get("total_revenue", 0.0)}]
