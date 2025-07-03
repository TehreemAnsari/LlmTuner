#!/usr/bin/env python3
"""
Production startup script for LLM Tuner Platform
This script directly starts the FastAPI server without the Node.js wrapper
"""

import sys
import os
import uvicorn
from pathlib import Path

# Add the dist directory to Python path if running from dist
if os.path.exists("dist/main.py"):
    sys.path.insert(0, "dist")
    os.chdir("dist")

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from main import app
    
    if __name__ == "__main__":
        print("🚀 Starting LLM Tuner Platform in production mode...")
        print("📍 Server will be available at: http://0.0.0.0:5000")
        
        # Create uploads directory if it doesn't exist
        uploads_dir = Path("uploads")
        uploads_dir.mkdir(exist_ok=True)
        
        # Start the FastAPI server
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=5000,
            log_level="info",
            access_log=True
        )
        
except ImportError as e:
    print(f"❌ Error importing main application: {e}")
    print("📁 Current directory:", os.getcwd())
    print("📁 Files in current directory:", os.listdir("."))
    if os.path.exists("dist"):
        print("📁 Files in dist directory:", os.listdir("dist"))
    sys.exit(1)
except Exception as e:
    print(f"❌ Error starting server: {e}")
    sys.exit(1)