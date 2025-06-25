import { useState, useRef } from "react";
import { Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void;
}

export default function FileUpload({ onFilesUploaded }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
      toast({
        title: "Invalid file type",
        description: "Please upload JSON, CSV, TXT, or JSONL files only.",
        variant: "destructive",
      });
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
      toast({
        title: "No files selected",
        description: "Please select files to upload.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append(`files`, file);
      });

      const response = await apiRequest("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Upload response:", result);

      // Show individual file success messages
      if (result.files && Array.isArray(result.files)) {
        result.files.forEach((file: any, index: number) => {
          // Use setTimeout to stagger the toasts
          setTimeout(() => {
            toast({
              title: `${file.originalName} uploaded successfully`,
              description: `File processed and Python script generated.`,
              duration: 4000,
            });
          }, index * 500);
        });
        
        // Also show a browser alert as backup
        const fileNames = result.files.map((f: any) => f.originalName).join(', ');
        alert(`Files uploaded successfully: ${fileNames}`);
      } else {
        // Fallback success message
        selectedFiles.forEach((file, index) => {
          setTimeout(() => {
            toast({
              title: `${file.name} uploaded successfully`,
              description: `File processed and Python script generated.`,
              duration: 4000,
            });
          }, index * 500);
        });
        
        const fileNames = selectedFiles.map(f => f.name).join(', ');
        alert(`Files uploaded successfully: ${fileNames}`);
      }
      
      onFilesUploaded(selectedFiles);
      setSelectedFiles([]);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Training Data Upload</h3>
        <Button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || uploading}
          size="sm"
        >
          {uploading ? "Uploading..." : "Upload Files"}
        </Button>
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
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
                <File className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}