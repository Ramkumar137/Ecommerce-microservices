resource "aws_cloudfront_origin_access_control" "frontend" {

  name        = "ram-ecom-oac"
  description = "OAC for frontend"

  origin_access_control_origin_type = "s3"

  signing_behavior = "always"

  signing_protocol = "sigv4"
}

resource "aws_cloudfront_distribution" "frontend" {

  enabled             = true
  default_root_object = "index.html"

  origin {

    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name

    origin_id = "frontend-origin"

    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  default_cache_behavior {

    allowed_methods = [
      "GET",
      "HEAD"
    ]

    cached_methods = [
      "GET",
      "HEAD"
    ]

    target_origin_id = "frontend-origin"

    viewer_protocol_policy = "redirect-to-https"

    compress = true

    cache_policy_id = data.aws_cloudfront_cache_policy.caching_optimized.id
  }

  restrictions {

    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {

    cloudfront_default_certificate = true
  }

  custom_error_response {

    error_code = 403

    response_code = 200

    response_page_path = "/index.html"
  }

  custom_error_response {

    error_code = 404

    response_code = 200

    response_page_path = "/index.html"
  }

  price_class = "PriceClass_100"

  tags = {

    ApplicationService = "appln"

    CostCentre = "cost"

    Project = var.project_name

    Environment = var.environment
  }
}

data "aws_iam_policy_document" "frontend" {

  statement {

    effect = "Allow"

    actions = [
      "s3:GetObject"
    ]

    resources = [
      "${aws_s3_bucket.frontend.arn}/*"
    ]

    principals {

      type = "Service"

      identifiers = [
        "cloudfront.amazonaws.com"
      ]
    }

    condition {

      test = "StringEquals"

      variable = "AWS:SourceArn"

      values = [
        aws_cloudfront_distribution.frontend.arn
      ]
    }
  }
}

resource "aws_s3_bucket_policy" "frontend" {

  bucket = aws_s3_bucket.frontend.id

  policy = data.aws_iam_policy_document.frontend.json

  depends_on = [
    aws_cloudfront_distribution.frontend
  ]
}

data "aws_cloudfront_cache_policy" "caching_optimized" {

  name = "Managed-CachingOptimized"
}