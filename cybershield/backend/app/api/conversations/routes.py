from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.base import get_db
from app.api.auth.routes import get_current_user
from app.models.user import User
from app.models.content import Conversation, Message
from app.models.moderation import ModerationResult

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("")
def list_conversations(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    convs = db.query(Conversation).order_by(Conversation.risk_score.desc()).limit(50).all()
    return {"success": True, "message": "OK", "data": [
        {
            "id": c.id,
            "participant": c.participant,
            "risk_score": round(c.risk_score or 0, 1),
            "message_count": c.message_count,
            "flagged_count": c.flagged_count,
        } for c in convs
    ]}


@router.get("/{conv_id}")
def conversation_detail(conv_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conv:
        return {"success": False, "message": "Not found", "data": {}}
    msgs = db.query(Message).filter(Message.conversation_id == conv_id).order_by(Message.timestamp.desc()).limit(50).all()
    return {"success": True, "message": "OK", "data": {
        "conversation": {
            "id": conv.id,
            "participant": conv.participant,
            "risk_score": round(conv.risk_score or 0, 1),
            "message_count": conv.message_count,
            "flagged_count": conv.flagged_count,
        },
        "messages": [
            {"id": m.id, "sender": m.sender, "content": m.content, "timestamp": m.timestamp}
            for m in msgs
        ],
    }}
