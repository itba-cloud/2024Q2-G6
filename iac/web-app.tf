module "web_app_1" {
  source = "./modules/web-app"

  # Input Variables
  domain_name      = var.domain_name
  static_files_dir = var.nextjs_export_directory
}


