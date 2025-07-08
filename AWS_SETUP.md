# AWS Setup & Authentication Guide

This guide covers setting up AWS services and authentication for the LLM Tuner Platform, including Google OAuth integration and SageMaker training capabilities.

## Prerequisites

- AWS Account with appropriate permissions
- Google Developer Console account (for OAuth)
- Access to AWS IAM, S3, SageMaker, and DynamoDB services

## Authentication System Overview

The platform supports two authentication methods:
1. **Email/Password Registration** - Traditional signup with bcrypt password hashing
2. **Google OAuth** - One-click sign-in using Google accounts

## Google OAuth Setup

### 1. Google Cloud Console Configuration

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Google Identity API
   - Google+ API (if available)
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"

### 2. OAuth Client Configuration

**Application Type:** Web application

**Name:** LLM Tuner Platform

**Authorized JavaScript origins:**
```
http://localhost:5000
https://your-repl-name.replit.app
https://your-custom-domain.com
```

**Authorized redirect URIs:**
```
http://localhost:5000/auth/google/callback
https://your-repl-name.replit.app/auth/google/callback
https://your-custom-domain.com/auth/google/callback
```

### 3. Callback URL Format

The callback URL follows this pattern:
```
{BASE_URL}/auth/google/callback
```

**Base URLs by environment:**
- **Local development:** `http://localhost:5000`
- **Replit deployment:** `https://your-repl-name.replit.app`
- **Custom domain:** `https://your-domain.com`

### 4. OAuth Configuration Notes

- The redirect URI must match exactly (including protocol and port)
- For development, use HTTP; for production, use HTTPS
- Multiple redirect URIs can be configured for different environments
- Google will validate the redirect URI on each authentication request

## AWS Services Configuration

### 1. IAM User and Permissions

Create an IAM user with programmatic access and attach the following policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "S3BucketAccess",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket",
                "s3:GetBucketLocation",
                "s3:GetObjectVersion"
            ],
            "Resource": [
                "arn:aws:s3:::your-llm-tuner-bucket",
                "arn:aws:s3:::your-llm-tuner-bucket/*"
            ]
        },
        {
            "Sid": "SageMakerTraining",
            "Effect": "Allow",
            "Action": [
                "sagemaker:CreateTrainingJob",
                "sagemaker:DescribeTrainingJob",
                "sagemaker:StopTrainingJob",
                "sagemaker:ListTrainingJobs",
                "sagemaker:CreateModel",
                "sagemaker:DescribeModel"
            ],
            "Resource": "*"
        },
        {
            "Sid": "DynamoDBAccess",
            "Effect": "Allow",
            "Action": [
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Query",
                "dynamodb:Scan",
                "dynamodb:CreateTable",
                "dynamodb:DescribeTable"
            ],
            "Resource": [
                "arn:aws:dynamodb:*:*:table/llm-tuner-*",
                "arn:aws:dynamodb:*:*:table/llm-tuner-*/index/*"
            ]
        },
        {
            "Sid": "IAMPassRole",
            "Effect": "Allow",
            "Action": [
                "iam:PassRole"
            ],
            "Resource": "arn:aws:iam::*:role/SageMakerExecutionRole*"
        },
        {
            "Sid": "ServiceQuotas",
            "Effect": "Allow",
            "Action": [
                "servicequotas:GetServiceQuota",
                "servicequotas:ListServiceQuotas"
            ],
            "Resource": "*"
        }
    ]
}
```

### 2. S3 Bucket Setup

Create an S3 bucket for training data and model artifacts:

```bash
# Create bucket (replace with your unique name)
aws s3 mb s3://your-llm-tuner-bucket-unique-name

# Enable versioning
aws s3api put-bucket-versioning \
    --bucket your-llm-tuner-bucket-unique-name \
    --versioning-configuration Status=Enabled
```

**S3 Bucket Policy:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowSageMakerAccess",
            "Effect": "Allow",
            "Principal": {
                "Service": "sagemaker.amazonaws.com"
            },
            "Action": [
                "s3:GetObject",
                "s3:ListBucket",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::your-llm-tuner-bucket-unique-name",
                "arn:aws:s3:::your-llm-tuner-bucket-unique-name/*"
            ]
        },
        {
            "Sid": "AllowApplicationAccess",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::YOUR-ACCOUNT-ID:user/llm-tuner-user"
            },
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-llm-tuner-bucket-unique-name",
                "arn:aws:s3:::your-llm-tuner-bucket-unique-name/*"
            ]
        }
    ]
}
```

### 3. DynamoDB Tables

