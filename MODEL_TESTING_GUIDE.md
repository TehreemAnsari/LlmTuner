# Model Testing Guide - How to Test Your Fine-Tuned Model

## Overview
After your LLM fine-tuning job completes, the platform provides multiple ways to test and validate your model's performance. This guide covers all available testing methods.

## Testing Methods

### **Method 1: Real-Time Endpoint Testing (Recommended)**
Deploy your model to a SageMaker endpoint for immediate testing with custom prompts.

#### **Step 1: Check Training Status**
```bash
GET /api/training-job/{job_name}
```

**Expected Response for Completed Job:**
```json
{
  "job_name": "llm-tune-user123-llama-2-7b-20250105-143052",
  "status": "Completed",
  "model_artifacts_s3_uri": "s3://bucket/users/uuid/models/job-name/output/model.tar.gz",
  "training_metrics": [
    {"metric_name": "train_loss", "value": 0.245}
  ],
  "estimated_cost": 2.89
}
```

#### **Step 2: Deploy Model to Endpoint**
```bash
POST /api/deploy-model
Content-Type: application/json
Authorization: Bearer {your_jwt_token}

{
  "model_s3_uri": "s3://bucket/users/uuid/models/job-name/output/model.tar.gz",
  "model_name": "my-fine-tuned-llama2",
  "instance_type": "ml.g5.xlarge"
}
```

**Response:**
```json
{
  "message": "Model deployment initiated",
  "deployment": {
    "endpoint_name": "my-fine-tuned-llama2-endpoint",
    "status": "Creating",
    "instance_type": "ml.g5.xlarge",
    "estimated_cost_per_hour": 1.21
  }
}
```

#### **Step 3: Wait for Endpoint to be Ready**
```bash
GET /api/endpoint-status/my-fine-tuned-llama2-endpoint
```

**Wait for status: "InService" (usually 5-10 minutes)**

#### **Step 4: Test Your Model**
```bash
POST /api/invoke-model
Content-Type: application/json
Authorization: Bearer {your_jwt_token}

{
  "endpoint_name": "my-fine-tuned-llama2-endpoint",
  "input_text": "Based on the training data, explain how to..."
}
```

**Response:**
```json
{
  "result": {
    "input_text": "Based on the training data, explain how to...",
    "generated_text": "Based on the training data, explain how to handle customer complaints by first acknowledging their concern, then...",
    "endpoint_name": "my-fine-tuned-llama2-endpoint",
    "timestamp": "2025-01-05T16:45:30Z"
  },
  "status": "success"
}
```

### **Method 2: Model Download for Local Testing**
Download your trained model artifacts for testing in your own environment.

#### **Step 1: Get Download URL**
```bash
GET /api/model-download/{job_name}
Authorization: Bearer {your_jwt_token}
```

**Response:**
```json
{
  "download_url": "https://s3.amazonaws.com/bucket/path/to/model.tar.gz?presigned_params",
  "model_s3_uri": "s3://bucket/users/uuid/models/job-name/output/model.tar.gz",
  "job_name": "llm-tune-user123-llama-2-7b-20250105-143052",
  "expires_in": 3600
}
```

#### **Step 2: Download and Extract**
```bash
# Download the model
curl -o my_model.tar.gz "{download_url}"

# Extract the model files
tar -xzf my_model.tar.gz

# Contents typically include:
# - model weights (pytorch_model.bin or model.safetensors)
# - tokenizer files
# - configuration files
# - adapter weights (for LoRA fine-tuning)
```

#### **Step 3: Load Model Locally**
```python
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Load your fine-tuned model
model_path = "./extracted_model"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForCausalLM.from_pretrained(
    model_path,
    torch_dtype=torch.float16,
    device_map="auto"
)

# Test the model
def test_model(prompt):
    inputs = tokenizer(prompt, return_tensors="pt")
    with torch.no_grad():
        outputs = model.generate(
            inputs.input_ids,
            max_new_tokens=100,
            temperature=0.7,
            do_sample=True
        )
    return tokenizer.decode(outputs[0], skip_special_tokens=True)

# Example test
result = test_model("Based on my training data, how should I...")
print(result)
```

## Testing Strategies

### **1. Prompt Comparison Testing**
Compare your fine-tuned model against the base model with the same prompts.

**Test Prompts:**
```
# Domain-specific prompts based on your training data
1. "How do I handle [specific scenario from your data]?"
2. "Explain the process of [topic from your training]..."
3. "What's the best approach to [domain-specific question]?"

# General capability prompts
1. "Write a summary of..."
2. "Generate a response to..."
3. "Continue this text..."
```

### **2. Quality Assessment**
Evaluate model responses for:
- **Relevance**: Does it address the prompt appropriately?
- **Accuracy**: Is the information correct based on your training data?
- **Coherence**: Is the response well-structured and logical?
- **Style**: Does it match the tone/style of your training data?

