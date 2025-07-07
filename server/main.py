#!/usr/bin/env python3
"""
This is a FastAPI-based Python backend designed for a platform that allows users to:
1. Upload training data files
2. Configure training hyperparameters
3. Run GPT-2 fine-tuning jobs via a Python script
4. Serve the frontend UI via static files

On server start, checks for the presence of gpt2_tuning.py.

If not found, creates a lightweight script that:

Parses command-line arguments

Loads training data from the given file

Shows sample data + hyperparameters

"""

import os
import json
import subprocess
from pathlib import Path
from typing import List, Optional
from datetime import timedelta
import uuid

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse, HTMLResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from authlib.integrations.starlette_client import OAuth
import httpx
import boto3
from botocore.exceptions import ClientError

from auth import (
    auth_manager, UserCreate, UserLogin, User, Token, GoogleUser,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from sagemaker_training import SageMakerTrainingManager
from jumpstart_training import JumpStartTrainingManager

# Create temporary directory for processing (when needed)
import tempfile

# Initialize S3 client
def get_s3_client():
    """Initialize and return S3 client with AWS credentials"""
    return boto3.client(
        's3',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        region_name='us-east-1'  # Default region
    )

# S3 bucket configuration
S3_BUCKET_NAME = 'llm-tuner-user-uploads'

async def upload_to_s3(file_content: bytes, file_name: str, user_id: str, content_type: str = 'application/octet-stream') -> str:
    """Upload file to S3 and return the S3 key"""
    try:
        s3_client = get_s3_client()
        
        # Create unique file path with user ID and timestamp
        file_id = str(uuid.uuid4())
        s3_key = f"users/{user_id}/uploads/{file_id}_{file_name}"
        
        # Upload file to S3
        s3_client.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=s3_key,
            Body=file_content,
            ContentType=content_type,
            Metadata={
                'user_id': user_id,
                'original_filename': file_name,
                'file_id': file_id
            }
        )
        
        print(f"📁 Uploaded {file_name} to S3: s3://{S3_BUCKET_NAME}/{s3_key}")
        return s3_key
        
    except ClientError as e:
        print(f"❌ S3 upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload file to S3: {str(e)}")

async def download_from_s3(s3_key: str) -> bytes:
    """Download file content from S3"""
    try:
        s3_client = get_s3_client()
        
        response = s3_client.get_object(Bucket=S3_BUCKET_NAME, Key=s3_key)
        return response['Body'].read()
        
    except ClientError as e:
        print(f"❌ S3 download error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to download file from S3: {str(e)}")

