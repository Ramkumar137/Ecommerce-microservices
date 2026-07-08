# Product Service

## Overview
The Product Service is a Django REST Framework microservice for managing a product catalog. It stores products directly in DynamoDB and exposes CRUD endpoints for catalog operations.

## What this service does
- Create, list, retrieve, update, and delete products
- Validate product payloads before saving
- Expose a health endpoint for deployment checks
- Run as a Lambda-compatible ASGI app via Mangum

## Tech stack
- Python
- Django
- Django REST Framework
- boto3 for DynamoDB access
- Mangum for AWS Lambda integration

## API inventory
Base URL: `/api/`

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/v1/products/` | List all products |
| POST | `/api/v1/products/` | Create a product |
| GET | `/api/v1/products/<product_id>/` | Retrieve one product |
| PUT | `/api/v1/products/<product_id>/` | Update one product |
| DELETE | `/api/v1/products/<product_id>/` | Delete one product |
| GET | `/api/v1/products/health` | Health check |

## Request and response model
### Create or update product
Request body:
```json
{
  "name": "Wireless Mouse",
  "price": 29.99,
  "stock": 120,
  "category": "Electronics"
}
```

Response body:
```json
{
  "product_id": "p-abc12345",
  "name": "Wireless Mouse",
  "price": 29.99,
  "stock": 120,
  "category": "Electronics"
}
```

## Request flow
1. Client sends a request to a Django APIView.
2. DRF serializer validates the payload.
3. The view calls the DynamoDB helper and table operations.
4. Results are returned as JSON responses.

## Notes and future improvements
- Add authentication and authorization for admin-only operations
- Add pagination for large catalogs
- Add product search and filtering by category
- Add integration tests against a local or mocked DynamoDB environment
