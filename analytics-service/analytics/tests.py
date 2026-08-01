from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient


class AnalyticsResponseStandardizationTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()

    @patch("analytics.views.JWTAuthentication.authenticate")
    @patch("analytics.views.IsAdmin.has_permission")
    @patch("analytics.services.AnalyticsService.get_table")
    def test_dashboard_response_shape(self, mock_get_table, mock_has_perm, mock_auth):
        mock_auth.return_value = (MagicMock(), None)
        mock_has_perm.return_value = True

        mock_table = MagicMock()
        mock_get_table.return_value = mock_table
        mock_table.get_item.return_value = {}
        mock_table.query.return_value = {"Items": []}

        url = reverse("analytics-dashboard")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        res = response.json()
        self.assertTrue(res.get("success"))
        data = res.get("data", {})

        expected_keys = {
            "totalRevenue",
            "totalOrders",
            "totalCustomers",
            "totalProducts",
            "activeProducts",
            "successfulPayments",
            "failedPayments",
            "topSellingProducts",
            "recentOrders",
            "updatedAt",
        }
        self.assertEqual(set(data.keys()), expected_keys)
        self.assertIsInstance(data["topSellingProducts"], list)
        self.assertIsInstance(data["recentOrders"], list)
        self.assertEqual(len(data["topSellingProducts"]), 0)
        self.assertEqual(len(data["recentOrders"]), 0)
        self.assertEqual(data["totalRevenue"], 0.0)
        self.assertEqual(data["totalOrders"], 0)
        for key, val in data.items():
            self.assertIsNotNone(val, f"Key {key} should not be null")

    @patch("analytics.views.JWTAuthentication.authenticate")
    @patch("analytics.views.IsAdmin.has_permission")
    @patch("analytics.services.AnalyticsService.get_table")
    def test_orders_response_shape(self, mock_get_table, mock_has_perm, mock_auth):
        mock_auth.return_value = (MagicMock(), None)
        mock_has_perm.return_value = True

        mock_table = MagicMock()
        mock_get_table.return_value = mock_table
        mock_table.get_item.return_value = {}

        url = reverse("analytics-orders")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        res = response.json()
        self.assertTrue(res.get("success"))
        data = res.get("data", {})

        expected_keys = {
            "totalOrders",
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
            "updatedAt",
        }
        self.assertEqual(set(data.keys()), expected_keys)
        for key, val in data.items():
            self.assertIsNotNone(val, f"Key {key} should not be null")

    @patch("analytics.views.JWTAuthentication.authenticate")
    @patch("analytics.views.IsAdmin.has_permission")
    @patch("analytics.services.AnalyticsService.get_table")
    def test_payments_response_shape(self, mock_get_table, mock_has_perm, mock_auth):
        mock_auth.return_value = (MagicMock(), None)
        mock_has_perm.return_value = True

        mock_table = MagicMock()
        mock_get_table.return_value = mock_table
        mock_table.get_item.return_value = {}

        url = reverse("analytics-payments")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        res = response.json()
        self.assertTrue(res.get("success"))
        data = res.get("data", {})

        expected_keys = {
            "totalPayments",
            "successfulPayments",
            "failedPayments",
            "refundedPayments",
            "updatedAt",
        }
        self.assertEqual(set(data.keys()), expected_keys)
        for key, val in data.items():
            self.assertIsNotNone(val, f"Key {key} should not be null")

    @patch("analytics.views.JWTAuthentication.authenticate")
    @patch("analytics.views.IsAdmin.has_permission")
    @patch("analytics.services.AnalyticsService.get_table")
    def test_revenue_response_shape(self, mock_get_table, mock_has_perm, mock_auth):
        mock_auth.return_value = (MagicMock(), None)
        mock_has_perm.return_value = True

        mock_table = MagicMock()
        mock_get_table.return_value = mock_table
        mock_table.get_item.return_value = {}
        mock_table.query.return_value = {"Items": []}

        url = reverse("analytics-revenue")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        res = response.json()
        self.assertTrue(res.get("success"))
        data = res.get("data", [])

        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        item = data[0]
        self.assertIn("date", item)
        self.assertIn("revenue", item)
        self.assertIsNotNone(item["date"])
        self.assertIsNotNone(item["revenue"])

    @patch("analytics.views.JWTAuthentication.authenticate")
    @patch("analytics.views.IsAdmin.has_permission")
    @patch("analytics.services.AnalyticsService.get_table")
    def test_products_response_shape(self, mock_get_table, mock_has_perm, mock_auth):
        mock_auth.return_value = (MagicMock(), None)
        mock_has_perm.return_value = True

        mock_table = MagicMock()
        mock_get_table.return_value = mock_table
        mock_table.query.return_value = {"Items": []}

        url = reverse("analytics-products")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        res = response.json()
        self.assertTrue(res.get("success"))
        data = res.get("data", {})

        expected_keys = {"products", "total"}
        self.assertEqual(set(data.keys()), expected_keys)
        self.assertIsInstance(data["products"], list)
        self.assertEqual(data["total"], 0)
        for key, val in data.items():
            self.assertIsNotNone(val, f"Key {key} should not be null")

    @patch("analytics.views.JWTAuthentication.authenticate")
    @patch("analytics.views.IsAdmin.has_permission")
    @patch("analytics.services.AnalyticsService.get_table")
    def test_sales_response_shape(self, mock_get_table, mock_has_perm, mock_auth):
        mock_auth.return_value = (MagicMock(), None)
        mock_has_perm.return_value = True

        mock_table = MagicMock()
        mock_get_table.return_value = mock_table
        mock_table.get_item.return_value = {}

        url = reverse("analytics-sales")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        res = response.json()
        self.assertTrue(res.get("success"))
        data = res.get("data", {})

        expected_keys = {
            "totalRevenue",
            "totalPayments",
            "successfulPayments",
            "failedPayments",
            "updatedAt",
        }
        self.assertEqual(set(data.keys()), expected_keys)
        for key, val in data.items():
            self.assertIsNotNone(val, f"Key {key} should not be null")

    @patch("analytics.views.JWTAuthentication.authenticate")
    @patch("analytics.views.IsAdmin.has_permission")
    @patch("analytics.services.AnalyticsService.get_table")
    def test_inventory_response_shape(self, mock_get_table, mock_has_perm, mock_auth):
        mock_auth.return_value = (MagicMock(), None)
        mock_has_perm.return_value = True

        mock_table = MagicMock()
        mock_get_table.return_value = mock_table
        mock_table.get_item.return_value = {}

        url = reverse("analytics-inventory")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        res = response.json()
        self.assertTrue(res.get("success"))
        data = res.get("data", {})

        expected_keys = {
            "totalStock",
            "availableStock",
            "reservedStock",
            "lowStockProducts",
            "outOfStockProducts",
            "updatedAt",
        }
        self.assertEqual(set(data.keys()), expected_keys)
        for key, val in data.items():
            self.assertIsNotNone(val, f"Key {key} should not be null")

    @patch("analytics.views.JWTAuthentication.authenticate")
    @patch("analytics.views.IsAdmin.has_permission")
    @patch("analytics.services.AnalyticsService.get_table")
    def test_customer_response_shape(self, mock_get_table, mock_has_perm, mock_auth):
        mock_auth.return_value = (MagicMock(), None)
        mock_has_perm.return_value = True

        mock_table = MagicMock()
        mock_get_table.return_value = mock_table
        mock_table.get_item.return_value = {}

        url = reverse("analytics-customers")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        res = response.json()
        self.assertTrue(res.get("success"))
        data = res.get("data", {})

        expected_keys = {
            "cartAbandonmentRate",
            "activeCustomers",
            "returningCustomers",
            "newCustomers",
            "updatedAt",
        }
        self.assertEqual(set(data.keys()), expected_keys)
        for key, val in data.items():
            self.assertIsNotNone(val, f"Key {key} should not be null")


