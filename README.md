# LLM Tuner Platform

A professional web platform for fine-tuning Large Language Models with AWS SageMaker integration. Built with React frontend and FastAPI backend, providing enterprise-grade LLM training capabilities with cost management and real-time monitoring.

## Table of Contents

- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [File Structure](#file-structure)
- [Local Development Setup](#local-development-setup)
- [Production Deployment](#production-deployment)
- [Security Analysis](#security-analysis)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

## Features

### Core Functionality
- **Dual Training Options**: AWS SageMaker (enterprise) and Local GPT-2 (legacy)
- **Model Support**: Llama 2 7B/13B, FLAN-T5 XL with Parameter-Efficient Fine-Tuning
- **Authentication**: JWT-based auth with Google OAuth integration
- **File Management**: AWS S3 integration for secure training data storage
- **Cost Management**: Real-time cost estimation and training job monitoring
- **User Interface**: Modern React interface with dark mode support

### AWS Integration
- **SageMaker Training Jobs**: Professional LLM fine-tuning infrastructure
- **S3 Storage**: Secure, scalable file storage for training data and models
- **DynamoDB**: User data and session management
- **IAM Integration**: Secure role-based access control

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │───▶│  FastAPI Server │───▶│   AWS Services  │
│                 │    │                 │    │                 │
│ • Authentication│    │ • API Routes    │    │ • SageMaker     │
│ • File Upload   │    │ • Training Mgmt │    │ • S3 Storage    │
│ • Job Monitoring│    │ • Auth System   │    │ • DynamoDB      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: FastAPI, Python 3.11, Pydantic
- **Database**: AWS DynamoDB
- **Storage**: AWS S3
- **ML Platform**: AWS SageMaker
- **Authentication**: JWT, Google OAuth 2.0
- **Deployment**: Node.js wrapper, multiple startup options

## File Structure

### Root Directory
```
llm-tuner-platform/
├── README.md                           # This comprehensive guide
├── replit.md                          # Project documentation and preferences
├── package.json                       # Node.js dependencies and scripts
├── pyproject.toml                     # Python dependencies
├── tsconfig.json                      # TypeScript configuration
├── tailwind.config.js                 # Tailwind CSS configuration
├── vite.config.ts                     # Vite build configuration
├── eslint.config.js                   # ESLint configuration
├── postcss.config.js                  # PostCSS configuration
├── build.sh                          # Production build script
├── deploy-check.py                    # Deployment verification script
├── start-production.py               # Alternative production startup
├── gpt2_tuning.py                    # Legacy GPT-2 fine-tuning script
└── dist/                             # Production build output
```

### Client Directory (`client/`)
```
client/
├── src/
│   ├── main.tsx                      # React application entry point
│   ├── App.tsx                       # Main application component
│   ├── contexts/
│   │   └── AuthContext.tsx           # Authentication context provider
│   ├── pages/
│   │   ├── AuthPage.tsx              # Login/register page
│   │   └── Dashboard.tsx             # Main dashboard interface
│   └── components/
│       ├── auth/
│       │   ├── LoginForm.tsx         # Login form component
│       │   └── RegisterForm.tsx      # Registration form component
│       ├── file-upload.tsx           # File upload interface
│       ├── hyperparameters.tsx       # Legacy training configuration
│       └── sagemaker-training.tsx    # AWS SageMaker training interface
├── index.html                        # HTML template
└── public/                           # Static assets
```

### Server Directory (`server/`)
```
server/
├── main.py                           # FastAPI application and API routes
├── auth.py                           # Authentication system and user management
├── sagemaker_training.py             # AWS SageMaker integration
└── index.ts                          # Node.js server wrapper
```

### Documentation Files
```
docs/
├── DEPLOYMENT.md                     # Deployment instructions
├── SAGEMAKER_INTEGRATION.md          # AWS SageMaker integration guide
├── DEPLOYMENT_FIXES_SUMMARY.md       # Deployment troubleshooting
├── TECHNICAL_DOCUMENTATION.md        # Technical architecture details
├── AWS_ROLE_SETUP.md                 # AWS IAM role setup guide
├── CHANGELOG.md                      # Version history
├── LICENSE                           # MIT license
```

## Detailed File Descriptions

### Core Application Files

#### `server/main.py` (FastAPI Backend)
**Purpose**: Main FastAPI application with all API endpoints
**Key Features**:
- Authentication routes (`/api/auth/*`)
- File upload endpoints (`/api/upload`)
- SageMaker training management (`/api/sagemaker-training`)
- Legacy training support (`/api/start-training`)
- Static file serving for frontend
- CORS configuration for cross-origin requests

**Dependencies**: FastAPI, Uvicorn, boto3, authlib, bcrypt

#### `server/auth.py` (Authentication System)
**Purpose**: Complete user authentication and session management
**Key Features**:
- User registration and login with bcrypt password hashing
- JWT token generation and validation
- Google OAuth 2.0 integration
- AWS DynamoDB user storage
- Session management and token refresh

**Security Features**: Password hashing, secure token generation, OAuth state validation

#### `server/sagemaker_training.py` (ML Training Integration)
**Purpose**: AWS SageMaker integration for professional LLM training
**Key Features**:
- Training job creation and management
- Cost estimation and monitoring
- Multiple model support (Llama 2, FLAN-T5)
- Training data preparation and S3 integration
- Job status tracking and metrics collection

**AWS Services**: SageMaker, S3, IAM, CloudWatch

#### `client/src/contexts/AuthContext.tsx` (Frontend Auth)
**Purpose**: React context for authentication state management
**Key Features**:
- User state management
- Token storage and validation
- Login/logout functionality
- Cross-tab authentication sync
- Automatic token refresh

#### `client/src/components/sagemaker-training.tsx` (Training UI)
**Purpose**: React component for SageMaker training interface
**Key Features**:
- Model selection (Llama 2 7B/13B, FLAN-T5 XL)
- Instance type configuration
- Hyperparameter tuning interface
- Cost estimation display
- Training job monitoring

### Build and Deployment Files

#### `build.sh` (Build Script)
**Purpose**: Production build automation
**Process**:
1. Builds React frontend with Vite
2. Compiles Node.js TypeScript with esbuild
3. Copies Python files to dist directory
4. Creates upload directories
5. Verifies build completion

#### `deploy-check.py` (Deployment Verification)
**Purpose**: Validates deployment readiness
**Checks**:
- All required files present
- Python dependencies available
- AWS configuration valid
- Import functionality working

#### `start-production.py` (Alternative Startup)
**Purpose**: Direct Python startup without Node.js wrapper
**Features**:
- Standalone FastAPI server
- Error handling and logging
- Directory resolution
- Port configuration

### Configuration Files

#### `package.json` (Node.js Configuration)
**Purpose**: Node.js dependencies and build scripts
**Key Scripts**:
- `dev`: Development server with hot reload
- `build`: Production build process
- `start`: Production server startup
- `check`: TypeScript validation

#### `pyproject.toml` (Python Configuration)
**Purpose**: Python dependencies and project metadata
**Key Dependencies**:
- FastAPI, Uvicorn (web framework)
- boto3, sagemaker (AWS integration)
- authlib, bcrypt (authentication)
- pydantic (data validation)

#### `tsconfig.json` (TypeScript Configuration)
**Purpose**: TypeScript compiler configuration
**Settings**: Strict mode, ES2020 target, module resolution

#### `tailwind.config.js` (CSS Configuration)
**Purpose**: Tailwind CSS customization
**Features**: Custom colors, animations, responsive design

## Local Development Setup

### Prerequisites
- **Node.js 18+**: For frontend development and build tools
- **Python 3.11+**: For backend API and ML integration
- **Git**: For version control
- **AWS CLI** (optional): For AWS service testing

### Step 1: Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd llm-tuner-platform

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
# OR using uv (recommended)
uv add fastapi uvicorn authlib bcrypt boto3 httpx pydantic python-jose sagemaker
```

### Step 2: Environment Variables

Create a `.env` file in the root directory:

```env
# Development Configuration
NODE_ENV=development

# AWS Configuration (for SageMaker integration)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_DEFAULT_REGION=us-east-1
SAGEMAKER_EXECUTION_ROLE=arn:aws:iam::ACCOUNT:role/SageMakerExecutionRole
S3_BUCKET_NAME=your-training-data-bucket

# Authentication
SECRET_KEY=your-jwt-secret-key-minimum-32-characters
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# Local Development URLs
FRONTEND_URL=http://localhost:5000
BACKEND_URL=http://localhost:5000
```

### Step 3: Local Development Considerations

#### Authentication and OAuth
**Issue**: Google OAuth callback URLs are configured for Replit domains
**Local Solution**:
1. **Create separate Google OAuth credentials for local development**:
   - Go to Google Cloud Console
   - Create new OAuth 2.0 credentials
   - Set authorized redirect URI to: `http://localhost:5000/api/auth/google/callback`

2. **Update environment variables** with local OAuth credentials

3. **Alternative**: Use email/password authentication for local testing

#### AWS Services
**SageMaker**: Works from local if AWS credentials are configured
**S3**: Requires proper AWS credentials and bucket access
**DynamoDB**: Works with AWS credentials

**Local Testing Strategy**:
```bash
# Test AWS connectivity
aws sts get-caller-identity

# Test S3 access
aws s3 ls s3://your-bucket-name

# Test SageMaker permissions
aws sagemaker list-training-jobs --max-results 1
```

### Step 4: Running Locally

#### Development Mode (Hot Reload)
```bash
# Start development server
npm run dev

# This starts:
# - FastAPI backend on http://localhost:5000
# - React frontend with hot reload
# - File watching for auto-restart
```

#### Production Mode (Local)
```bash
# Build for production
npm run build

# Start production server
npm start
# OR
python start-production.py
# OR
cd dist && python main.py
```

### Step 5: Local Database Setup

#### Option 1: Use AWS DynamoDB (Recommended)
- Requires AWS credentials
- Uses production DynamoDB tables
- Consistent with production behavior

#### Option 2: Local DynamoDB (Advanced)
```bash
# Install DynamoDB Local
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb

# Update auth.py to use local endpoint
# endpoint_url='http://localhost:8000'
```

### Local Development Limitations

1. **Google OAuth**: Requires separate credentials for localhost
2. **HTTPS Features**: Some browser features require HTTPS
3. **Cross-Origin Issues**: May need CORS configuration adjustments
4. **AWS Costs**: SageMaker training incurs real AWS costs even in development

## Documentation

All comprehensive documentation is now organized in the `/docs` folder:

- **[Complete Documentation Index](docs/README.md)** - Navigate all guides and references
- **[SageMaker Integration](docs/SAGEMAKER_INTEGRATION.md)** - AWS SageMaker with JumpStart
- **[Model Testing Guide](docs/MODEL_TESTING_GUIDE.md)** - Testing and validation workflows
- **[Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md)** - Complete architecture guide
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[AWS Setup Guide](docs/AWS_ROLE_SETUP.md)** - IAM configuration for SageMaker
- **[Post-Training Workflow](docs/POST_TRAINING_WORKFLOW.md)** - Model management and deployment

## Production Deployment

### Deployment Options

#### Option 1: Replit Deployment (Recommended)
**Advantages**: Integrated environment, automatic scaling, HTTPS included
**Process**:
1. Configure environment variables in Replit Secrets
2. Run build process: `./build.sh`
3. Click "Deploy" button in Replit interface
4. Access at: `https://your-repl-name.replit.app`

#### Option 2: Cloud Platform Deployment
**Platforms**: AWS EC2, Google Cloud Run, Azure Container Instances, DigitalOcean

### Custom Domain Deployment

#### Step 1: Domain Purchase and DNS Setup
```bash
# Purchase domain from registrar (Namecheap, GoDaddy, etc.)
# Configure DNS records:

# A Record (if using static IP)
Type: A
Name: @
Value: your-server-ip
TTL: 3600

# CNAME Record (if using platform subdomain)
Type: CNAME
Name: @
Value: your-platform-url.com
TTL: 3600

# WWW Redirect
Type: CNAME
Name: www
Value: your-domain.com
TTL: 3600
```

#### Step 2: SSL Certificate Setup
```bash
# Using Let's Encrypt (free)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Using Cloudflare (recommended)
# 1. Add domain to Cloudflare
# 2. Update nameservers at registrar
# 3. Enable SSL/TLS encryption in Cloudflare dashboard
```

#### Step 3: Production Server Setup (Ubuntu/Debian)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install python3.11 python3-pip nodejs npm nginx

# Install PM2 for process management
sudo npm install -g pm2

# Clone and setup application
git clone <repository-url>
cd llm-tuner-platform
npm install
pip install -r requirements.txt

# Build application
./build.sh

# Configure environment variables
sudo nano /etc/environment
# Add all production environment variables

# Setup systemd service
sudo nano /etc/systemd/system/llm-tuner.service
```

#### Step 4: Systemd Service Configuration
```ini
[Unit]
Description=LLM Tuner Platform
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/llm-tuner-platform
ExecStart=/usr/bin/python3 start-production.py
Restart=always
RestartSec=3
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

#### Step 5: Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Proxy to FastAPI application
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static file caching
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Step 6: Production Environment Variables
```bash
# Create production environment file
sudo nano /etc/environment

# Add variables:
NODE_ENV=production
AWS_ACCESS_KEY_ID=production_aws_key
AWS_SECRET_ACCESS_KEY=production_aws_secret
AWS_DEFAULT_REGION=us-east-1
SAGEMAKER_EXECUTION_ROLE=arn:aws:iam::ACCOUNT:role/SageMakerExecutionRole
S3_BUCKET_NAME=production-bucket
SECRET_KEY=production-jwt-secret-key-minimum-32-characters
GOOGLE_CLIENT_ID=production_google_client_id
GOOGLE_CLIENT_SECRET=production_google_client_secret
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://your-domain.com
```

#### Step 7: Start Production Services
```bash
# Enable and start services
sudo systemctl enable llm-tuner
sudo systemctl start llm-tuner
sudo systemctl enable nginx
sudo systemctl start nginx

# Check status
sudo systemctl status llm-tuner
sudo systemctl status nginx

# View logs
sudo journalctl -u llm-tuner -f
```

### Docker Deployment (Alternative)

#### Dockerfile
```dockerfile
FROM python:3.11-slim

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

COPY pyproject.toml ./
RUN pip install -r requirements.txt

# Copy application code
COPY . .

# Build application
RUN ./build.sh

# Expose port
EXPOSE 5000

# Start application
CMD ["python", "start-production.py"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  llm-tuner:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - SECRET_KEY=${SECRET_KEY}
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - llm-tuner
    restart: unless-stopped
```

## Security Analysis

### Current Security Measures

#### Authentication Security
✅ **JWT Token-Based Authentication**
- Secure token generation with configurable expiration
- Automatic token refresh mechanism
- HTTP-only cookie option available

✅ **Password Security**
- bcrypt hashing with salt rounds
- Minimum password requirements (implementation dependent)
- Secure password reset flow (via email)

✅ **OAuth 2.0 Integration**
- Google OAuth with proper state validation
- CSRF protection via state parameter
- Secure redirect URI validation

#### API Security
✅ **Input Validation**
- Pydantic models for request validation
- Type safety with TypeScript
- File upload size and type restrictions

✅ **CORS Configuration**
- Controlled cross-origin resource sharing
- Configurable allowed origins
- Credential handling

✅ **HTTPS Enforcement**
- Production deployment uses HTTPS
- Secure cookie flags in production
- HTTP redirect to HTTPS

#### AWS Security
✅ **IAM Role-Based Access**
- Principle of least privilege
- Service-specific execution roles
- Resource-based access control

✅ **Data Encryption**
- S3 bucket encryption at rest
- DynamoDB encryption
- TLS for data in transit

### Critical Security Vulnerabilities

#### 🔴 HIGH PRIORITY - Requires Manual Fixes

##### 1. Environment Variable Exposure
**Issue**: Sensitive environment variables may be logged or exposed
**Current Risk**: High
**Manual Fix Required**:
```python
# Add to main.py startup
import logging
logging.getLogger("boto3").setLevel(logging.WARNING)
logging.getLogger("botocore").setLevel(logging.WARNING)

# Implement environment variable sanitization
SENSITIVE_VARS = ['SECRET_KEY', 'AWS_SECRET_ACCESS_KEY', 'GOOGLE_CLIENT_SECRET']
```

##### 2. JWT Secret Key Management
**Issue**: JWT secret key is stored in environment variables
**Current Risk**: High if compromised
**Manual Fix Required**:
1. Use AWS Secrets Manager or HashiCorp Vault
2. Implement key rotation mechanism
3. Use asymmetric keys (RS256) instead of symmetric (HS256)

```python
# Recommended implementation
import boto3
import json

def get_jwt_secret():
    client = boto3.client('secretsmanager')
    response = client.get_secret_value(SecretId='llm-tuner/jwt-secret')
    return json.loads(response['SecretString'])['secret']
```

##### 3. Database Access Control
**Issue**: DynamoDB tables may lack proper access controls
**Current Risk**: Medium
**Manual Fix Required**:
1. Implement fine-grained DynamoDB IAM policies
2. Enable DynamoDB encryption at rest
3. Implement audit logging

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": "arn:aws:dynamodb:region:account:table/llm-tuner-users",
      "Condition": {
        "ForAllValues:StringEquals": {
          "dynamodb:Attributes": ["user_id", "email", "created_at"]
        }
      }
    }
  ]
}
```

##### 4. S3 Bucket Security
**Issue**: S3 bucket may have overly permissive access
**Current Risk**: Medium
**Manual Fix Required**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyInsecureConnections",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::your-bucket",
        "arn:aws:s3:::your-bucket/*"
      ],
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    },
    {
      "Sid": "DenyPublicAccess",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket/*",
      "Condition": {
        "StringNotEquals": {
          "aws:PrincipalServiceName": "sagemaker.amazonaws.com"
        }
      }
    }
  ]
}
```

#### 🟡 MEDIUM PRIORITY - Security Improvements

##### 1. Rate Limiting
**Issue**: No rate limiting on API endpoints
**Impact**: Potential for abuse and DDoS attacks
**Implementation Needed**:

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/auth/login")
@limiter.limit("5/minute")
async def login(request: Request, user_data: UserLogin):
    # Implementation
```

##### 2. Input Sanitization
**Issue**: Limited input sanitization for file uploads
**Impact**: Potential for malicious file uploads
**Implementation Needed**:

```python
import magic

def validate_file_content(file_content: bytes, expected_type: str) -> bool:
    mime = magic.from_buffer(file_content, mime=True)
    allowed_types = {
        'text': ['text/plain', 'application/json'],
        'data': ['text/csv', 'application/json']
    }
    return mime in allowed_types.get(expected_type, [])
```

##### 3. Session Management
**Issue**: No session timeout or concurrent session limits
**Impact**: Potential for session hijacking
**Implementation Needed**:

```python
# Add session tracking to DynamoDB
def create_session(user_id: str, token: str) -> str:
    session_id = str(uuid.uuid4())
    session_data = {
        'session_id': session_id,
        'user_id': user_id,
        'token_hash': hashlib.sha256(token.encode()).hexdigest(),
        'created_at': datetime.utcnow().isoformat(),
        'expires_at': (datetime.utcnow() + timedelta(hours=24)).isoformat(),
        'ip_address': request.client.host
    }
    # Store in DynamoDB sessions table
```

##### 4. Audit Logging
**Issue**: Limited audit logging for sensitive operations
**Impact**: Difficulty in security incident investigation
**Implementation Needed**:

```python
import structlog

audit_logger = structlog.get_logger("audit")

def log_security_event(event_type: str, user_id: str, details: dict):
    audit_logger.info(
        "security_event",
        event_type=event_type,
        user_id=user_id,
        timestamp=datetime.utcnow().isoformat(),
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent"),
        **details
    )
```

### Security Checklist for Production

#### Pre-Deployment Security Tasks

- [ ] **AWS Security**
  - [ ] Create dedicated IAM user for application with minimal permissions
  - [ ] Enable CloudTrail logging for AWS API calls
  - [ ] Configure S3 bucket policy to deny public access
  - [ ] Enable DynamoDB encryption at rest
  - [ ] Set up AWS Config for compliance monitoring

- [ ] **Application Security**
  - [ ] Generate strong JWT secret key (minimum 256 bits)
  - [ ] Implement rate limiting on all API endpoints
  - [ ] Add input validation and sanitization
  - [ ] Configure HTTPS with strong TLS settings
  - [ ] Implement audit logging for all user actions

- [ ] **Infrastructure Security**
  - [ ] Configure firewall to allow only necessary ports
  - [ ] Enable fail2ban for SSH protection
  - [ ] Set up monitoring and alerting
  - [ ] Configure automated security updates
  - [ ] Implement backup and disaster recovery

- [ ] **Monitoring and Compliance**
  - [ ] Set up AWS GuardDuty for threat detection
  - [ ] Configure AWS Security Hub for compliance monitoring
  - [ ] Implement log aggregation and analysis
  - [ ] Set up security incident response procedures
  - [ ] Regular security audits and penetration testing

#### Post-Deployment Security Monitoring

- [ ] **Daily Tasks**
  - [ ] Monitor failed login attempts
  - [ ] Check AWS CloudTrail logs for unusual activity
  - [ ] Review application error logs
  - [ ] Monitor SageMaker training job costs

- [ ] **Weekly Tasks**
  - [ ] Review user account activity
  - [ ] Check for security updates
  - [ ] Analyze access patterns
  - [ ] Backup validation

- [ ] **Monthly Tasks**
  - [ ] Security audit and review
  - [ ] Update dependencies
  - [ ] Review and rotate API keys
  - [ ] Disaster recovery testing

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "full_name": "John Doe"
}
```

**Response**:
```json
{
  "access_token": "jwt-token-here",
  "token_type": "bearer"
}
```

#### POST /api/auth/login
Authenticate user and receive access token.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response**:
```json
{
  "access_token": "jwt-token-here",
  "token_type": "bearer"
}
```

#### GET /api/auth/google
Initiate Google OAuth flow.

**Response**:
```json
{
  "auth_url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

#### GET /api/auth/me
Get current user information (requires authentication).

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "created_at": "2025-01-01T00:00:00Z",
  "provider": "email"
}
```

### File Upload Endpoints

#### POST /api/upload
Upload training files to S3.

**Headers**: `Authorization: Bearer <token>`

**Request**: `multipart/form-data` with file(s)

**Response**:
```json
{
  "message": "Files uploaded and processed successfully",
  "files": [
    {
      "originalName": "training_data.txt",
      "size": 1024,
      "type": ".txt",
      "contentPreview": "Sample content...",
      "s3_key": "users/uuid/uploads/filename"
    }
  ]
}
```

### Training Endpoints

#### POST /api/sagemaker-training
Start AWS SageMaker training job.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "base_model": "llama-2-7b",
  "hyperparameters": {
    "learning_rate": 0.0001,
    "batch_size": 4,
    "epochs": 3,
    "max_sequence_length": 2048,
    "weight_decay": 0.01
  },
  "files": ["training_data.txt"],
  "instance_type": "ml.g5.2xlarge"
}
```

**Response**:
```json
{
  "job_name": "llm-tune-user123-llama-2-7b-20250105-143052",
  "job_arn": "arn:aws:sagemaker:us-east-1:123456789012:training-job/...",
  "status": "InProgress",
  "training_data_s3_uri": "s3://bucket/users/uuid/training-data/",
  "output_s3_uri": "s3://bucket/users/uuid/models/job-name/",
  "instance_type": "ml.g5.2xlarge",
  "created_at": "2025-01-05T14:30:52Z",
  "estimated_cost_per_hour": 1.21
}
```

#### GET /api/training-job/{job_name}
Get training job status and metrics.

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "job_name": "llm-tune-user123-llama-2-7b-20250105-143052",
  "status": "Completed",
  "creation_time": "2025-01-05T14:30:52Z",
  "start_time": "2025-01-05T14:32:15Z",
  "end_time": "2025-01-05T16:45:30Z",
  "duration_seconds": 8595,
  "instance_type": "ml.g5.2xlarge",
  "failure_reason": null,
  "model_artifacts_s3_uri": "s3://bucket/users/uuid/models/job-name/output/model.tar.gz",
  "training_metrics": [
    {
      "metric_name": "train_loss",
      "value": 0.245,
      "timestamp": "2025-01-05T16:45:30Z"
    }
  ],
  "estimated_cost": 2.89
}
```

