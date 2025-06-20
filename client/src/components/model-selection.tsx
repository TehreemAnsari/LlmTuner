import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTrainingJob, useUpdateTrainingJob } from "@/hooks/use-training";
import { BASE_MODELS, TASK_TYPES } from "@/lib/constants";

interface ModelSelectionProps {
  selectedJobId: number | null;
}

export default function ModelSelection({ selectedJobId }: ModelSelectionProps) {
  const { data: job } = useTrainingJob(selectedJobId!);
  const updateJob = useUpdateTrainingJob();
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedTask, setSelectedTask] = useState("");

  useEffect(() => {
    if (job) {
      setSelectedModel(job.baseModel);
      setSelectedTask(job.taskType);
    }
  }, [job]);

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    if (selectedJobId) {
      updateJob.mutate({ id: selectedJobId, data: { baseModel: value } });
    }
  };

  const handleTaskChange = (value: string) => {
    setSelectedTask(value);
    if (selectedJobId) {
      updateJob.mutate({ id: selectedJobId, data: { taskType: value } });
    }
  };

  const selectedModelInfo = BASE_MODELS.find(model => model.value === selectedModel);

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Base Model Selection</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="baseModel" className="text-sm font-medium text-slate-700 mb-2 block">
              Select Base Model
            </Label>
            <Select value={selectedModel} onValueChange={handleModelChange} disabled={!selectedJobId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a model..." />
              </SelectTrigger>
              <SelectContent>
                {BASE_MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="taskType" className="text-sm font-medium text-slate-700 mb-2 block">
              Task Type
            </Label>
            <Select value={selectedTask} onValueChange={handleTaskChange} disabled={!selectedJobId}>
              <SelectTrigger>
                <SelectValue placeholder="Select task type..." />
              </SelectTrigger>
              <SelectContent>
                {TASK_TYPES.map((task) => (
                  <SelectItem key={task.value} value={task.value}>
                    {task.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 p-4 bg-slate-50 rounded-md">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-2" />
            <div className="text-sm text-slate-600">
              {selectedModelInfo ? (
                <>
                  <p className="font-medium mb-1">{selectedModelInfo.label}</p>
                  <p className="mb-2">{selectedModelInfo.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div>
                      <span className="font-medium">Capabilities:</span>{" "}
                      {selectedModelInfo.capabilities.join(", ")}
                    </div>
                    <div>
                      <span className="font-medium">Cost:</span> {selectedModelInfo.cost}
                    </div>
                    <div>
                      <span className="font-medium">Speed:</span> {selectedModelInfo.speed}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-medium mb-1">Select a model to view details</p>
                  <p>Choose a base model to see specifications, capabilities, and recommended use cases.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
