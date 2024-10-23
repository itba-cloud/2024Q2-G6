# resource "aws_wafv2_web_acl" "api_gateway_acl" {
#   name        = "api-gateway-waf-acl"
#   description = "WAF ACL for API Gateway"
#   scope       = "REGIONAL"

#   default_action {
#     allow {}
#   }

#   # block SQL injection
#   rule {
#     name     = "block-sqli"
#     priority = 1

#     statement {
#       sqli_match_statement {
#         field_to_match {
#           all_query_arguments {}
#         }
#         text_transformation {
#           priority = 0
#           type     = "URL_DECODE"
#         }
#       }
#     }

#     action {
#       block {}
#     }

#     visibility_config {
#       cloudwatch_metrics_enabled = true
#       metric_name                = "block-sqli"
#       sampled_requests_enabled   = true
#     }
#   }

#   visibility_config {
#     cloudwatch_metrics_enabled = true
#     metric_name                = "api-gateway-waf"
#     sampled_requests_enabled   = true
#   }
# }

# resource "aws_wafv2_web_acl_association" "api-waf" {
#   resource_arn = aws_apigatewayv2_stage.default.arn
#   web_acl_arn  = aws_wafv2_web_acl.api_gateway_acl.arn
# }