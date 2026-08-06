resource "aws_s3_object" "frontend" {

  for_each = fileset("../frontend/dist", "**")

  bucket = aws_s3_bucket.frontend.id

  key = each.value

  source = "../frontend/dist/${each.value}"

  etag = filemd5("../frontend/dist/${each.value}")

  content_type = lookup({

    html = "text/html"

    js = "application/javascript"

    css = "text/css"

    svg = "image/svg+xml"

    png = "image/png"

    jpg = "image/jpeg"

    jpeg = "image/jpeg"

    ico = "image/x-icon"

    json = "application/json"

  }, reverse(split(".", each.value))[0], "binary/octet-stream")

  depends_on = [
    aws_s3_bucket_policy.frontend
  ]
}