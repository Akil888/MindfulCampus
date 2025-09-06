import uuid
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from app.models.user import User, UserCreate, UserResponse

class AuthService:
    def __init__(self):
        self.secret_key = "mindfulcampus-secret-key-change-in-production"
        self.algorithm = "HS256"
        self.access_token_expire_minutes = 30
        self.refresh_token_expire_days = 7
        
        # Mock user storage (in production, use database)
        self.users_db = {}

    def _hash_password(self, password: str) -> str:
        """Hash password using SHA256"""
        return hashlib.sha256(password.encode()).hexdigest()

    def _verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return self._hash_password(plain_password) == hashed_password

    def _create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt

    def _create_refresh_token(self, data: Dict[str, Any]) -> str:
        """Create JWT refresh token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt

    async def create_user(self, user_data: UserCreate) -> UserResponse:
        """Create a new user"""
        # Check if user already exists
        if any(user.email == user_data.email for user in self.users_db.values()):
            raise Exception("User with this email already exists")

        # Generate user ID
        user_id = str(uuid.uuid4())
        
        # Create user object
        user = User(
            id=user_id,
            email=user_data.email,
            name=user_data.name,
            student_id=user_data.student_id,
            university=user_data.university,
            major=user_data.major,
            year=user_data.year,
            created_at=datetime.utcnow(),
            avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_data.email}"
        )
        
        # Store user with hashed password
        self.users_db[user_id] = {
            "user": user,
            "password_hash": self._hash_password(user_data.password)
        }
        
        return UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            student_id=user.student_id,
            university=user.university,
            major=user.major,
            year=user.year,
            avatar=user.avatar,
            created_at=user.created_at
        )

    async def authenticate_user(self, email: str, password: str) -> Dict[str, Any]:
        """Authenticate user and return tokens"""
        # Find user by email
        user_data = None
        user_id = None
        
        for uid, data in self.users_db.items():
            if data["user"].email == email:
                user_data = data
                user_id = uid
                break
        
        if not user_data or not self._verify_password(password, user_data["password_hash"]):
            raise Exception("Invalid credentials")
        
        # Update last login
        user_data["user"].last_login = datetime.utcnow()
        
        # Create tokens
        access_token_expires = timedelta(minutes=self.access_token_expire_minutes)
        access_token = self._create_access_token(
            data={"sub": user_id}, expires_delta=access_token_expires
        )
        refresh_token = self._create_refresh_token(data={"sub": user_id})
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": UserResponse(
                id=user_data["user"].id,
                email=user_data["user"].email,
                name=user_data["user"].name,
                student_id=user_data["user"].student_id,
                university=user_data["user"].university,
                major=user_data["user"].major,
                year=user_data["user"].year,
                avatar=user_data["user"].avatar,
                created_at=user_data["user"].created_at
            )
        }

    async def verify_token(self, token: str) -> User:
        """Verify JWT token and return user"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            user_id: str = payload.get("sub")
            if user_id is None:
                raise Exception("Invalid token")
        except jwt.PyJWTError:
            raise Exception("Invalid token")
        
        user_data = self.users_db.get(user_id)
        if user_data is None:
            raise Exception("User not found")
        
        return user_data["user"]

    async def refresh_access_token(self, refresh_token: str) -> Dict[str, str]:
        """Refresh access token using refresh token"""
        try:
            payload = jwt.decode(refresh_token, self.secret_key, algorithms=[self.algorithm])
            user_id: str = payload.get("sub")
            if user_id is None:
                raise Exception("Invalid refresh token")
        except jwt.PyJWTError:
            raise Exception("Invalid refresh token")
        
        user_data = self.users_db.get(user_id)
        if user_data is None:
            raise Exception("User not found")
        
        # Create new access token
        access_token_expires = timedelta(minutes=self.access_token_expire_minutes)
        access_token = self._create_access_token(
            data={"sub": user_id}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }