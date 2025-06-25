#!/usr/bin/env python3
"""
Test the latest uploaded file with the enhanced GPT-2 logging
"""

import os
import glob

# Find the most recent content file
content_files = glob.glob("uploads/content_*.txt")
if content_files:
    latest_file = max(content_files, key=os.path.getctime)
    
    print(f"Testing latest upload: {latest_file}")
    
    with open(latest_file, 'r') as f:
        file_content = f.read()
    
    print("=== GPT-2 Dataset Processing Simulation ===")
    print(f"File content size: {len(file_content)} characters")
    
    # Simulate the exact same processing as gpt2_tuning.py
    texts = [line.strip() for line in file_content.split('\n') if line.strip() and len(line.strip()) > 10]
    
    print(f"Prepared {len(texts)} text samples for training")
    if texts:
        print(f"Sample text: {texts[0][:100]}...")
        
        # Print first 5 dataset samples for verification (same as gpt2_tuning.py)
        print("\n=== First 5 Dataset Samples ===")
        for i, text in enumerate(texts[:5]):
            print(f"Sample {i+1}: {text[:150]}...")
        print("===============================\n")
    
    print("This is exactly what you'll see when running gpt2_tuning.py")
    
else:
    print("No uploaded content files found")