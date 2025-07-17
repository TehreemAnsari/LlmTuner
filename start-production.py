#!/usr/bin/env python3
"""
Production startup script for LLM Tuner Platform
This script directly starts the FastAPI server without the Node.js wrapper
"""

import sys
import os
import uvicorn
from pathlib import Path

def main():
    """Main entry point for production deployment"""
    print("🚀 Starting LLM Tuner Platform in production mode...")
    
    # Set environment for production
    os.environ["NODE_ENV"] = "production"
    os.environ["PYTHONPATH"] = os.getcwd()
    
    # Try different import paths based on deployment structure
    app = None
    
    # Option 1: Try importing from server directory (development structure)
    try:
        sys.path.insert(0, 'server')
        from server.main import app
        print("✅ FastAPI app imported from server directory")
    except ImportError:
        pass
    
    # Option 2: Try importing from dist directory (built structure)
    if app is None:
        try:
            if os.path.exists("dist/main.py"):
                sys.path.insert(0, "dist")
                os.chdir("dist")
            from main import app
            print("✅ FastAPI app imported from dist directory")
        except ImportError:
            pass
    
    # Option 3: Try importing from current directory
    if app is None:
        try:
            sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
            from main import app
            print("✅ FastAPI app imported from current directory")
        except ImportError:
            pass
    
    if app is None:
        print("❌ Error: Could not import FastAPI app from any location")
        print("📁 Current directory:", os.getcwd())
        print("📁 Files in current directory:", os.listdir("."))
        if os.path.exists("dist"):
            print("📁 Files in dist directory:", os.listdir("dist"))
        if os.path.exists("server"):
            print("📁 Files in server directory:", os.listdir("server"))
        sys.exit(1)
    
    try:
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
        
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()