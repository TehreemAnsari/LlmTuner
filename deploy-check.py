#!/usr/bin/env python3
"""
Deployment verification script for LLM Tuner Platform
This script checks if all required files are present for deployment
"""

import os
import sys
from pathlib import Path

def check_deployment_readiness():
    """Check if all required files are present for deployment"""
    
    print("🔍 Checking deployment readiness...")
    
    # Required files for deployment
    required_files = [
        "dist/main.py",
        "dist/auth.py", 
        "dist/gpt2_tuning.py",
        "dist/pyproject.toml",
        "dist/index.js",
        "dist/index.html",
        "dist/assets"
    ]
    
    missing_files = []
    
    for file_path in required_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
        else:
            print(f"✅ {file_path} - Found")
    
    if missing_files:
        print(f"\n❌ Missing files for deployment:")
        for file_path in missing_files:
            print(f"   - {file_path}")
        return False
    
    # Check if Python dependencies are available
    try:
        import fastapi
        import uvicorn
        import boto3
        import authlib
        print("✅ Python dependencies - Available")
    except ImportError as e:
        print(f"❌ Python dependencies missing: {e}")
        return False
    
    # Note: Uploads now handled via S3, no local directory needed
    print("✅ File storage - Using AWS S3 (no local uploads directory needed)")
    
    print("\n🎉 Deployment readiness check passed!")
    print("📋 Ready for deployment with the following setup:")
    print("   - Frontend: React app served from dist/")
    print("   - Backend: FastAPI server with Python files")
    print("   - Storage: AWS S3 integration")
    print("   - Authentication: JWT + OAuth")
    
    return True

def test_python_import():
    """Test if main.py can be imported successfully"""
    try:
        # Change to dist directory for testing
        import os
        original_dir = os.getcwd()
        os.chdir("dist")
        
        try:
            sys.path.insert(0, ".")
            from main import app
            print("✅ main.py imports successfully")
            return True
        finally:
            os.chdir(original_dir)
    except Exception as e:
        print(f"❌ Error importing main.py: {e}")
        return False

if __name__ == "__main__":
    print("🚀 LLM Tuner Platform - Deployment Check")
    print("=" * 50)
    
    if not check_deployment_readiness():
        print("\n❌ Deployment check failed!")
        sys.exit(1)
    
    if not test_python_import():
        print("\n❌ Python import test failed!")
        sys.exit(1)
    
    print("\n✅ All deployment checks passed!")
    print("🎯 You can now deploy the application using:")
    print("   - Option 1: npm start (uses Node.js wrapper)")
    print("   - Option 2: python start-production.py (direct Python)")
    print("   - Option 3: cd dist && python main.py (direct from dist)")