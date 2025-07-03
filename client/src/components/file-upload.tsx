import { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void;
}

export default function FileUpload({ onFilesUploaded }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuth();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => 
      file.type === "application/json" || 
      file.type === "text/csv" || 
      file.type === "text/plain" ||
      file.name.endsWith('.jsonl') ||
      file.name.endsWith('.txt')
    );

    if (validFiles.length !== files.length) {
      alert("Please upload JSON, CSV, TXT, or JSONL files only.");
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select files to upload.");
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append(`files`, file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      console.log("Upload response:", result);

      const fileNames = selectedFiles.map(f => f.name).join(', ');
      alert(`Files uploaded successfully: ${fileNames}`);
      
      onFilesUploaded(selectedFiles);
      setSelectedFiles([]);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Training Data Upload</h3>
        <button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || uploading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          {uploading ? "Uploading..." : "Upload Files"}
        </button>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-12 h-12 mx-auto mb-4 text-gray-400">📁</div>
        <p className="text-lg font-medium text-gray-600 mb-2">
          Drop your training files here
        </p>
        <p className="text-sm text-gray-500 mb-4">
          or click to browse (JSON, CSV, TXT, JSONL)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".json,.csv,.txt,.jsonl"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Selected Files:</h4>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-gray-500">📄</span>
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}