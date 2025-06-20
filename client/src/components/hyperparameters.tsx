import { useEffect, useState } from "react";
import { Wand2, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { useTrainingJob, useUpdateTrainingJob, useEstimate } from "@/hooks/use-training";
import { HYPERPARAMETER_TEMPLATES } from "@/lib/constants";
import type { Hyperparameters } from "@shared/schema";

interface HyperparametersProps {
  selectedJobId: number | null;
}

export default function Hyperparameters({ selectedJobId }: HyperparametersProps) {
  const { data: job } = useTrainingJob(selectedJobId!);
  const updateJob = useUpdateTrainingJob();
  const estimate = useEstimate();
  
  const [hyperparams, setHyperparams] = useState<Hyperparameters>({
    learningRate: 5e-4,
    batchSize: 16,
    epochs: 3,
    warmupSteps: 100,
    weightDecay: 0.01,
    maxLength: 2048,
  });
  
  const [estimates, setEstimates] = useState({
    estimatedCost: "$25.00",
    estimatedTime: "~30min",
    totalTokens: "125K"
  });

  useEffect(() => {
    if (job?.hyperparameters) {
      setHyperparams(job.hyperparameters as Hyperparameters);
    }
  }, [job]);

  useEffect(() => {
    if (job?.baseModel && job?.taskType) {
      estimate.mutate({
        baseModel: job.baseModel,
        taskType: job.taskType,
        hyperparameters: hyperparams,
        dataSize: 1000 // Mock data size
      }, {
        onSuccess: (data) => {
          setEstimates(data);
        }
      });
    }
  }, [hyperparams, job?.baseModel, job?.taskType]);

  const updateHyperparameter = (key: keyof Hyperparameters, value: number) => {
    const newHyperparams = { ...hyperparams, [key]: value };
    setHyperparams(newHyperparams);
    
    if (selectedJobId) {
      updateJob.mutate({
        id: selectedJobId,
        data: { hyperparameters: newHyperparams }
      });
    }
  };

  const autoConfigureHyperparameters = () => {
    if (!job?.taskType) return;
    
    const template = HYPERPARAMETER_TEMPLATES[job.taskType as keyof typeof HYPERPARAMETER_TEMPLATES];
    if (template) {
      setHyperparams(template);
      if (selectedJobId) {
        updateJob.mutate({
          id: selectedJobId,
          data: { hyperparameters: template }
        });
      }
    }
  };

  const resetToDefaults = () => {
    const defaults: Hyperparameters = {
      learningRate: 5e-4,
      batchSize: 16,
      epochs: 3,
      warmupSteps: 100,
      weightDecay: 0.01,
      maxLength: 2048,
    };
    setHyperparams(defaults);
    if (selectedJobId) {
      updateJob.mutate({
        id: selectedJobId,
        data: { hyperparameters: defaults }
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Hyperparameters</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={autoConfigureHyperparameters}
              disabled={!job?.taskType}
            >
              <Wand2 className="w-4 h-4 mr-1" />
              Auto-Configure
            </Button>
            <Button variant="outline" size="sm" onClick={resetToDefaults}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Training Parameters */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-900 border-b border-slate-200 pb-2">
              Training Parameters
            </h3>

            {/* Learning Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center">
                  Learning Rate
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3 h-3 ml-1 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Controls how much to change the model in response to the estimated error</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <span className="text-sm text-slate-500">{hyperparams.learningRate.toExponential(1)}</span>
              </div>
              <input
                type="range"
                min="1e-6"
                max="1e-2"
                step="1e-6"
                value={hyperparams.learningRate}
                onChange={(e) => updateHyperparameter('learningRate', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>1e-6</span>
                <span>1e-2</span>
              </div>
            </div>

            {/* Batch Size */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center">
                  Batch Size
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3 h-3 ml-1 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Number of training examples processed simultaneously</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <span className="text-sm text-slate-500">{hyperparams.batchSize}</span>
              </div>
              <input
                type="range"
                min="1"
                max="64"
                step="1"
                value={hyperparams.batchSize}
                onChange={(e) => updateHyperparameter('batchSize', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>1</span>
                <span>64</span>
              </div>
            </div>

            {/* Epochs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium text-slate-700 flex items-center">
                  Epochs
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3 h-3 ml-1 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Number of complete passes through the training dataset</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <span className="text-sm text-slate-500">{hyperparams.epochs}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={hyperparams.epochs}
                onChange={(e) => updateHyperparameter('epochs', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>1</span>
                <span>10</span>
              </div>
            </div>
          </div>

          {/* Advanced Parameters */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-900 border-b border-slate-200 pb-2">
              Advanced Parameters
            </h3>

            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">Warmup Steps</Label>
              <Input
                type="number"
                value={hyperparams.warmupSteps}
                onChange={(e) => updateHyperparameter('warmupSteps', parseInt(e.target.value) || 0)}
                min="0"
                max="1000"
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">Weight Decay</Label>
              <Input
                type="number"
                value={hyperparams.weightDecay}
                onChange={(e) => updateHyperparameter('weightDecay', parseFloat(e.target.value) || 0)}
                min="0"
                max="1"
                step="0.001"
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">Max Sequence Length</Label>
              <Select 
                value={hyperparams.maxLength.toString()} 
                onValueChange={(value) => updateHyperparameter('maxLength', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="512">512 tokens</SelectItem>
                  <SelectItem value="1024">1024 tokens</SelectItem>
                  <SelectItem value="2048">2048 tokens</SelectItem>
                  <SelectItem value="4096">4096 tokens</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Cost and Time Estimation */}
        <div className="mt-6 p-4 bg-slate-50 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-semibold text-slate-900">
                {estimates.estimatedCost}
              </div>
              <div className="text-sm text-slate-500">Estimated Cost</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900">
                {estimates.estimatedTime}
              </div>
              <div className="text-sm text-slate-500">Training Time</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900">
                {estimates.totalTokens}
              </div>
              <div className="text-sm text-slate-500">Total Tokens</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
