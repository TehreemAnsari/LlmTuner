import { useState } from "react";

interface HyperparametersProps {
  uploadedFiles: File[];
}

export default function Hyperparameters({ uploadedFiles }: HyperparametersProps) {
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
      alert("Please upload training files first.");
      return;
    }

    setTraining(true);

    try {
      const response = await fetch("/api/start-training", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hyperparameters,
          files: uploadedFiles.map(f => f.name),
        }),
      });

      if (!response.ok) {
        throw new Error('Training failed to start');
      }

      alert("Training started successfully!");
    } catch (error) {
      console.error("Training error:", error);
      alert("Failed to start training. Please try again.");
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
          <span className="text-gray-500">⚙️</span>
          <h3 className="text-lg font-semibold">Training Configuration</h3>
        </div>
        <button 
          onClick={handleStartTraining} 
          disabled={uploadedFiles.length === 0 || training}
          className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
        >
          <span>▶️</span>
          <span>{training ? "Starting..." : "Start Training"}</span>
        </button>
      </div>

      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center space-x-2 mb-4">
          <span>⚡</span>
          <h4 className="font-medium">Training Estimate</h4>
        </div>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <div className="mb-4">
            <h4 className="font-medium">Learning Parameters</h4>
            <p className="text-sm text-gray-600">Core training settings</p>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Learning Rate</label>
              <input
                type="range"
                min="1"
                max="100"
                value={hyperparameters.learning_rate * 10000}
                onChange={(e) => handleParameterChange("learning_rate", Number(e.target.value) / 10000)}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>0.0001</span>
                <span className="font-medium">{hyperparameters.learning_rate}</span>
                <span>0.01</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Batch Size</label>
              <input
                type="range"
                min="1"
                max="128"
                value={hyperparameters.batch_size}
                onChange={(e) => handleParameterChange("batch_size", Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>1</span>
                <span className="font-medium">{hyperparameters.batch_size}</span>
                <span>128</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Epochs</label>
              <input
                type="range"
                min="1"
                max="100"
                value={hyperparameters.epochs}
                onChange={(e) => handleParameterChange("epochs", Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>1</span>
                <span className="font-medium">{hyperparameters.epochs}</span>
                <span>100</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="mb-4">
            <h4 className="font-medium">Advanced Settings</h4>
            <p className="text-sm text-gray-600">Fine-tuning options</p>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Optimizer</label>
              <select
                value={hyperparameters.optimizer}
                onChange={(e) => handleParameterChange("optimizer", e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="adam">Adam</option>
                <option value="adamw">AdamW</option>
                <option value="sgd">SGD</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Weight Decay</label>
              <input
                type="range"
                min="0"
                max="100"
                value={hyperparameters.weight_decay * 1000}
                onChange={(e) => handleParameterChange("weight_decay", Number(e.target.value) / 1000)}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>0</span>
                <span className="font-medium">{hyperparameters.weight_decay}</span>
                <span>0.1</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Max Sequence Length</label>
              <input
                type="range"
                min="512"
                max="4096"
                step="256"
                value={hyperparameters.max_sequence_length}
                onChange={(e) => handleParameterChange("max_sequence_length", Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>512</span>
                <span className="font-medium">{hyperparameters.max_sequence_length}</span>
                <span>4096</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}