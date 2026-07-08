# Cart Service

## Overview
The Cart Service manages per-user shopping carts. It stores cart items in DynamoDB and supports adding, updating, removing, and clearing cart contents.

## What this service does
- Return a user’s cart contents
- Add items to a cart
- Update item quantities
- Remove a single item from the cart
- Clear an entire cart
- Expose a health endpoint

## Tech stack
- Python
- Django
- Django REST Framework
- boto3 for DynamoDB access
- Mangum for Lambda deployment

## API inventory
Base URL: `/api/v1/cart/`

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/v1/cart/` | Admin endpoint to list all carts |
| GET | `/api/v1/cart/<user_id>/` | Get a single user’s cart |
| POST | `/api/v1/cart/<user_id>/items/` | Add an item to a cart |
| PUT | `/api/v1/cart/<user_id>/items/<product_id>/` | Update item quantity |
| DELETE | `/api/v1/cart/<user_id>/items/<product_id>/delete/` | Remove one item |
| DELETE | `/api/v1/cart/<user_id>/clear/` | Clear the cart |
| GET | `/api/v1/cart/health/` | Health check |

## Request and response model
### Add item to cart
Request body:
```json
{
  "product_id": "p-abc12345",
  "quantity": 2
}
```

Response body:
```json
{
  "user_id": "u-1001",
  "product_id": "p-abc12345",
  "quantity": 2,
  "created_at": "2024-01-01T12:00:00+00:00",
  "updated_at": "2024-01-01T12:00:00+00:00"
}
```

## Request flow
1. The request hits the appropriate cart APIView.
2. The serializer validates the payload.
3. The service layer queries or updates the DynamoDB table.
4. The response is returned to the client.


## Notes and future improvements
- Add authentication and user ownership checks
- Add cart expiration or cleanup policies
- Add item price snapshots for order generation
- Move to a more event-driven cart lifecycle
