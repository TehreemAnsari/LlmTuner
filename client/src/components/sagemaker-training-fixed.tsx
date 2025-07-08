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

// ALL 8 INSTANCE TYPES - FINAL VERSION
const ALL_INSTANCE_TYPES = [
  { id: 'ml.m5.large', name: 'ml.m5.large', cost: 0.096, description: 'CPU - ✅ RECOMMENDED: Available immediately, great for testing' },
  { id: 'ml.c5.large', name: 'ml.c5.large', cost: 0.085, description: 'CPU - ✅ Available immediately, compute optimized' },
  { id: 'ml.m5.xlarge', name: 'ml.m5.xlarge', cost: 0.192, description: 'CPU - ✅ Available immediately, more memory' },
  { id: 'ml.g5.large', name: 'ml.g5.large', cost: 0.61, description: 'GPU - ⚠️ May need quota increase request' },
  { id: 'ml.g5.xlarge', name: 'ml.g5.xlarge', cost: 1.01, description: 'GPU - ⚠️ May need quota increase request' },
  { id: 'ml.g5.2xlarge', name: 'ml.g5.2xlarge', cost: 1.21, description: 'GPU - ⚠️ May need quota increase request' },
  { id: 'ml.g5.4xlarge', name: 'ml.g5.4xlarge', cost: 1.83, description: 'GPU - ⚠️ May need quota increase request' },
  { id: 'ml.p3.2xlarge', name: 'ml.p3.2xlarge', cost: 3.06, description: 'GPU - ⚠️ May need quota increase request' }
];

console.log('🎯 NEW FILE: Loading', ALL_INSTANCE_TYPES.length, 'instance types');
console.log('🎯 Instance types:', ALL_INSTANCE_TYPES.map(i => i.id));

export default function SageMakerTrainingFixed({ uploadedFiles }: SageMakerTrainingProps) {
  const { token } = useAuth();
  const [selectedModel, setSelectedModel] = useState('llama-2-7b');
  const [selectedInstance, setSelectedInstance] = useState('ml.m5.large');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [estimatedCost, setEstimatedCost] = useState({ hourly_cost: 0.096, total_estimated_cost: 0.192 });

  const loadTrainingJobs = async () => {
    try {
      const response = await fetch('/api/training-jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const jobs = await response.json();
        setTrainingJobs(jobs);
      }
    } catch (error) {
      console.error('Error loading training jobs:', error);
    }
  };

  const updateCostEstimate = async () => {
    try {
      const response = await fetch(
        `/api/training-cost-estimate?base_model=${selectedModel}&instance_type=${selectedInstance}&estimated_hours=2.0`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const cost = await response.json();
        setEstimatedCost(cost);
      }
    } catch (error) {
      console.error('Error fetching cost estimate:', error);
    }
  };

  const startTraining = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload training files first');
      return;
    }

    setIsTraining(true);
    try {
      const response = await fetch('/api/sagemaker-training', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          base_model: selectedModel,
          instance_type: selectedInstance,
          files: uploadedFiles.map(f => f.name),
          hyperparameters: {
            learning_rate: 0.001,
            batch_size: 32,
            epochs: 10
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Training started:', result);
        await loadTrainingJobs();
      } else {
        console.error('Training failed');
      }
    } catch (error) {
      console.error('Error starting training:', error);
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
      <h2 className="text-2xl font-bold mb-6 text-green-600 bg-green-100 p-4 rounded border-4 border-green-500">
        ✅ WORKING VERSION: AWS SageMaker LLM Fine-Tuning - ALL {ALL_INSTANCE_TYPES.length} INSTANCES
      </h2>
      
      <div className="mb-4 p-3 bg-blue-50 border-4 border-blue-400 rounded-lg">
        <p className="text-sm text-blue-800 font-bold">
          🎯 SUCCESS: {ALL_INSTANCE_TYPES.length} instance types loaded from new component file!
        </p>
        <p className="text-xs text-blue-600 mt-1">
          All instances: {ALL_INSTANCE_TYPES.map(i => i.id).join(', ')}
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
          {baseModels.map((model) => (
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
          className="w-full p-3 border-4 border-green-500 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {ALL_INSTANCE_TYPES.map((instance, index) => {
            console.log(`🎯 RENDERING OPTION ${index + 1}:`, instance.id);
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
        <div className="text-xs text-gray-500 mt-1 bg-green-100 p-2 rounded">
          Available options: {ALL_INSTANCE_TYPES.length} total
        </div>
      </div>

      {/* Cost Estimation */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Cost Estimation</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Hourly Cost</p>
            <p className="text-xl font-bold text-green-600">${estimatedCost.hourly_cost}/hr</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Total (2 hours)</p>
            <p className="text-xl font-bold text-blue-600">${estimatedCost.total_estimated_cost}</p>
          </div>
        </div>
      </div>

      {/* Training Button */}
      <div className="mb-6">
        <button
          onClick={startTraining}
          disabled={isTraining || uploadedFiles.length === 0}
          className={`w-full py-3 px-4 rounded-md font-semibold ${
            isTraining || uploadedFiles.length === 0
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isTraining ? 'Starting Training...' : 'Start Training'}
        </button>
      </div>

      {/* Training Jobs */}
      {trainingJobs.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Training Jobs</h3>
          <div className="space-y-3">
            {trainingJobs.map((job, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-md font-medium text-gray-800 dark:text-white">{job.job_name}</h4>
                  <span className={`px-2 py-1 text-xs rounded ${
                    job.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    job.status === 'InProgress' ? 'bg-blue-100 text-blue-800' :
                    job.status === 'Failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>Instance: {job.instance_type}</p>
                  <p>Created: {new Date(job.creation_time).toLocaleString()}</p>
                  <p>Estimated Cost: ${job.estimated_cost}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}