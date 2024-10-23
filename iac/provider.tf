provider "aws" {
  region = "us-east-1"
  default_tags {
   tags = {
     Owner       = "cloud-ecommerce"
     Project     = "pickitup"
   }
 }
}