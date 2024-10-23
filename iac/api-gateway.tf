module "product_api_gateway" {
  source             = "./modules/api-gw"
  api_name           = "product-api"
  cors_configuration = { allow_origins = ["*"], allow_methods = ["*"], allow_headers = ["*"] }
  lambda_routes = {
  "addProduct"                = { function_name = "addProduct",                route_key = "POST /products",                requires_admin = false, requires_auth = true }
  "addProductImage"           = { function_name = "addProductImage",           route_key = "PUT /products/{id}/image",      requires_admin = false, requires_auth = true }
  "bookProduct"               = { function_name = "bookProduct",               route_key = "POST /products/{id}/bookings",  requires_admin = false, requires_auth = true }
  "deleteProduct"             = { function_name = "deleteProduct",             route_key = "DELETE /products/{id}",         requires_admin = true,  requires_auth = true }
  "getAllProducts"            = { function_name = "getAllProducts",            route_key = "GET /products",                 requires_admin = false, requires_auth = false }
  "getBookings"               = { function_name = "getBookings",               route_key = "GET /bookings",                 requires_admin = true,  requires_auth = true }
  "redirectLambda"            = { function_name = "redirectLambda",            route_key = "GET /front",                    requires_admin = false, requires_auth = false }
  }
  cognito_user_pool_id = aws_cognito_user_pool.product_users.id
  cognito_audience     = [aws_cognito_user_pool_client.product_users.id]
}