# General Variables

variable "region" {
  description = "Default region for provider"
  type        = string
  default     = "us-east-1"
}

variable "static_files_dir" {
  description = "Static export directory of Web App"
  type        = string
}


variable "domain_name" {
  description = "Domain name"
  type        = string
}











