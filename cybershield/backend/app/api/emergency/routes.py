from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.base import get_db
from app.api.auth.routes import get_current_user
from app.models.user import User
from app.models.moderation import EmergencyReport, EmailLog

router = APIRouter(prefix="/emergency", tags=["emergency"])


@router.get("/reports")
def reports(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(EmergencyReport).filter(EmergencyReport.user_id == user.id).order_by(EmergencyReport.created_at.desc()).limit(50).all()
    return {"success": True, "message": "OK", "data": [
        {"id": r.id, "risk_score": r.risk_score, "severity": r.severity, "report_data": r.report_data, "created_at": r.created_at}
        for r in items
    ]}


@router.get("/email-logs")
def email_logs(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(EmailLog).filter(EmailLog.user_id == user.id).order_by(EmailLog.sent_at.desc()).limit(50).all()
    return {"success": True, "message": "OK", "data": [
        {"id": l.id, "recipient": l.recipient, "incident_type": l.incident_type, "status": l.status, "sent_at": l.sent_at}
        for l in logs
    ]}
