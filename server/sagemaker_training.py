"""
Amazon SageMaker integration for LLM fine-tuning
Handles training job creation, monitoring, and management
"""

import json
import boto3
import time
import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime
from botocore.exceptions import ClientError
import os

class SageMakerTrainingManager:
    def __init__(self):
        # Set default AWS region if not configured
        aws_region = os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
        
        try:
            self.sagemaker_client = boto3.client('sagemaker', region_name=aws_region)
            self.s3_client = boto3.client('s3', region_name=aws_region)
            self.aws_configured = True
            print(f"✅ AWS SageMaker client initialized in region: {aws_region}")
        except Exception as e:
            print(f"⚠️ AWS SageMaker not configured: {e}")
            self.sagemaker_client = None
            self.s3_client = None
            self.aws_configured = False
        
        # Try multiple possible secret names for SageMaker role
        self.execution_role = (
            os.getenv('SAGEMAKER_EXECUTION_ROLE') or 
            os.getenv('LLM_SAGEMAKER') or 
            os.getenv('SAGEMAKER_ROLE') or
            'arn:aws:iam::103259692132:role/SageMakerExecutionRole-LLMTuner'  # Default to your account
        )
        self.s3_bucket = os.getenv('S3_BUCKET_NAME', 'llm-tuner-platform')
        self.aws_region = aws_region
        
    def create_training_job(
        self,
        job_name: str,
        user_id: str,
        base_model: str,
        training_files: List[str],
        hyperparameters: Dict[str, Any],
        instance_type: str = "ml.g5.2xlarge"
    ) -> Dict[str, Any]:
        """Create a SageMaker training job for LLM fine-tuning"""
        
        if not self.aws_configured:
            raise Exception("AWS SageMaker is not configured. Please configure AWS credentials and region.")
        
        try:
            # Prepare training data S3 paths
            training_data_s3_uri = f"s3://{self.s3_bucket}/users/{user_id}/training-data/"
            output_s3_uri = f"s3://{self.s3_bucket}/users/{user_id}/models/{job_name}/"
            
            # Define algorithm specification based on base model
            algorithm_specification = self._get_algorithm_specification(base_model)
            
            # Configure hyperparameters for SageMaker
            sagemaker_hyperparameters = {
                'base_model': base_model,
                'learning_rate': str(hyperparameters.get('learning_rate', 0.0001)),
                'batch_size': str(hyperparameters.get('batch_size', 4)),
                'epochs': str(hyperparameters.get('epochs', 3)),
                'max_sequence_length': str(hyperparameters.get('max_sequence_length', 2048)),
                'warmup_steps': str(hyperparameters.get('warmup_steps', 100)),
                'weight_decay': str(hyperparameters.get('weight_decay', 0.01)),
                'use_peft': 'True',  # Use Parameter Efficient Fine-Tuning
                'peft_type': 'lora',  # LoRA adapters
                'lora_r': '16',
                'lora_alpha': '32',
                'lora_dropout': '0.1'
            }
            
            # Create training job configuration
            training_job_config = {
                'TrainingJobName': job_name,
                'RoleArn': self.execution_role,
                'AlgorithmSpecification': algorithm_specification,
                'InputDataConfig': [
                    {
                        'ChannelName': 'training',
                        'DataSource': {
                            'S3DataSource': {
                                'S3DataType': 'S3Prefix',
                                'S3Uri': training_data_s3_uri,
                                'S3DataDistributionType': 'FullyReplicated'
                            }
                        },
                        'ContentType': 'application/jsonlines',
                        'CompressionType': 'None'
                    }
                ],
                'OutputDataConfig': {
                    'S3OutputPath': output_s3_uri
                },
                'ResourceConfig': {
                    'InstanceType': instance_type,
                    'InstanceCount': 1,
                    'VolumeSizeInGB': 30
                },
                'StoppingCondition': {
                    'MaxRuntimeInSeconds': 10800  # 3 hours max
                },
                'HyperParameters': sagemaker_hyperparameters,
                'Tags': [
                    {
                        'Key': 'Project',
                        'Value': 'LLM-Tuner-Platform'
                    },
                    {
                        'Key': 'UserId',
                        'Value': user_id
                    },
                    {
                        'Key': 'BaseModel',
                        'Value': base_model
                    }
                ]
            }
            
            # Start the training job
            response = self.sagemaker_client.create_training_job(**training_job_config)
            
            print(f"✅ SageMaker training job created: {job_name}")
            print(f"📊 Training job ARN: {response['TrainingJobArn']}")
            
            return {
                'job_name': job_name,
                'job_arn': response['TrainingJobArn'],
                'status': 'InProgress',
                'training_data_s3_uri': training_data_s3_uri,
                'output_s3_uri': output_s3_uri,
                'instance_type': instance_type,
                'created_at': datetime.now().isoformat(),
                'estimated_cost_per_hour': self._get_instance_cost(instance_type)
            }
            
        except ClientError as e:
            print(f"❌ SageMaker training job creation failed: {e}")
            raise Exception(f"Failed to create training job: {str(e)}")
    
    def _get_algorithm_specification(self, base_model: str) -> Dict[str, Any]:
        """Get algorithm specification based on base model"""
        
        # SageMaker JumpStart model configurations
        model_configs = {
            'llama-2-7b': {
                'TrainingInputMode': 'File',
                'TrainingImage': '763104351884.dkr.ecr.us-east-1.amazonaws.com/huggingface-pytorch-training:2.0.0-transformers4.28.1-gpu-py310-cu118-ubuntu20.04',
                'MetricDefinitions': [
                    {
                        'Name': 'train_loss',
                        'Regex': 'train_loss: ([0-9\\.]+)'
                    },
                    {
                        'Name': 'eval_loss',
                        'Regex': 'eval_loss: ([0-9\\.]+)'
                    }
                ]
            },
            'llama-2-13b': {
                'TrainingInputMode': 'File',
                'TrainingImage': '763104351884.dkr.ecr.us-east-1.amazonaws.com/huggingface-pytorch-training:2.0.0-transformers4.28.1-gpu-py310-cu118-ubuntu20.04',
                'MetricDefinitions': [
                    {
                        'Name': 'train_loss',
                        'Regex': 'train_loss: ([0-9\\.]+)'
                    },
                    {
                        'Name': 'eval_loss',
                        'Regex': 'eval_loss: ([0-9\\.]+)'
                    }
                ]
            },
            'flan-t5-xl': {
                'TrainingInputMode': 'File',
                'TrainingImage': '763104351884.dkr.ecr.us-east-1.amazonaws.com/huggingface-pytorch-training:2.0.0-transformers4.28.1-gpu-py310-cu118-ubuntu20.04',
                'MetricDefinitions': [
                    {
                        'Name': 'train_loss',
                        'Regex': 'train_loss: ([0-9\\.]+)'
                    }
                ]
            }
        }
        
        return model_configs.get(base_model, model_configs['llama-2-7b'])
    
    def _get_instance_cost(self, instance_type: str) -> float:
        """Get approximate hourly cost for instance type"""
        
        # Approximate costs per hour (USD) - these should be updated regularly
        instance_costs = {
            'ml.g5.2xlarge': 1.21,
            'ml.g5.4xlarge': 1.83,
            'ml.g5.8xlarge': 2.42,
            'ml.p3.2xlarge': 3.06,
            'ml.p3.8xlarge': 12.24,
            'ml.p4d.24xlarge': 37.69
        }
        
        return instance_costs.get(instance_type, 1.21)
    
    def get_training_job_status(self, job_name: str) -> Dict[str, Any]:
        """Get current status of a training job"""
        
        try:
            response = self.sagemaker_client.describe_training_job(TrainingJobName=job_name)
            
            # Calculate running time
            start_time = response.get('TrainingStartTime', response.get('CreationTime'))
            end_time = response.get('TrainingEndTime', datetime.now())
            
            if isinstance(start_time, str):
                start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            if isinstance(end_time, str):
                end_time = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            
            duration_seconds = (end_time - start_time).total_seconds()
            
            return {
                'job_name': job_name,
                'status': response['TrainingJobStatus'],
                'creation_time': response['CreationTime'].isoformat(),
                'start_time': start_time.isoformat() if start_time else None,
                'end_time': response.get('TrainingEndTime').isoformat() if response.get('TrainingEndTime') else None,
                'duration_seconds': duration_seconds,
                'instance_type': response['ResourceConfig']['InstanceType'],
                'failure_reason': response.get('FailureReason'),
                'model_artifacts_s3_uri': response.get('ModelArtifacts', {}).get('S3ModelArtifacts'),
                'training_metrics': self._extract_training_metrics(response),
                'estimated_cost': self._calculate_training_cost(
                    response['ResourceConfig']['InstanceType'],
                    duration_seconds
                )
            }
            
        except ClientError as e:
            print(f"❌ Error getting training job status: {e}")
            raise Exception(f"Failed to get training job status: {str(e)}")
    
    def _extract_training_metrics(self, response: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract training metrics from SageMaker response"""
        
        metrics = []
        final_metrics = response.get('FinalMetricDataList', [])
        
        for metric in final_metrics:
            metrics.append({
                'metric_name': metric['MetricName'],
                'value': metric['Value'],
                'timestamp': metric['Timestamp'].isoformat()
            })
        
        return metrics
    
    def _calculate_training_cost(self, instance_type: str, duration_seconds: float) -> float:
        """Calculate approximate training cost"""
        
        hourly_cost = self._get_instance_cost(instance_type)
        duration_hours = duration_seconds / 3600
        
        return round(hourly_cost * duration_hours, 2)
    
    def list_training_jobs(self, user_id: str) -> List[Dict[str, Any]]:
        """List all training jobs for a user"""
        
        try:
            response = self.sagemaker_client.list_training_jobs(
                SortBy='CreationTime',
                SortOrder='Descending',
                MaxResults=50
            )
            
            user_jobs = []
            
            for job in response['TrainingJobSummaries']:
                # Check if job belongs to user (by tags)
                job_details = self.sagemaker_client.describe_training_job(
                    TrainingJobName=job['TrainingJobName']
                )
                
                user_tag = next((tag for tag in job_details.get('Tags', []) if tag['Key'] == 'UserId'), None)
                
                if user_tag and user_tag['Value'] == user_id:
                    user_jobs.append({
                        'job_name': job['TrainingJobName'],
                        'status': job['TrainingJobStatus'],
                        'creation_time': job['CreationTime'].isoformat(),
                        'training_start_time': job.get('TrainingStartTime').isoformat() if job.get('TrainingStartTime') else None,
                        'training_end_time': job.get('TrainingEndTime').isoformat() if job.get('TrainingEndTime') else None
                    })
            
            return user_jobs
            
        except ClientError as e:
            print(f"❌ Error listing training jobs: {e}")
            return []
    
    def stop_training_job(self, job_name: str) -> Dict[str, Any]:
        """Stop a running training job"""
        
        try:
            self.sagemaker_client.stop_training_job(TrainingJobName=job_name)
            
            print(f"🛑 Training job stopped: {job_name}")
            
            return {
                'job_name': job_name,
                'status': 'Stopping',
                'stopped_at': datetime.now().isoformat()
            }
            
        except ClientError as e:
            print(f"❌ Error stopping training job: {e}")
            raise Exception(f"Failed to stop training job: {str(e)}")
    
    def prepare_training_data(self, user_id: str, uploaded_files: List[str]) -> str:
        """Prepare training data in SageMaker format (JSONL)"""
        
        try:
            # Create training dataset in JSONL format
            training_data = []
            
            for file_s3_key in uploaded_files:
                # Download file content from S3
                response = self.s3_client.get_object(Bucket=self.s3_bucket, Key=file_s3_key)
                content = response['Body'].read().decode('utf-8')
                
                # Convert to instruction format
                # This is a simplified conversion - in production, you'd want more sophisticated parsing
                lines = content.strip().split('\n')
                
                for line in lines:
                    if line.strip():
                        training_data.append({
                            'instruction': 'Continue the following text:',
                            'input': line[:100],  # First 100 chars as input
                            'output': line[100:] if len(line) > 100 else line  # Rest as output
                        })
            
            # Upload training data to S3
            training_data_key = f"users/{user_id}/training-data/train.jsonl"
            training_content = '\n'.join(json.dumps(item) for item in training_data)
            
            self.s3_client.put_object(
                Bucket=self.s3_bucket,
                Key=training_data_key,
                Body=training_content.encode('utf-8'),
                ContentType='application/jsonlines'
            )
            
            print(f"✅ Training data prepared: {len(training_data)} samples")
            print(f"📁 Training data uploaded to: s3://{self.s3_bucket}/{training_data_key}")
            
            return f"s3://{self.s3_bucket}/{training_data_key}"
            
        except Exception as e:
            print(f"❌ Error preparing training data: {e}")
            raise Exception(f"Failed to prepare training data: {str(e)}")
    
    def generate_job_name(self, user_id: str, base_model: str) -> str:
        """Generate unique training job name"""
        
        timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
        model_name = base_model.replace('/', '-').replace('_', '-')
        user_prefix = user_id[:8]  # First 8 chars of user ID
        
        return f"llm-tune-{user_prefix}-{model_name}-{timestamp}"