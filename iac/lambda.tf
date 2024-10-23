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
      DB_PASSWORD = random_password.db_password.result
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

  timeout = 30

  environment {
    variables = {
      DB_HOST     = aws_rds_cluster.aurora.endpoint
      DB_PORT     = "5432"
      DB_NAME     = var.db_name
      DB_USER     = var.db_user
      DB_PASSWORD = random_password.db_password.result
      IMAGES_BUCKET = aws_s3_bucket.item_images.id
      WEBSITE_URL = module.web_app_1.website_url
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
