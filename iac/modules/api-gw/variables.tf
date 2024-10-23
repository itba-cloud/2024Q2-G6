variable "api_name" {
  type        = string
  description = "The name of the API"
}

variable "cors_configuration" {
  type = object({
    allow_origins = list(string)
    allow_methods = list(string)
    allow_headers = list(string)
  })
  description = "CORS configuration for the API"
}

variable "lambda_routes" {
  type = map(object({
    function_name  = string
    route_key      = string
    requires_admin = bool
    requires_auth  = bool
  }))
  description = "Map of Lambda functions, route keys, and their permissions"
}

variable "cognito_user_pool_id" {
  type        = string
  description = "Cognito User Pool ID for JWT authorization"
}

variable "cognito_audience" {
  type        = list(string)
  description = "Audience for the JWT authorization"
}