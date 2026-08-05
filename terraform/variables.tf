variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "ap-southeast-1"
}

variable "aws_profile" {
  description = "AWS CLI Profile"
  type        = string
  default     = "Ramkumar"
}

variable "project_name" {
  description = "Project Name"
  type        = string
  default     = "ecommerce"
}

variable "environment" {
  description = "Deployment Environment"
  type        = string
  default     = "dev"
}

variable "lambda_execution_role_arn" {

  description = "Existing Lambda execution IAM role ARN"

  type = string

}

variable "jwt_secret_key" {
  description = "JWT Secret Key used by Lambda functions"
  type        = string
  sensitive   = true
}