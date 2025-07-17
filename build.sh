#!/bin/bash

# Build script for LLM Tuner Platform
# This script builds the frontend and copies Python files to the dist directory

echo "🏗️  Building LLM Tuner Platform..."

# Build the frontend
echo "📦 Building frontend..."
npm run build

# Copy Python files to dist directory
echo "🐍 Copying Python files to dist directory..."
cp server/main.py dist/
cp server/auth.py dist/
cp server/sagemaker_training.py dist/
cp server/jumpstart_training.py dist/
cp server/finetune.py dist/
cp gpt2_tuning.py dist/
cp pyproject.toml dist/
cp start-production.py dist/

# Copy the root main.py for direct execution
cp main.py dist/

# Create uploads directory in dist
mkdir -p dist/uploads

echo "✅ Build completed successfully!"
echo "📁 Files in dist directory:"
ls -la dist/

# Update the start script to use the correct import path
echo "🔧 Creating deployment-compatible start script..."
cat > dist/start.py << 'EOF'
#!/usr/bin/env python3
"""
Simple deployment start script for Replit
"""
import os
import sys
import uvicorn

# Set environment for production
os.environ["NODE_ENV"] = "production"

# Import the FastAPI app
try:
    from main import app
    print("✅ FastAPI app imported successfully")
    
    # Start the server
    print("🚀 Starting server on 0.0.0.0:5000...")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=5000,
        log_level="info"
    )
    
except Exception as e:
    print(f"❌ Error starting server: {e}")
    sys.exit(1)
EOF

chmod +x dist/start.py

echo "🎯 Deployment build complete!"
echo "📋 Available deployment options:"
echo "   - Option 1: python main.py (direct execution)"
echo "   - Option 2: python dist/start.py (from dist directory)"
echo "   - Option 3: python start-production.py (production mode)"