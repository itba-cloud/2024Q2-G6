resource "aws_lambda_function" "schema_action" {
  function_name    = "generate_schema"
  handler          = "index.handler"
  runtime          = "nodejs16.x"
  filename         = "lambda/schema/generate_schema.zip"
  source_code_hash = data.archive_file.schema_lambda.output_base64sha256
  role             = local.lab_role_arn // usamos LabRole porque no podemos crear roles o adjuntar policies

  environment {
    variables = {
      DB_HOST     = aws_rds_cluster.aurora.endpoint
      DB_PORT     = "5432"
      DB_NAME     = var.db_name
      DB_USER     = var.db_user
      SECRET_NAME = aws_secretsmanager_secret.db_credentials.name

    }
  }

  timeout = 60

  vpc_config {
    subnet_ids         = aws_db_subnet_group.lambda.subnet_ids
    security_group_ids = [aws_security_group.lambda_sg.id]
  }

  depends_on = [aws_rds_cluster.aurora, data.archive_file.schema_lambda]
}

resource "aws_lambda_function" "api_action" {
  for_each         = data.archive_file.api_lambda
  function_name    = split("_", split("/", each.key)[0])[0]
  handler          = "index.handler"
  runtime          = "nodejs16.x"
  filename         = "lambda/api/${split("/", each.key)[0]}.zip"
  source_code_hash = data.archive_file.api_lambda[each.key].output_base64sha256

  role = local.lab_role_arn // usamos LabRole porque no podemos crear roles o adjuntar policies

  timeout = 900

  environment {
    variables = {
      DB_HOST     = aws_rds_cluster.aurora.endpoint
      DB_PORT     = "5432"
      DB_NAME     = var.db_name
      DB_USER     = var.db_user
      SECRET_NAME = aws_secretsmanager_secret.db_credentials.name
      REGION  = var.region
      IMAGES_BUCKET = aws_s3_bucket.item_images.id
      WEBSITE_URL = module.web_app_1.website_url
      RESERVATION_DONE_SNS_TOPIC_ARN = aws_sns_topic.reservation_done.arn
      OUT_OF_STOCK_SNS_TOPIC_ARN = aws_sns_topic.out_of_stock.arn
    }
  }

  vpc_config {
    subnet_ids         = aws_db_subnet_group.lambda.subnet_ids
    security_group_ids = [aws_security_group.lambda_sg.id]
  }

  depends_on = [aws_rds_cluster.aurora, data.archive_file.api_lambda]

}

# Lambda Function for Pre-Token Generation Trigger
resource "aws_lambda_function" "preauth_token" {
  function_name = "preauth_token"
  filename      = "lambda/auth/preauth_token.zip"  
  handler       = "index.handler"           
  runtime       = "nodejs16.x"              
  role             = local.lab_role_arn
  source_code_hash = data.archive_file.auth_lambda.output_base64sha256
}

# Lambda Function for confirmation booking email
resource "aws_lambda_function" "confirmation_booking_email" {
  function_name = "confirmation_booking_email"
  filename      = "lambda/email/bookProductEmail.zip"  
  handler       = "index.handler"           
  runtime       = "nodejs16.x"              
  role             = local.lab_role_arn
  source_code_hash = data.archive_file.confirmation_booking_email_lambda.output_base64sha256
  environment {
    variables = {
      SENDGRID_API_KEY = var.sendgrid_api_key,
      SENDGRID_FROM_VERIFIED_EMAIL = var.sendgrid_from_verified_email
    }
  }
}

# Lambda Function for confirmation booking email
resource "aws_lambda_function" "out_of_stock_email" {
  function_name = "out_of_stock_email"
  filename      = "lambda/email/outOfStockEmail.zip"  
  handler       = "index.handler"           
  runtime       = "nodejs16.x"              
  role             = local.lab_role_arn
  source_code_hash = data.archive_file.out_of_stock_email_lambda.output_base64sha256
  environment {
    variables = {
      SENDGRID_API_KEY = var.sendgrid_api_key,
      SENDGRID_FROM_VERIFIED_EMAIL = var.sendgrid_from_verified_email
    }
  }
}

# Lambda Function for daily check of reservations
resource "aws_lambda_function" "notify_daily_reservations" {
  function_name = "notify_daily_reservations"
  filename      = "lambda/email/notifyDailyReservations.zip"  
  handler       = "index.handler"           
  runtime       = "nodejs16.x"              
  role             = local.lab_role_arn
  source_code_hash = data.archive_file.notify_daily_reservations_lambda.output_base64sha256
  
  environment {
    variables = {
      DB_HOST     = aws_rds_cluster.aurora.endpoint
      DB_PORT     = "5432"
      DB_NAME     = var.db_name
      DB_USER     = var.db_user
      SECRET_NAME = aws_secretsmanager_secret.db_credentials.name
      REGION  = var.region
      WEBSITE_URL = module.web_app_1.website_url
      PICKUP_DATE_TODAY_TOPIC = aws_sns_topic.pickup_date_today.arn
    }
  }

  vpc_config {
    subnet_ids         = aws_db_subnet_group.lambda.subnet_ids
    security_group_ids = [aws_security_group.lambda_sg.id]
  }
}

# Lambda Function for notification booking day
resource "aws_lambda_function" "pickup_date_today_email" {
  function_name = "pickup_date_today_email"
  filename      = "lambda/email/pickupDateTodayEmail.zip"  
  handler       = "index.handler"           
  runtime       = "nodejs16.x"              
  role             = local.lab_role_arn
  source_code_hash = data.archive_file.pickup_date_today_email_lambda.output_base64sha256
  environment {
    variables = {
      SENDGRID_API_KEY = var.sendgrid_api_key,
      SENDGRID_FROM_VERIFIED_EMAIL = var.sendgrid_from_verified_email
    }
  }
}

resource "aws_security_group" "lambda_sg" {
  name        = "lambda-security-group"
  description = "Security group for Lambda functions connecting to Aurora"
  vpc_id      = module.vpc.vpc_id

  egress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

    egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
