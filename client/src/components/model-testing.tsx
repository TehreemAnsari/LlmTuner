import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ModelTestingProps {
  trainingJobs: any[];
}

interface InferenceResult {
  generated_text: string;
  confidence: number;
  processing_time: number;
}

export default function ModelTesting({ trainingJobs }: ModelTestingProps) {
  const { token } = useAuth();
  const [selectedJob, setSelectedJob] = useState('');
  const [inputText, setInputText] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [deployedEndpoint, setDeployedEndpoint] = useState('');
  const [testResults, setTestResults] = useState<InferenceResult[]>([]);

  const completedJobs = trainingJobs.filter(job => job.status === 'Completed');

  const deployModel = async () => {
    if (!selectedJob || !token) return;
    
    setIsDeploying(true);
    try {
      const response = await fetch('/api/deploy-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          job_name: selectedJob,
          model_name: `${selectedJob}-model`,
          instance_type: 'ml.g5.xlarge'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setDeployedEndpoint(data.endpoint_name);
        alert(`Model deployed to endpoint: ${data.endpoint_name}`);
      } else {
        alert('Deployment failed');
      }
    } catch (error) {
      console.error('Deployment error:', error);
      alert('Deployment failed');
    } finally {
      setIsDeploying(false);
    }
  };

  const testModel = async () => {
    if (!deployedEndpoint || !inputText || !token) return;
    
    setIsTesting(true);
    try {
      const response = await fetch('/api/invoke-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          endpoint_name: deployedEndpoint,
          input_text: inputText
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setTestResults(prev => [result, ...prev]);
        setInputText('');
      } else {
        alert('Model inference failed');
      }
    } catch (error) {
      console.error('Inference error:', error);
      alert('Model inference failed');
    } finally {
      setIsTesting(false);
    }
  };

  const getModelDownloadUrl = async () => {
    if (!selectedJob || !token) return;
    
    try {
      const response = await fetch(`/api/model-download-url/${selectedJob}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        window.open(data.download_url, '_blank');
      } else {
        alert('Failed to get download URL');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to get download URL');
    }
  };

  if (completedJobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Model Testing</h3>
        <div className="text-gray-500 text-center py-8">
          <p className="mb-2">No completed training jobs available for testing</p>
          <p className="text-sm">Complete a training job first to test your fine-tuned model</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Model Testing & Deployment</h3>
      
      {/* Model Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Completed Training Job
        </label>
        <select
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a training job...</option>
          {completedJobs.map(job => (
            <option key={job.job_name} value={job.job_name}>
              {job.job_name} - {job.creation_time}
            </option>
          ))}
        </select>
      </div>

      {/* Model Actions */}
      {selectedJob && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={deployModel}
            disabled={isDeploying}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isDeploying ? 'Deploying...' : 'Deploy Model'}
          </button>
          
          <button
            onClick={getModelDownloadUrl}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Download Model
          </button>
        </div>
      )}

      {/* Endpoint Info */}
      {deployedEndpoint && (
        <div className="mb-6 p-4 bg-green-50 rounded-md">
          <h4 className="font-medium text-green-800 mb-2">Model Deployed Successfully</h4>
          <p className="text-green-700 text-sm">Endpoint: {deployedEndpoint}</p>
        </div>
      )}

      {/* Testing Interface */}
      {deployedEndpoint && (
        <div className="mb-6">
          <h4 className="font-medium mb-3">Test Your Model</h4>
          <div className="space-y-3">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to test your fine-tuned model..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
            <button
              onClick={testModel}
              disabled={isTesting || !inputText.trim()}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {isTesting ? 'Testing...' : 'Test Model'}
            </button>
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Test Results</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-md">
                <div className="font-medium text-sm text-gray-600 mb-1">
                  Generated Text:
                </div>
                <p className="text-gray-800 mb-2">{result.generated_text}</p>
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>Confidence: {(result.confidence * 100).toFixed(1)}%</span>
                  <span>Processing time: {result.processing_time.toFixed(2)}s</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="font-medium mb-2">Testing Options</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Deploy Model:</strong> Creates a real-time inference endpoint</li>
          <li>• <strong>Download Model:</strong> Get model files for local testing</li>
          <li>• <strong>Web Testing:</strong> Test directly through this interface</li>
          <li>• <strong>API Access:</strong> Use REST API for integration</li>
        </ul>
      </div>
    </div>
  );
}