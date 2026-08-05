locals {

  services = {

    auth = {
      name    = "ram-auth-service"
      source  = "../auth-service"
      runtime = "python3.14"
      handler = "lambda_handler.lambda_handler"

      timeout = 30
      memory  = 512

    }


    product = {
      name    = "ram-product-service"
      source  = "../product-service"
      runtime = "python3.14"
      handler = "lambda_handler.lambda_handler"

      timeout = 30
      memory  = 512

    }


    inventory = {
      name    = "ram-inventory-service"
      source  = "../inventory-service"
      runtime = "python3.14"
      handler = "lambda_handler.lambda_handler"

      timeout = 30
      memory  = 512

    }


    cart = {
      name    = "ram-cart-service"
      source  = "../cart-service"
      runtime = "python3.14"
      handler = "lambda_handler.lambda_handler"

      timeout = 30
      memory  = 512

    }


    order = {
      name    = "ram-order-service"
      source  = "../order-service"
      runtime = "python3.14"
      handler = "lambda_handler.lambda_handler"

      timeout = 30
      memory  = 512

    }


    payment = {
      name    = "ram-payment-service"
      source  = "../payment-service"
      runtime = "python3.14"
      handler = "lambda_handler.lambda_handler"

      timeout = 30
      memory  = 512

    }


    analytics = {
      name    = "ram-analytical-service"
      source  = "../analytics-service"
      runtime = "python3.14"
      handler = "lambda_handler.lambda_handler"

      timeout = 30
      memory  = 512

    }


    notification = {
      name    = "ram-notification-service"
      source  = "../notification-service"
      runtime = "python3.14"
      handler = "lambda_handler.lambda_handler"

      timeout = 30
      memory  = 512

    }

  }

}