from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    student_id: Optional[str] = None
    university: Optional[str] = None
    major: Optional[str] = None
    year: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    is_active: bool = True
    is_counselor: bool = False
    is_admin: bool = False
    is_researcher: bool = False
    created_at: datetime
    last_login: Optional[datetime] = None
    avatar: Optional[str] = None
    
    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    student_id: Optional[str]
    university: Optional[str]
    major: Optional[str]
    year: Optional[str]
    avatar: Optional[str]
    created_at: datetime