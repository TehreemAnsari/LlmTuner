import { Download, Rocket, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTrainingJob } from "@/hooks/use-training";
import { useToast } from "@/hooks/use-toast";

interface PerformanceMetricsProps {
  selectedJobId: number | null;
}

export default function PerformanceMetrics({ selectedJobId }: PerformanceMetricsProps) {
  const { data: job } = useTrainingJob(selectedJobId!);
  const { toast } = useToast();

  const metrics = job?.metrics as any || {};
  const isCompleted = job?.status === "completed";

  const handleExportModel = () => {
    if (!isCompleted) {
      toast({
        title: "Training not completed",
        description: "Please wait for training to complete before exporting",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Model export started",
      description: "Your trained model is being prepared for download",
    });
    
    // In a real application, this would trigger a download
    setTimeout(() => {
      toast({
        title: "Model ready for download",
        description: "Your fine-tuned model has been packaged and is ready",
      });
    }, 3000);
  };

  const handleDeployModel = () => {
    if (!isCompleted) {
      toast({
        title: "Training not completed",
        description: "Please wait for training to complete before deploying",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Model deployment initiated",
      description: "Your model is being deployed to the inference endpoint",
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Model Performance</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Chart Placeholder */}
          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-3">Training Progress</h3>
            <div className="bg-slate-50 rounded-lg p-4 h-48 flex items-center justify-center">
              <div className="text-center text-slate-500">
                <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">
                  {job?.status === "running" 
                    ? "Training in progress - chart will update automatically"
                    : job?.status === "completed"
                    ? "Training completed - detailed charts available after export"
                    : "Training loss and accuracy chart will appear here"
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Evaluation Metrics */}
          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-3">Evaluation Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                <span className="text-sm font-medium text-slate-700">BLEU Score</span>
                <span className="text-sm font-semibold text-slate-900">
                  {metrics.bleu || (isCompleted ? "0.000" : "—")}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                <span className="text-sm font-medium text-slate-700">ROUGE-L</span>
                <span className="text-sm font-semibold text-slate-900">
                  {metrics.rouge || (isCompleted ? "0.000" : "—")}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                <span className="text-sm font-medium text-slate-700">Perplexity</span>
                <span className="text-sm font-semibold text-slate-900">
                  {metrics.perplexity || (isCompleted ? "0.0" : "—")}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                <span className="text-sm font-medium text-slate-700">F1 Score</span>
                <span className="text-sm font-semibold text-slate-900">
                  {metrics.f1 || (isCompleted ? "0.000" : "—")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Model Export */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-slate-900">Export Trained Model</h3>
              <p className="text-sm text-slate-500 mt-1">
                {isCompleted 
                  ? "Download your fine-tuned model for deployment" 
                  : "Complete training to export your model"
                }
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleExportModel}
                disabled={!isCompleted}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Model
              </Button>
              <Button
                onClick={handleDeployModel}
                disabled={!isCompleted}
                variant="outline"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Deploy
              </Button>
            </div>
          </div>
          
          {isCompleted && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                <span className="text-sm text-emerald-700 font-medium">
                  Training completed successfully! Your model is ready for export.
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
