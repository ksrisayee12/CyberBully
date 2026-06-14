from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
from app.database.base import get_db
from app.api.auth.routes import get_current_user
from app.models.user import User
from app.models.instagram import InstagramAccount
from app.core.security import encrypt
from app.services.collector_service import start_monitoring, stop_monitoring, is_session_expired

router = APIRouter(prefix="/monitor", tags=["monitoring"])


class MonitorStartRequest(BaseModel):
    instagram_username: str
    instagram_password: str


@router.post("/start")
def start(req: MonitorStartRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = db.query(InstagramAccount).filter(
        InstagramAccount.user_id == user.id,
        InstagramAccount.account_username == req.instagram_username
    ).first()

    if not account:
        account = InstagramAccount(
            user_id=user.id,
            account_username=req.instagram_username,
            password_encrypted=encrypt(req.instagram_password),
        )
        db.add(account)
    else:
        account.password_encrypted = encrypt(req.instagram_password)

    account.monitoring_status = "running"
    account.session_started_at = datetime.utcnow()
    db.commit()
    db.refresh(account)

    start_monitoring(account)
    return {"success": True, "message": "Monitoring started (session expires in 15 min)", "data": {"account_id": account.id}}


@router.post("/stop")
def stop(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    accounts = db.query(InstagramAccount).filter(
        InstagramAccount.user_id == user.id,
        InstagramAccount.monitoring_status == "running"
    ).all()
    for acc in accounts:
        stop_monitoring(acc.id)
        acc.monitoring_status = "stopped"
    db.commit()
    return {"success": True, "message": "Monitoring stopped", "data": {}}


@router.get("/status")
def status(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    accounts = db.query(InstagramAccount).filter(InstagramAccount.user_id == user.id).all()
    result = []
    for acc in accounts:
        expired = is_session_expired(acc)
        if expired and acc.monitoring_status == "running":
            acc.monitoring_status = "stopped"
            db.commit()
        result.append({
            "account_id": acc.id,
            "username": acc.account_username,
            "status": acc.monitoring_status,
            "session_started_at": acc.session_started_at,
            "session_expired": expired,
        })
    return {"success": True, "message": "OK", "data": result}
