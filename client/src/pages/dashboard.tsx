import { useState, useEffect } from "react";
import { Brain, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Sidebar from "@/components/sidebar";
import FileUpload from "@/components/file-upload";
import ModelSelection from "@/components/model-selection";
import Hyperparameters from "@/components/hyperparameters";
import TrainingProgress from "@/components/training-progress";
import PerformanceMetrics from "@/components/performance-metrics";
import { useTrainingJobs } from "@/hooks/use-training";

export default function Dashboard() {
  const { data: jobs, isLoading } = useTrainingJobs();
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  // Auto-select the most recent job
  useEffect(() => {
    if (jobs && jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Brain className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-xl font-semibold text-slate-900">LLM Tuner</h1>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-blue-600 border-b-2 border-blue-600 px-1 pt-1 pb-4 text-sm font-medium">
                Dashboard
              </a>
              <a href="#" className="text-slate-500 hover:text-slate-700 px-1 pt-1 pb-4 text-sm font-medium">
                Models
              </a>
              <a href="#" className="text-slate-500 hover:text-slate-700 px-1 pt-1 pb-4 text-sm font-medium">
                History
              </a>
              <a href="#" className="text-slate-500 hover:text-slate-700 px-1 pt-1 pb-4 text-sm font-medium">
                Documentation
              </a>
            </nav>
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="p-2">
                <Bell className="h-4 w-4 text-slate-400" />
              </Button>
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <img 
                    className="h-8 w-8 rounded-full" 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                    alt="User avatar" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar 
              jobs={jobs || []} 
              selectedJobId={selectedJobId}
              onSelectJob={setSelectedJobId}
              isLoading={isLoading}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <FileUpload selectedJobId={selectedJobId} />
            <ModelSelection selectedJobId={selectedJobId} />
            <Hyperparameters selectedJobId={selectedJobId} />
            <TrainingProgress selectedJobId={selectedJobId} />
            <PerformanceMetrics selectedJobId={selectedJobId} />
          </div>
        </div>
      </div>
    </div>
  );
}
