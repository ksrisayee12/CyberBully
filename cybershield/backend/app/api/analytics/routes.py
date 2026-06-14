from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.base import get_db
from app.api.auth.routes import get_current_user
from app.models.user import User
from app.models.moderation import ModerationResult, Violation, Alert
from app.models.content import Comment, Message
from app.models.instagram import Post, InstagramAccount

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview")
def overview(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account_ids = [a.id for a in db.query(InstagramAccount).filter(InstagramAccount.user_id == user.id).all()]
    post_ids = [p.id for p in db.query(Post).filter(Post.account_id.in_(account_ids)).all()] if account_ids else []

    total_posts = len(post_ids)
    total_comments = db.query(Comment).filter(Comment.post_id.in_(post_ids)).count() if post_ids else 0
    total_messages = db.query(Message).count()
    flagged = db.query(ModerationResult).filter(ModerationResult.toxicity_score > 0.3).count()
    critical_alerts = db.query(Alert).filter(Alert.user_id == user.id, Alert.severity == "Critical").count()
    unread_alerts = db.query(Alert).filter(Alert.user_id == user.id, Alert.status == "unread").count()

    return {"success": True, "message": "OK", "data": {
        "total_posts": total_posts,
        "total_comments": total_comments,
        "total_messages": total_messages,
        "flagged_content": flagged,
        "critical_alerts": critical_alerts,
        "unread_alerts": unread_alerts,
    }}


@router.get("/trends")
def trends(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Category distribution
    categories = db.query(
        ModerationResult.category, func.count(ModerationResult.id)
    ).group_by(ModerationResult.category).all()

    # Severity distribution
    severities = db.query(
        ModerationResult.severity, func.count(ModerationResult.id)
    ).group_by(ModerationResult.severity).all()

    # Top offenders
    offenders = db.query(
        Violation.user_identifier, func.count(Violation.id).label("count")
    ).group_by(Violation.user_identifier).order_by(func.count(Violation.id).desc()).limit(10).all()

    return {"success": True, "message": "OK", "data": {
        "category_distribution": [{"category": c, "count": n} for c, n in categories],
        "severity_distribution": [{"severity": s, "count": n} for s, n in severities],
        "top_offenders": [{"username": u, "violations": n} for u, n in offenders],
    }}


@router.get("/offenders")
def offenders(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.services.analysis_pipeline import get_offender_level
    rows = db.query(
        Violation.user_identifier, func.count(Violation.id).label("count")
    ).group_by(Violation.user_identifier).order_by(func.count(Violation.id).desc()).limit(50).all()
    return {"success": True, "message": "OK", "data": [
        {"username": u, "violations": n, "risk_level": get_offender_level(n)} for u, n in rows
    ]}
