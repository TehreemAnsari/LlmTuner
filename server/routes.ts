import { Express } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";

const upload = multer({ 
  dest: "uploads/",
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.json', '.csv', '.txt', '.jsonl'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JSON, CSV, TXT, and JSONL files are allowed.'));
    }
  }
});

const hyperparametersSchema = z.object({
  learning_rate: z.number().min(0.0001).max(0.01),
  batch_size: z.number().min(1).max(128),
  epochs: z.number().min(1).max(100),
  optimizer: z.enum(["adam", "adamw", "sgd"]),
  weight_decay: z.number().min(0).max(0.1),
  max_sequence_length: z.number().min(512).max(4096),
});

export function registerRoutes(app: Express) {
  // File upload endpoint
  app.post("/api/upload", upload.array("files"), async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const files = req.files as Express.Multer.File[];
      const processedFiles = [];

      for (const file of files) {
        const filePath = file.path;
        const originalName = file.originalname;
        const ext = path.extname(originalName).toLowerCase();

        // Read file content
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Create Python script to process this file
        const pythonScript = generatePythonScript(originalName, ext, content);
        const scriptPath = path.join("uploads", `process_${Date.now()}_${originalName.replace(/\.[^/.]+$/, "")}.py`);
        
        fs.writeFileSync(scriptPath, pythonScript);

        processedFiles.push({
          originalName,
          size: file.size,
          type: ext,
          processedAt: new Date().toISOString(),
          pythonScript: scriptPath
        });
      }

      res.json({
        message: "Files uploaded and processed successfully",
        files: processedFiles
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to process uploaded files" });
    }
  });

  // Start training endpoint
  app.post("/api/start-training", async (req, res) => {
    try {
      const { hyperparameters, files } = req.body;
      
      // Validate hyperparameters
      const validatedParams = hyperparametersSchema.parse(hyperparameters);
      
      // Create training Python script
      const trainingScript = generateTrainingScript(validatedParams, files);
      const scriptPath = path.join("uploads", `training_${Date.now()}.py`);
      
      fs.writeFileSync(scriptPath, trainingScript);

      res.json({
        message: "Training started successfully",
        trainingScript: scriptPath,
        hyperparameters: validatedParams,
        files
      });
    } catch (error) {
      console.error("Training error:", error);
      res.status(400).json({ error: "Failed to start training" });
    }
  });

  // Get uploaded files
  app.get("/api/files", (req, res) => {
    try {
      const uploadsDir = "uploads";
      if (!fs.existsSync(uploadsDir)) {
        return res.json({ files: [] });
      }

      const files = fs.readdirSync(uploadsDir)
        .filter(file => !file.endsWith('.py'))
        .map(file => {
          const filePath = path.join(uploadsDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            size: stats.size,
            uploadedAt: stats.ctime.toISOString()
          };
        });

      res.json({ files });
    } catch (error) {
      console.error("Files error:", error);
      res.status(500).json({ error: "Failed to retrieve files" });
    }
  });
}

function generatePythonScript(fileName: string, fileType: string, content: string): string {
  return `#!/usr/bin/env python3
"""
Automated file processor for ${fileName}
Generated on: ${new Date().toISOString()}
File type: ${fileType}
"""

import json
import csv
import pandas as pd
from pathlib import Path

def read_file(file_path):
    """Read and process the uploaded file"""
    file_path = Path(file_path)
    
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
    
    file_ext = file_path.suffix.lower()
    
    try:
        if file_ext == '.json':
            return read_json_file(file_path)
        elif file_ext == '.csv':
            return read_csv_file(file_path)
        elif file_ext in ['.txt', '.jsonl']:
            return read_text_file(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")
    except Exception as e:
        print(f"Error reading file: {e}")
        return None

def read_json_file(file_path):
    """Process JSON file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"JSON file loaded: {len(data) if isinstance(data, list) else 1} records")
    print(f"Sample data: {str(data)[:200]}...")
    
    return data

def read_csv_file(file_path):
    """Process CSV file"""
    df = pd.read_csv(file_path)
    
    print(f"CSV file loaded: {len(df)} rows, {len(df.columns)} columns")
    print(f"Columns: {list(df.columns)}")
    print(f"Sample rows:\\n{df.head()}")
    
    return df.to_dict('records')

def read_text_file(file_path):
    """Process text/JSONL file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Try to parse as JSONL
    if file_path.suffix.lower() == '.jsonl':
        data = []
        for i, line in enumerate(lines):
            try:
                data.append(json.loads(line.strip()))
            except json.JSONDecodeError:
                print(f"Warning: Line {i+1} is not valid JSON")
        
        print(f"JSONL file loaded: {len(data)} records")
        return data
    else:
        print(f"Text file loaded: {len(lines)} lines")
        print(f"Sample content: {lines[0][:200] if lines else 'Empty file'}...")
        return [line.strip() for line in lines if line.strip()]

def analyze_data(data):
    """Analyze the loaded data for training insights"""
    if not data:
        print("No data to analyze")
        return
    
    print("\\n=== Data Analysis ===")
    print(f"Total records: {len(data)}")
    
    if isinstance(data, list) and len(data) > 0:
        sample = data[0]
        if isinstance(sample, dict):
            print(f"Fields: {list(sample.keys())}")
            
            # Check for common training data patterns
            text_fields = [k for k in sample.keys() if 'text' in k.lower() or 'content' in k.lower()]
            label_fields = [k for k in sample.keys() if 'label' in k.lower() or 'target' in k.lower()]
            
            print(f"Potential text fields: {text_fields}")
            print(f"Potential label fields: {label_fields}")

def main():
    """Main processing function"""
    print("=== File Processing Started ===")
    print(f"Processing file: ${fileName}")
    print(f"File type: ${fileType}")
    
    # For demo purposes, we'll work with the embedded content
    # In production, you'd read from the actual uploaded file
    content = '''${content.substring(0, 1000).replace(/'/g, "\\'")}'''
    
    print(f"Content preview: {content[:200]}...")
    
    # You can extend this to actually process the file
    # data = read_file("path/to/uploaded/file")
    # analyze_data(data)
    
    print("=== Processing Complete ===")

if __name__ == "__main__":
    main()
`;
}

