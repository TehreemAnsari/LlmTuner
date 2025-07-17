#!/usr/bin/env python3
"""
Direct Python startup for deployment - bypasses Node.js wrapper
Main entry point for LLM Tuner Platform FastAPI application
"""

import os
import sys
import uvicorn
from pathlib import Path

# Ensure we can import from the server directory
sys.path.insert(0, 'server')

# Set environment variables for production
os.environ["NODE_ENV"] = "production"
os.environ["PYTHONPATH"] = os.getcwd()

def main():
    """Main entry point for the application"""
    try:
        # Import the FastAPI app from server directory
        from server.main import app
        
        print("✅ FastAPI app imported successfully")
        print("🚀 Starting LLM Tuner Platform server...")
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
        print(f"❌ Error importing FastAPI app: {e}")
        print("📁 Current directory:", os.getcwd())
        print("📁 Python path:", sys.path)
        if os.path.exists("server"):
            print("📁 Files in server directory:", os.listdir("server"))
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()