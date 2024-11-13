#Definition of the database secret
resource "aws_secretsmanager_secret" "db_credentials" {
  name        = "aurora-db-credentials"
  description = "Credencials to Aurora database"
  
  tags = {
    Name = "aurora-db-credentials"
  }
}

# Explicit value given to the secret
resource "aws_secretsmanager_secret_version" "db_credentials_version" {
  secret_id     = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    password = random_password.db_password.result    # Usa las variables que ya estás usando para la contraseña
  })
}

# Security Group para el VPC Endpoint
resource "aws_security_group" "secrets_manager_endpoint_sg" {
  name        = "secrets-manager-endpoint-sg"
  description = "Security Group para el VPC Endpoint de Secrets Manager"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"  # "-1" permite todo el tráfico (All traffic)
    cidr_blocks     = ["0.0.0.0/0"] 
    description     = "Permitir trafico entrante desde el Security Group de las Lambdas"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Permitir todo el trafico de salida"
  }

  tags = {
    Name = "secrets-manager-endpoint-sg"
  }
}

resource "aws_vpc_endpoint" "secret_manager_endpoint" {
  vpc_id            = module.vpc.vpc_id
  service_name      = "com.amazonaws.${local.region}.secretsmanager"
  vpc_endpoint_type = "Interface"

  subnet_ids        = aws_db_subnet_group.lambda.subnet_ids
  private_dns_enabled = true
  security_group_ids = [aws_security_group.secrets_manager_endpoint_sg.id]
}
