from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.base import get_db
from app.api.auth.routes import get_current_user
from app.models.user import User
from app.models.moderation import Alert

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("")
def list_alerts(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alerts = db.query(Alert).filter(Alert.user_id == user.id).order_by(Alert.created_at.desc()).limit(100).all()
    return {"success": True, "message": "OK", "data": [
        {
            "id": a.id,
            "alert_type": a.alert_type,
            "severity": a.severity,
            "content_preview": a.content_preview,
            "status": a.status,
            "created_at": a.created_at,
        } for a in alerts
    ]}


@router.post("/{alert_id}/acknowledge")
def acknowledge(alert_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == user.id).first()
    if alert:
        alert.status = "acknowledged"
        db.commit()
    return {"success": True, "message": "Acknowledged", "data": {}}
