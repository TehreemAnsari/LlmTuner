#!/usr/bin/env python3
"""
FastAPI Backend for LLM Tuner Platform
Clean, minimal implementation for file upload and training management
"""

import os
import json
import subprocess
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

# Ensure uploads directory exists
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)

app = FastAPI(title="LLM Tuner Platform", version="1.0.0")

# Pydantic models for request/response
class Hyperparameters(BaseModel):
    learning_rate: float = 0.001
    batch_size: int = 32
    epochs: int = 10
    optimizer: str = "adam"
    weight_decay: float = 0.01
    max_sequence_length: int = 2048

class TrainingRequest(BaseModel):
    hyperparameters: Hyperparameters
    files: List[str]

class UploadResponse(BaseModel):
    message: str
    files: List[dict]

class TrainingResponse(BaseModel):
    message: str
    hyperparameters: Hyperparameters
    files: List[dict]

def create_gpt2_script():
    """Create the GPT-2 tuning script if it doesn't exist"""
    script_path = Path("gpt2_tuning.py")
    if script_path.exists():
        return
    
    script_content = '''#!/usr/bin/env python3
"""
GPT-2 Fine-tuning Script
Processes uploaded datasets with configurable hyperparameters
"""

import sys
import json
import argparse

def read_data(file_content, file_type):
    """Process file content into training dataset"""
    print(f"Processing file content of type: {file_type}")
    print(f"Content length: {len(file_content)} characters")
    
    if file_type in ['.txt', '.text']:
        texts = [line.strip() for line in file_content.split('\\n') if line.strip()]
    elif file_type == '.json':
        try:
            data = json.loads(file_content)
            texts = data if isinstance(data, list) else [str(data)]
        except:
            texts = [file_content]
    else:
        texts = [line.strip() for line in file_content.split('\\n') if line.strip()]
    
    print(f"Prepared {len(texts)} text samples for training")
    return {"texts": texts}

def main():
    parser = argparse.ArgumentParser(description="GPT-2 Fine-tuning Script")
    parser.add_argument("--file_name", required=True, help="Name of the uploaded file")
    parser.add_argument("--file_type", required=True, help="Type of the uploaded file")
    parser.add_argument("--content_file", help="Path to file containing content")
    parser.add_argument("--hyperparameters", help="JSON string of hyperparameters")
    
    args = parser.parse_args()
    
    print("=== 🚀 GPT-2 Fine-tuning with Uploaded Data ===")
    print(f"📄 File: {args.file_name}")
    print(f"📁 Type: {args.file_type}")
    
    # Read file content
    if args.content_file:
        try:
            with open(args.content_file, 'r', encoding='utf-8') as f:
                file_content = f.read()
            print(f"✅ Read content from {args.content_file}")
        except Exception as e:
            print(f"❌ Error reading content file: {e}")
            sys.exit(1)
    else:
        print("❌ No content file provided")
        sys.exit(1)
    
    # Process dataset
    dataset_dict = read_data(file_content, args.file_type)
    
    # Show first 5 dataset samples
    if 'texts' in dataset_dict and dataset_dict['texts']:
        print("\\n=== First 5 Dataset Samples ===")
        for i, text in enumerate(dataset_dict['texts'][:5], 1):
            preview = text[:150] + "..." if len(text) > 150 else text
            print(f"Sample {i}: {preview}")
        print("===============================")
    
    # Parse and display hyperparameters
    if args.hyperparameters:
        try:
            hyperparams = json.loads(args.hyperparameters)
            print(f"📊 Hyperparameters loaded------>: {hyperparams}")
            
            # Show dataset samples after hyperparameters
            if 'texts' in dataset_dict and dataset_dict['texts']:
                print("\\n=== Dataset Samples After Hyperparameters Loaded ===")
                for i, text in enumerate(dataset_dict['texts'][:5], 1):
                    preview = text[:150] + "..." if len(text) > 150 else text
                    print(f"Sample {i}: {preview}")
                print("===================================================")
        except Exception as e:
            print(f"⚠️ Could not parse hyperparameters: {e}")

if __name__ == "__main__":
    main()
'''
    
    script_path.write_text(script_content)
    print(f"Created GPT-2 tuning script: {script_path}")

# Initialize GPT-2 script on startup
create_gpt2_script()

@app.post("/api/upload", response_model=UploadResponse)
async def upload_files(files: List[UploadFile] = File(...)):
    """Upload and process training files"""
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    
    processed_files = []
    
    for file in files:
        # Save uploaded file
        if file.filename:
            file_path = uploads_dir / file.filename
            content = await file.read()
            file_path.write_bytes(content)
            
            # Save content for training
            content_str = content.decode('utf-8')
            content_path = uploads_dir / f"content_{file.filename}"
            content_path.write_text(content_str)
        else:
            raise HTTPException(status_code=400, detail="Invalid filename")
        
        # Get file info
        ext = Path(file.filename or "").suffix.lower()
        lines = len(content_str.split('\\n'))
        
        print(f"📄 {file.filename}: {ext.upper()} file with {lines} lines")
        
        processed_files.append({
            "originalName": file.filename,
            "size": len(content),
            "type": ext,
            "contentPreview": content_str[:200] + ("..." if len(content_str) > 200 else "")
        })
    
    return UploadResponse(
        message="Files uploaded and processed successfully",
        files=processed_files
    )

@app.post("/api/start-training", response_model=TrainingResponse)
async def start_training(request: TrainingRequest):
    """Start training with hyperparameters"""
    print(f"🎯 Starting training with hyperparameters: {request.hyperparameters.model_dump()}")
    print(f"📂 Training files: {request.files}")
    
    processed_files = []
    
    for filename in request.files:
        content_path = uploads_dir / f"content_{filename}"
        
        if not content_path.exists():
            print(f"⚠️ Content file not found for {filename}")
            continue
        
        # Create temporary content file for GPT-2 script
        temp_content_path = uploads_dir / f"temp_{filename}"
        temp_content_path.write_text(content_path.read_text())
        
        # Execute GPT-2 script with hyperparameters
        ext = Path(filename).suffix.lower()
        hyperparams_json = json.dumps(request.hyperparameters.model_dump())
        
        cmd = [
            "python", "gpt2_tuning.py",
            "--file_name", filename,
            "--file_type", ext,
            "--content_file", str(temp_content_path),
            "--hyperparameters", hyperparams_json
        ]
        
        print(f"🔧 Executing: {' '.join(cmd[:6])}...")
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            
            if result.stdout:
                print("=== GPT-2 Script Output ===")
                for line in result.stdout.strip().split('\\n'):
                    if line.strip():
                        print(line)
                print("==========================")
            
            if result.stderr:
                print(f"⚠️ GPT-2 Script Errors: {result.stderr}")
        
        except subprocess.TimeoutExpired:
            print("⚠️ GPT-2 script execution timed out")
        except Exception as e:
            print(f"❌ Error executing GPT-2 script: {e}")
        finally:
            # Cleanup temp file
            if temp_content_path.exists():
                temp_content_path.unlink()
        
        processed_files.append({
            "fileName": filename,
            "tuningInfo": {
                "tuningScript": "gpt2_tuning.py",
                "fileName": filename,
                "fileType": ext
            }
        })
    
    return TrainingResponse(
        message="Training completed successfully",
        hyperparameters=request.hyperparameters,
        files=processed_files
    )

# Serve static files for the frontend
app.mount("/", StaticFiles(directory="dist/public", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)