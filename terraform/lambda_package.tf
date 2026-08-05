#################################################
# Package every microservice automatically
#################################################

data "archive_file" "lambda_zip" {

  for_each = local.services

  type = "zip"

  source_dir = each.value.source

  output_path = "${path.module}/build/${each.key}.zip"

}