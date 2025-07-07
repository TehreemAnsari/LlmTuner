# AWS SageMaker Role Setup Instructions

## Required Role ARN
Your AWS account needs this SageMaker execution role:
```
arn:aws:iam::103259692132:role/SageMakerExecutionRole-LLMTuner
```

## Option 1: Create Role via AWS Console (Recommended)

1. **Go to AWS IAM Console**: https://console.aws.amazon.com/iam/
2. **Create Role**:
   - Click "Roles" → "Create role"
   - Select "AWS service" → "SageMaker"
   - Choose "SageMaker - Execution"
   - Click "Next"

3. **Attach Policies**:
   - Search and select: `AmazonSageMakerFullAccess`
   - Search and select: `AmazonS3FullAccess`
   - Click "Next"

4. **Name the Role**:
   - Role name: `SageMakerExecutionRole-LLMTuner`
   - Description: "SageMaker execution role for LLM Tuner Platform"
   - Click "Create role"

## Option 2: Use Existing Role
If you already have a SageMaker role with S3 permissions, provide its ARN instead.

## Option 3: Use AWS CLI (if you have admin access)
```bash
aws iam create-role --role-name SageMakerExecutionRole-LLMTuner \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {"Service": "sagemaker.amazonaws.com"},
        "Action": "sts:AssumeRole"
      }
    ]
  }'

aws iam attach-role-policy --role-name SageMakerExecutionRole-LLMTuner \
  --policy-arn arn:aws:iam::aws:policy/AmazonSageMakerFullAccess

aws iam attach-role-policy --role-name SageMakerExecutionRole-LLMTuner \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
```

## Once Created
After creating the role, I'll add it to your environment variables and the SageMaker training will be fully functional.

The role ARN should be exactly:
`arn:aws:iam::103259692132:role/SageMakerExecutionRole-LLMTuner`