Create the required DynamoDB tables:

**Users Table:**
```bash
aws dynamodb create-table \
    --table-name llm-tuner-users \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=email,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
    --global-secondary-indexes \
        IndexName=email-index,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL} \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1
```

**Training Jobs Table:**
```bash
aws dynamodb create-table \
    --table-name llm-tuner-training-jobs \
    --attribute-definitions \
        AttributeName=job_id,AttributeType=S \
        AttributeName=user_id,AttributeType=S \
        AttributeName=created_at,AttributeType=S \
    --key-schema \
        AttributeName=job_id,KeyType=HASH \
    --global-secondary-indexes \
        IndexName=user-index,KeySchema=[{AttributeName=user_id,KeyType=HASH},{AttributeName=created_at,KeyType=RANGE}],Projection={ProjectionType=ALL} \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1
```

**Files Table:**
```bash
aws dynamodb create-table \
    --table-name llm-tuner-files \
    --attribute-definitions \
        AttributeName=file_id,AttributeType=S \
        AttributeName=user_id,AttributeType=S \
    --key-schema \
        AttributeName=file_id,KeyType=HASH \
    --global-secondary-indexes \
        IndexName=user-files-index,KeySchema=[{AttributeName=user_id,KeyType=HASH}],Projection={ProjectionType=ALL} \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1
```

### 4. SageMaker Execution Role

Create a SageMaker execution role with the following trust policy:

**Trust Policy:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "sagemaker.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
```

**Attached Policies:**
- `AmazonSageMakerFullAccess` (AWS managed)
- Custom S3 access policy (see below)

**Custom S3 Policy for SageMaker Role:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket",
                "s3:GetBucketLocation"
            ],
            "Resource": [
                "arn:aws:s3:::your-llm-tuner-bucket-unique-name",
                "arn:aws:s3:::your-llm-tuner-bucket-unique-name/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:*:*:*"
        }
    ]
}
```

## Environment Variables

### Required Secrets for Replit

Add these secrets in the Replit "Secrets" tab:

**AWS Configuration:**
```
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=us-east-1
S3_BUCKET_NAME=your-llm-tuner-bucket-unique-name
SAGEMAKER_EXECUTION_ROLE_ARN=arn:aws:iam::YOUR-ACCOUNT:role/SageMakerExecutionRole
```

**Google OAuth:**
```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Application Security:**
```
JWT_SECRET=your-long-random-jwt-secret-key
SESSION_SECRET=your-session-secret-key
BCRYPT_ROUNDS=12
```

**Database Configuration:**
```
DATABASE_URL=sqlite:///./app.db
DYNAMODB_USERS_TABLE=llm-tuner-users
DYNAMODB_JOBS_TABLE=llm-tuner-training-jobs
DYNAMODB_FILES_TABLE=llm-tuner-files
```

### Local Development (.env file)

For local development, create a `.env` file:

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-1
S3_BUCKET_NAME=your-llm-tuner-bucket-unique-name
SAGEMAKER_EXECUTION_ROLE_ARN=arn:aws:iam::account:role/SageMakerExecutionRole

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Application
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
DATABASE_URL=sqlite:///./app.db

# Development Settings
DEBUG=true
ENVIRONMENT=development
```

## SageMaker Training Configuration

### Supported Instance Types

**CPU Instances (Immediate availability):**
- `ml.m5.large` - 2 vCPU, 8 GB RAM
- `ml.c5.large` - 2 vCPU, 4 GB RAM  
- `ml.m5.xlarge` - 4 vCPU, 16 GB RAM

**GPU Instances (Require quota increases):**
- `ml.g5.large` - 1 GPU, 4 vCPU, 16 GB RAM
- `ml.g5.xlarge` - 1 GPU, 4 vCPU, 16 GB RAM
- `ml.g5.2xlarge` - 1 GPU, 8 vCPU, 32 GB RAM
- `ml.g5.4xlarge` - 1 GPU, 16 vCPU, 64 GB RAM
- `ml.p3.2xlarge` - 1 GPU, 8 vCPU, 61 GB RAM

### Training Script Requirements

The platform automatically packages training scripts with:
- Custom `finetune.py` script for LLM training
- `requirements.txt` with necessary dependencies
- Proper entry point configuration for SageMaker containers

## Authentication Flow

### Email/Password Registration

1. User submits email and password
2. Password is hashed using bcrypt
3. User record created in DynamoDB
4. JWT token issued for session management

### Google OAuth Flow

