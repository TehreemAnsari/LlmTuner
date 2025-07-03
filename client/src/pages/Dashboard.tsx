import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import FileUpload from "../components/file-upload";
import Hyperparameters from "../components/hyperparameters";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

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
              Fine-tune Large Language Models with custom datasets and hyperparameters
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <FileUpload onFilesUploaded={handleFilesUploaded} />
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <Hyperparameters uploadedFiles={uploadedFiles} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;