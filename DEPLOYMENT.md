# Deployment Guide

## Quick Deploy

1. **Using Replit Deploy**
   - Click the "Deploy" button in Replit
   - The application will be automatically built and deployed
   - Access your deployed app at `[your-repl-name].replit.app`

## Manual Deployment

### Prerequisites
- Python 3.11+
- Node.js 18+
- Modern web browser

### Environment Setup
```bash
# Install Python dependencies
pip install fastapi uvicorn python-multipart

# Install Node.js dependencies
npm install

# Build frontend
npm run build
```

### Production Start
```bash
# Start the production server
python server/main.py
```

The application will be available at `http://localhost:5000`

## Environment Variables

No additional environment variables are required for basic functionality.

## File Structure
- Frontend files are served from the `dist/` directory after build
- Backend API runs on FastAPI with automatic OpenAPI documentation
- File uploads are stored in the `uploads/` directory

## Notes
- The application runs on port 5000 by default
- Both frontend and backend are served from the same FastAPI server
- Static files are automatically served from the built frontend