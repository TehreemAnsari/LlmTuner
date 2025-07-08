# AWS SageMaker Quota Limits and Solutions

## Overview

AWS SageMaker has service quotas that limit the number of instances you can use for training jobs. This document explains how to handle quota limits and request increases.

## Common Quota Errors

### ResourceLimitExceeded Error
```
The account-level service limit 'ml.g5.2xlarge for training job usage' is 0 Instances, with current utilization of 0 Instances and a request delta of 1 Instances.
```

This means your AWS account has no quota allocated for this specific instance type.

## Instance Type Quotas

### GPU Instances (Often Limited)
- `ml.g5.large` - 12GB GPU, usually limited quota
- `ml.g5.xlarge` - 24GB GPU, usually limited quota  
- `ml.g5.2xlarge` - 24GB GPU, often zero quota for new accounts
- `ml.g5.4xlarge` - 48GB GPU, often zero quota for new accounts

### CPU Instances (Usually Available)
- `ml.m5.large` - General purpose, typically higher quota
- `ml.c5.large` - Compute optimized, typically higher quota
- `ml.m5.xlarge` - More memory, typically available

## Solutions

### 1. Use CPU Instances First
Start with CPU instances to test your training pipeline:
- `ml.m5.large` ($0.096/hour)
- `ml.c5.large` ($0.085/hour)
- `ml.m5.xlarge` ($0.192/hour)

### 2. Request Quota Increase
1. Go to [AWS Service Quotas Console](https://console.aws.amazon.com/servicequotas/)
2. Search for "SageMaker"
3. Find the instance type you need
4. Click "Request quota increase"
5. Provide business justification

### 3. Check Current Quotas
View your current quotas at:
- [SageMaker Service Quotas](https://console.aws.amazon.com/servicequotas/home/services/sagemaker/quotas)

### 4. Alternative Instance Types
If one GPU instance type is limited, try others:
- `ml.g5.large` (smaller, might have quota)
- `ml.g4dn.xlarge` (older generation, often available)
- `ml.p3.2xlarge` (older but powerful)

## Training Strategy

### Phase 1: Test with CPU
1. Start training jobs with `ml.m5.large`
2. Verify your training pipeline works
3. Test data processing and script execution

### Phase 2: Scale with GPU
1. Request quota for GPU instances
2. Switch to `ml.g5.large` or `ml.g5.xlarge`
3. Run full training with GPU acceleration

## Quota Increase Tips

### Business Justification Examples
- "Developing machine learning models for production applications"
- "Research and development for AI/ML projects"
- "Training custom language models for business use cases"

### Request Strategy
- Start with small increases (1-2 instances)
- Explain your use case clearly
- Mention you're a legitimate business/research use
- AWS typically approves reasonable requests quickly

## Cost Optimization

### Instance Selection
- **Development/Testing**: `ml.m5.large` ($0.096/hour)
- **Small Models**: `ml.g5.large` ($0.61/hour)
- **Medium Models**: `ml.g5.xlarge` ($1.01/hour)
- **Large Models**: `ml.g5.2xlarge` ($1.21/hour)

### Training Time Estimates
- **Small dataset (1K samples)**: 30-60 minutes
- **Medium dataset (10K samples)**: 1-3 hours
- **Large dataset (100K samples)**: 3-8 hours

## Monitoring and Alerts

### Check Training Job Status
```bash
aws sagemaker describe-training-job --training-job-name your-job-name
```

### Monitor Costs
- [AWS Cost Explorer](https://console.aws.amazon.com/cost-reports/)
- Set up billing alerts
- Monitor SageMaker usage in CloudWatch

## Real SageMaker Job Success

When you successfully create a real SageMaker job, you'll see:
1. Job appears in [SageMaker Console](https://console.aws.amazon.com/sagemaker/home#/jobs)
2. Status progresses: InProgress → Training → Completed
3. CloudWatch logs show training script execution
4. Model artifacts saved to S3

## Troubleshooting Steps

1. **Check quotas**: Verify your instance type quota
2. **Try CPU first**: Use `ml.m5.large` to test
3. **Request increase**: Submit quota increase request
4. **Use alternatives**: Try different instance types
5. **Monitor costs**: Set up billing alerts

## Success Indicators

### Real AWS Training Job Created
- Job visible in AWS SageMaker console
- CloudWatch logs show training progress
- S3 contains training data and model artifacts
- Actual AWS billing charges

### Demo Mode (Fallback)
- Local simulation of training process
- No AWS charges
- Jobs only visible in application UI
- Used when quota limits are hit

The application automatically handles quota limits by falling back to demo mode while you request quota increases.