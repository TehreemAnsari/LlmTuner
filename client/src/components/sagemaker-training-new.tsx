import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SageMakerTrainingProps {
  uploadedFiles: File[];
}

interface TrainingJob {
  job_name: string;
  status: string;
  creation_time: string;
  estimated_cost: number;
  instance_type: string;
}

const baseModels = [
  { id: 'llama-2-7b', name: 'Llama 2 7B', description: 'Meta Llama 2 7B - Good for general tasks' },
  { id: 'llama-2-13b', name: 'Llama 2 13B', description: 'Meta Llama 2 13B - Better performance, higher cost' },
  { id: 'flan-t5-xl', name: 'FLAN-T5 XL', description: 'Google FLAN-T5 XL - Instruction-tuned model' }
];

const FULL_INSTANCE_TYPES = [
  { id: 'ml.m5.large', name: 'ml.m5.large', cost: 0.096, description: 'CPU - ✅ RECOMMENDED: Available immediately, great for testing' },
  { id: 'ml.c5.large', name: 'ml.c5.large', cost: 0.085, description: 'CPU - ✅ Available immediately, compute optimized' },
  { id: 'ml.m5.xlarge', name: 'ml.m5.xlarge', cost: 0.192, description: 'CPU - ✅ Available immediately, more memory' },
  { id: 'ml.g5.large', name: 'ml.g5.large', cost: 0.61, description: 'GPU - ⚠️ May need quota increase request' },
  { id: 'ml.g5.xlarge', name: 'ml.g5.xlarge', cost: 1.01, description: 'GPU - ⚠️ May need quota increase request' },
  { id: 'ml.g5.2xlarge', name: 'ml.g5.2xlarge', cost: 1.21, description: 'GPU - ⚠️ May need quota increase request' },
  { id: 'ml.g5.4xlarge', name: 'ml.g5.4xlarge', cost: 1.83, description: 'GPU - ⚠️ May need quota increase request' },
  { id: 'ml.p3.2xlarge', name: 'ml.p3.2xlarge', cost: 3.06, description: 'GPU - ⚠️ May need quota increase request' }
];

console.log('🎯 NEW COMPONENT: Loading', FULL_INSTANCE_TYPES.length, 'instance types');