#### GET /api/training-jobs
List all training jobs for the current user.

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "training_jobs": [
    {
      "job_name": "llm-tune-user123-llama-2-7b-20250105-143052",
      "status": "Completed",
      "creation_time": "2025-01-05T14:30:52Z",
      "training_start_time": "2025-01-05T14:32:15Z",
      "training_end_time": "2025-01-05T16:45:30Z"
    }
  ]
}
```

#### POST /api/stop-training-job/{job_name}
Stop a running training job.

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "job_name": "llm-tune-user123-llama-2-7b-20250105-143052",
  "status": "Stopping",
  "stopped_at": "2025-01-05T15:00:00Z"
}
```

#### GET /api/training-cost-estimate
Get cost estimate for training configuration.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `base_model`: Model identifier
- `instance_type`: SageMaker instance type
- `estimated_hours`: Expected training duration

**Response**:
```json
{
  "base_model": "llama-2-7b",
  "instance_type": "ml.g5.2xlarge",
  "estimated_hours": 2.0,
  "hourly_cost": 1.21,
  "total_estimated_cost": 2.42,
  "currency": "USD"
}
```

### Legacy Training Endpoints

#### POST /api/start-training
Start legacy GPT-2 training (local processing).

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "hyperparameters": {
    "learning_rate": 0.001,
    "batch_size": 32,
    "epochs": 10,
    "optimizer": "adam",
    "weight_decay": 0.01,
    "max_sequence_length": 2048
  },
  "files": ["training_data.txt"]
}
```

**Response**:
```json
{
  "message": "Training completed successfully",
  "hyperparameters": { ... },
  "files": [
    {
      "fileName": "training_data.txt",
      "tuningInfo": {
        "tuningScript": "gpt2_tuning.py",
        "fileName": "training_data.txt",
        "fileType": ".txt"
      }
    }
  ]
}
```

## Troubleshooting

### Common Issues

#### Authentication Problems

**Issue**: Google OAuth redirect URI mismatch
**Solution**: Update Google Cloud Console OAuth credentials
```
Authorized redirect URIs:
- https://your-domain.com/api/auth/google/callback
- http://localhost:5000/api/auth/google/callback (for local dev)
```

**Issue**: JWT token expired
**Solution**: Implement automatic token refresh
```typescript
// Frontend token refresh logic
const refreshToken = async () => {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  // Handle response
};
```

#### AWS Configuration Issues

**Issue**: SageMaker training job fails with permission errors
**Solution**: Verify IAM role permissions
```bash
# Check role permissions
aws iam get-role --role-name SageMakerExecutionRole-LLMTuner
aws iam list-attached-role-policies --role-name SageMakerExecutionRole-LLMTuner
```

**Issue**: S3 access denied errors
**Solution**: Update S3 bucket policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT:role/SageMakerExecutionRole-LLMTuner"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket/*"
    }
  ]
}
```