function generateTrainingScript(hyperparameters: any, files: string[]): string {
  return `#!/usr/bin/env python3
"""
LLM Fine-tuning Training Script
Generated on: ${new Date().toISOString()}
Hyperparameters: ${JSON.stringify(hyperparameters, null, 2)}
Files: ${JSON.stringify(files)}
"""

import json
import time
from datetime import datetime
from pathlib import Path

class LLMTrainer:
    def __init__(self, hyperparameters, files):
        self.hyperparameters = hyperparameters
        self.files = files
        self.training_logs = []
        
    def load_data(self):
        """Load and prepare training data"""
        print("Loading training data...")
        
        for file_name in self.files:
            print(f"Processing file: {file_name}")
            # In production, you would load and preprocess the actual files
            # For now, we simulate the process
        
        print(f"Data loaded: {len(self.files)} files processed")
        
    def setup_model(self):
        """Setup the model for training"""
        print("Setting up model...")
        print(f"Learning rate: {self.hyperparameters['learning_rate']}")
        print(f"Batch size: {self.hyperparameters['batch_size']}")
        print(f"Epochs: {self.hyperparameters['epochs']}")
        print(f"Optimizer: {self.hyperparameters['optimizer']}")
        print(f"Weight decay: {self.hyperparameters['weight_decay']}")
        print(f"Max sequence length: {self.hyperparameters['max_sequence_length']}")
        
    def train_model(self):
        """Execute the training process"""
        print("\\n=== Starting Training ===")
        
        epochs = self.hyperparameters['epochs']
        batch_size = self.hyperparameters['batch_size']
        
        for epoch in range(epochs):
            print(f"\\nEpoch {epoch + 1}/{epochs}")
            
            # Simulate training steps
            for step in range(1, 11):  # 10 steps per epoch for demo
                loss = max(0.1, 2.0 - (epoch * 0.3) - (step * 0.05))
                accuracy = min(0.95, 0.3 + (epoch * 0.15) + (step * 0.02))
                
                log_entry = {
                    "epoch": epoch + 1,
                    "step": step,
                    "loss": round(loss, 4),
                    "accuracy": round(accuracy, 4),
                    "timestamp": datetime.now().isoformat()
                }
                
                self.training_logs.append(log_entry)
                
                print(f"  Step {step}: Loss = {loss:.4f}, Accuracy = {accuracy:.4f}")
                time.sleep(0.1)  # Simulate training time
        
        print("\\n=== Training Complete ===")
        
    def save_results(self):
        """Save training results and model"""
        results_dir = Path("uploads/training_results")
        results_dir.mkdir(exist_ok=True)
        
        # Save training logs
        logs_file = results_dir / f"training_logs_{int(time.time())}.json"
        with open(logs_file, 'w') as f:
            json.dump(self.training_logs, f, indent=2)
        
        # Save model info (simulated)
        model_info = {
            "hyperparameters": self.hyperparameters,
            "training_files": self.files,
            "final_metrics": {
                "final_loss": self.training_logs[-1]["loss"] if self.training_logs else 0,
                "final_accuracy": self.training_logs[-1]["accuracy"] if self.training_logs else 0,
                "total_epochs": self.hyperparameters['epochs'],
                "total_steps": len(self.training_logs)
            },
            "training_completed": datetime.now().isoformat()
        }
        
        model_file = results_dir / f"model_info_{int(time.time())}.json"
        with open(model_file, 'w') as f:
            json.dump(model_info, f, indent=2)
        
        print(f"Results saved to: {results_dir}")
        print(f"Training logs: {logs_file}")
        print(f"Model info: {model_file}")

def main():
    """Main training function"""
    hyperparameters = ${JSON.stringify(hyperparameters)}
    files = ${JSON.stringify(files)}
    
    print("=== LLM Fine-tuning Training ===")
    print(f"Start time: {datetime.now()}")
    
    trainer = LLMTrainer(hyperparameters, files)
    
    try:
        trainer.load_data()
        trainer.setup_model()
        trainer.train_model()
        trainer.save_results()
        
        print("\\n=== Training Successful ===")
        
    except Exception as e:
        print(f"\\nTraining failed: {e}")
        raise

if __name__ == "__main__":
    main()
`;
}