export default function SageMakerTrainingNew({ uploadedFiles }: SageMakerTrainingProps) {
  const { token } = useAuth();
  const [selectedModel, setSelectedModel] = useState('llama-2-7b');
  const [selectedInstance, setSelectedInstance] = useState('ml.m5.large');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [estimatedCost, setEstimatedCost] = useState({ hourly_cost: 0.096, total_estimated_cost: 0.192 });
  
  // Hyperparameters
  const [hyperparameters, setHyperparameters] = useState({
    learning_rate: 0.0001,
    batch_size: 4,
    epochs: 3,
    max_sequence_length: 2048,
    weight_decay: 0.01
  });

  const updateCostEstimate = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`/api/training-cost-estimate?base_model=${selectedModel}&instance_type=${selectedInstance}&estimated_hours=2.0`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEstimatedCost(data);
      }
    } catch (error) {
      console.error('Error fetching cost estimate:', error);
    }
  };

  const loadTrainingJobs = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/training-jobs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTrainingJobs(data.training_jobs);
      }
    } catch (error) {
      console.error('Error loading training jobs:', error);
    }
  };

  const startSageMakerTraining = async () => {
    if (!token || uploadedFiles.length === 0) {
      alert('Please upload training files first');
      return;
    }

    console.log('Starting training with instance:', selectedInstance);
    setIsTraining(true);

    try {
      const trainingRequest = {
        base_model: selectedModel,
        hyperparameters,
        files: uploadedFiles.map(file => file.name),
        instance_type: selectedInstance
      };

      const response = await fetch('/api/sagemaker-training', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(trainingRequest)
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ SageMaker JumpStart training job started!\n\nJob Name: ${result.job_name}\nEstimated Cost: $${result.estimated_cost_per_hour}/hour`);
        loadTrainingJobs(); // Refresh the job list
      } else {
        const error = await response.json();
        alert(`❌ Training failed: ${error.detail}`);
      }
    } catch (error) {
      console.error('Training error:', error);
      alert('❌ Training failed. Please try again.');
    } finally {
      setIsTraining(false);
    }
  };

  React.useEffect(() => {
    updateCostEstimate();
  }, [selectedModel, selectedInstance]);

  React.useEffect(() => {
    loadTrainingJobs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-green-600 bg-yellow-100 p-4 rounded border-4 border-green-500">
        ✅ NEW COMPONENT: AWS SageMaker LLM Fine-Tuning - ALL {FULL_INSTANCE_TYPES.length} INSTANCES
      </h2>
      
      <div className="mb-4 p-3 bg-green-50 border-4 border-green-400 rounded-lg">
        <p className="text-sm text-green-800 font-bold">
          🎯 FRESH COMPONENT: {FULL_INSTANCE_TYPES.length} instance types loaded successfully!
        </p>
        <p className="text-xs text-green-600 mt-1">
          All instances: {FULL_INSTANCE_TYPES.map(i => i.id).join(', ')}
        </p>
      </div>
      
      {/* Model Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Base Model
        </label>
        <select 
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {baseModels.map(model => (
            <option key={model.id} value={model.id}>
              {model.name} - {model.description}
            </option>
          ))}
        </select>
      </div>

      {/* Instance Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Instance Type
        </label>
        <select 
          value={selectedInstance}
          onChange={(e) => {
            console.log('Instance changed to:', e.target.value);
            setSelectedInstance(e.target.value);
          }}
          className="w-full p-3 border-4 border-blue-500 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {FULL_INSTANCE_TYPES.map((instance, index) => {
            console.log(`🎯 NEW: Rendering option ${index + 1}:`, instance.id);
            return (
              <option key={instance.id} value={instance.id}>
                {instance.name} - ${instance.cost}/hr - {instance.description}
              </option>
            );
          })}
        </select>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          💡 <strong>ml.m5.large</strong> is recommended - works immediately without quota increases
        </p>
        <div className="text-xs text-gray-500 mt-1 bg-blue-100 p-2 rounded">
          Available options: {FULL_INSTANCE_TYPES.length} total
        </div>
      </div>

      {/* Hyperparameters */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Hyperparameters</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Learning Rate
            </label>
            <input
              type="number"
              step="0.00001"
              value={hyperparameters.learning_rate}
              onChange={(e) => setHyperparameters({...hyperparameters, learning_rate: parseFloat(e.target.value)})}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Batch Size
            </label>
            <input
              type="number"
              value={hyperparameters.batch_size}
              onChange={(e) => setHyperparameters({...hyperparameters, batch_size: parseInt(e.target.value)})}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Epochs
            </label>
            <input
              type="number"
              value={hyperparameters.epochs}
              onChange={(e) => setHyperparameters({...hyperparameters, epochs: parseInt(e.target.value)})}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Sequence Length
            </label>
            <input
              type="number"
              value={hyperparameters.max_sequence_length}
              onChange={(e) => setHyperparameters({...hyperparameters, max_sequence_length: parseInt(e.target.value)})}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Cost Estimate */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">Cost Estimate</h3>
        <p className="text-blue-700 dark:text-blue-300">
          <strong>${estimatedCost.hourly_cost}/hour</strong> for {selectedInstance}
        </p>
        <p className="text-blue-700 dark:text-blue-300">
          Estimated total cost: <strong>${estimatedCost.total_estimated_cost}</strong> (2 hours avg)
        </p>
      </div>

      {/* Training Files Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Training Files</h3>
        {uploadedFiles.length > 0 ? (
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-green-500">✓</span>
                <span>{file.name}</span>
                <span className="text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No files uploaded yet</p>
        )}
      </div>

      {/* Start Training Button */}
      <button
        onClick={startSageMakerTraining}
        disabled={isTraining || uploadedFiles.length === 0}
        className={`w-full py-3 px-6 rounded-md font-semibold text-white transition-colors ${
          isTraining || uploadedFiles.length === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isTraining ? '🚀 Starting SageMaker Training...' : '🚀 Start SageMaker Training'}
      </button>

      {/* Training Jobs List */}
      {trainingJobs.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Training Jobs</h3>
          <div className="space-y-2">
            {trainingJobs.map((job, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div>
                  <span className="font-medium text-gray-800 dark:text-white">{job.job_name}</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    job.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    job.status === 'InProgress' ? 'bg-blue-100 text-blue-800' :
                    job.status === 'Failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(job.creation_time).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}