### **3. A/B Testing**
```python
# Test same prompt with different parameters
prompts = [
    "Explain how to handle customer complaints",
    "What's the procedure for processing returns?",
    "How do you resolve billing disputes?"
]

# Test with different generation parameters
parameters = [
    {"temperature": 0.3, "top_p": 0.9},  # More focused
    {"temperature": 0.7, "top_p": 0.9},  # Balanced
    {"temperature": 1.0, "top_p": 0.9}   # More creative
]

for prompt in prompts:
    for params in parameters:
        # Test and compare outputs
        result = invoke_model(prompt, **params)
        print(f"Prompt: {prompt}")
        print(f"Params: {params}")
        print(f"Output: {result}\n")
```

## Performance Metrics

### **Automated Evaluation**
```python
# Example evaluation metrics you can implement
def evaluate_model_performance(test_prompts, expected_patterns):
    results = {
        "relevance_score": 0,
        "coherence_score": 0,
        "accuracy_score": 0,
        "total_tests": len(test_prompts)
    }
    
    for prompt, expected in zip(test_prompts, expected_patterns):
        response = invoke_model(prompt)
        
        # Check if response contains expected keywords/patterns
        relevance = check_relevance(response, expected)
        coherence = check_coherence(response)
        accuracy = check_accuracy(response, expected)
        
        results["relevance_score"] += relevance
        results["coherence_score"] += coherence
        results["accuracy_score"] += accuracy
    
    # Calculate averages
    for key in ["relevance_score", "coherence_score", "accuracy_score"]:
        results[key] /= results["total_tests"]
    
    return results
```

### **Cost Considerations**
- **Endpoint Testing**: ~$1.21/hour while endpoint is running
- **Local Testing**: No ongoing costs after download
- **Recommendation**: Use endpoint for initial testing, download for extensive evaluation

## Testing Best Practices

### **1. Start Small**
- Test with 5-10 representative prompts first
- Gradually expand test set based on initial results
- Focus on core use cases from your training data

### **2. Document Results**
```markdown
# Model Testing Results

## Test Date: 2025-01-05
## Model: llama-2-7b fine-tuned on customer support data
## Training Job: llm-tune-user123-llama-2-7b-20250105-143052

### Test Results:
1. **Prompt**: "How do I handle angry customers?"
   **Response**: "When handling angry customers, first acknowledge their concerns..."
   **Quality**: 9/10 - Excellent domain-specific response
   
2. **Prompt**: "Explain our return policy"
   **Response**: "Our return policy allows customers to..."
   **Quality**: 8/10 - Good but could be more specific
```

### **3. Compare Against Baseline**
Always test the same prompts on:
- Your fine-tuned model
- The original base model
- Competitor models (if available)

### **4. User Acceptance Testing**
- Share test results with domain experts
- Get feedback from actual users
- Iterate based on real-world usage patterns

## Troubleshooting Common Issues

### **Endpoint Deployment Fails**
```
Error: Model deployment failed
Solution: Check IAM permissions for SageMaker endpoint creation
```

### **Poor Model Performance**
```
Issue: Model outputs are generic/not domain-specific
Solutions:
- Review training data quality
- Increase training epochs
- Adjust learning rate
- Add more domain-specific examples
```

### **High Inference Costs**
```
Issue: Endpoint costs too high for testing
Solutions:
- Use smaller instance type (ml.t3.medium for testing)
- Download model for local testing
- Delete endpoint when not actively testing
```

## Integration Testing

### **API Integration**
```javascript
// Example frontend integration test
const testFineTunedModel = async () => {
  try {
    const response = await fetch('/api/invoke-model', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        endpoint_name: 'my-model-endpoint',
        input_text: 'Test prompt for my domain'
      })
    });
    
    const result = await response.json();
    console.log('Model response:', result.result.generated_text);
    
    // Validate response quality
    if (result.result.generated_text.length > 10) {
      console.log('✅ Model responding correctly');
    } else {
      console.log('❌ Model response too short');
    }
  } catch (error) {
    console.error('Model testing failed:', error);
  }
};
```

## Cleanup After Testing

### **Stop Inference Endpoint**
```bash
# To avoid ongoing costs, delete endpoint when done testing
DELETE /api/endpoint/{endpoint_name}
```

### **Local Cleanup**
```bash
# Remove downloaded model files
rm -rf ./extracted_model
rm my_model.tar.gz
```

## Next Steps After Testing

1. **Production Deployment**: If tests pass, keep endpoint for production use
2. **Model Iteration**: If performance needs improvement, retrain with better data
3. **Integration**: Integrate tested model into your applications
4. **Monitoring**: Set up ongoing performance monitoring

The platform provides comprehensive testing capabilities to ensure your fine-tuned model meets your specific requirements before production deployment.