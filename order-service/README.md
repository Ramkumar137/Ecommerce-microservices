# Order Service

## Overview
The Order Service creates and manages customer orders. It records order items, totals, and status transitions in DynamoDB.

## What this service does
- Create new orders from user and item data
- Retrieve one order or all orders
- List orders by user
- Update order status
- Delete an order
- Expose a health endpoint

## Tech stack
- Python 3
- Django
- Django REST Framework
- boto3 for DynamoDB access
- Mangum for Lambda deployment

## API inventory
Base URL: `/api/v1/orders/`

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/v1/orders/` | List all orders |
| POST | `/api/v1/orders/` | Create an order |
| GET | `/api/v1/orders/<order_id>/` | Retrieve one order |
| DELETE | `/api/v1/orders/<order_id>/` | Delete one order |
| PATCH | `/api/v1/orders/<order_id>/status/` | Update order status |
| GET | `/api/v1/orders/user/<user_id>/` | List orders for one user |
| GET | `/api/v1/orders/health/` | Health check |

## Request and response model
### Create order
Request body:
```json
{
  "user_id": "u-1001",
  "items": [
    {
      "product_id": "p-abc12345",
      "product_name": "Wireless Mouse",
      "unit_price": 29.99,
      "quantity": 2
    }
  ]
}
```

Response body:
```json
{
  "order_id": "ord-1234abcd",
  "user_id": "u-1001",
  "status": "PENDING",
  "items": [
    {
      "product_id": "p-abc12345",
      "product_name": "Wireless Mouse",
      "unit_price": 29.99,
      "quantity": 2,
      "subtotal": 59.98
    }
  ],
  "total_amount": 59.98,
  "created_at": "2024-01-01T12:00:00+00:00",
  "updated_at": "2024-01-01T12:00:00+00:00"
}
```

## Allowed order statuses
- `PENDING`
- `CONFIRMED`
- `PROCESSING`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`

## Request flow
1. Client submits order data to the APIView.
2. Serializer validates the payload and item structure.
3. The service builds a snapshot of each item and computes totals.
4. The order is stored in DynamoDB and returned to the client.

## Notes and future improvements
- Add payment and inventory integration hooks
- Add order history and audit fields
- Add event-driven order status updates
- Add pagination and filtering for large order sets
