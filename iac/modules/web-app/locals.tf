locals {
  bucket_ids = {
    www  = aws_s3_bucket.www.id
    root = aws_s3_bucket.root.id
  }

  log_bucket_id = {
    log = aws_s3_bucket.logs.id
  }

  bucket_policies = {
    www  = data.aws_iam_policy_document.www_policy.json
    root = data.aws_iam_policy_document.root_policy.json
  }
}