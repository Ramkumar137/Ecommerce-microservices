resource "random_string" "suffix" {
  length  = 6
  upper   = false
  special = false
}

resource "aws_s3_bucket" "frontend" {

  bucket = "ram-ecom-${random_string.suffix.result}"

  force_destroy = true

  tags = {
    ApplicationService = "appln"
    CostCentre         = "cost"
    Project            = var.project_name
    Environment        = var.environment
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {

  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "frontend" {

  bucket = aws_s3_bucket.frontend.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}