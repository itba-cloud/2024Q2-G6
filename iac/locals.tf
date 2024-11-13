locals {
  account_id   = data.aws_caller_identity.this.account_id
  region       = data.aws_region.this.name
  lab_role_arn = "arn:aws:iam::${data.aws_caller_identity.this.account_id}:role/LabRole"
}