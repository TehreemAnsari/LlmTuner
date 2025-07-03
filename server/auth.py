"""
Authentication module for LLM Tuner Platform
Handles user registration, login, and session management with AWS DynamoDB
"""

import os
import boto3
import bcrypt
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
from botocore.exceptions import ClientError

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# DynamoDB Configuration
DYNAMODB_TABLE_NAME = "LLM_Tuning_User_Login_info"
AWS_REGION = "us-east-1"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    user_id: str
    email: str
    full_name: Optional[str] = None
    created_at: str
    provider: str = "email"  # "email" or "google"

class Token(BaseModel):
    access_token: str
    token_type: str

class GoogleUser(BaseModel):
    email: str
    name: str
    picture: str
    sub: str

class AuthManager:
    def __init__(self):
        self.dynamodb = boto3.resource(
            'dynamodb',
            region_name=AWS_REGION,
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )
        self.table = self.dynamodb.Table(DYNAMODB_TABLE_NAME)
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def verify_password(self, password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
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
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email from DynamoDB"""
        try:
            response = self.table.get_item(
                Key={'email': email}
            )
            return response.get('Item')
        except ClientError as e:
            print(f"Error getting user: {e}")
            return None
    
    async def create_user(self, user_data: UserCreate) -> Dict[str, Any]:
        """Create new user in DynamoDB"""
        try:
            # Check if user already exists
            existing_user = await self.get_user_by_email(user_data.email)
            if existing_user:
                raise ValueError("User already exists")
            
            # Hash password
            hashed_password = self.hash_password(user_data.password)
            
            # Create user item
            user_item = {
                'user_id': f"user_{secrets.token_urlsafe(16)}",
                'email': user_data.email,
                'password_hash': hashed_password,
                'full_name': user_data.full_name or "",
                'created_at': datetime.utcnow().isoformat(),
                'provider': 'email',
                'last_login': datetime.utcnow().isoformat()
            }
            
            # Save to DynamoDB
            self.table.put_item(Item=user_item)
            
            # Remove password hash from return data
            user_item.pop('password_hash', None)
            return user_item
            
        except ClientError as e:
            print(f"Error creating user: {e}")
            raise ValueError(f"Failed to create user: {e}")
    
    async def authenticate_user(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate user with email and password"""
        try:
            user = await self.get_user_by_email(email)
            if not user:
                return None
            
            if not self.verify_password(password, user.get('password_hash', '')):
                return None
            
            # Update last login
            self.table.update_item(
                Key={'email': email},
                UpdateExpression='SET last_login = :last_login',
                ExpressionAttributeValues={':last_login': datetime.utcnow().isoformat()}
            )
            
            # Remove password hash from return data
            user.pop('password_hash', None)
            return user
            
        except ClientError as e:
            print(f"Error authenticating user: {e}")
            return None
    
    async def create_google_user(self, google_user: GoogleUser) -> Dict[str, Any]:
        """Create or update Google OAuth user"""
        try:
            # Check if user already exists
            existing_user = await self.get_user_by_email(google_user.email)
            
            if existing_user:
                # Update last login for existing user
                self.table.update_item(
                    Key={'email': google_user.email},
                    UpdateExpression='SET last_login = :last_login',
                    ExpressionAttributeValues={':last_login': datetime.utcnow().isoformat()}
                )
                existing_user.pop('password_hash', None)
                return existing_user
            
            # Create new Google user
            user_item = {
                'user_id': f"google_{google_user.sub}",
                'email': google_user.email,
                'full_name': google_user.name,
                'created_at': datetime.utcnow().isoformat(),
                'provider': 'google',
                'google_id': google_user.sub,
                'profile_picture': google_user.picture,
                'last_login': datetime.utcnow().isoformat()
            }
            
            # Save to DynamoDB
            self.table.put_item(Item=user_item)
            return user_item
            
        except ClientError as e:
            print(f"Error creating Google user: {e}")
            raise ValueError(f"Failed to create Google user: {e}")
    
    def decode_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Decode JWT token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            return None

# Global auth manager instance
auth_manager = AuthManager()