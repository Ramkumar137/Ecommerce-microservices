#################################################
# Deploy Lambda Functions
#################################################

resource "aws_lambda_function" "service" {

  for_each = local.services


  function_name = each.value.name


  filename = data.archive_file.lambda_zip[each.key].output_path


  source_code_hash = data.archive_file.lambda_zip[each.key].output_base64sha256


  role = var.lambda_execution_role_arn


  runtime = each.value.runtime


  handler = each.value.handler


  timeout = each.value.timeout


  memory_size = each.value.memory


  environment {
    variables = local.lambda_environment[each.key]
  }


  tags = {
    ApplicationService = "appln"
    CostCentre         = "cost"
    Project            = var.project_name
    Environment        = var.environment
  }

}