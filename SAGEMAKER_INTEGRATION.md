# AWS SageMaker Integration Guide

## Overview

The LLM Tuner Platform now includes full AWS SageMaker integration for professional LLM fine-tuning at scale. This integration provides enterprise-grade training capabilities with cost estimation, job monitoring, and multiple model support.

## Features

### ✅ Implemented Features

1. **SageMaker Training Jobs**
   - Create and manage training jobs for LLM fine-tuning
   - Support for popular models: Llama 2 7B/13B, FLAN-T5 XL
   - Parameter-Efficient Fine-Tuning (PEFT) with LoRA adapters
   - Configurable instance types and hyperparameters

2. **Cost Management**
   - Real-time cost estimation before training
   - Hourly cost tracking during training
   - Multiple instance type options with cost comparisons

3. **Training Data Processing**
   - Automatic conversion of uploaded files to SageMaker JSONL format
   - S3 integration for training data storage
   - Support for instruction-based fine-tuning format

4. **Job Monitoring**
   - Real-time training job status tracking
   - Training metrics and progress monitoring
   - Job stopping and management capabilities

5. **User Interface**
   - Intuitive model and instance type selection
   - Hyperparameter configuration interface
   - Training job history and status display

## Technical Architecture

### Backend Components

#### SageMakerTrainingManager (`server/sagemaker_training.py`)
- Main class handling all SageMaker operations
- AWS SDK integration with proper error handling
- Training data preparation and job management

#### FastAPI Endpoints
- `/api/sagemaker-training` - Start new training jobs
- `/api/training-job/{job_name}` - Get job status
- `/api/training-jobs` - List user's training jobs
- `/api/stop-training-job/{job_name}` - Stop running jobs
- `/api/training-cost-estimate` - Get cost estimates

### Frontend Components

#### SageMakerTraining Component (`client/src/components/sagemaker-training.tsx`)
- React component for SageMaker training interface
- Model selection, hyperparameter configuration
- Cost estimation and job monitoring

#### Dashboard Integration
- Tabbed interface with Legacy and SageMaker options
- Unified file upload for both training methods

## Configuration

### Required Environment Variables

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_DEFAULT_REGION=us-east-1

# SageMaker Specific
SAGEMAKER_EXECUTION_ROLE=arn:aws:iam::ACCOUNT:role/SageMakerExecutionRole
S3_BUCKET_NAME=your-training-data-bucket
```

### IAM Permissions

The SageMaker execution role needs these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sagemaker:CreateTrainingJob",
        "sagemaker:DescribeTrainingJob",
        "sagemaker:StopTrainingJob",
        "sagemaker:ListTrainingJobs"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket/*",
        "arn:aws:s3:::your-bucket"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

## Supported Models

### Base Models Available

1. **Llama 2 7B** (`llama-2-7b`)
   - 7 billion parameters
   - Recommended instance: ml.g5.2xlarge
   - Cost: ~$1.21/hour

2. **Llama 2 13B** (`llama-2-13b`)
   - 13 billion parameters
   - Recommended instance: ml.g5.4xlarge
   - Cost: ~$1.83/hour

3. **FLAN-T5 XL** (`flan-t5-xl`)
   - Google's instruction-tuned model
   - Recommended instance: ml.g5.2xlarge
   - Cost: ~$1.21/hour

### Instance Types

| Instance Type | GPU Memory | Cost/Hour | Best For |
|---------------|------------|-----------|----------|
| ml.g5.2xlarge | 24GB | $1.21 | 7B models |
| ml.g5.4xlarge | 48GB | $1.83 | 13B models |
| ml.p3.2xlarge | 16GB | $3.06 | Alternative |

## Training Process

### 1. Data Preparation
- Files uploaded to S3 in user-specific directories
- Automatic conversion to instruction format (JSONL)
- Format: `{"instruction": "...", "input": "...", "output": "..."}`

### 2. Training Job Creation
- Unique job name generation with timestamp
- Hyperparameter configuration and validation
- SageMaker training job submission

### 3. Monitoring
- Real-time status updates (InProgress, Completed, Failed)
- Training metrics collection
- Cost tracking throughout training

### 4. Results
- Model artifacts stored in S3
- Training logs and metrics available
- Optional deployment to SageMaker endpoints

## Cost Estimation

### Factors Affecting Cost

1. **Instance Type**: Different GPU configurations have different hourly rates
2. **Training Duration**: Typically 2-5 hours for fine-tuning
3. **Model Size**: Larger models require more expensive instances
4. **Data Size**: More data may require longer training times

### Example Costs

- **Llama 2 7B** on ml.g5.2xlarge: $2.42-6.05 (2-5 hours)
- **Llama 2 13B** on ml.g5.4xlarge: $3.66-9.15 (2-5 hours)
- **FLAN-T5 XL** on ml.g5.2xlarge: $2.42-6.05 (2-5 hours)

## Usage Examples

### Starting a Training Job

```typescript
const trainingRequest = {
  base_model: 'llama-2-7b',
  hyperparameters: {
    learning_rate: 0.0001,
    batch_size: 4,
    epochs: 3,
    max_sequence_length: 2048,
    weight_decay: 0.01
  },
  files: ['training_data.txt'],
  instance_type: 'ml.g5.2xlarge'
};

const response = await fetch('/api/sagemaker-training', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(trainingRequest)
});
```

### Monitoring Job Status

```typescript
const jobStatus = await fetch(`/api/training-job/${jobName}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Troubleshooting

### Common Issues

1. **AWS Credentials Not Configured**
   - Error: "AWS SageMaker is not configured"
   - Solution: Set AWS environment variables

2. **Insufficient IAM Permissions**
   - Error: "Access denied" during job creation
   - Solution: Update SageMaker execution role permissions

3. **Training Job Failures**
   - Check CloudWatch logs for detailed error messages
   - Verify training data format and S3 access

4. **High Costs**
   - Use smaller instance types for testing
   - Implement training time limits
   - Monitor job progress and stop if needed

## Future Enhancements

### Planned Features

1. **Model Deployment**
   - Automatic endpoint creation after training
   - A/B testing capabilities
   - Inference cost optimization

2. **Advanced Monitoring**
   - Real-time training loss charts
   - Performance comparison dashboards
   - Alert notifications

3. **Cost Optimization**
   - Spot instance support
   - Automatic job scheduling
   - Budget controls and limits

4. **Model Management**
   - Version control for fine-tuned models
   - Model registry integration
   - Automated evaluation metrics

## Best Practices

1. **Start Small**: Begin with small datasets and shorter training times
2. **Monitor Costs**: Set up billing alerts and job time limits
3. **Use PEFT**: Parameter-Efficient Fine-Tuning reduces costs significantly
4. **Data Quality**: Ensure training data is properly formatted and clean
5. **Testing**: Use validation sets to prevent overfitting
6. **Documentation**: Keep track of hyperparameters and results

This integration provides a production-ready solution for LLM fine-tuning with enterprise-grade capabilities and cost management.