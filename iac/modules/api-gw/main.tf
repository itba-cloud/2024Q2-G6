resource "aws_apigatewayv2_api" "product" {
  name          = var.api_name
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = var.cors_configuration.allow_origins
    allow_methods = var.cors_configuration.allow_methods
    allow_headers = var.cors_configuration.allow_headers
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.product.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "apigw_invoke" {
  for_each      = var.lambda_routes
  statement_id  = "AllowAPIGatewayInvoke-${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = each.value.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.product.execution_arn}/*/*"
}

resource "aws_apigatewayv2_integration" "lambdas" {
  for_each           = var.lambda_routes
  api_id             = aws_apigatewayv2_api.product.id
  integration_type   = "AWS_PROXY"
  integration_uri    = "arn:aws:lambda:${data.aws_region.this.name}:${data.aws_caller_identity.current.account_id}:function:${each.value.function_name}"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "lambdas" {
  for_each  = var.lambda_routes
  api_id    = aws_apigatewayv2_api.product.id
  route_key = each.value.route_key
  target    = "integrations/${aws_apigatewayv2_integration.lambdas[each.key].id}"

  authorization_type   = each.value.requires_auth ? "JWT" : null
  authorizer_id        = each.value.requires_auth ? aws_apigatewayv2_authorizer.cognito.id : null
  authorization_scopes = each.value.requires_admin ? ["product-admins"] : []
}

resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id          = aws_apigatewayv2_api.product.id
  name            = "CognitoAuthorizer"
  authorizer_type = "JWT"
  jwt_configuration {
    audience = var.cognito_audience
    issuer   = "https://cognito-idp.${data.aws_region.this.name}.amazonaws.com/${var.cognito_user_pool_id}"
  }
  identity_sources = ["$request.header.Authorization"]
}