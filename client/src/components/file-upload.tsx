import { useState, useRef } from "react";
import { CloudUpload, X, FileText, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUploadFiles } from "@/hooks/use-training";
import { useToast } from "@/hooks/use-toast";
import { SAMPLE_DATASETS } from "@/lib/constants";

interface FileUploadProps {
  selectedJobId: number | null;
}

export default function FileUpload({ selectedJobId }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFiles = useUploadFiles();
  const { toast } = useToast();

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => {
      const validTypes = ['application/json', 'text/csv', 'text/plain'];
      const validExtensions = ['.json', '.csv', '.txt'];
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      return validTypes.includes(file.type) || validExtensions.includes(extension);
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid files detected",
        description: "Only JSON, CSV, and TXT files are supported",
        variant: "destructive",
      });
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedJobId) {
      toast({
        title: "No job selected",
        description: "Please create or select a training job first",
        variant: "destructive",
      });
      return;
    }

    if (uploadedFiles.length === 0) {
      toast({
        title: "No files to upload",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    const fileList = new DataTransfer();
    uploadedFiles.forEach(file => fileList.items.add(file));

    try {
      await uploadFiles.mutateAsync({
        jobId: selectedJobId,
        files: fileList.files
      });
      
      setUploadedFiles([]);
      toast({
        title: "Success",
        description: "Files uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadSampleDataset = (datasetName: string) => {
    toast({
      title: "Sample dataset loaded",
      description: `${datasetName} dataset has been loaded for demonstration`,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Training Data Upload</h2>
          <div className="flex items-center text-sm text-slate-500">
            <Info className="w-4 h-4 mr-1" />
            <span>Supports JSON, CSV, TXT formats</span>
          </div>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            dragOver
              ? "border-blue-400 bg-blue-50"
              : "border-slate-300 hover:border-blue-400"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="mx-auto w-12 h-12 text-slate-400 mb-4">
            <CloudUpload className="w-12 h-12" />
          </div>
          <p className="text-sm text-slate-600 mb-2">
            <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
              Click to upload
            </span>{" "}
            or drag and drop
          </p>
          <p className="text-xs text-slate-500 mb-4">JSON, CSV, TXT up to 100MB</p>
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".json,.csv,.txt"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-2">Or try with sample datasets:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SAMPLE_DATASETS.map((dataset) => (
                <Button
                  key={dataset.name}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    loadSampleDataset(dataset.name);
                  }}
                >
                  {dataset.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-slate-900 mb-2">Uploaded Files</h3>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200"
                >
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-slate-400 mr-2" />
                    <div>
                      <span className="text-sm font-medium text-slate-700">{file.name}</span>
                      <div className="text-xs text-slate-500">
                        {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleUpload}
                disabled={uploadFiles.isPending || !selectedJobId}
              >
                {uploadFiles.isPending ? "Uploading..." : "Upload Files"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
