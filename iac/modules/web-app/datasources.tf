data "aws_iam_policy_document" "root_policy" {
  statement {
    effect = "Allow"
    resources = [
      "${aws_s3_bucket.root.arn}",
      "${aws_s3_bucket.root.arn}/*",
    ]
actions = ["S3:GetObject"]
principals {
      type        = "*"
      identifiers = ["*"]
    }
  }

  depends_on = [aws_s3_bucket_public_access_block.website_allow_access]
}

data "aws_region" "current" {}