# Payment Service

## Overview
The Payment Service records payments for orders and tracks payment status and transaction identifiers. It is implemented as a Django REST Framework service backed by DynamoDB.

## What this service does
- Create payments for orders
- Retrieve payment details by ID
- Retrieve payments for a specific order
- Update payment status and transaction ID
- Delete a payment record
- Expose a health endpoint

## Tech stack
- Python
- Django
- Django REST Framework
- boto3 for DynamoDB access
- Mangum for Lambda deployment

## API inventory
Base URL: `/api/v1/payments/`

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/v1/payments/` | List all payments |
| POST | `/api/v1/payments/` | Create a payment |
| GET | `/api/v1/payments/<payment_id>/` | Retrieve one payment |
| DELETE | `/api/v1/payments/<payment_id>/` | Delete one payment |
| PUT | `/api/v1/payments/<payment_id>/status/` | Update payment status |
| GET | `/api/v1/payments/order/<order_id>/` | Retrieve a payment for one order |
| GET | `/api/v1/payments/health/` | Health check |

## Request and response model
### Create payment
Request body:
```json
{
  "order_id": "ord-1234abcd",
  "user_id": "u-1001",
  "amount": 59.98,
  "currency": "INR",
  "payment_method": "UPI"
}
```

Response body:
```json
{
  "payment_id": "pay-efgh5678",
  "order_id": "ord-1234abcd",
  "user_id": "u-1001",
  "amount": 59.98,
  "currency": "INR",
  "payment_method": "UPI",
  "status": "PENDING",
  "transaction_id": "",
  "gateway": "MockGateway",
  "created_at": "2024-01-01T12:00:00+00:00",
  "updated_at": "2024-01-01T12:00:00+00:00"
}
```

## Allowed payment statuses
- `PENDING`
- `SUCCESS`
- `FAILED`
- `REFUNDED`
- `CANCELLED`

## Allowed payment methods
- `CARD`
- `UPI`
- `NET_BANKING`
- `WALLET`

## Request flow
1. Client submits a payment request.
2. Serializer validates the payload.
3. The service creates a payment record in DynamoDB.
4. Payment status can later be updated through a dedicated status endpoint.

## Notes and future improvements
- Integrate with a real payment gateway
- Add idempotency for repeated payment attempts
- Add authentication and audit trails
- Add webhook-style status updates for external payment providers
