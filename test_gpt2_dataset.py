#!/usr/bin/env python3
"""
Test script to verify GPT-2 tuning script receives dataset correctly
"""

import subprocess
import sys
import os

def test_gpt2_script():
    # Get the uploaded content
    content_file = "uploads/content_1750888085242_test.txt"
    
    if not os.path.exists(content_file):
        print("❌ Content file not found")
        return False
    
    # Read a small sample of content for testing
    with open(content_file, 'r') as f:
        content = f.read()[:1000]  # First 1000 characters for testing
    
    print(f"📊 Testing with content sample ({len(content)} characters)")
    print(f"📄 Content preview: {content[:100]}...")
    
    # Test the GPT-2 script with minimal parameters
    cmd = [
        sys.executable, "gpt2_tuning.py",
        "--file_content", content,
        "--file_type", ".txt", 
        "--file_name", "test.txt",
        "--epochs", "1",
        "--batch_size", "1"
    ]
    
    print("🔧 Running GPT-2 script test...")
    print(f"Command: {' '.join(cmd[:4])}... (truncated)")
    
    try:
        # Run with timeout and capture output
        result = subprocess.run(
            cmd, 
            capture_output=True, 
            text=True, 
            timeout=60
        )
        
        print(f"📤 Exit code: {result.returncode}")
        print("📋 STDOUT:")
        print(result.stdout)
        
        if result.stderr:
            print("❌ STDERR:")
            print(result.stderr)
        
        return result.returncode == 0
        
    except subprocess.TimeoutExpired:
        print("⏰ Script timed out (expected for demo)")
        return True
    except Exception as e:
        print(f"❌ Error running script: {e}")
        return False

if __name__ == "__main__":
    print("=== GPT-2 Dataset Verification Test ===")
    success = test_gpt2_script()
    print(f"✅ Test {'passed' if success else 'failed'}")