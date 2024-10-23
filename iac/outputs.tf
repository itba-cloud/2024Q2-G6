output "api_gateway_url" {
  value = module.product_api_gateway.api_gateway_url
  description = "The URL for invoking the API Gateway"
}

output "cognito_hosted_ui_url" {
  value = "https://${aws_cognito_user_pool_domain.user_pool_domain.domain}.auth.${local.region}.amazoncognito.com/login?client_id=${aws_cognito_user_pool_client.product_users.id}&response_type=code&scope=email+openid&redirect_uri=${module.product_api_gateway.api_gateway_url}/front"
  sensitive = true
}

output "cognito_auth_url" {
  value = "https://${aws_cognito_user_pool_domain.user_pool_domain.domain}.auth.${local.region}.amazoncognito.com/oauth2/token"
}

output "login_client_id" {
     value = "${aws_cognito_user_pool_client.product_users.id}" 
}

output "website_url" {
    value = "${module.product_api_gateway.api_gateway_url}/front"
}