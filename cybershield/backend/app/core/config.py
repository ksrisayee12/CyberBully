from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # App
    APP_NAME: str = "CyberShield AI"
    DEBUG: bool = False
    SECRET_KEY: str = "change-this-in-production"
    
    # DB
    DATABASE_URL: str = "sqlite:///./cybershield.db"
    
    # JWT
    JWT_SECRET: str = "jwt-secret-change-in-prod"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Instagram session
    INSTAGRAM_SESSION_EXPIRE_MINUTES: int = 15
    
    # Email
    RESEND_API_KEY: Optional[str] = None
    
    # Cooldown
    EMERGENCY_EMAIL_COOLDOWN_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()
