output "api_gateway_url" {
  value       = aws_apigatewayv2_api.product.api_endpoint
  description = "The URL for invoking the API Gateway"
}