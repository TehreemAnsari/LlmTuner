import { useState } from "react";
import FileUpload from "@/components/file-upload";
import Hyperparameters from "@/components/hyperparameters";

export default function Dashboard() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <main className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            LLM Fine-Tuning Platform
          </h1>
          <p className="text-gray-600">
            Upload your training data and configure hyperparameters
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <FileUpload onFilesUploaded={setUploadedFiles} />
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <Hyperparameters uploadedFiles={uploadedFiles} />
          </div>
        </div>
      </main>
    </div>
  );
}