resource "aws_s3_bucket" "item_images" {
  bucket = "${var.domain_name}-my-item-images-bucket" # Make sure this bucket name is globally unique

  tags = {
    Name        = "Item Images Bucket"
    Environment = "Production"
  }
}

resource "aws_s3_bucket_logging" "item_images_logging" {
  bucket = aws_s3_bucket.item_images.id

  target_bucket = aws_s3_bucket.logs_bucket.id  # The bucket where logs will be stored
  target_prefix = "logs/"  # Prefix for the log files
}

resource "aws_s3_bucket_server_side_encryption_configuration" "item_images_encryption" {
  bucket = aws_s3_bucket.item_images.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256" 
    }
  }
}

resource "aws_s3_bucket_versioning" "images" {
  bucket = aws_s3_bucket.item_images.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_versioning" "images_logs" {
  bucket = aws_s3_bucket.logs_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "images_bucket_access_block" {
  bucket = aws_s3_bucket.item_images.id

  block_public_acls   = true
  block_public_policy = false
  ignore_public_acls  = true
  restrict_public_buckets = false
}

# Create an optional S3 bucket to store logs (optional, used for logging)
resource "aws_s3_bucket" "logs_bucket" {
  bucket = "${var.domain_name}-images-logs-bucket"

}
resource "aws_s3_bucket_public_access_block" "logs_bucket_access_block" {
  bucket = aws_s3_bucket.logs_bucket.id

  block_public_acls   = true
  block_public_policy = true
  ignore_public_acls  = true
  restrict_public_buckets = true
}
# Create a bucket policy to allow access from specific AWS principals (IAM roles, users, etc.)
data "aws_iam_policy_document" "bucket_policy" {
  statement {
    effect = "Allow"
    resources = [
      "${aws_s3_bucket.item_images.arn}/*"
    ]
    actions = ["S3:GetObject"]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
  }
  statement {
    effect = "Allow"
    resources = [
      "${aws_s3_bucket.item_images.arn}/*"
    ]
    actions = ["S3:PutObject"]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    condition {
      test     = "StringEquals"
      variable = "aws:RequestTag/Role"
      values   = [local.lab_role_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "bucket_policy" {
  bucket = aws_s3_bucket.item_images.id
  policy = data.aws_iam_policy_document.bucket_policy.json
  depends_on = [ aws_s3_bucket_public_access_block.images_bucket_access_block ]
}

resource "aws_vpc_endpoint" "s3" {
  vpc_id            = module.vpc.vpc_id
  service_name      = "com.amazonaws.${local.region}.s3"
  vpc_endpoint_type = "Gateway"
  
  route_table_ids = module.vpc.private_route_table_ids
}