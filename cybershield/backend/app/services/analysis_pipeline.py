"""
Analysis Pipeline
Called after collector stores content.
Runs: moderation → severity → violation tracking → emergency trigger
"""
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.services.moderation_service import classify_text
from app.services.severity_service import calculate_severity, is_critical, is_threat_category
from app.services.emergency_service import trigger_emergency
from app.models.moderation import ModerationResult, Violation, Alert
from app.models.user import User

logger = logging.getLogger(__name__)

# WebSocket broadcaster (set by websocket module)
broadcast_fn = None


def _get_prior_violations(db: Session, author: str) -> int:
    return db.query(Violation).filter(Violation.user_identifier == author).count()


def analyze_content(
    db: Session,
    user: User,
    content_type: str,  # "comment" or "message"
    content_id: int,
    text: str,
    author: str,
) -> dict:
    if not text or not text.strip():
        return {}

    # 1. Classify
    mod = classify_text(text)
    toxicity_score = mod["toxicity_score"]
    category = mod["category"]
    confidence = mod["confidence"]

    # 2. Severity
    is_threat = is_threat_category(category)
    prior_violations = _get_prior_violations(db, author)
    sev = calculate_severity(toxicity_score, is_threat, prior_violations)
    severity_level = sev["severity_level"]
    severity_score = sev["severity_score"]

    # 3. Store moderation result
    result = ModerationResult(
        content_type=content_type,
        content_id=content_id,
        toxicity_score=toxicity_score,
        category=category,
        severity=severity_level,
        confidence=confidence,
    )
    db.add(result)

    # 4. Track violations
    if toxicity_score > 0.3:
        violation = Violation(
            user_identifier=author,
            violation_type=category,
            severity=severity_level,
        )
        db.add(violation)

    # 5. Create alert
    if toxicity_score > 0.3:
        alert = Alert(
            user_id=user.id,
            alert_type=category,
            severity=severity_level,
            content_preview=text[:200],
            status="unread",
        )
        db.add(alert)

    db.commit()

    # 6. Broadcast via WebSocket
    if broadcast_fn and toxicity_score > 0.3:
        try:
            import asyncio
            asyncio.create_task(broadcast_fn({
                "event": f"new_{content_type}",
                "severity": severity_level,
                "category": category,
                "author": author,
            }))
        except Exception:
            pass

    # 7. Emergency
    if is_critical(severity_level):
        trigger_emergency(
            db=db,
            user=user,
            content_preview=text,
            severity_score=severity_score,
            severity_level=severity_level,
            incident_type=category,
            report_data={
                "content_type": content_type,
                "content_id": content_id,
                "author": author,
                "toxicity_score": toxicity_score,
            },
        )
        if broadcast_fn:
            try:
                import asyncio
                asyncio.create_task(broadcast_fn({"event": "emergency_triggered", "severity": severity_level}))
            except Exception:
                pass

    return {
        "toxicity_score": toxicity_score,
        "category": category,
        "severity": severity_level,
        "severity_score": severity_score,
    }


def get_offender_level(violation_count: int) -> str:
    if violation_count == 0:
        return "Clean"
    elif violation_count <= 2:
        return "Low"
    elif violation_count <= 5:
        return "Medium"
    elif violation_count <= 10:
        return "High"
    return "Critical"
