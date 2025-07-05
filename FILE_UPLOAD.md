# File Upload & Format Support

## Supported File Formats for LLM Training

The LLM Tuner Platform supports multiple file formats for training data upload. All formats are processed and converted to instruction-following format for optimal LLM fine-tuning.

### **Primary Supported Formats**

#### 1. **Plain Text Files (.txt)**
- **Processing**: Each line becomes a separate training sample
- **Format**: Raw text content, UTF-8 encoded
- **Best For**: Stories, articles, documentation, dialogue
- **Example**:
```txt
This is a sample training text.
Each line becomes a separate training sample.
The model learns from this content.
```

#### 2. **JSON Files (.json)**
- **Processing**: Extracts text from structured data
- **Supported Fields**: `text`, `content`, `description`
- **Format**: Single JSON object or array of objects
- **Best For**: Structured training data, API responses, content collections
- **Example**:
```json
{
  "training_data": [
    {"text": "Sample conversation about AI"},
    {"content": "Technical documentation excerpt"},
    {"description": "Product description for training"}
  ]
}
```

#### 3. **JSON Lines (.jsonl)**
- **Processing**: One JSON object per line
- **Supported Fields**: `text`, `content`
- **Format**: Newline-delimited JSON
- **Best For**: Large datasets, streaming data, conversational data
- **Example**:
```jsonl
{"text": "Customer support conversation example"}
{"text": "Technical Q&A pair for training"}
{"text": "Creative writing sample"}
```

#### 4. **CSV Files (.csv)**
- **Processing**: Skips header row, processes data rows
- **Format**: Comma-separated values
- **Best For**: Tabular data, spreadsheet exports
- **Example**:
```csv
id,content,category
1,"Training text sample 1",support
2,"Training text sample 2",technical
3,"Training text sample 3",creative
```

## File Processing Pipeline

### **Upload Flow**
1. **Frontend Validation**: File type checking before upload
2. **UTF-8 Conversion**: All files decoded to UTF-8 text
3. **Format Detection**: Based on file extension
4. **Content Extraction**: Format-specific parsing logic
5. **S3 Storage**: Secure cloud storage with user isolation
6. **Training Conversion**: Transformed to instruction-response pairs

### **Frontend Validation**
```typescript
const validFiles = files.filter(file => 
  file.type === "application/json" || 
  file.type === "text/csv" || 
  file.type === "text/plain" ||
  file.name.endsWith('.jsonl') ||
  file.name.endsWith('.txt')
);
```

### **Backend Processing**
- **Smart Content Extraction**: Automatically detects text fields in JSON
- **Error Handling**: Invalid JSON falls back to line-by-line processing
- **Data Cleaning**: Empty lines and whitespace filtered out
- **UTF-8 Compliance**: Ensures proper character encoding

## Training Data Conversion

### **AWS SageMaker Training Format**
All uploaded formats are converted to instruction-following JSONL:
```json
{
  "instruction": "Continue the following text:",
  "input": "First 100 characters of your content...",
  "output": "Remaining text as completion..."
}
```

### **Legacy GPT-2 Training**
Supports same formats with simplified processing for demonstration purposes.

## File Upload Interface

### **User Experience Features**
- **Drag-and-Drop**: Modern file upload interface
- **Multiple Files**: Upload several files simultaneously
- **File Validation**: Real-time format checking
- **Content Preview**: Shows first 200 characters of uploaded content
- **Progress Tracking**: Upload status and completion feedback
- **Error Messages**: Clear feedback for unsupported formats

### **Upload Process**
1. **Select/Drop Files**: Choose files via browser or drag-and-drop
2. **Format Validation**: System checks file types
3. **Content Processing**: Files parsed and validated
4. **S3 Upload**: Secure storage with user-specific paths
5. **Preview Generation**: Content preview for verification
6. **Ready for Training**: Files available for model training

## File Size and Performance

### **Current Limitations**
- **Memory Processing**: Files loaded entirely into memory
- **UTF-8 Requirement**: Binary files not supported
- **No Explicit Size Limits**: But performance may degrade with very large files

