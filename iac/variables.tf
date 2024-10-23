variable "region" {
  description = "Default region for provider"
  type        = string
  default     = "us-east-1"
}

variable "nextjs_export_directory" {
  description = "Static export directory of NextJS App"
  type        = string
  default     = "../frontend/out"
}

variable "domain_name" {
  description = "Domain name"
  type        = string
}

variable "db_name" {
  description = "Name of DB"
  type        = string
  default     = "inventory"
}

variable "db_user" {
  description = "Username for DB"
  type        = string
}

variable "google_auth_client_id" {
  description = "Client id of Google project that provides auth"
  type        = string
  sensitive   = true
}

variable "google_auth_client_secret" {
  description = "Client secret of Google project that provides auth"
  type        = string
  sensitive   = true
}

variable "vpc_name" {
  description = "Name of the VPC"
  type        = string
  default     = "cloud-ecommerce-vpc"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "private_subnets" {
  description = "List of private subnet CIDRs"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24", "10.0.4.0/24"]
}