#################################################
# Lambda Environment Variables
#################################################

locals {

  lambda_environment = {

    auth = {
      USER_TABLE     = "ram-users"
      JWT_SECRET_KEY = var.jwt_secret_key
    }

    product = {
      PRODUCT_TABLE            = "ram-products"
      PRODUCT_EVENTS_TOPIC_ARN = "arn:aws:sns:ap-southeast-1:726101441380:ram-product-events"
      S3_BUCKET_NAME           = "ram-ecom-product-images"
      JWT_SECRET_KEY           = var.jwt_secret_key
    }

    inventory = {
      INVENTORY_TABLE = "ram-inventory"
      JWT_SECRET_KEY  = var.jwt_secret_key
    }

    cart = {
      CART_TABLE            = "ram-carts"
      PRODUCT_SERVICE_URL   = "https://ozqkz0sa3j.execute-api.ap-southeast-1.amazonaws.com/api/v1/products"
      INVENTORY_SERVICE_URL = "https://nj6zjlwffi.execute-api.ap-southeast-1.amazonaws.com/api/v1/inventory"
      JWT_SECRET_KEY        = var.jwt_secret_key
    }

    order = {
      ORDER_TABLE           = "ram-orders"
      PRODUCT_SERVICE_URL   = "https://ozqkz0sa3j.execute-api.ap-southeast-1.amazonaws.com/api/v1/products"
      INVENTORY_SERVICE_URL = "https://nj6zjlwffi.execute-api.ap-southeast-1.amazonaws.com/api/v1/inventory"
      ORDER_SNS_TOPIC_ARN   = "arn:aws:sns:ap-southeast-1:726101441380:ram-order-events"
      JWT_SECRET_KEY        = var.jwt_secret_key
    }

    payment = {
      PAYMENT_TABLE         = "ram-payments"
      ORDER_SERVICE_URL     = "https://cnslsh1jye.execute-api.ap-southeast-1.amazonaws.com/api/v1/orders"
      PAYMENT_SNS_TOPIC_ARN = "arn:aws:sns:ap-southeast-1:726101441380:ram-payment-events"
      JWT_SECRET_KEY        = var.jwt_secret_key
    }

    analytics = {
      ANALYTICS_TABLE = "ram-analytics"
      JWT_SECRET_KEY  = var.jwt_secret_key
    }

    notification = {
      NOTIFICATION_TABLE = "ram-notifications"
      EMAIL_FROM         = "ramkumar81637@gmail.com"
      FRONTEND_URL       = "http://localhost:8080"
      JWT_SECRET_KEY     = var.jwt_secret_key
    }

  }

}