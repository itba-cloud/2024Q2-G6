resource "aws_sns_topic" "reservation_done" {
  name = "reservation_done"
}

resource "aws_sns_topic" "pickup_date_today" {
  name = "pickup_date_today"
}

resource "aws_vpc_endpoint" "sns" {
  vpc_id            = module.vpc.vpc_id
  service_name      = "com.amazonaws.${local.region}.sns"
  vpc_endpoint_type = "Interface"

  subnet_ids         = aws_db_subnet_group.lambda.subnet_ids
  security_group_ids = [aws_security_group.secrets_manager_endpoint_sg.id]

  private_dns_enabled = true
}

resource "aws_sns_topic_policy" "reservation_done_policy" {
  arn = aws_sns_topic.reservation_done.arn

  policy = jsonencode({
    "Version": "2012-10-17",
    "Id": "AllowLambdaToPublish",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Action": "sns:Publish",
        "Resource": "arn:aws:sns:${data.aws_region.this.name}:${data.aws_caller_identity.this.account_id}:${aws_sns_topic.reservation_done.name}",
        "Condition": {
          "ArnLike": {
            "AWS:SourceArn": "arn:aws:lambda:${data.aws_region.this.name}:${data.aws_caller_identity.this.account_id}:function/*"
          }
        }
      }
    ]
  })
}

resource "aws_sns_topic_policy" "pickup_date_today_policy" {
  arn = aws_sns_topic.pickup_date_today.arn

  policy = jsonencode({
    "Version": "2012-10-17",
    "Id": "AllowLambdaToPublish",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Action": "sns:Publish",
        "Resource": "arn:aws:sns:${data.aws_region.this.name}:${data.aws_caller_identity.this.account_id}:${aws_sns_topic.pickup_date_today.name}",
        "Condition": {
          "ArnLike": {
            "AWS:SourceArn": "arn:aws:lambda:${data.aws_region.this.name}:${data.aws_caller_identity.this.account_id}:function/*"
          }
        }
      }
    ]
  })
}

# Grant SNS permission to invoke the Lambda function
resource "aws_lambda_permission" "allow_sns_invoke" {
  statement_id  = "AllowSNSInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.confirmation_booking_email.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.reservation_done.arn
}

resource "aws_lambda_permission" "allow_sns_invoke_pickup_date_today" {
  statement_id  = "AllowSNSInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.pickup_date_today_email.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.pickup_date_today.arn
}

# Create the SNS subscription to the Lambda function
resource "aws_sns_topic_subscription" "sns_to_lambda_subscription" {
  topic_arn = aws_sns_topic.reservation_done.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.confirmation_booking_email.arn
}

resource "aws_sns_topic_subscription" "sns_to_lambda_subscription_pickup_date_today" {
  topic_arn = aws_sns_topic.pickup_date_today.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.pickup_date_today_email.arn
}