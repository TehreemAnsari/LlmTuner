import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import FileUpload from "../components/file-upload";
import SageMakerTraining from "../components/sagemaker-training";
import ModelTesting from "../components/model-testing";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<'sagemaker' | 'testing'>('sagemaker');
  const [trainingJobs, setTrainingJobs] = useState<any[]>([]);

  const handleFilesUploaded = (files: File[]) => {
    setUploadedFiles(files);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                LLM Tuner Platform
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.full_name || user?.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {user?.provider === 'google' ? 'Google Account' : 'Email Account'}
                </span>
              </div>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <p className="text-gray-600">
              AWS SageMaker training for Large Language Models with custom datasets
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <FileUpload onFilesUploaded={handleFilesUploaded} />
            </div>

            {/* Training Options Tabs */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('sagemaker')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'sagemaker'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    🚀 AWS SageMaker Training
                  </button>

                  <button
                    onClick={() => setActiveTab('testing')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'testing'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    🧪 Model Testing
                  </button>
                </nav>
              </div>
              
              <div className="p-6">
                {activeTab === 'sagemaker' ? (
                  <SageMakerTraining uploadedFiles={uploadedFiles} />
                ) : (
                  <ModelTesting trainingJobs={trainingJobs} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;