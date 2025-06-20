import { useEffect, useRef } from "react";
import { Play, Pause, Square, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTrainingJob, useStartTraining, usePauseTraining, useStopTraining, useTrainingLogs } from "@/hooks/use-training";
import { useToast } from "@/hooks/use-toast";

interface TrainingProgressProps {
  selectedJobId: number | null;
}

export default function TrainingProgress({ selectedJobId }: TrainingProgressProps) {
  const { data: job, refetch } = useTrainingJob(selectedJobId!);
  const { data: logs } = useTrainingLogs(selectedJobId!);
  const startTraining = useStartTraining();
  const pauseTraining = usePauseTraining();
  const stopTraining = useStopTraining();
  const { toast } = useToast();
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Auto-refresh job data when training is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (job?.status === "running") {
      interval = setInterval(() => {
        refetch();
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [job?.status, refetch]);

  const handleStart = async () => {
    if (!selectedJobId) return;
    
    try {
      await startTraining.mutateAsync(selectedJobId);
      toast({
        title: "Training started",
        description: "Your model training has begun",
      });
    } catch (error) {
      toast({
        title: "Failed to start training",
        description: "Please check your configuration and try again",
        variant: "destructive",
      });
    }
  };

  const handlePause = async () => {
    if (!selectedJobId) return;
    
    try {
      await pauseTraining.mutateAsync(selectedJobId);
      toast({
        title: "Training paused",
        description: "You can resume training later",
      });
    } catch (error) {
      toast({
        title: "Failed to pause training",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleStop = async () => {
    if (!selectedJobId) return;
    
    try {
      await stopTraining.mutateAsync(selectedJobId);
      toast({
        title: "Training stopped",
        description: "Training has been terminated",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Failed to stop training",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const downloadLogs = () => {
    if (!logs) return;
    
    const logText = logs.map((log: any) => 
      `[${new Date(log.timestamp).toLocaleString()}] ${log.level.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training-logs-${selectedJobId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusMessage = () => {
    if (!job) return "No job selected";
    
    switch (job.status) {
      case "running":
        return "Training in progress...";
      case "completed":
        return "Training completed successfully";
      case "paused":
        return "Training paused";
      case "failed":
        return "Training failed";
      default:
        return "Training ready to start";
    }
  };

  const metrics = job?.metrics as any || {};

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Training Status</h2>

        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>{getStatusMessage()}</span>
              <span>{job?.progress || 0}%</span>
            </div>
            <Progress value={job?.progress || 0} className="h-2" />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>
                {metrics.currentStep ? `Step ${metrics.currentStep}/${metrics.totalSteps}` : "Step 0/0"}
              </span>
              <span>
                {job?.status === "running" ? "ETA: 12 min" : "Not running"}
              </span>
            </div>
          </div>

          {/* Live Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-3 rounded-md text-center">
              <div className="text-lg font-semibold text-slate-900">
                {metrics.loss || "0.000"}
              </div>
              <div className="text-xs text-slate-500">Training Loss</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-md text-center">
              <div className="text-lg font-semibold text-slate-900">
                {metrics.accuracy ? `${metrics.accuracy}%` : "0.0%"}
              </div>
              <div className="text-xs text-slate-500">Accuracy</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-md text-center">
              <div className="text-lg font-semibold text-slate-900">
                {metrics.learningRate || "0.0e-0"}
              </div>
              <div className="text-xs text-slate-500">Current LR</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-md text-center">
              <div className="text-lg font-semibold text-slate-900">
                {metrics.throughput ? `${metrics.throughput}` : "0"}
              </div>
              <div className="text-xs text-slate-500">Tokens/sec</div>
            </div>
          </div>

          {/* Training Logs */}
          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-2">Training Logs</h3>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-md h-32 overflow-y-auto text-sm font-mono training-logs">
              {logs && logs.length > 0 ? (
                logs.map((log: any, index: number) => (
                  <div 
                    key={index} 
                    className={`
                      ${log.level === 'error' ? 'text-red-400' : 
                        log.level === 'warning' ? 'text-yellow-400' : 
                        log.level === 'info' ? 'text-white' : 'text-slate-300'}
                    `}
                  >
                    [{new Date(log.timestamp).toLocaleTimeString()}] {log.level.toUpperCase()}: {log.message}
                  </div>
                ))
              ) : (
                <div className="text-slate-400">
                  {selectedJobId ? "No logs available. Start training to see logs." : "Select a training job to view logs."}
                </div>
              )}
              <div ref={logsEndRef} />
              {job?.status === "running" && (
                <div className="animate-pulse text-white">█</div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <div className="space-x-2">
              <Button
                onClick={handleStart}
                disabled={!selectedJobId || job?.status === "running" || startTraining.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="w-4 h-4 mr-2" />
                {startTraining.isPending ? "Starting..." : "Start Training"}
              </Button>
              
              <Button
                onClick={handlePause}
                disabled={!selectedJobId || job?.status !== "running" || pauseTraining.isPending}
                className="bg-amber-500 hover:bg-amber-600"
              >
                <Pause className="w-4 h-4 mr-2" />
                {pauseTraining.isPending ? "Pausing..." : "Pause"}
              </Button>
              
              <Button
                onClick={handleStop}
                disabled={!selectedJobId || job?.status === "idle" || stopTraining.isPending}
                variant="destructive"
              >
                <Square className="w-4 h-4 mr-2" />
                {stopTraining.isPending ? "Stopping..." : "Stop"}
              </Button>
            </div>
            
            <Button variant="outline" onClick={downloadLogs} disabled={!logs || logs.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Download Logs
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
