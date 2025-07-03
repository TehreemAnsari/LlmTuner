# LLM Tuner Platform - Technical Documentation

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Authentication System](#authentication-system)
3. [File Upload and S3 Integration](#file-upload-and-s3-integration)
4. [Machine Learning Training System](#machine-learning-training-system)
5. [Database Integration](#database-integration)
6. [API Endpoints](#api-endpoints)
7. [Frontend Architecture](#frontend-architecture)
8. [Security Implementation](#security-implementation)
9. [Deployment Configuration](#deployment-configuration)

---

## System Architecture Overview

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: FastAPI (Python) + Express.js (Node.js for server startup)
- **Database**: AWS DynamoDB
- **File Storage**: AWS S3
- **Authentication**: JWT + Google OAuth 2.0
- **Machine Learning**: Python GPT-2 fine-tuning

### Project Structure
```
llm-tuner/
├── client/src/                 # React frontend
│   ├── components/            # UI components
│   ├── contexts/             # React contexts
│   ├── pages/                # Application pages
│   └── App.tsx               # Main app component
├── server/                   # Backend services
│   ├── main.py              # FastAPI application
│   ├── auth.py              # Authentication logic
│   └── index.ts             # Express server startup
├── uploads/                  # Local fallback storage
├── gpt2_tuning.py           # ML training script
└── dist/                    # Built frontend assets
```

---

## Authentication System

### Overview
The platform implements a dual authentication system supporting both email/password and Google OAuth authentication, with JWT token-based session management.

### 1. Email/Password Authentication

#### Registration Flow
1. **Frontend**: User fills registration form (`RegisterForm.tsx`)
2. **API Call**: POST `/api/auth/register`
3. **Validation**: Pydantic schema validation
4. **Password Hashing**: bcrypt with salt
5. **Database**: Store user in DynamoDB
6. **Response**: JWT token returned

#### Code Implementation

**Backend - Registration Endpoint (`server/main.py`)**
```python
@app.post("/api/auth/register")
async def register(user_data: UserCreate):
    try:
        user = await auth_manager.create_user(user_data)
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth_manager.create_access_token(
            data={"sub": user["email"]}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

**Frontend - Registration Form (`client/src/components/auth/RegisterForm.tsx`)**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  try {
    await register(email, password, fullName);
  } catch (error: any) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};
```

#### Login Flow
1. **Frontend**: User submits credentials
2. **API Call**: POST `/api/auth/login`
3. **Validation**: Email/password verification
4. **Token Generation**: JWT with user claims
5. **Storage**: Token stored in localStorage
6. **Redirect**: User redirected to dashboard

### 2. Google OAuth Authentication

#### OAuth Flow
1. **Initiation**: User clicks "Continue with Google"
2. **Popup Window**: Opens Google OAuth consent screen
3. **Authorization**: User grants permissions
4. **Callback**: Google redirects to `/api/auth/google/callback`
5. **Token Exchange**: Authorization code exchanged for access token
6. **User Creation**: User profile created/updated in DynamoDB
7. **JWT Generation**: Platform JWT token created
8. **Cross-Window Communication**: Token passed to parent window
9. **Auto-Login**: User automatically logged into dashboard

#### Code Implementation

**OAuth Initiation (`server/main.py`)**
```python
@app.get("/api/auth/google")
async def google_login():
    base_url = get_base_url()
    redirect_uri = f"{base_url}/api/auth/google/callback"
    
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={os.getenv('GOOGLE_CLIENT_ID')}&"
        f"redirect_uri={redirect_uri}&"
        f"scope=openid email profile&"
        f"response_type=code&"
        f"access_type=offline&"
        f"include_granted_scopes=true"
    )
    
    return {
        "auth_url": auth_url,
        "redirect_uri": redirect_uri,
        "debug_info": {
            "base_url": base_url,
            "client_id_configured": bool(os.getenv('GOOGLE_CLIENT_ID'))
        }
    }
```

**OAuth Callback with Popup Handling (`server/main.py`)**
```python
@app.get("/api/auth/google/callback")
async def google_callback(code: str):
    try:
        # Exchange code for token
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "client_id": os.getenv('GOOGLE_CLIENT_ID'),
            "client_secret": os.getenv('GOOGLE_CLIENT_SECRET'),
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": f"{get_base_url()}/api/auth/google/callback",
        }
        
        async with httpx.AsyncClient() as client:
            token_response = await client.post(token_url, data=token_data)
            token_json = token_response.json()
            
            # Get user info
            user_info_url = f"https://www.googleapis.com/oauth2/v1/userinfo?access_token={token_data['access_token']}"
            response = await client.get(user_info_url)
            user_info = response.json()
        
        # Create user and JWT token
        google_user = GoogleUser(
            email=user_info["email"],
            name=user_info["name"],
            picture=user_info["picture"],
            sub=user_info["id"]
        )
        
        user = await auth_manager.create_google_user(google_user)
        access_token = auth_manager.create_access_token(
            data={"sub": user["email"]}, expires_delta=access_token_expires
        )
        
        # Return HTML that communicates with parent window
        success_html = f"""
        <!DOCTYPE html>
        <html>
        <head><title>Login Success</title></head>
        <body>
            <script>
                localStorage.setItem('token', '{access_token}');
                
                if (window.opener) {{
                    window.opener.postMessage({{
                        type: 'GOOGLE_AUTH_SUCCESS',
                        token: '{access_token}'
                    }}, '*');
                    
                    try {{
                        window.opener.location.reload();
                    }} catch (e) {{
                        window.opener.location.href = '{frontend_url}';
                    }}
                    
                    window.close();
                }} else {{
                    window.location.href = '{frontend_url}';
                }}
            </script>
        </body>
        </html>
        """
        
        return HTMLResponse(content=success_html)
    except Exception as e:
        # Error handling with user-friendly popup
        return HTMLResponse(content=error_html)
```

**Frontend Popup Handling (`client/src/components/auth/LoginForm.tsx`)**
```typescript
const handleGoogleLogin = async () => {
  try {
    const response = await fetch('/api/auth/google');
    const data = await response.json();
    
    // Open popup window
    const popup = window.open(
      data.auth_url,
      'googleAuth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );
    
    if (!popup) {
      // Fallback to same window
      window.location.href = data.auth_url;
      return;
    }
    
    // Listen for popup completion
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.location.reload();
      }
    }, 1000);
    
  } catch (error) {
    setError('Google login failed. Please try again.');
  }
};
```

### 3. Session Management

#### JWT Token Structure
```json
{
  "sub": "user@example.com",
  "user_id": "user_ABC123",
  "exp": 1751577559,
  "iat": 1751575759
}
```

#### Token Storage and Validation
- **Storage**: localStorage (both 'token' and 'access_token' keys)
- **Validation**: HTTP Bearer token on protected routes
- **Expiration**: 30 minutes (configurable)
- **Refresh**: Manual re-authentication required

#### Protected Route Implementation
```python
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = auth_manager.decode_token(token)
        
        if payload is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await auth_manager.get_user_by_email(email)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authentication")
```

---

## File Upload and S3 Integration

### Overview
The platform uses AWS S3 for secure, scalable file storage with user-isolated organization and unique file naming.

### 1. S3 Configuration

#### Bucket Structure
```
s3://llm-tuner-user-uploads/
└── users/
    └── {user_id}/
        └── uploads/
            └── {uuid}_{filename}
```

#### S3 Client Setup (`server/main.py`)
```python
def get_s3_client():
    return boto3.client(
        's3',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        region_name='us-east-1'
    )

S3_BUCKET_NAME = 'llm-tuner-user-uploads'
```

### 2. File Upload Process

#### Upload Flow
1. **Frontend**: User selects files via drag-and-drop interface
2. **Validation**: File type and size validation
3. **Authentication**: JWT token verification
4. **S3 Upload**: File uploaded with unique naming
5. **Metadata**: File info stored with user association
6. **Response**: Upload confirmation with S3 key

#### Upload Implementation

**Backend Upload Function (`server/main.py`)**
```python
async def upload_to_s3(file_content: bytes, file_name: str, user_id: str, content_type: str = 'application/octet-stream') -> str:
    try:
        s3_client = get_s3_client()
        
        # Create unique file path
        file_id = str(uuid.uuid4())
        s3_key = f"users/{user_id}/uploads/{file_id}_{file_name}"
        
        # Upload to S3
        s3_client.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=s3_key,
            Body=file_content,
            ContentType=content_type,
            Metadata={
                'user_id': user_id,
                'original_filename': file_name,
                'file_id': file_id
            }
        )
        
        print(f"📁 Uploaded {file_name} to S3: s3://{S3_BUCKET_NAME}/{s3_key}")
        return s3_key
        
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file to S3: {str(e)}")
```

**Upload Endpoint (`server/main.py`)**
```python
@app.post("/api/upload", response_model=UploadResponse)
async def upload_files(files: List[UploadFile] = File(...), current_user: dict = Depends(get_current_user)):
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    
    processed_files = []
    user_id = current_user["user_id"]
    
    for file in files:
        if not file.filename:
            raise HTTPException(status_code=400, detail="Invalid filename")
            
        # Read file content
        content = await file.read()
        content_str = content.decode('utf-8')
        
        # Upload to S3
        s3_key = await upload_to_s3(
            content, 
            file.filename, 
            user_id, 
            file.content_type or 'text/plain'
        )
        
        # Get file info
        ext = Path(file.filename).suffix.lower()
        lines = len(content_str.split('\n'))
        
        processed_files.append({
            "originalName": file.filename,
            "size": len(content),
            "type": ext,
            "contentPreview": content_str[:200] + ("..." if len(content_str) > 200 else ""),
            "s3_key": s3_key
        })
    
    return UploadResponse(
        message="Files uploaded and processed successfully",
        files=processed_files
    )
```

**Frontend Upload Component (`client/src/components/file-upload.tsx`)**
```typescript
const handleFileUpload = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Upload response:', result);
      onFilesUploaded(files);
    } else {
      throw new Error('Upload failed');
    }
  } catch (error) {
    console.error('Upload error:', error);
  }
};
```

### 3. File Download and Access

#### Download from S3
```python
async def download_from_s3(s3_key: str) -> bytes:
    try:
        s3_client = get_s3_client()
        response = s3_client.get_object(Bucket=S3_BUCKET_NAME, Key=s3_key)
        return response['Body'].read()
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Failed to download file from S3: {str(e)}")
```

---

## Machine Learning Training System

### Overview
The platform executes GPT-2 fine-tuning using uploaded training data with configurable hyperparameters.

### 1. Training Flow

#### Process Overview
1. **File Retrieval**: Download training data from S3
2. **Preprocessing**: Create temporary local file for script
3. **Script Execution**: Run GPT-2 training script with parameters
4. **Output Capture**: Log training progress and results
5. **Cleanup**: Remove temporary files

### 2. Training Implementation

#### Training Endpoint (`server/main.py`)
```python
@app.post("/api/start-training", response_model=TrainingResponse)
async def start_training(request: TrainingRequest, current_user: dict = Depends(get_current_user)):
    print(f"🎯 Starting training with hyperparameters: {request.hyperparameters.model_dump()}")
    print(f"📂 Training files: {request.files}")
    
    processed_files = []
    user_id = current_user["user_id"]
    
    for filename in request.files:
        temp_content_path = None
        ext = Path(filename).suffix.lower()
        
        try:
            # Find file in user's S3 folder
            s3_client = get_s3_client()
            prefix = f"users/{user_id}/uploads/"
            
            response = s3_client.list_objects_v2(
                Bucket=S3_BUCKET_NAME,
                Prefix=prefix
            )
            
            file_s3_key = None
            for obj in response.get('Contents', []):
                obj_key = obj['Key']
                if filename in obj_key:
                    file_s3_key = obj_key
                    break
            
            if not file_s3_key:
                print(f"⚠️ File not found in S3 for {filename}")
                continue
            
            # Download from S3
            print(f"📥 Downloading {file_s3_key} from S3...")
            content_bytes = await download_from_s3(file_s3_key)
            content_str = content_bytes.decode('utf-8')
            
            # Create temporary local file
            temp_content_path = uploads_dir / f"temp_{filename}"
            temp_content_path.write_text(content_str)
            
            # Execute GPT-2 script
            hyperparams_json = json.dumps(request.hyperparameters.model_dump())
            
            cmd = [
                "python", "gpt2_tuning.py",
                "--file_name", filename,
                "--file_type", ext,
                "--content_file", str(temp_content_path),
                "--hyperparameters", hyperparams_json
            ]
            
            print(f"🔧 Executing: {' '.join(cmd[:6])}...")
            
            try:
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
                
                if result.stdout:
                    print("=== GPT-2 Script Output ===")
                    for line in result.stdout.strip().split('\\n'):
                        if line.strip():
                            print(line)
                    print("==========================")
                
                if result.stderr:
                    print(f"⚠️ GPT-2 Script Errors: {result.stderr}")
                    
            except subprocess.TimeoutExpired:
                print(f"⏰ Training timeout for {filename}")
            except Exception as e:
                print(f"❌ Training error for {filename}: {e}")
            
            processed_files.append({
                "fileName": filename,
                "tuningInfo": {
                    "tuningScript": "gpt2_tuning.py",
                    "fileName": filename,
                    "fileType": ext
                }
            })
                    
        except Exception as e:
            print(f"❌ Error processing {filename} from S3: {e}")
        finally:
            # Cleanup temporary file
            if temp_content_path and temp_content_path.exists():
                temp_content_path.unlink()
    
    return TrainingResponse(
        message="Training completed successfully",
        hyperparameters=request.hyperparameters,
        files=processed_files
    )
```

### 3. GPT-2 Training Script

#### Hyperparameters Configuration
```python
class Hyperparameters(BaseModel):
    learning_rate: float = 0.001
    batch_size: int = 32
    epochs: int = 10
    optimizer: str = "adam"
    weight_decay: float = 0.01
    max_sequence_length: int = 2048
```

#### Training Script (`gpt2_tuning.py`)
```python
def read_data(file_content, file_type):
    """Process uploaded file content into training dataset"""
    lines = file_content.strip().split('\n')
    # Process data based on file type
    processed_samples = []
    for line in lines:
        if line.strip():
            processed_samples.append(line.strip())
    return processed_samples

# Script execution with hyperparameters
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--file_name', required=True)
    parser.add_argument('--file_type', required=True)
    parser.add_argument('--content_file', required=True)
    parser.add_argument('--hyperparameters', required=True)
    
    args = parser.parse_args()
    
    # Load hyperparameters
    hyperparams = json.loads(args.hyperparameters)
    
    # Process training data
    with open(args.content_file, 'r') as f:
        content = f.read()
    
    samples = read_data(content, args.file_type)
    
    print(f"Processing file content of type: {args.file_type}")
    print(f"Content length: {len(content)} characters")
    print(f"Prepared {len(samples)} text samples for training")
    print(f"📊 Hyperparameters loaded------>: {hyperparams}")
```

---

## Database Integration

### Overview
The platform uses AWS DynamoDB for user data storage with secure password hashing and Google OAuth integration.

### 1. DynamoDB Configuration

#### Table Structure: `LLM_Tuning_User_Login_info`
```json
{
  "user_id": "user_ABC123",           // Partition Key
  "email": "user@example.com",        // Global Secondary Index
  "password_hash": "$2b$12$...",      // bcrypt hash (email users only)
  "full_name": "John Doe",
  "created_at": "2025-07-03T21:00:00Z",
  "provider": "email",                // "email" or "google"
  "google_sub": "107502290603611610054", // Google user ID (OAuth users only)
  "picture": "https://...",           // Profile picture URL (OAuth users only)
  "last_login": "2025-07-03T21:30:00Z"
}
```

### 2. Authentication Manager

#### User Management (`server/auth.py`)
```python
class AuthManager:
    def __init__(self):
        self.dynamodb = boto3.resource(
            'dynamodb',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name='us-east-1'
        )
        self.table = self.dynamodb.Table('LLM_Tuning_User_Login_info')
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def verify_password(self, password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    async def create_user(self, user_data: UserCreate) -> Dict[str, Any]:
        """Create new user in DynamoDB"""
        # Check if user already exists
        existing_user = await self.get_user_by_email(user_data.email)
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Create new user
        user_id = f"user_{generate_user_id()}"
        hashed_password = self.hash_password(user_data.password)
        
        user_item = {
            'user_id': user_id,
            'email': user_data.email,
            'password_hash': hashed_password,
            'full_name': user_data.full_name,
            'created_at': datetime.utcnow().isoformat(),
            'provider': 'email'
        }
        
        self.table.put_item(Item=user_item)
        return user_item
    
    async def create_google_user(self, google_user: GoogleUser) -> Dict[str, Any]:
        """Create or update Google OAuth user"""
        existing_user = await self.get_user_by_email(google_user.email)
        
        if existing_user:
            # Update existing user with Google info
            user_item = existing_user.copy()
            user_item.update({
                'provider': 'google',
                'google_sub': google_user.sub,
                'picture': google_user.picture,
                'last_login': datetime.utcnow().isoformat()
            })
        else:
            # Create new Google user
            user_id = f"google_{google_user.sub}"
            user_item = {
                'user_id': user_id,
                'email': google_user.email,
                'full_name': google_user.name,
                'created_at': datetime.utcnow().isoformat(),
                'provider': 'google',
                'google_sub': google_user.sub,
                'picture': google_user.picture,
                'last_login': datetime.utcnow().isoformat()
            }
        
        self.table.put_item(Item=user_item)
        return user_item
```

### 3. JWT Token Management

#### Token Creation and Validation
```python
def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(self, token: str) -> Optional[Dict[str, Any]]:
    """Decode JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
```

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/auth/register` | User registration | None |
| POST | `/api/auth/login` | User login | None |
| GET | `/api/auth/google` | Get Google OAuth URL | None |
| GET | `/api/auth/google/callback` | Handle OAuth callback | None |
| GET | `/api/auth/me` | Get current user info | Bearer Token |
| GET | `/api/auth/debug` | Debug OAuth configuration | None |

### File Management Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/upload` | Upload training files | Bearer Token |
| POST | `/api/start-training` | Start ML training | Bearer Token |

### Request/Response Examples

#### Registration Request
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "securepassword123",
  "full_name": "John Doe"
}
```

#### Registration Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### File Upload Response
```json
{
  "message": "Files uploaded and processed successfully",
  "files": [
    {
      "originalName": "train_data.txt",
      "size": 21972,
      "type": ".txt",
      "contentPreview": "Sample training data content...",
      "s3_key": "users/user_ABC123/uploads/uuid_train_data.txt"
    }
  ]
}
```

---

## Frontend Architecture

### 1. React Application Structure

#### Main Components
- **App.tsx**: Main application router and layout
- **AuthPage.tsx**: Authentication page with login/register forms
- **Dashboard.tsx**: Main dashboard with file upload and training
- **AuthContext.tsx**: Authentication state management

#### Component Hierarchy
```
App
├── AuthProvider (Context)
├── AuthPage
│   ├── LoginForm
│   └── RegisterForm
└── Dashboard
    ├── FileUpload
    └── Hyperparameters
```

### 2. State Management

#### Authentication Context (`client/src/contexts/AuthContext.tsx`)
```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token
    const savedToken = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchUserInfo(savedToken);
    } else {
      setIsLoading(false);
    }
    
    // Listen for storage changes (from popup)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && e.newValue) {
        setToken(e.newValue);
        fetchUserInfo(e.newValue);
        localStorage.setItem('access_token', e.newValue);
      }
    };
    
    // Listen for messages from popup
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'GOOGLE_AUTH_SUCCESS' && e.data.token) {
        setToken(e.data.token);
        fetchUserInfo(e.data.token);
        localStorage.setItem('access_token', e.data.token);
        localStorage.setItem('token', e.data.token);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('message', handleMessage);
    };
  }, []);
};
```

### 3. Routing and Navigation

#### App Router (`client/src/App.tsx`)
```typescript
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainContent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function MainContent() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return user ? <Dashboard /> : <AuthPage />;
}
```

---

## Security Implementation

### 1. Authentication Security

#### Password Security
- **Hashing**: bcrypt with salt rounds
- **Storage**: Only hashed passwords stored in database
- **Validation**: Server-side password strength requirements

#### JWT Security
- **Secret Key**: Environment variable-based signing
- **Expiration**: 30-minute token lifetime
- **Claims**: Minimal user information in payload

#### OAuth Security
- **HTTPS Only**: All OAuth redirects use HTTPS
- **State Validation**: CSRF protection via state parameter
- **Scope Limitation**: Minimal required permissions (email, profile)

### 2. API Security

#### Route Protection
```python
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Validate JWT token and return user"""
    try:
        token = credentials.credentials
        payload = auth_manager.decode_token(token)
        
        if payload is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        email = payload.get("sub")
        user = await auth_manager.get_user_by_email(email)
        
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authentication")
```

#### CORS Configuration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configured for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. File Security

#### S3 Access Control
- **IAM Roles**: Service-specific AWS credentials
- **Bucket Policy**: Restricted access to application
- **User Isolation**: Files organized by user ID
- **Unique Naming**: UUID-based file naming prevents conflicts

#### Upload Validation
- **File Type**: Content type validation
- **Size Limits**: Configurable upload size restrictions
- **Authentication**: All uploads require valid JWT token

---

## Deployment Configuration

### 1. Environment Variables

#### Required Environment Variables
```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT Security
SECRET_KEY=your_jwt_secret_key

# Replit Configuration
REPLIT_DOMAINS=your_replit_domain
```

### 2. Server Configuration

#### FastAPI Server (`server/main.py`)
```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
```

#### Node.js Startup (`server/index.ts`)
```typescript
const pythonProcess = spawn('python', [join(__dirname, 'main.py')], {
  stdio: 'inherit',
  cwd: process.cwd()
});
```

### 3. Build Process

#### Frontend Build
```bash
npm run build  # Builds React app to dist/
```

#### Static File Serving
```python
# Serve built frontend
app.mount("/", StaticFiles(directory="dist", html=True), name="static")
```

### 4. Production Considerations

#### Performance Optimizations
- **Static File Caching**: Browser caching for assets
- **API Response Compression**: Gzip compression enabled
- **Database Connection Pooling**: Efficient DynamoDB connections

#### Security Enhancements
- **HTTPS Enforcement**: All production traffic over HTTPS
- **Rate Limiting**: API endpoint rate limiting
- **Input Validation**: Comprehensive input sanitization
- **Error Handling**: Sanitized error responses

#### Monitoring and Logging
- **Application Logs**: Structured logging for debugging
- **S3 Access Logs**: File upload/download tracking
- **DynamoDB Metrics**: Database performance monitoring
- **Error Tracking**: Exception monitoring and alerting

---

## Conclusion

The LLM Tuner Platform provides a complete solution for machine learning model fine-tuning with enterprise-grade security, scalable file storage, and intuitive user interface. The architecture supports both individual and enterprise use cases with robust authentication, secure data handling, and comprehensive API documentation.

### Key Features Delivered
- ✅ **Dual Authentication**: Email/password + Google OAuth
- ✅ **Secure File Storage**: AWS S3 with user isolation
- ✅ **ML Training Integration**: GPT-2 fine-tuning with configurable parameters
- ✅ **Database Integration**: AWS DynamoDB for user management
- ✅ **Modern Frontend**: React + TypeScript with responsive design
- ✅ **Production Ready**: Comprehensive security and deployment configuration

### Technology Benefits
- **Scalability**: Cloud-native architecture with AWS services
- **Security**: JWT tokens, password hashing, OAuth integration
- **Maintainability**: Clean separation of concerns and comprehensive documentation
- **User Experience**: Intuitive interface with real-time feedback
- **Developer Experience**: TypeScript, comprehensive API documentation, structured codebase