import React, { useState, useEffect } from 'react';
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

// Instance types for SageMaker training
const instanceTypes = [
  { id: 'ml.m5.large', name: 'ml.m5.large', cost: 0.096, description: 'CPU - ✅ RECOMMENDED: Available immediately, great for testing' },
  { id: 'ml.c5.large', name: 'ml.c5.large', cost: 0.085, description: 'CPU - ✅ Available immediately, compute optimized' },
  { id: 'ml.m5.xlarge', name: 'ml.m5.xlarge', cost: 0.192, description: 'CPU - ✅ Available immediately, more memory' },
  { id: 'ml.g5.large', name: 'ml.g5.large', cost: 0.61, description: 'GPU - ⚠️ May need quota increase request' },
  { id: 'ml.g5.xlarge', name: 'ml.g5.xlarge', cost: 1.01, description: 'GPU - ⚠️ May need quota increase request' },
  { id: 'ml.g5.2xlarge', name: 'ml.g5.2xlarge', cost: 1.21, description: 'GPU - ⚠️ May need quota increase request' },
  { id: 'ml.g5.4xlarge', name: 'ml.g5.4xlarge', cost: 1.83, description: 'GPU - ⚠️ May need quota increase request' },
  { id: 'ml.p3.2xlarge', name: 'ml.p3.2xlarge', cost: 3.06, description: 'GPU - ⚠️ May need quota increase request' }
];



