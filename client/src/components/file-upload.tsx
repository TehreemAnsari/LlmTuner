import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void;
}

export default function FileUpload({ onFilesUploaded }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [fileHistory, setFileHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuth();

  // Load file history on component mount
  useEffect(() => {
    if (token) {
      loadFileHistory();
    }
  }, [token]);

  const loadFileHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch('/api/file-history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('File history loaded:', data.files);
        setFileHistory(data.files || []);
      } else {
        console.error('Failed to load file history:', response.status);
      }
    } catch (error) {
      console.error('Error loading file history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

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
      
      // Refresh file history after upload with delay to ensure backend update
      setTimeout(() => {
        loadFileHistory();
      }, 500);
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

      {/* User File History Section - Debug: fileHistory.length={fileHistory.length} */}
      <div className="mt-8 border-t pt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="text-xs text-yellow-800 mb-2">
          DEBUG: File history loaded = {fileHistory.length} files | Loading = {loadingHistory ? 'yes' : 'no'}
        </div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">User File History</h3>
          <button
            onClick={loadFileHistory}
            disabled={loadingHistory}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            {loadingHistory ? '⟳' : '↻'} Refresh
          </button>
        </div>

        {loadingHistory ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-sm text-gray-500">Loading file history...</p>
          </div>
        ) : fileHistory.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <p className="text-xs text-gray-500 mb-2">Found {fileHistory.length} files in history</p>
            {fileHistory.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{file.name}</span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {file.type || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>Size: {file.size ? formatFileSize(file.size) : 'Unknown'}</span>
                    {file.lines && <span>Lines: {file.lines.toLocaleString()}</span>}
                    {file.upload_date && <span>Uploaded: {new Date(file.upload_date).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📁</div>
            <p className="text-sm">No files uploaded yet</p>
            <p className="text-xs mt-1">Upload your first training file to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}