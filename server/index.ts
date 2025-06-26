import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import fs from "fs";
import { createServer } from "http";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}

// Create static GPT-2 tuning script on startup
function createStaticGPT2Script() {
  const scriptPath = "gpt2_tuning.py";
  
  if (!fs.existsSync(scriptPath)) {
    const scriptContent = `#!/usr/bin/env python3
"""
Static GPT-2 Fine-tuning Script
This script receives uploaded file content as dataset input
Created on application startup
"""

import sys
import json
import argparse
from datasets import Dataset
from transformers import AutoTokenizer, GPT2LMHeadModel, TrainingArguments, Trainer, DataCollatorForLanguageModeling

def install_packages():
    """Install required packages if needed"""
    import subprocess
    packages = ['datasets', 'huggingface_hub', 'fsspec', 'transformers', 'torch']
    for package in packages:
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-U', package])
        except subprocess.CalledProcessError as e:
            print(f"Failed to install {package}: {e}")

def prepare_dataset(file_content, file_type=".txt", file_name="uploaded_file"):
    """Convert uploaded file content to training dataset"""
    print(f"Preparing dataset from uploaded file: {file_name}")
    print(f"File type: {file_type}")
    
    texts = []
    
    if file_type == '.json':
        try:
            data = json.loads(file_content)
            if isinstance(data, list):
                for item in data:
                    if isinstance(item, dict):
                        # Extract text from common fields
                        text = item.get('text', '') or item.get('content', '') or item.get('description', '') or str(item)
                        if text.strip():
                            texts.append(text.strip())
                    else:
                        texts.append(str(item))
            else:
                texts.append(str(data))
        except json.JSONDecodeError:
            # Fallback to raw content
            texts = [line.strip() for line in file_content.split('\\n') if line.strip()]
    
    elif file_type == '.csv':
        lines = file_content.split('\\n')
        if len(lines) > 1:  # Skip header
            for line in lines[1:]:
                if line.strip():
                    # For CSV, combine all columns as text
                    texts.append(line.strip())
    
    elif file_type == '.jsonl':
        for line in file_content.split('\\n'):
            if line.strip():
                try:
                    data = json.loads(line)
                    text = data.get('text', '') or data.get('content', '') or str(data)
                    if text.strip():
                        texts.append(text.strip())
                except json.JSONDecodeError:
                    texts.append(line.strip())
    
    else:  # Default for .txt and other text files
        # For text files, split by lines or sentences
        texts = [line.strip() for line in file_content.split('\\n') if line.strip() and len(line.strip()) > 10]
    
    print(f"Prepared {len(texts)} text samples for training")
    if texts:
        print(f"Sample text: {texts[0][:100]}...")
        
        # Print first 5 dataset samples for verification
        print("\\n=== First 5 Dataset Samples ===")
        for i, text in enumerate(texts[:5]):
            print(f"Sample {i+1}: {text[:150]}...")
        print("===============================\\n")
    
    # Create dataset
    dataset_dict = {"text": texts}
    dataset = Dataset.from_dict(dataset_dict)
    
    return dataset

def clean_text(example):
    """Clean text data"""
    example['text'] = example['text'].strip().replace('\\n', ' ')
    return example

def tokenize_function(examples, tokenizer):
    """Tokenize the dataset"""
    return tokenizer(
        examples["text"],
        truncation=True,
        padding="max_length",
        max_length=128
    )

def main():
    parser = argparse.ArgumentParser(description='GPT-2 Fine-tuning with uploaded data')
    parser.add_argument('--file_content', required=True, help='Content of the uploaded file')
    parser.add_argument('--file_type', default='.txt', help='Type of the uploaded file')
    parser.add_argument('--file_name', default='uploaded_file', help='Name of the uploaded file')
    parser.add_argument('--output_dir', default='./gpt2_finetuned_output', help='Output directory')
    parser.add_argument('--batch_size', type=int, default=4, help='Batch size')
    parser.add_argument('--epochs', type=int, default=3, help='Number of epochs')
    parser.add_argument('--learning_rate', type=float, default=5e-5, help='Learning rate')
    
    args = parser.parse_args()
    
    print("=== GPT-2 Fine-tuning with Uploaded Data ===")
    print(f"File: {args.file_name}")
    print(f"Type: {args.file_type}")
    
    # Load pretrained GPT-2 tokenizer and model
    print("Loading GPT-2 model and tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained("gpt2")
    tokenizer.pad_token = tokenizer.eos_token
    model = GPT2LMHeadModel.from_pretrained("gpt2")
    
    # Prepare custom dataset from uploaded file content
    dataset = prepare_dataset(args.file_content, args.file_type, args.file_name)
    dataset = dataset.map(clean_text)
    
    # Tokenize the dataset
    print("Tokenizing dataset...")
    tokenized_dataset = dataset.map(
        lambda examples: tokenize_function(examples, tokenizer), 
        batched=True, 
        remove_columns=["text"]
    )
    
    # Setup data collator
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False  # For causal language modeling
    )
    
    # Define training arguments
    training_args = TrainingArguments(
        output_dir=args.output_dir,
        per_device_train_batch_size=args.batch_size,
        num_train_epochs=args.epochs,
        learning_rate=args.learning_rate,
        save_steps=500,
        logging_steps=100,
        report_to="none"  # Disable wandb
    )
    
    # Define Trainer
    print("Setting up trainer...")
    trainer = Trainer(
        model=model,
        args=training_args,
        data_collator=data_collator,
        train_dataset=tokenized_dataset,
        tokenizer=tokenizer
    )
    
    print("Starting GPT-2 fine-tuning with uploaded data...")
    print(f"Training on {len(tokenized_dataset)} samples")
    
    # Fine-tune the model
    trainer.train()
    
    # Save the fine-tuned model and tokenizer
    print("Saving fine-tuned model...")
    model.save_pretrained("gpt2_finetuned")
    tokenizer.save_pretrained("gpt2_finetuned")
    
    print("Fine-tuning completed successfully!")
    print("Model saved to: gpt2_finetuned/")

if __name__ == "__main__":
    main()
`;
    
    fs.writeFileSync(scriptPath, scriptContent);
    log(`Created static GPT-2 tuning script: ${scriptPath}`);
  } else {
    log(`Static GPT-2 tuning script already exists: ${scriptPath}`);
  }
}

// Initialize static script
createStaticGPT2Script();

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  const server = createServer(app);

  // importantly only setup vite in development and after everything else
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start the server
  const port = Number(process.env.PORT) || 3001;  // 3001 is the default port for the server
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();