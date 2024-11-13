output "www_bucket_id" {
  value = aws_s3_bucket.www.id
  description = "ID of www bucket"
}

output "root_bucket_id" {
  value = aws_s3_bucket.root.id
  description = "ID of root bucket"
}

output "website_url" {
  value = "http://${aws_s3_bucket.root.bucket}.s3-website-${data.aws_region.current.name}.amazonaws.com"
  description = "The URL of the S3 bucket"
}