1. User clicks "Sign in with Google"
2. Redirect to Google OAuth consent screen
3. Google redirects to callback URL with authorization code
4. Server exchanges code for user profile
5. User created/updated in DynamoDB
6. JWT token issued for session management

**OAuth Callback Implementation:**
```python
@app.get("/auth/google/callback")
async def google_callback(code: str, state: str = None):
    # Exchange authorization code for access token
    # Get user profile from Google
    # Create/update user in database
    # Issue JWT token
    # Redirect to dashboard
```

## Testing the Setup

### 1. Test AWS Services

**S3 Connection:**
```bash
aws s3 ls s3://your-bucket-name
aws s3 cp test-file.txt s3://your-bucket-name/
```

**DynamoDB Access:**
```bash
aws dynamodb scan --table-name llm-tuner-users --limit 1
```

**SageMaker Permissions:**
```bash
aws sagemaker list-training-jobs --max-results 5
```

### 2. Test Google OAuth

1. Navigate to your application login page
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Verify user appears in DynamoDB users table
5. Check JWT token is issued correctly

### 3. Test File Upload and Training

1. Login to the application
2. Upload a training file (JSON/CSV/TXT)
3. Configure hyperparameters
4. Start training job
5. Verify job appears in SageMaker console
6. Check training logs in CloudWatch

## Troubleshooting

### Common AWS Issues

**Permission Denied Errors:**
- Verify IAM user has correct policies attached
- Check S3 bucket policy allows SageMaker access
- Ensure SageMaker execution role can access S3

**SageMaker Training Failures:**
- Check CloudWatch logs for training job
- Verify training script is properly packaged
- Ensure instance type has available capacity

**DynamoDB Access Issues:**
- Verify table names match environment variables
- Check IAM permissions for DynamoDB operations
- Ensure tables exist in correct region

### Google OAuth Issues

**Invalid Redirect URI:**
- Verify redirect URI matches exactly in Google Console
- Check protocol (HTTP vs HTTPS)
- Ensure domain matches deployment

**Client ID/Secret Issues:**
- Verify credentials are correctly set in secrets
- Check Google Console for API quotas
- Ensure required APIs are enabled

### Debug Commands

```bash
# Test AWS credentials
aws sts get-caller-identity

# Check S3 bucket access
aws s3 ls s3://your-bucket-name --region us-east-1

# List SageMaker training jobs
aws sagemaker list-training-jobs --region us-east-1

# Check DynamoDB tables
aws dynamodb list-tables --region us-east-1

# Test Google OAuth token exchange (curl)
curl -X POST https://oauth2.googleapis.com/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "code=AUTH_CODE&client_id=CLIENT_ID&client_secret=CLIENT_SECRET&redirect_uri=REDIRECT_URI&grant_type=authorization_code"
```

## Security Best Practices

### AWS Security
- Use IAM roles with minimal required permissions
- Enable MFA on AWS root account
- Rotate access keys regularly
- Enable CloudTrail for audit logging
- Use VPC endpoints for S3 access if possible

### Application Security
- Use HTTPS in production
- Implement rate limiting on authentication endpoints
- Validate all user inputs
- Store secrets securely (not in code)
- Use secure JWT secret keys
- Implement session timeout

### Data Protection
- Encrypt data at rest in S3
- Use SSL/TLS for data in transit
- Implement user data access controls
- Regular security audits
- Monitor for unusual access patterns

## Cost Optimization

### SageMaker Training
- Use spot instances for non-critical jobs
- Set training job time limits
- Monitor training costs with CloudWatch alarms
- Clean up completed training artifacts

### Storage Costs
- Implement S3 lifecycle policies
- Delete unused training data
- Use appropriate storage classes
- Monitor DynamoDB usage patterns

### Monitoring and Alerts
```bash
# CloudWatch alarm for high SageMaker costs
aws cloudwatch put-metric-alarm \
  --alarm-name "HighSageMakerCosts" \
  --alarm-description "Alert when SageMaker costs exceed threshold" \
  --metric-name "EstimatedCharges" \
  --namespace "AWS/Billing" \
  --statistic "Maximum" \
  --period 86400 \
  --threshold 100 \
  --comparison-operator "GreaterThanThreshold"
```

## Support Resources

- **AWS Documentation:** https://docs.aws.amazon.com/
- **Google OAuth Guide:** https://developers.google.com/identity/protocols/oauth2
- **SageMaker Training:** https://docs.aws.amazon.com/sagemaker/latest/dg/train-model.html
- **DynamoDB Guide:** https://docs.aws.amazon.com/dynamodb/
- **Replit Deployment:** https://docs.replit.com/deployments