export default function SageMakerTraining({ uploadedFiles }: SageMakerTrainingProps) {
  const { token } = useAuth();
  const [selectedModel, setSelectedModel] = useState('llama-2-7b');
  const [selectedInstance, setSelectedInstance] = useState('ml.m5.large');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [estimatedCost, setEstimatedCost] = useState({ hourly_cost: 0.096, total_estimated_cost: 0.192 });
  const [trainingStarted, setTrainingStarted] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [progressUpdates, setProgressUpdates] = useState<string[]>([]);
  const [activeJobName, setActiveJobName] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalData, setSuccessModalData] = useState<any>(null);
  const [isTrainingActive, setIsTrainingActive] = useState(false);
  const [currentTrainingJob, setCurrentTrainingJob] = useState<string | null>(null);

  const loadTrainingJobs = async () => {
    try {
      const response = await fetch('/api/training-jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTrainingJobs(data.training_jobs || []);
        
        // Check for active training jobs
        const activeJobs = data.training_jobs?.filter((job: TrainingJob) => 
          job.status === 'InProgress' || job.status === 'Starting'
        );
        
        if (activeJobs && activeJobs.length > 0) {
          setActiveJobName(activeJobs[0].job_name);
          setIsTrainingActive(true);
          setCurrentTrainingJob(activeJobs[0].job_name);
        } else {
          setIsTrainingActive(false);
          setCurrentTrainingJob(null);
        }
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
    console.log('SageMaker startTraining function called');
    alert('TEST: SageMaker function was called!');
    if (uploadedFiles.length === 0) {
      alert('Please upload training files first');
      return;
    }

    setIsTraining(true);
    console.log('Making SageMaker API call...');
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

      console.log('SageMaker API response received, status:', response.status);
      if (response.ok) {
        const result = await response.json();
        console.log('Training started:', result);
        
        // IMMEDIATELY show browser alert first
        console.log('About to show SageMaker alert for job:', result.job_name);
        alert(`🎉 SAGEMAKER TRAINING STARTED SUCCESSFULLY!\n\nJob: ${result.job_name}\nInstance: ${selectedInstance}\nModel: ${selectedModel}\nFiles: ${uploadedFiles.length}\nSamples: ${result.total_samples || 'Processing...'}\nCost: $${estimatedCost.hourly_cost}/hour\n\n⚠️ IMPORTANT: Do NOT start another training job until this one completes (1-4 hours)!`);
        console.log('SageMaker alert should have appeared');
        
        // Show immediate success modal
        const modalData = {
          jobName: result.job_name,
          instance: selectedInstance,
          model: selectedModel,
          filesCount: uploadedFiles.length,
          samples: result.total_samples || 'Processing...',
          cost: estimatedCost.hourly_cost
        };
        console.log('Setting success modal data:', modalData);
        
        // Force React state update with setTimeout to ensure state update happens
        setTimeout(() => {
          setSuccessModalData(modalData);
          setShowSuccessModal(true);
          console.log('Success modal should now be visible, showSuccessModal:', true, 'successModalData:', modalData);
        }, 100);
        
        // Alert was already shown above
        
        // Show success message and set up progress tracking
        setTrainingStarted(true);
        setActiveJobName(result.job_name);
        setIsTrainingActive(true);
        setCurrentTrainingJob(result.job_name);
        setLastUpdateTime(new Date());
        setProgressUpdates([
          `Training job "${result.job_name}" started successfully!`,
          `Using ${selectedInstance} instance with ${selectedModel} model`,
          `Training ${uploadedFiles.length} files with ${result.total_samples || 'unknown'} samples`,
          `Estimated cost: $${estimatedCost.hourly_cost}/hour`
        ]);
        
        // Start periodic progress updates
        startProgressUpdates(result.job_name);
        
        await loadTrainingJobs();
      } else {
        console.log('SageMaker API call failed with status:', response.status);
        const errorData = await response.json();
        console.error('Training failed:', errorData);
        alert('Training failed: ' + errorData.detail);
      }
    } catch (error) {
      console.error('Error starting SageMaker training:', error);
      alert('Error starting training: ' + error.message);
    } finally {
      setIsTraining(false);
    }
  };

  // Progress monitoring functions
  const startProgressUpdates = (jobName: string) => {
    const interval = setInterval(async () => {
      await checkTrainingProgress(jobName);
    }, 30 * 60 * 1000); // Check every 30 minutes

    // Clear interval after 4 hours (typical training duration)
    setTimeout(() => {
      clearInterval(interval);
    }, 4 * 60 * 60 * 1000);
  };

  const checkTrainingProgress = async (jobName: string) => {
    try {
      const response = await fetch(`/api/training-job/${jobName}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const status = await response.json();
        const now = new Date();
        
        // Calculate elapsed time
        const startTime = new Date(status.creation_time);
        const elapsedMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
        
        let updateMessage = '';
        
        if (status.status === 'InProgress') {
          updateMessage = `🔄 Training in progress (${elapsedMinutes} minutes elapsed)`;
        } else if (status.status === 'Completed') {
          updateMessage = `✅ Training completed successfully! (Total time: ${elapsedMinutes} minutes)`;
          setTrainingStarted(false);
          setActiveJobName(null);
          setIsTrainingActive(false);
          setCurrentTrainingJob(null);
        } else if (status.status === 'Failed') {
          updateMessage = `❌ Training failed after ${elapsedMinutes} minutes. Check logs for details.`;
          setTrainingStarted(false);
          setActiveJobName(null);
          setIsTrainingActive(false);
          setCurrentTrainingJob(null);
        } else if (status.status === 'Stopped') {
          updateMessage = `⏸️ Training stopped after ${elapsedMinutes} minutes.`;
          setTrainingStarted(false);
          setActiveJobName(null);
          setIsTrainingActive(false);
          setCurrentTrainingJob(null);
        }
        
        if (updateMessage) {
          setProgressUpdates(prev => [...prev, updateMessage]);
          setLastUpdateTime(now);
        }
        
        // Refresh training jobs list
        await loadTrainingJobs();
      }
    } catch (error) {
      console.error('Error checking training progress:', error);
    }
  };

  React.useEffect(() => {
    updateCostEstimate();
  }, [selectedModel, selectedInstance]);

  React.useEffect(() => {
    loadTrainingJobs();
  }, []);

  // Check for existing active training jobs and resume monitoring
  React.useEffect(() => {
    if (activeJobName && !trainingStarted) {
      setTrainingStarted(true);
      startProgressUpdates(activeJobName);
    }
  }, [activeJobName]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        AWS SageMaker LLM Fine-Tuning
      </h2>

      {/* Training Success Message */}
      {trainingStarted && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Training Started Successfully!</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Your model training job has been initiated. You'll receive progress updates every 30-60 minutes.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Updates */}
      {progressUpdates.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-3">Training Progress Updates</h3>
          <div className="space-y-2">
            {progressUpdates.map((update, index) => (
              <div key={index} className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span className="text-sm text-blue-700">{update}</span>
              </div>
            ))}
          </div>
          {lastUpdateTime && (
            <div className="mt-3 text-xs text-blue-600">
              Last update: {lastUpdateTime.toLocaleString()}
            </div>
          )}
        </div>
      )}

      {/* Success Modal - Debug: showSuccessModal={String(showSuccessModal)}, hasData={String(!!successModalData)} */}
      {console.log('Rendering success modal check:', showSuccessModal, !!successModalData)}
      {showSuccessModal && successModalData && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-lg w-full mx-4 border-4 border-green-400 shadow-2xl">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-800 mb-4">
                <svg className="h-8 w-8 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                🎉 Training Started Successfully!
              </h3>
              <p className="text-lg text-green-600 dark:text-green-400 font-medium">
                Your model is now being trained on AWS SageMaker
              </p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Job Name:</p>
                <p className="font-medium text-gray-900 dark:text-white">{successModalData.jobName}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Instance:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{successModalData.instance}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Model:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{successModalData.model}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Files:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{successModalData.filesCount}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Samples:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{successModalData.samples}</p>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-sm text-blue-600 dark:text-blue-400">Estimated Cost:</p>
                <p className="font-medium text-blue-900 dark:text-blue-300">${successModalData.cost}/hour</p>
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6 border-2 border-red-200">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-bold text-red-800 dark:text-red-200">
                  IMPORTANT: Do not start another training job!
                </p>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                This training job will take 1-4 hours to complete. Starting multiple jobs will cost extra money. Wait for this job to finish before training another model.
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                📋 You will receive progress updates every 30-60 minutes while training is in progress. The training button will be disabled until this job completes.
              </p>
            </div>
            
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500 transform hover:scale-105 transition-all duration-200"
            >
              I Understand - Continue Monitoring
            </button>
          </div>
        </div>
      )}
      
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
          onChange={(e) => setSelectedInstance(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {instanceTypes.map((instance) => (
            <option key={instance.id} value={instance.id}>
              {instance.name} - ${instance.cost}/hr - {instance.description}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          <strong>ml.m5.large</strong> is recommended - works immediately without quota increases
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {instanceTypes.length} instance types available
        </p>
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

      {/* Active Training Warning */}
      {isTrainingActive && (
        <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">Training Already in Progress</h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>Job "{currentTrainingJob}" is currently running. Please wait for it to complete before starting a new training job.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Training Button */}
      <div className="mb-6">
        <button
          onClick={startTraining}
          disabled={isTraining || uploadedFiles.length === 0 || isTrainingActive}
          className={`w-full py-3 px-4 rounded-md font-semibold ${
            isTraining || uploadedFiles.length === 0 || isTrainingActive
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isTraining ? 'Starting SageMaker Training...' : 
           isTrainingActive ? 'SageMaker Training in Progress - Please Wait' : 
           '🚀 Start AWS SageMaker Training'}
        </button>
        
        {isTrainingActive && (
          <p className="mt-2 text-sm text-orange-600 text-center">
            ⚠️ You cannot start multiple training jobs simultaneously. Wait for the current job to complete.
          </p>
        )}
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