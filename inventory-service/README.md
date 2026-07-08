# Inventory Service

## Overview
The Inventory Service tracks stock availability for products. It maintains both total stock and reserved stock, and it exposes endpoints for CRUD operations plus reserve/release workflows.

## What this service does
- Create and manage inventory records per product
- Track `stock`, `reserved_stock`, and `available_stock`
- Reserve stock for checkout flows
- Release reserved stock when an operation is cancelled or completed
- Expose a health endpoint for monitoring

## Tech stack
- Python 3
- Django
- Django REST Framework
- boto3 for DynamoDB access
- Mangum for Lambda integration

## API inventory
Base URL: `/api/v1/inventory/`

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/v1/inventory/` | List all inventory records |
| POST | `/api/v1/inventory/` | Create an inventory record |
| GET | `/api/v1/inventory/<product_id>/` | Retrieve inventory for one product |
| PUT | `/api/v1/inventory/<product_id>/` | Update inventory for one product |
| DELETE | `/api/v1/inventory/<product_id>/` | Delete inventory for one product |
| PATCH | `/api/v1/inventory/<product_id>/reserve/` | Reserve stock |
| PATCH | `/api/v1/inventory/<product_id>/release/` | Release reserved stock |
| GET | `/api/v1/inventory/health/` | Health check |

## Request and response model
### Create inventory
Request body:
```json
{
  "product_id": "p-abc12345",
  "stock": 100,
  "reserved_stock": 10
}
```

Response body:
```json
{
  "product_id": "p-abc12345",
  "stock": 100,
  "reserved_stock": 10,
  "available_stock": 90,
  "created_at": "2024-01-01T12:00:00+00:00",
  "updated_at": "2024-01-01T12:00:00+00:00"
}
```

### Reserve stock
Request body:
```json
{
  "quantity": 5
}
```

## Business rules
- `reserved_stock` cannot exceed `stock`
- Reserve operations fail if the requested quantity is larger than `available_stock`
- Release operations fail if the requested quantity is larger than `reserved_stock`

## Request flow
1. Request reaches an APIView.
2. Serializer validates the body.
3. Service layer checks business rules.
4. DynamoDB item is created, updated, or queried.
5. A JSON response is returned.


## Notes and future improvements
- Add atomic conditional updates for concurrent stock changes
- Add event-driven integration with order and payment services
- Add pagination and filtering options
