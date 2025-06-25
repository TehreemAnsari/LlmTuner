#!/usr/bin/env python3
"""
Example Python file processing script for the LLM Tuner platform.
This demonstrates how uploaded files can be read and processed.
"""

import json
import csv
import pandas as pd
from pathlib import Path
import sys

def read_json_file(file_path):
    """Process JSON file for training data"""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"✅ JSON file loaded: {len(data) if isinstance(data, list) else 1} records")
    
    # Sample data structure analysis
    if isinstance(data, list) and len(data) > 0:
        sample = data[0]
        if isinstance(sample, dict):
            print(f"   Fields found: {list(sample.keys())}")
            
            # Look for common training patterns
            text_fields = [k for k in sample.keys() if 'text' in k.lower() or 'content' in k.lower()]
            label_fields = [k for k in sample.keys() if 'label' in k.lower() or 'target' in k.lower()]
            
            if text_fields:
                print(f"   Text fields: {text_fields}")
            if label_fields:
                print(f"   Label fields: {label_fields}")
    
    return data

def read_csv_file(file_path):
    """Process CSV file for training data"""
    df = pd.read_csv(file_path)
    
    print(f"✅ CSV file loaded: {len(df)} rows, {len(df.columns)} columns")
    print(f"   Columns: {list(df.columns)}")
    print(f"   Sample data:")
    print(df.head(3).to_string())
    
    return df.to_dict('records')

def read_text_file(file_path):
    """Process text/JSONL file for training data"""
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Try to parse as JSONL
    if file_path.suffix.lower() == '.jsonl':
        data = []
        for i, line in enumerate(lines):
            try:
                data.append(json.loads(line.strip()))
            except json.JSONDecodeError:
                print(f"⚠️  Warning: Line {i+1} is not valid JSON")
        
        print(f"✅ JSONL file loaded: {len(data)} records")
        return data
    else:
        clean_lines = [line.strip() for line in lines if line.strip()]
        print(f"✅ Text file loaded: {len(clean_lines)} lines")
        return clean_lines

def process_file(file_path):
    """Main file processing function"""
    file_path = Path(file_path)
    
    if not file_path.exists():
        print(f"❌ File not found: {file_path}")
        return None
    
    print(f"📁 Processing: {file_path.name}")
    print(f"   Size: {file_path.stat().st_size / 1024:.1f} KB")
    
    file_ext = file_path.suffix.lower()
    
    try:
        if file_ext == '.json':
            return read_json_file(file_path)
        elif file_ext == '.csv':
            return read_csv_file(file_path)
        elif file_ext in ['.txt', '.jsonl']:
            return read_text_file(file_path)
        else:
            print(f"❌ Unsupported file type: {file_ext}")
            return None
    except Exception as e:
        print(f"❌ Error processing file: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
        print("=== LLM Tuner File Processor ===")
        data = process_file(file_path)
        if data:
            print(f"✅ File processed successfully!")
        else:
            print("❌ Failed to process file")
    else:
        print("Usage: python process_files.py <file_path>")
        print("Example: python process_files.py uploads/data.json")