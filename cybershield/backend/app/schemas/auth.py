from pydantic import BaseModel, EmailStr
from typing import Optional

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    instagram_username: Optional[str] = None
    emergency_contact_email: Optional[EmailStr] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserProfile(BaseModel):
    id: int
    name: str
    email: str
    instagram_username: Optional[str]
    emergency_contact_email: Optional[str]

    class Config:
        from_attributes = True
