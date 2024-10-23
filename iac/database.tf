resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "_%@"
}

resource "aws_security_group" "aurora_sg" {
  vpc_id = module.vpc.vpc_id

  name = "aurora-sg"

  ingress {
    description     = "Allow Lambda to connect"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "aurora-sg"
  }
}

resource "aws_rds_cluster_parameter_group" "aurora_parameter_group" {
  name   = "rds-pgroup"
  family = "aurora-postgresql11"

  parameter {
    name  = "log_connections"
    value = "1"
  }
}

# Aurora PostgreSQL Cluster
resource "aws_rds_cluster" "aurora" {
  engine                 = "aurora-postgresql"
  engine_mode            = "serverless"
  cluster_identifier     = "aurora-cluster"
  master_username        = var.db_user
  master_password        = random_password.db_password.result
  database_name          = var.db_name
  enable_http_endpoint   = true
  skip_final_snapshot    = true
  vpc_security_group_ids = [aws_security_group.aurora_sg.id]

  # Subnets for Aurora
  db_subnet_group_name = aws_db_subnet_group.aurora.name

  scaling_configuration {
    auto_pause               = true
    min_capacity             = 2
    max_capacity             = 4
    seconds_until_auto_pause = 300
    timeout_action           = "ForceApplyCapacityChange"
  }

  depends_on = [
    aws_security_group.aurora_sg,
    aws_db_subnet_group.aurora,
    aws_rds_cluster_parameter_group.aurora_parameter_group,
  ]

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name = "aurora-cluster"
  }
}


resource "null_resource" "invoke_lambda_generate_schema" {
  provisioner "local-exec" {
    command = "aws lambda invoke --function-name ${aws_lambda_function.schema_action.function_name} --region us-east-1 NUL"
  }

  depends_on = [
    aws_rds_cluster.aurora
  ]

  triggers = {
    rds_cluster_id = aws_rds_cluster.aurora.id
  }
}