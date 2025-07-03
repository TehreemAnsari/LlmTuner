# Deployment Guide

## Quick Deploy

1. **Using Replit Deploy**
   - Run the build process: `./build.sh`
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
pip install fastapi uvicorn python-multipart authlib bcrypt boto3 httpx pydantic python-jose

# Install Node.js dependencies
npm install

# Build frontend and copy Python files
./build.sh
```

### Production Start Options

#### Option 1: Using Node.js wrapper (Recommended)
```bash
npm start
```

#### Option 2: Direct Python execution
```bash
python start-production.py
```

#### Option 3: From dist directory
```bash
cd dist && python main.py
```

The application will be available at `http://0.0.0.0:5000`

## Environment Variables

### Required for Full Functionality
- `AWS_ACCESS_KEY_ID` - AWS S3 access key
- `AWS_SECRET_ACCESS_KEY` - AWS S3 secret key
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `SECRET_KEY` - JWT secret key
- `REPLIT_DOMAINS` - Domain for OAuth redirects

### Optional
- `S3_BUCKET_NAME` - AWS S3 bucket name (defaults to configured bucket)

## File Structure
- Frontend files are served from the `dist/` directory after build
- Backend API runs on FastAPI with automatic OpenAPI documentation
- File uploads are stored in AWS S3 with local fallback
- Python files are copied to `dist/` during build process

## Deployment Scripts

### build.sh
Builds the frontend and copies all Python files to the dist directory:
```bash
./build.sh
```

### deploy-check.py
Verifies that all required files are present for deployment:
```bash
python deploy-check.py
```

### start-production.py
Alternative production startup script that runs FastAPI directly:
```bash
python start-production.py
```

## Notes
- The application runs on port 5000 by default
- Both frontend and backend are served from the same FastAPI server
- Static files are automatically served from the built frontend
- All Python dependencies are defined in `pyproject.toml`
- The build process ensures all necessary files are copied to the dist directory