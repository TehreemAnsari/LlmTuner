import { useState } from "react";
import { Settings, Zap, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface HyperparametersProps {
  uploadedFiles: File[];
}

export default function Hyperparameters({ uploadedFiles }: HyperparametersProps) {
  const { toast } = useToast();
  const [training, setTraining] = useState(false);

  const [hyperparameters, setHyperparameters] = useState({
    learning_rate: 0.001,
    batch_size: 32,
    epochs: 10,
    optimizer: "adam",
    weight_decay: 0.01,
    max_sequence_length: 2048,
  });

  const handleParameterChange = (key: string, value: any) => {
    setHyperparameters(prev => ({ ...prev, [key]: value }));
  };

  const handleStartTraining = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files uploaded",
        description: "Please upload training files first.",
        variant: "destructive",
      });
      return;
    }

    setTraining(true);

    try {
      await apiRequest("/api/start-training", {
        method: "POST",
        body: JSON.stringify({
          hyperparameters,
          files: uploadedFiles.map(f => f.name),
        }),
      });

      toast({
        title: "Training started",
        description: "Your model training has begun with the specified parameters.",
      });
    } catch (error) {
      toast({
        title: "Training failed",
        description: "Failed to start training. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTraining(false);
    }
  };

  const estimatedTime = Math.round((hyperparameters.epochs * hyperparameters.batch_size) / 10);
  const estimatedCost = estimatedTime * 0.5;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold">Training Configuration</h3>
        </div>
        <Button 
          onClick={handleStartTraining} 
          disabled={uploadedFiles.length === 0 || training}
          className="flex items-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>{training ? "Starting..." : "Start Training"}</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Training Estimate</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Duration</p>
              <p className="text-lg font-bold">
                {estimatedTime * uploadedFiles.length} min
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Cost</p>
              <p className="text-lg font-bold">
                ${(estimatedCost * uploadedFiles.length).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Files</p>
              <p className="text-lg font-bold">{uploadedFiles.length}</p>
            </div>
          </div>
        </CardContent>

      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Learning Parameters</CardTitle>
            <CardDescription>Core training settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Learning Rate</Label>
              <Slider
                value={[hyperparameters.learning_rate * 10000]}
                onValueChange={(value) => handleParameterChange("learning_rate", value[0] / 10000)}
                max={100}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>0.0001</span>
                <span className="font-medium">{hyperparameters.learning_rate}</span>
                <span>0.01</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Batch Size</Label>
              <Slider
                value={[hyperparameters.batch_size]}
                onValueChange={(value) => handleParameterChange("batch_size", value[0])}
                max={128}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>1</span>
                <span className="font-medium">{hyperparameters.batch_size}</span>
                <span>128</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Epochs</Label>
              <Slider
                value={[hyperparameters.epochs]}
                onValueChange={(value) => handleParameterChange("epochs", value[0])}
                max={100}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>1</span>
                <span className="font-medium">{hyperparameters.epochs}</span>
                <span>100</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Advanced Settings</CardTitle>
            <CardDescription>Fine-tuning options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Optimizer</Label>
              <Select
                value={hyperparameters.optimizer}
                onValueChange={(value) => handleParameterChange("optimizer", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adam">Adam</SelectItem>
                  <SelectItem value="adamw">AdamW</SelectItem>
                  <SelectItem value="sgd">SGD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Weight Decay</Label>
              <Slider
                value={[hyperparameters.weight_decay * 1000]}
                onValueChange={(value) => handleParameterChange("weight_decay", value[0] / 1000)}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>0</span>
                <span className="font-medium">{hyperparameters.weight_decay}</span>
                <span>0.1</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Max Sequence Length</Label>
              <Slider
                value={[hyperparameters.max_sequence_length]}
                onValueChange={(value) => handleParameterChange("max_sequence_length", value[0])}
                max={4096}
                min={512}
                step={256}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>512</span>
                <span className="font-medium">{hyperparameters.max_sequence_length}</span>
                <span>4096</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}