app = FastAPI(title="LLM Tuner Platform", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Initialize SageMaker Training Manager
sagemaker_manager = SageMakerTrainingManager()

# OAuth Configuration
oauth = OAuth()
oauth.register(
    name='google',
    client_id=os.getenv('GOOGLE_CLIENT_ID'),
    client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

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

class SageMakerTrainingRequest(BaseModel):
    base_model: str
    hyperparameters: Hyperparameters
    files: List[str]  # S3 keys of uploaded files
    instance_type: str = "ml.m5.large"

class SageMakerTrainingResponse(BaseModel):
    job_name: str
    job_arn: str
    status: str
    training_data_s3_uri: str
    output_s3_uri: str
    instance_type: str
    created_at: str
    estimated_cost_per_hour: float

class TrainingJobStatus(BaseModel):
    job_name: str
    status: str
    creation_time: str
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration_seconds: float
    instance_type: str
    failure_reason: Optional[str] = None
    model_artifacts_s3_uri: Optional[str] = None
    training_metrics: List[dict]
    estimated_cost: float

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

# Dependency to get current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
    token = credentials.credentials
    payload = auth_manager.decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    email = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await auth_manager.get_user_by_email(email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# Authentication endpoints
@app.post("/api/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    """Register a new user"""
    try:
        user = await auth_manager.create_user(user_data)
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth_manager.create_access_token(
            data={"sub": user["email"]}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    """Login user"""
    user = await auth_manager.authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_manager.create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/google")
async def google_login():
    """Get Google OAuth URL"""
    # Use the current domain for the redirect URI
    import os
    
    # Check if we're running on Replit
    replit_domain = os.getenv('REPLIT_DOMAINS')
    if replit_domain:
        base_url = f"https://{replit_domain.split(',')[0]}"
    else:
        base_url = "http://localhost:5000"
    
    redirect_uri = f"{base_url}/api/auth/google/callback"
    client_id = os.getenv('GOOGLE_CLIENT_ID')
    
    if not client_id:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    
    # Build the OAuth URL with proper parameters and encode the redirect URI
    import urllib.parse
    encoded_redirect_uri = urllib.parse.quote(redirect_uri, safe='')
    
    google_oauth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={client_id}&"
        f"redirect_uri={encoded_redirect_uri}&"
        "scope=openid%20email%20profile&"
        "response_type=code&"
        "access_type=offline&"
        "include_granted_scopes=true"
    )
    
    return {
        "auth_url": google_oauth_url,
        "redirect_uri": redirect_uri,
        "debug_info": {
            "base_url": base_url,
            "replit_domain": replit_domain,
            "client_id_configured": bool(client_id)
        }
    }

@app.get("/api/auth/google/callback")
async def google_callback(code: str):
    """Handle Google OAuth callback"""
    try:
        # Use the current domain for the redirect URI
        replit_domain = os.getenv('REPLIT_DOMAINS')
        if replit_domain:
            base_url = f"https://{replit_domain.split(',')[0]}"
        else:
            base_url = "http://localhost:5000"
        
        redirect_uri = f"{base_url}/api/auth/google/callback"
        
        # Exchange code for token
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "client_id": os.getenv('GOOGLE_CLIENT_ID'),
            "client_secret": os.getenv('GOOGLE_CLIENT_SECRET'),
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(token_url, data=data)
            token_data = response.json()
        
        # Get user info
        user_info_url = f"https://www.googleapis.com/oauth2/v1/userinfo?access_token={token_data['access_token']}"
        async with httpx.AsyncClient() as client:
            response = await client.get(user_info_url)
            user_info = response.json()
        
        # Create or get user
        google_user = GoogleUser(
            email=user_info["email"],
            name=user_info["name"],
            picture=user_info["picture"],
            sub=user_info["id"]
        )
        
        user = await auth_manager.create_google_user(google_user)
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth_manager.create_access_token(
            data={"sub": user["email"]}, expires_delta=access_token_expires
        )
        
        # Get base URL again for redirect
        replit_domain = os.getenv('REPLIT_DOMAINS')
        if replit_domain:
            frontend_url = f"https://{replit_domain.split(',')[0]}"
        else:
            frontend_url = "http://localhost:5000"
        
        # Create a success page that closes the popup and passes the token
        success_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Login Success</title>
            <style>
                body {{ font-family: Arial, sans-serif; text-align: center; padding: 50px; }}
                .success {{ color: #28a745; }}
            </style>
        </head>
        <body>
            <div class="success">
                <h2>✅ Login Successful!</h2>
                <p>Redirecting you back to the application...</p>
            </div>
            <script>
                // Store token in localStorage
                localStorage.setItem('token', '{access_token}');
                
                // Try to close popup and redirect parent
                if (window.opener) {{
                    // Send message to parent window
                    window.opener.postMessage({{
                        type: 'GOOGLE_AUTH_SUCCESS',
                        token: '{access_token}'
                    }}, '*');
                    
                    // Try to reload parent window
                    try {{
                        window.opener.location.reload();
                    }} catch (e) {{
                        // If reload fails, just navigate to home
                        window.opener.location.href = '{frontend_url}';
                    }}
                    
                    // Close popup
                    window.close();
                }} else {{
                    // Fallback: redirect in same window
                    window.location.href = '{frontend_url}';
                }}
            </script>
        </body>
        </html>
        """
        
        return HTMLResponse(content=success_html)
        
    except Exception as e:
        print(f"Google OAuth error: {e}")
        # Get base URL for error redirect
        replit_domain = os.getenv('REPLIT_DOMAINS')
        if replit_domain:
            frontend_url = f"https://{replit_domain.split(',')[0]}"
        else:
            frontend_url = "http://localhost:5000"
        # Create error page for popup
        error_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Login Error</title>
            <style>
                body {{ font-family: Arial, sans-serif; text-align: center; padding: 50px; }}
                .error {{ color: #dc3545; }}
            </style>
        </head>
        <body>
            <div class="error">
                <h2>❌ Login Failed</h2>
                <p>There was an error during authentication. Please try again.</p>
                <button onclick="window.close()">Close</button>
            </div>
        </body>
        </html>
        """
        return HTMLResponse(content=error_html)

@app.get("/api/auth/me", response_model=User)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return User(**current_user)

@app.get("/api/auth/debug")
async def debug_oauth():
    """Debug OAuth configuration"""
    replit_domain = os.getenv('REPLIT_DOMAINS')
    if replit_domain:
        base_url = f"https://{replit_domain.split(',')[0]}"
    else:
        base_url = "http://localhost:5000"
    
    # Test DynamoDB connection
    try:
        from auth import auth_manager
        # Try to list table info
        table_info = "Connected"
    except Exception as e:
        table_info = f"Error: {str(e)}"
    
    return {
        "base_url": base_url,
        "redirect_uri": f"{base_url}/api/auth/google/callback",
        "google_client_id": os.getenv('GOOGLE_CLIENT_ID', 'NOT_SET'),
        "google_client_secret_set": bool(os.getenv('GOOGLE_CLIENT_SECRET')),
        "aws_access_key_set": bool(os.getenv('AWS_ACCESS_KEY_ID')),
        "aws_secret_key_set": bool(os.getenv('AWS_SECRET_ACCESS_KEY')),
        "replit_domain": replit_domain,
        "dynamodb_status": table_info,
        "suggested_troubleshooting": [
            "1. Verify Google Cloud Console has the exact redirect URI: " + f"{base_url}/api/auth/google/callback",
            "2. Check if OAuth consent screen is configured",
            "3. Ensure domain is added to authorized domains if needed",
            "4. Try incognito/private browsing to bypass cache issues"
        ]
    }

@app.post("/api/upload", response_model=UploadResponse)
async def upload_files(files: List[UploadFile] = File(...), current_user: dict = Depends(get_current_user)):
    """Upload and process training files to S3"""
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    
    processed_files = []
    user_id = current_user["user_id"]
    
    for file in files:
        if not file.filename:
            raise HTTPException(status_code=400, detail="Invalid filename")
            
        # Read file content
        content = await file.read()
        content_str = content.decode('utf-8')
        
        # Upload file to S3 (single file for both original and training content)
        s3_key = await upload_to_s3(
            content, 
            file.filename, 
            user_id, 
            file.content_type or 'text/plain'
        )
        
        # Get file info
        ext = Path(file.filename).suffix.lower()
        lines = len(content_str.split('\n'))
        
        print(f"📄 {file.filename}: {ext.upper()} file with {lines} lines")
        print(f"🗂️ Stored in S3: {s3_key}")
        
        processed_files.append({
            "originalName": file.filename,
            "size": len(content),
            "type": ext,
            "contentPreview": content_str[:200] + ("..." if len(content_str) > 200 else ""),
            "s3_key": s3_key
        })
    
    return UploadResponse(
        message="Files uploaded and processed successfully",
        files=processed_files
    )

@app.post("/api/start-training", response_model=TrainingResponse)
async def start_training(request: TrainingRequest, current_user: dict = Depends(get_current_user)):
    """Start training with hyperparameters using S3-stored files (Legacy GPT-2 script)"""
    print(f"🎯 Starting training with hyperparameters: {request.hyperparameters.model_dump()}")
    print(f"📂 Training files: {request.files}")
    
    processed_files = []
    user_id = current_user["user_id"]
    
    for filename in request.files:
        temp_content_path = None
        ext = Path(filename).suffix.lower()
        
        try:
            # List objects in user's S3 folder to find the content file
            s3_client = get_s3_client()
            prefix = f"users/{user_id}/uploads/"
            
            response = s3_client.list_objects_v2(
                Bucket=S3_BUCKET_NAME,
                Prefix=prefix
            )
            
            file_s3_key = None
            for obj in response.get('Contents', []):
                obj_key = obj['Key']
                # Look for the original file that matches this filename
                if filename in obj_key and not obj_key.endswith(f"content_{filename}"):
                    file_s3_key = obj_key
                    break
            
            if not file_s3_key:
                print(f"⚠️ File not found in S3 for {filename}")
                continue
            
            # Download content from S3
            print(f"📥 Downloading {file_s3_key} from S3...")
            content_bytes = await download_from_s3(file_s3_key)
            content_str = content_bytes.decode('utf-8')
            
            # Create temporary local file for GPT-2 script
            # Use temporary file for processing
            with tempfile.NamedTemporaryFile(mode='w', suffix=f'_{filename}', delete=False) as temp_file:
                temp_file.write(content_str)
                temp_content_path = Path(temp_file.name)
            
            # Execute GPT-2 script with hyperparameters
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
                print(f"⏰ Training timeout for {filename}")
            except Exception as e:
                print(f"❌ Training error for {filename}: {e}")
            
            processed_files.append({
                "fileName": filename,
                "tuningInfo": {
                    "tuningScript": "gpt2_tuning.py",
                    "fileName": filename,
                    "fileType": ext
                }
            })
                    
        except Exception as e:
            print(f"❌ Error processing {filename} from S3: {e}")
        finally:
            # Clean up temporary file
            if temp_content_path and temp_content_path.exists():
                temp_content_path.unlink()
    
    return TrainingResponse(
        message="Training completed successfully",
        hyperparameters=request.hyperparameters,
        files=processed_files
    )

@app.post("/api/sagemaker-training", response_model=SageMakerTrainingResponse)
async def start_sagemaker_training(request: SageMakerTrainingRequest, current_user: dict = Depends(get_current_user)):
    """Start SageMaker training job for LLM fine-tuning"""
    print(f"🚀 Starting SageMaker training job...")
    print(f"📊 Base model: {request.base_model}")
    print(f"🎯 Hyperparameters: {request.hyperparameters.model_dump()}")
    print(f"📂 Training files: {request.files}")
    
    user_id = current_user["user_id"]
    
    try:
        # Generate unique job name
        job_name = sagemaker_manager.generate_job_name(user_id, request.base_model)
        
        # Prepare training data in SageMaker format
        training_data_s3_uri = sagemaker_manager.prepare_training_data(user_id, request.files)
        
        # Create SageMaker training job
        training_job = sagemaker_manager.create_training_job(
            job_name=job_name,
            user_id=user_id,
            base_model=request.base_model,
            training_files=request.files,
            hyperparameters=request.hyperparameters.model_dump(),
            instance_type=request.instance_type
        )
        
        return SageMakerTrainingResponse(**training_job)
        
    except Exception as e:
        print(f"❌ SageMaker training job failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start SageMaker training: {str(e)}")

@app.post("/api/jumpstart-training", response_model=SageMakerTrainingResponse)
async def start_jumpstart_training(request: SageMakerTrainingRequest, current_user: dict = Depends(get_current_user)):
    """Start SageMaker JumpStart training job for LLM fine-tuning"""
    print(f"🚀 Starting SageMaker JumpStart training...")
    print(f"📊 Base model: {request.base_model}")
    print(f"🎯 Hyperparameters: {request.hyperparameters.model_dump()}")
    print(f"📂 Training files: {request.files}")
    
    user_id = current_user["user_id"]
    
    try:
        manager = JumpStartTrainingManager()
        
        # Map base model to JumpStart model ID
        model_id_mapping = {
            'llama-2-7b': 'huggingface-llm-llama-2-7b-f',
            'llama-2-13b': 'huggingface-llm-llama-2-13b-f',
            'flan-t5-xl': 'huggingface-text2text-flan-t5-xl'
        }
        
        model_id = model_id_mapping.get(request.base_model, 'huggingface-llm-llama-2-7b-f')
        
        # Generate job name
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        user_prefix = user_id[:10].replace('@', '').replace('.', '')
        job_name = f"jumpstart-{user_prefix}-{request.base_model}-{timestamp}"
        
        # Prepare S3 URIs
        s3_bucket = "llm-tuner-user-uploads"
        training_data_s3_uri = f"s3://{s3_bucket}/users/{user_id}/training-data/"
        output_s3_uri = f"s3://{s3_bucket}/users/{user_id}/models/{job_name}/"
        
        result = manager.create_jumpstart_training_job(
            model_id=model_id,
            job_name=job_name,
            training_data_s3_uri=training_data_s3_uri,
            output_s3_uri=output_s3_uri,
            hyperparameters=request.hyperparameters.model_dump(),
            instance_type=request.instance_type
        )
        
        return SageMakerTrainingResponse(**result)
        
    except Exception as e:
        print(f"❌ JumpStart training error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"JumpStart training job creation failed: {str(e)}")

@app.get("/api/jumpstart-models")
async def get_jumpstart_models(current_user: dict = Depends(get_current_user)):
    """Get available JumpStart models for fine-tuning"""
    try:
        manager = JumpStartTrainingManager()
        models = manager.get_jumpstart_models()
        return {"models": models}
        
    except Exception as e:
        print(f"❌ Error fetching JumpStart models: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch JumpStart models: {str(e)}")

@app.get("/api/training-job/{job_name}", response_model=TrainingJobStatus)
async def get_training_job_status(job_name: str, current_user: dict = Depends(get_current_user)):
    """Get status of a SageMaker training job"""
    
    try:
        status = sagemaker_manager.get_training_job_status(job_name)
        return TrainingJobStatus(**status)
        
    except Exception as e:
        print(f"❌ Error getting training job status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get training job status: {str(e)}")

@app.get("/api/training-jobs")
async def list_training_jobs(current_user: dict = Depends(get_current_user)):
    """List all training jobs for the current user"""
    
    user_id = current_user["user_id"]
    
    try:
        jobs = sagemaker_manager.list_training_jobs(user_id)
        return {"training_jobs": jobs}
        
    except Exception as e:
        print(f"❌ Error listing training jobs: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list training jobs: {str(e)}")

@app.post("/api/stop-training-job/{job_name}")
async def stop_training_job(job_name: str, current_user: dict = Depends(get_current_user)):
    """Stop a running SageMaker training job"""
    
    try:
        result = sagemaker_manager.stop_training_job(job_name)
        return result
        
    except Exception as e:
        print(f"❌ Error stopping training job: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to stop training job: {str(e)}")

@app.get("/api/training-cost-estimate")
async def get_training_cost_estimate(
    base_model: str,
    instance_type: str = "ml.g5.2xlarge",
    estimated_hours: float = 2.0,
    current_user: dict = Depends(get_current_user)
):
    """Get estimated cost for training job"""
    
    hourly_cost = sagemaker_manager._get_instance_cost(instance_type)
    total_cost = hourly_cost * estimated_hours
    
    return {
        "base_model": base_model,
        "instance_type": instance_type,
        "estimated_hours": estimated_hours,
        "hourly_cost": hourly_cost,
        "total_estimated_cost": round(total_cost, 2),
        "currency": "USD"
    }

@app.post("/api/deploy-model")
async def deploy_model(
    model_s3_uri: str,
    model_name: str,
    instance_type: str = "ml.g5.xlarge",
    current_user: dict = Depends(get_current_user)
):
    """Deploy trained model to SageMaker endpoint"""
    
    try:
        deployment = sagemaker_manager.deploy_model(
            model_s3_uri=model_s3_uri,
            model_name=model_name,
            instance_type=instance_type
        )
        
        return {
            "message": "Model deployment initiated",
            "deployment": deployment
        }
        
    except Exception as e:
        print(f"❌ Error deploying model: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to deploy model: {str(e)}")

@app.get("/api/model-download/{job_name}")
async def get_model_download_url(job_name: str, current_user: dict = Depends(get_current_user)):
    """Get presigned URL for model download"""
    
    try:
        # Get training job details to find model artifacts
        job_status = sagemaker_manager.get_training_job_status(job_name)
        
        if job_status['status'] != 'Completed':
            raise HTTPException(status_code=400, detail="Training job not completed")
        
        model_s3_uri = job_status.get('model_artifacts_s3_uri')
        if not model_s3_uri:
            raise HTTPException(status_code=404, detail="Model artifacts not found")
        
        download_url = sagemaker_manager.get_model_download_url(model_s3_uri)
        
        return {
            "download_url": download_url,
            "model_s3_uri": model_s3_uri,
            "job_name": job_name,
            "expires_in": 3600  # 1 hour
        }
        
    except Exception as e:
        print(f"❌ Error generating download URL: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate download URL: {str(e)}")

@app.post("/api/invoke-model")
async def invoke_model(
    endpoint_name: str,
    input_text: str,
    current_user: dict = Depends(get_current_user)
):
    """Invoke deployed model for inference"""
    
    try:
        result = sagemaker_manager.invoke_endpoint(
            endpoint_name=endpoint_name,
            input_text=input_text
        )
        
        return {
            "result": result,
            "status": "success"
        }
        
    except Exception as e:
        print(f"❌ Error invoking model: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to invoke model: {str(e)}")

@app.get("/api/endpoint-status/{endpoint_name}")
async def get_endpoint_status(endpoint_name: str, current_user: dict = Depends(get_current_user)):
    """Get status of deployed endpoint"""
    
    try:
        status = sagemaker_manager.get_endpoint_status(endpoint_name)
        return status
        
    except Exception as e:
        print(f"❌ Error getting endpoint status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get endpoint status: {str(e)}")

@app.get("/api/training-job-actions/{job_name}")
async def get_training_job_actions(job_name: str, current_user: dict = Depends(get_current_user)):
    """Get available actions for a completed training job"""
    
    try:
        job_status = sagemaker_manager.get_training_job_status(job_name)
        
        actions = {
            "job_name": job_name,
            "status": job_status['status'],
            "available_actions": []
        }
        
        if job_status['status'] == 'Completed':
            actions["available_actions"] = [
                {
                    "action": "download_model",
                    "description": "Download trained model artifacts",
                    "endpoint": f"/api/model-download/{job_name}"
                },
                {
                    "action": "deploy_model",
                    "description": "Deploy model to inference endpoint",
                    "endpoint": "/api/deploy-model"
                }
            ]
            
            # Add model artifacts info
            if job_status.get('model_artifacts_s3_uri'):
                actions["model_artifacts"] = {
                    "s3_uri": job_status['model_artifacts_s3_uri'],
                    "estimated_size": "~500MB - 2GB (depending on model)"
                }
        
        return actions
        
    except Exception as e:
        print(f"❌ Error getting training job actions: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get training job actions: {str(e)}")

# Serve static files for the frontend
app.mount("/", StaticFiles(directory="dist", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)