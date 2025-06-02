terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.0"
    }
  }
  backend "s3" {
    bucket         = "gpt-wrapper-terraform"
    key            = "gpt-wrapper/terraform.tfstate"
    region         = "eu-central-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = "eu-central-1"
}

resource "aws_dynamodb_table" "chat_history" {
  name           = "gpt-wrapper-chat-history"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }
  attribute {
    name = "timestamp"
    type = "N"
  }
  global_secondary_index {
    name               = "userId-timestamp-index"
    hash_key           = "userId"
    range_key          = "timestamp"
    projection_type    = "ALL"
  }
}

data "aws_ssm_parameter" "gpt_api_token" {
  name = "/gpt-wrapper/gpt-api-token"
  with_decryption = true
}

data "aws_ssm_parameter" "google_client_id" {
  name = "/gpt-wrapper/google-client-id"
}

data "aws_ssm_parameter" "google_client_secret" {
  name = "/gpt-wrapper/google-client-secret"
  with_decryption = true
}

data "aws_ssm_parameter" "google_authorize_scopes" {
  name = "/gpt-wrapper/google-authorize-scopes"
}

# Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name = "gpt-wrapper-user-pool"
  auto_verified_attributes = ["email"]
}

# Google Identity Provider for Cognito User Pool
resource "aws_cognito_identity_provider" "google" {
  user_pool_id  = aws_cognito_user_pool.main.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    client_id     = data.aws_ssm_parameter.google_client_id.value
    client_secret = data.aws_ssm_parameter.google_client_secret.value
    authorize_scopes = data.aws_ssm_parameter.google_authorize_scopes.value
  }

  attribute_mapping = {
    email    = "email"
    username = "sub"
  }
}

# Cognito User Pool Client
resource "aws_cognito_user_pool_client" "main" {
  name         = "gpt-wrapper-client"
  user_pool_id = aws_cognito_user_pool.main.id
  generate_secret = false
  allowed_oauth_flows = ["code"]
  allowed_oauth_scopes = ["email", "openid", "profile"]
  allowed_oauth_flows_user_pool_client = true
  callback_urls = [
    "https://d11e3ixoa4l8th.cloudfront.net"
  ]
  logout_urls = [
    "https://d11e3ixoa4l8th.cloudfront.net"
  ]
  supported_identity_providers = ["COGNITO", aws_cognito_identity_provider.google.provider_name]
}

# Cognito Identity Pool
resource "aws_cognito_identity_pool" "main" {
  identity_pool_name               = "gpt-wrapper-identity-pool"
  allow_unauthenticated_identities = false
  cognito_identity_providers {
    client_id = aws_cognito_user_pool_client.main.id
    provider_name = aws_cognito_user_pool.main.endpoint
    server_side_token_check = false
  }
}

# Use existing S3 bucket for frontend

data "aws_s3_bucket" "frontend" {
  bucket = "gpt-wrapper-backet"
}

# Update S3 bucket policy to use the data source
resource "aws_s3_bucket_policy" "frontend" {
  bucket = data.aws_s3_bucket.frontend.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.frontend.iam_arn
        }
        Action = ["s3:GetObject"]
        Resource = ["${data.aws_s3_bucket.frontend.arn}/*"]
      }
    ]
  })
}

# Update CloudFront distribution origin to use the data source
resource "aws_cloudfront_distribution" "frontend" {
  origin {
    domain_name = data.aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "s3-frontend"
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.frontend.cloudfront_access_identity_path
    }
  }
  default_root_object = "index.html"
  enabled = true
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "s3-frontend"
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    viewer_protocol_policy = "redirect-to-https"
  }
  viewer_certificate {
    cloudfront_default_certificate = true
  }
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
  }
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
  }
}

resource "aws_cloudfront_origin_access_identity" "frontend" {
  comment = "OAI for gpt-wrapper frontend"
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.main.id
}
output "cognito_user_pool_client_id" {
  value = aws_cognito_user_pool_client.main.id
}
output "cognito_identity_pool_id" {
  value = aws_cognito_identity_pool.main.id
}
output "frontend_bucket_name" {
  value = data.aws_s3_bucket.frontend.bucket
}
output "frontend_cloudfront_domain" {
  value = aws_cloudfront_distribution.frontend.domain_name
}