#### Performance Issues

**Issue**: Slow file uploads
**Solution**: Implement chunked upload for large files
```typescript
const uploadLargeFile = async (file: File) => {
  const chunkSize = 5 * 1024 * 1024; // 5MB chunks
  // Implementation for chunked upload
};
```

**Issue**: High AWS costs
**Solution**: Implement cost controls
```python
# Add cost estimation before training
def estimate_training_cost(instance_type: str, duration_hours: float) -> float:
    hourly_costs = {
        'ml.g5.2xlarge': 1.21,
        'ml.g5.4xlarge': 1.83,
        'ml.p3.2xlarge': 3.06
    }
    return hourly_costs.get(instance_type, 0) * duration_hours
```

### Debugging Tools

#### Application Logs
```bash
# View application logs
sudo journalctl -u llm-tuner -f

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

#### AWS Debugging
```bash
# Check AWS credentials
aws sts get-caller-identity

# List SageMaker training jobs
aws sagemaker list-training-jobs --sort-by CreationTime --sort-order Descending

# Get training job details
aws sagemaker describe-training-job --training-job-name job-name

# Check CloudWatch logs
aws logs describe-log-groups --log-group-name-prefix /aws/sagemaker
```

#### Database Debugging
```python
# Test DynamoDB connection
import boto3
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('llm-tuner-users')
response = table.scan(Limit=1)
print(response)
```

### Performance Optimization

#### Frontend Optimization
- Implement lazy loading for components
- Use React.memo for expensive components
- Optimize bundle size with code splitting
- Enable gzip compression for static assets

#### Backend Optimization
- Implement caching for frequently accessed data
- Use connection pooling for database connections
- Optimize S3 operations with multipart uploads
- Implement request/response compression

#### AWS Cost Optimization
- Use SageMaker Spot instances for training
- Implement automatic training job timeouts
- Optimize S3 storage classes
- Monitor and set up billing alerts

---

## Updates-07/07/2025

### Major Platform Enhancements

#### 1. **SageMaker JumpStart Integration**
- **Complete Integration**: Replaced custom training containers with pre-built SageMaker JumpStart models
- **Available Models**: Llama 2 7B, Llama 2 13B, and FLAN-T5 XL with optimized fine-tuning configurations
- **Reliability Improvement**: Eliminated AlgorithmError issues by using AWS-managed training containers
- **No Script Requirements**: Pre-configured entry points handle all training complexities automatically

#### 2. **Real AWS Training Success**
- **Live SageMaker Jobs**: Successfully created actual AWS SageMaker training jobs visible in AWS Console
- **Job Name**: `llm-tune-google10-llama-2-7b-20250707-201433-ml-m5-large`
- **Data Processing**: 55,621 New Zealand enterprise survey samples processed and uploaded to S3
- **Instance Management**: Intelligent fallback from ml.g5.2xlarge to ml.m5.large for quota optimization

#### 3. **Comprehensive Model Testing Interface**
- **New Testing Tab**: Added dedicated "Model Testing" section in dashboard
- **Deployment Capabilities**: One-click model deployment to SageMaker endpoints
- **Interactive Testing**: Web-based interface for testing fine-tuned models with custom prompts
- **Download Options**: Direct model file downloads for local testing and integration

#### 4. **Enhanced Cost Management**
- **Multi-Instance Support**: Added ml.t3.medium ($0.042/hour), ml.c5.large ($0.085/hour), ml.m5.large ($0.096/hour)
- **Budget-Friendly Defaults**: Changed default instance from expensive GPU to cost-effective CPU instances
- **Real-time Estimation**: Accurate cost calculations based on actual AWS pricing

#### 5. **Advanced Error Handling**
- **Quota Management**: Intelligent detection and handling of AWS ResourceLimitExceeded errors
- **Instance Fallback**: Automatic retry with alternative instance types when quotas exceeded
- **User Feedback**: Clear messaging about quota limitations and resolution steps

#### 6. **Production-Ready Architecture**
- **S3 Integration**: All training data properly stored in AWS S3 for scalable access
- **Security**: Proper IAM role configuration with AmazonSageMakerFullAccess permissions
- **Monitoring**: Real-time job status tracking and progress updates

### Technical Achievements

#### Backend Enhancements
- **JumpStart Manager**: New `jumpstart_training.py` module for simplified model access
- **API Endpoints**: Added `/api/jumpstart-training` and `/api/jumpstart-models` endpoints
- **Configuration Updates**: Enhanced hyperparameter handling for JumpStart compatibility

#### Frontend Improvements
- **Updated Interface**: Modified SageMaker training component to use JumpStart endpoints
- **Better Notifications**: Improved success/error messages for training job creation
- **Cost Display**: Real-time cost estimation updates based on instance selection

#### Data Processing Success
- **Enterprise Survey Data**: Successfully processed 55,622-line New Zealand financial dataset
- **JSONL Format**: Converted CSV data to proper training format for LLM fine-tuning
- **S3 Storage**: Securely stored at `s3://llm-tuner-user-uploads/users/.../training-data/train.jsonl`

### User Experience Improvements

#### Simplified Workflow
1. **Upload**: Drag-and-drop CSV files with automatic processing
2. **Configure**: Select from pre-optimized JumpStart models and instance types
3. **Train**: One-click training job creation with real AWS SageMaker
4. **Test**: Comprehensive testing interface for fine-tuned models
5. **Deploy**: Production-ready model deployment options

#### Professional Features
- **AWS Console Integration**: Training jobs visible in official AWS SageMaker console
- **Cost Transparency**: Clear pricing information and budget-friendly options
- **Enterprise Ready**: Proper security, scaling, and monitoring capabilities

### Next Steps Available
- **Model Testing**: Use completed training jobs in the new testing interface
- **Deployment**: Deploy models to real-time inference endpoints
- **Integration**: Download models for local use or API integration
- **Scaling**: Request AWS quota increases for GPU instances when needed

This update transforms the platform from a demonstration tool into a production-ready enterprise LLM fine-tuning solution with real AWS integration.

---

## Support and Contributing

For support, please contact [support@your-domain.com] or create an issue in the repository.

For contributing guidelines, see [CONTRIBUTING.md].

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Last Updated**: July 7, 2025
**Version**: 2.1.0 with SageMaker JumpStart Integration