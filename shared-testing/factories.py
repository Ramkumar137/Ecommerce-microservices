# shared-testing/factories.py

import factory


class SampleUserPayloadFactory(factory.DictFactory):
    first_name = "Jane"
    last_name = "Doe"
    username = factory.Sequence(lambda n: f"user{n}")
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    phone = "+1234567890"
    password = "StrongPassword123!"
    role = "CUSTOMER"


class SampleProductPayloadFactory(factory.DictFactory):
    name = factory.Sequence(lambda n: f"Test Product {n}")
    description = "A high-grade test product"
    brand = "TestBrand"
    category = "Electronics"
    price = 99.99
    stock = 50
    is_active = True
    image_url = "https://example.com/image.jpg"


class SampleInventoryItemFactory(factory.DictFactory):
    product_id = factory.Sequence(lambda n: f"p-{n}")
    stock = 100
    available_stock = 90
    reserved_stock = 10


class SampleCartItemFactory(factory.DictFactory):
    product_id = factory.Sequence(lambda n: f"p-{n}")
    quantity = 2


class SampleOrderPayloadFactory(factory.DictFactory):
    shipping_address = {
        "street": "123 Main St",
        "city": "Metropolis",
        "state": "NY",
        "zip_code": "10001",
        "country": "USA",
    }
    items = [
        {
            "product_id": "p-101",
            "quantity": 2,
            "price": 49.99,
        }
    ]


class SamplePaymentPayloadFactory(factory.DictFactory):
    order_id = "ord-1001"
    amount = 99.98
    payment_method = "CREDIT_CARD"


class SampleNotificationPayloadFactory(factory.DictFactory):
    user_id = "usr-123"
    type = "ORDER_CONFIRMATION"
    message = "Your order has been confirmed successfully."
