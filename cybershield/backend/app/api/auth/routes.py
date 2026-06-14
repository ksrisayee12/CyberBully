from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database.base import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserProfile
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token, decode_token

router = APIRouter(prefix="/auth", tags=["auth"])
bearer = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer), db: Session = Depends(get_db)) -> User:
    try:
        payload = decode_token(credentials.credentials)
        user = db.query(User).filter(User.id == int(payload["sub"])).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=req.name, email=req.email,
        password_hash=hash_password(req.password),
        instagram_username=req.instagram_username,
        emergency_contact_email=req.emergency_contact_email
    )
    db.add(user); db.commit(); db.refresh(user)
    token = create_access_token({"sub": str(user.id)})
    return {"success": True, "message": "Registered", "data": {"access_token": token, "token_type": "bearer"}}

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id)})
    return {"success": True, "message": "Login successful", "data": {"access_token": token, "token_type": "bearer"}}

@router.get("/profile")
def profile(user: User = Depends(get_current_user)):
    return {"success": True, "message": "OK", "data": UserProfile.from_orm(user)}

@router.put("/profile")
def update_profile(data: dict, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    for field in ["name", "emergency_contact_email", "instagram_username"]:
        if field in data:
            setattr(user, field, data[field])
    db.commit()
    return {"success": True, "message": "Updated", "data": {}}