### **Recommended File Sizes**
- **Optimal**: < 10MB per file (best performance)
- **Acceptable**: 10-100MB per file
- **Large Files**: > 100MB (may cause memory issues)

### **Performance Tips**
- Split large files into smaller chunks
- Use JSONL format for large datasets
- Remove unnecessary whitespace and formatting
- Ensure UTF-8 encoding before upload

## Content Processing Examples

### **Text File Processing**
```txt
Input File:
Line 1: Customer asked about pricing
Line 2: Agent provided discount information
Line 3: Customer accepted the offer

Converted to Training Format:
{"instruction": "Continue the following text:", "input": "Customer asked about pricing", "output": "..."}
{"instruction": "Continue the following text:", "input": "Agent provided discount information", "output": "..."}
{"instruction": "Continue the following text:", "input": "Customer accepted the offer", "output": "..."}
```

### **JSON Processing**
```json
Input File:
{
  "conversations": [
    {"text": "How do I reset my password?"},
    {"content": "Click the forgot password link on login page"}
  ]
}

Extracted Content:
- "How do I reset my password?"
- "Click the forgot password link on login page"
```

### **CSV Processing**
```csv
Input File:
question,answer,category
"What is AI?","Artificial Intelligence is...","general"
"How does ML work?","Machine Learning uses...","technical"

Processed Content:
- "What is AI?","Artificial Intelligence is...","general"
- "How does ML work?","Machine Learning uses...","technical"
```

## Error Handling

### **Common Issues and Solutions**

#### **Invalid File Format**
- **Error**: "Please upload JSON, CSV, TXT, or JSONL files only"
- **Solution**: Convert file to supported format

#### **UTF-8 Encoding Issues**
- **Error**: Unicode decode errors
- **Solution**: Save file with UTF-8 encoding

#### **Empty or Invalid JSON**
- **Behavior**: Falls back to line-by-line text processing
- **Result**: Still usable for training

#### **Large File Memory Issues**
- **Symptom**: Upload timeout or failure
- **Solution**: Split file into smaller chunks

## Security and Privacy

### **Data Protection**
- **User Isolation**: Each user's files stored in separate S3 paths
- **Encryption**: All data encrypted at rest and in transit
- **Access Control**: IAM roles restrict access to authorized services only
- **Temporary Processing**: Local copies cleaned up after processing

### **File Storage Structure**
```
S3 Bucket:
├── users/
│   ├── {user_id_1}/
│   │   ├── uploads/
│   │   │   ├── original_file.txt
│   │   │   └── document.json
│   │   └── training-data/
│   │       └── train.jsonl
│   └── {user_id_2}/
│       ├── uploads/
│       └── training-data/
```

## Best Practices

### **Data Preparation**
1. **Clean Content**: Remove unnecessary formatting and special characters
2. **Consistent Format**: Use the same format across multiple files
3. **Quality Over Quantity**: Better to have high-quality, relevant content
4. **Test with Small Files**: Verify format compatibility before large uploads

### **File Organization**
- **Descriptive Names**: Use clear, descriptive filenames
- **Logical Grouping**: Group related content in single files
- **Version Control**: Include version information in filenames
- **Backup Strategy**: Keep original files as backup

### **Training Optimization**
- **Diverse Content**: Include varied examples for better generalization
- **Balanced Data**: Ensure representative coverage of use cases
- **Length Consideration**: Mix short and long text samples
- **Domain Specificity**: Focus on domain-relevant content for specialized models

## Troubleshooting

### **Upload Issues**
- Verify file format is supported (.txt, .json, .jsonl, .csv)
- Check file encoding is UTF-8
- Ensure file is not corrupted or empty
- Try uploading smaller files first

### **Processing Errors**
- Review file content for format consistency
- Check for special characters or encoding issues
- Validate JSON syntax if using structured formats
- Remove empty lines or invalid content

### **Performance Problems**
- Split large files into smaller chunks
- Use JSONL format for better streaming processing
- Reduce file size by removing unnecessary content
- Upload files individually rather than in batches

The platform provides flexible file format support while ensuring optimal processing for LLM fine-tuning, making it easy to work with various data sources and formats.