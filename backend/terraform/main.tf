terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.0"
    }
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

resource "aws_ssm_parameter" "gpt_api_token" {
  name  = "/gpt-wrapper/gpt-api-token"
  type  = "SecureString"
  value = "REPLACE_ME"
}

resource "aws_ssm_parameter" "google_client_id" {
  name  = "/gpt-wrapper/google-client-id"
  type  = "String"
  value = "GOOGLE_CLIENT_ID_HERE"
}

resource "aws_ssm_parameter" "google_client_secret" {
  name  = "/gpt-wrapper/google-client-secret"
  type  = "SecureString"
  value = "GOOGLE_CLIENT_SECRET_HERE"
}

resource "aws_ssm_parameter" "google_authorize_scopes" {
  name  = "/gpt-wrapper/google-authorize-scopes"
  type  = "String"
  value = "openid email profile"
}

data "aws_ssm_parameter" "google_client_id" {
  name = aws_ssm_parameter.google_client_id.name
}

data "aws_ssm_parameter" "google_client_secret" {
  name = aws_ssm_parameter.google_client_secret.name
  with_decryption = true
}

data "aws_ssm_parameter" "google_authorize_scopes" {
  name = aws_ssm_parameter.google_authorize_scopes.name
}

# Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name = "gpt-wrapper-user-pool"
  auto_verified_attributes = ["email"]
}

# Google Identity Provider for Cognito User Pool
resource "aws_cognito_user_pool_identity_provider" "google" {
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
  callback_urls = ["http://localhost:5173/"] # Update for prod
  supported_identity_providers = ["COGNITO", aws_cognito_user_pool_identity_provider.google.provider_name]
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

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.main.id
}
output "cognito_user_pool_client_id" {
  value = aws_cognito_user_pool_client.main.id
}
output "cognito_identity_pool_id" {
  value = aws_cognito_identity_pool.main.id
}
