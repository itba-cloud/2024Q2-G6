module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = var.vpc_name
  cidr = var.vpc_cidr

  #azs             = slice(data.aws_availability_zones.available.names, 0, 2)
  azs             = var.availability_zones
  private_subnets = var.private_subnets
  public_subnets  = []

  enable_nat_gateway = false
  enable_vpn_gateway = false

  tags = {
    Name = var.vpc_name
  }
}

# Subnet Group for Aurora
resource "aws_db_subnet_group" "aurora" {
  name       = "aurora_subnet_group"
  subnet_ids = [module.vpc.private_subnets[2], module.vpc.private_subnets[3]]

  tags = {
    Name = "aurora_subnet_group"
  }
}

# Subnet Group for Lambda
resource "aws_db_subnet_group" "lambda" {
  name       = "lambda_subnet_group"
  subnet_ids = [module.vpc.private_subnets[0], module.vpc.private_subnets[1]]

  tags = {
    Name = "lambda_subnet_group"
  }
}