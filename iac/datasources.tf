data "archive_file" "schema_lambda" {
  type        = "zip"
  source_dir  = "lambda/schema/generate_schema"
  output_path = "lambda/schema/generate_schema.zip"
}

data "archive_file" "notify_daily_reservations_lambda" {
  type        = "zip"
  source_dir  = "lambda/email/notifyDailyReservations"
  output_path = "lambda/email/notifyDailyReservations.zip"
}

data "archive_file" "confirmation_booking_email_lambda" {
  type        = "zip"
  source_dir  = "lambda/email/bookProductEmail"
  output_path = "lambda/email/bookProductEmail.zip"
}

data "archive_file" "out_of_stock_email_lambda" {
  type        = "zip"
  source_dir  = "lambda/email/outOfStockEmail"
  output_path = "lambda/email/outOfStockEmail.zip"
}

data "archive_file" "pickup_date_today_email_lambda" {
  type        = "zip"
  source_dir  = "lambda/email/pickupDateTodayEmail"
  output_path = "lambda/email/pickupDateTodayEmail.zip"
}

data "archive_file" "auth_lambda" {
  type        = "zip"
  source_dir  = "lambda/auth/preauth_token"
  output_path = "lambda/auth/preauth_token.zip"
}

data "archive_file" "api_lambda" {
  for_each    = fileset("${path.module}/lambda/api", "*/*.js")
  type        = "zip"
  source_dir  = "lambda/api/${split("/", each.value)[0]}"
  output_path = "lambda/api/${split("/", each.value)[0]}.zip"
}

data "aws_region" "this" {}

data "aws_caller_identity" "this" {}

data "aws_availability_zones" "available" {
  state = "available"
}
