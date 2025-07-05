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
cp gpt2_tuning.py dist/
cp pyproject.toml dist/

# Create uploads directory in dist
mkdir -p dist/uploads

echo "✅ Build completed successfully!"
echo "📁 Files in dist directory:"
ls -la dist/