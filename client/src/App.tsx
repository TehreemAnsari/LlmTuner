import { useState } from "react";
import FileUpload from "./components/file-upload";
import Hyperparameters from "./components/hyperparameters";

function App() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFilesUploaded = (files: File[]) => {
    setUploadedFiles(files);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              LLM Tuner Platform
            </h1>
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
}

export default App;