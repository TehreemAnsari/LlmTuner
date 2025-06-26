# LLM Tuner Platform

A clean, minimalist web platform for fine-tuning Large Language Models. Built with React frontend and FastAPI backend, providing an intuitive interface for uploading training data and configuring hyperparameters with real Python GPT-2 processing.

## Features

- **File Upload**: Drag-and-drop interface supporting JSON, CSV, TXT, and JSONL formats
- **Hyperparameter Configuration**: Interactive controls for learning rate, batch size, epochs, optimizer, weight decay, and sequence length
- **Real GPT-2 Training**: Actual Python script execution with dataset processing and hyperparameter validation
- **Training Estimates**: Cost and duration calculations based on configuration
- **Clean Interface**: Minimal UI with essential functionality only

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python + Pydantic for data validation
- **ML Processing**: Python with GPT-2 fine-tuning capabilities

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5000`

## Usage

1. **Upload Training Data**: Drag and drop your training files (JSON, CSV, TXT, JSONL)
2. **Configure Hyperparameters**: Adjust learning rate, batch size, epochs, and other settings
3. **Start Training**: Click "Start Training" to begin GPT-2 fine-tuning

## Project Structure

```
├── client/src/          # React frontend
├── server/             # FastAPI backend
├── gpt2_tuning.py      # GPT-2 training script
└── uploads/            # File upload storage
```

## File Count: Exactly 20 Files

This project maintains exactly 20 files across all folders and subfolders for optimal simplicity and maintainability.