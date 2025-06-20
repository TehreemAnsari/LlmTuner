import { useState } from "react";
import { Plus, Download, Book, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateTrainingJob } from "@/hooks/use-training";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { TrainingJob } from "@shared/schema";

interface SidebarProps {
  jobs: TrainingJob[];
  selectedJobId: number | null;
  onSelectJob: (id: number) => void;
  isLoading: boolean;
}

export default function Sidebar({ jobs, selectedJobId, onSelectJob, isLoading }: SidebarProps) {
  const [newJobName, setNewJobName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const createJob = useCreateTrainingJob();
  const { toast } = useToast();

  const handleCreateJob = async () => {
    if (!newJobName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a job name",
        variant: "destructive",
      });
      return;
    }

    try {
      const newJob = await createJob.mutateAsync({
        name: newJobName,
        baseModel: "",
        taskType: "",
        status: "idle",
        progress: 0,
        hyperparameters: {
          learningRate: 5e-4,
          batchSize: 16,
          epochs: 3,
          warmupSteps: 100,
          weightDecay: 0.01,
          maxLength: 2048
        }
      });
      
      onSelectJob(newJob.id);
      setNewJobName("");
      setDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Training job created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create training job",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "text-amber-500";
      case "completed":
        return "text-emerald-500";
      case "failed":
        return "text-red-500";
      case "paused":
        return "text-blue-500";
      default:
        return "text-slate-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "running":
        return "Running";
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      case "paused":
        return "Paused";
      default:
        return "Idle";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="space-y-3">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Training Job
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Training Job</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="jobName">Job Name</Label>
                  <Input
                    id="jobName"
                    value={newJobName}
                    onChange={(e) => setNewJobName(e.target.value)}
                    placeholder="Enter job name..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateJob}
                    disabled={createJob.isPending}
                  >
                    {createJob.isPending ? "Creating..." : "Create Job"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Import Template
          </Button>
          
          <Button variant="outline" className="w-full">
            <Book className="w-4 h-4 mr-2" />
            View Guides
          </Button>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-slate-900 mb-3">Training Jobs</h3>
          <div className="space-y-2">
            {isLoading ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : jobs.length === 0 ? (
              <div className="p-3 text-center text-slate-500 text-sm">
                No training jobs yet. Create one to get started!
              </div>
            ) : (
              jobs.slice(0, 5).map((job) => (
                <div
                  key={job.id}
                  className={`p-3 rounded-md border cursor-pointer transition-colors ${
                    selectedJobId === job.id
                      ? "bg-blue-50 border-blue-200"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                  onClick={() => onSelectJob(job.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <Circle className={`w-2 h-2 ${getStatusColor(job.status)} fill-current mr-2`} />
                      <span className="text-sm text-slate-600 truncate">{job.name}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-xs ${getStatusColor(job.status)}`}>
                        {getStatusText(job.status)}
                      </span>
                      {job.status === "running" && (
                        <span className="text-xs text-slate-500">{job.progress}%</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
