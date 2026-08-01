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
            "successfulPayments",
            "failedPayments",
            "topSellingProducts",
            "recentOrders",
            "updatedAt",
        }
        self.assertEqual(set(data.keys()), expected_keys)
        self.assertIsInstance(data["topSellingProducts"], list)
        self.assertIsInstance(data["recentOrders"], list)
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
