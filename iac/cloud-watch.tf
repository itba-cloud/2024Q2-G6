resource "aws_cloudwatch_event_rule" "every_notify_daily_reservations" {
    name = "event-notify-daily-reservations"
    description = "Fires every day"
    schedule_expression = "cron(0 11 * * ? *)"    
}

resource "aws_cloudwatch_event_target" "check_notify_daily_reservations" {
    rule = aws_cloudwatch_event_rule.every_notify_daily_reservations.name
    target_id = "invokeNotifyDailyReservations"
    arn = aws_lambda_function.notify_daily_reservations.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_notify_daily_reservations" {
    statement_id = "AllowExecutionFromCloudWatch"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.notify_daily_reservations.function_name
    principal = "events.amazonaws.com"
    source_arn = aws_cloudwatch_event_rule.every_notify_daily_reservations.arn
}