from decimal import Decimal
from analytics.direct_aggregator import DirectDynamoDBAggregator
from lambda_handler import lambda_handler

class DirectAggregatorTestCase(TestCase):

    @patch.object(DirectDynamoDBAggregator, "get_orders")
    @patch.object(DirectDynamoDBAggregator, "get_payments")
    @patch.object(DirectDynamoDBAggregator, "get_products")
    @patch.object(DirectDynamoDBAggregator, "get_users")
    @patch.object(DirectDynamoDBAggregator, "get_inventory")
    def test_direct_aggregator_calculations_and_decimal_parsing(
        self, mock_get_inv, mock_get_users, mock_get_prods, mock_get_pay, mock_get_orders
    ):
        mock_get_orders.return_value = [
            {
                "order_id": "ord-101",
                "user_id": "usr-1",
                "status": "DELIVERED",
                "total_amount": Decimal("150.75"),
                "items": [
                    {"product_id": "p-1", "product_name": "T-Shirt", "quantity": Decimal("2")},
                    {"product_id": "p-2", "product_name": "Jeans", "quantity": Decimal("1")},
                ],
                "created_at": "2026-08-01T10:00:00Z",
            }
        ]
        mock_get_pay.return_value = [
            {"payment_id": "pay-1", "order_id": "ord-101", "amount": Decimal("150.75"), "status": "SUCCESS"},
            {"payment_id": "pay-2", "order_id": "ord-102", "amount": Decimal("50.00"), "status": "FAILED"},
        ]
        mock_get_prods.return_value = [
            {"product_id": "p-1", "name": "T-Shirt", "is_active": True},
            {"product_id": "p-2", "name": "Jeans", "is_active": False},
        ]
        mock_get_users.return_value = [{"user_id": "usr-1"}]
        mock_get_inv.return_value = [
            {"product_id": "p-1", "stock": Decimal("20"), "available_stock": Decimal("18"), "reserved_stock": Decimal("2")},
            {"product_id": "p-2", "stock": Decimal("5"), "available_stock": Decimal("3"), "reserved_stock": Decimal("2")},
        ]

        # Test Dashboard Metrics
        dash = DirectDynamoDBAggregator.compute_dashboard_metrics()
        self.assertEqual(dash["total_revenue"], 150.75)
        self.assertEqual(dash["total_orders"], 1)
        self.assertEqual(dash["total_products"], 2)
        self.assertEqual(dash["active_products"], 1)
        self.assertEqual(dash["successful_payments"], 1)
        self.assertEqual(dash["failed_payments"], 1)

        # Test Inventory Metrics
        inv = DirectDynamoDBAggregator.compute_inventory_metrics()
        self.assertEqual(inv["total_stock"], 25)
        self.assertEqual(inv["available_stock"], 21)
        self.assertEqual(inv["reserved_stock"], 4)
        self.assertEqual(inv["low_stock_products"], 1)
        self.assertEqual(inv["out_of_stock_products"], 0)

    @patch("analytics.services.AnalyticsService.get_dashboard_metrics")
    def test_lambda_handler_direct_payload(self, mock_get_dash):
        mock_get_dash.return_value = {"total_revenue": 100.0}
        res = lambda_handler({"action": "get_dashboard"}, None)
        self.assertEqual(res["statusCode"], 200)
        import json
        body = json.loads(res["body"])
        self.assertTrue(body["success"])
        self.assertEqual(body["data"]["total_revenue"], 100.0)

