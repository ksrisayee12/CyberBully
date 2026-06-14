"""
Emergency Response Service
Sends email via Resend API, enforces 30-min cooldown.
"""
import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.moderation import EmergencyReport, EmailLog
from app.models.user import User
from app.core.config import settings

logger = logging.getLogger(__name__)


def _cooldown_ok(db: Session, user_id: int, incident_type: str) -> bool:
    cutoff = datetime.utcnow() - timedelta(minutes=settings.EMERGENCY_EMAIL_COOLDOWN_MINUTES)
    recent = (
        db.query(EmailLog)
        .filter(
            EmailLog.user_id == user_id,
            EmailLog.incident_type == incident_type,
            EmailLog.sent_at >= cutoff,
            EmailLog.status == "sent",
        )
        .first()
    )
    return recent is None


def _send_email(to: str, subject: str, body: str) -> bool:
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set — skipping email")
        return False
    try:
        import resend
        resend.api_key = settings.RESEND_API_KEY
        resend.Emails.send({
            "from": "CyberShield AI <alerts@cybershield.ai>",
            "to": to,
            "subject": subject,
            "html": body,
        })
        return True
    except Exception as e:
        logger.error(f"Email send failed: {e}")
        return False


def trigger_emergency(
    db: Session,
    user: User,
    content_preview: str,
    severity_score: float,
    severity_level: str,
    incident_type: str = "critical_content",
    report_data: dict = None,
) -> bool:
    if not user.emergency_contact_email:
        return False

    if not _cooldown_ok(db, user.id, incident_type):
        logger.info(f"Emergency email suppressed (cooldown) for user {user.id}")
        return False

    subject = f"🚨 CyberShield Alert: {severity_level} Incident Detected"
    body = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#ef4444">⚠️ CyberShield AI Emergency Alert</h2>
      <p>A <strong>{severity_level}</strong> severity incident has been detected on the monitored Instagram account of <strong>{user.name}</strong>.</p>
      <div style="background:#1e1e2e;color:#cdd6f4;padding:16px;border-radius:8px;margin:16px 0">
        <strong>Content Preview:</strong><br/>
        <em style="color:#f38ba8">{content_preview[:300]}</em>
      </div>
      <p><strong>Severity Score:</strong> {severity_score}/100</p>
      <p><strong>Incident Type:</strong> {incident_type}</p>
      <p><strong>Time:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}</p>
      <p style="color:#6c7086;font-size:12px">This is an automated alert from CyberShield AI. Please review the dashboard immediately.</p>
    </div>
    """

    sent = _send_email(user.emergency_contact_email, subject, body)

    # Store report
    report = EmergencyReport(
        user_id=user.id,
        risk_score=severity_score,
        severity=severity_level,
        report_data=report_data or {"content_preview": content_preview, "incident_type": incident_type},
    )
    db.add(report)

    # Log email
    log = EmailLog(
        recipient=user.emergency_contact_email,
        user_id=user.id,
        incident_type=incident_type,
        status="sent" if sent else "failed",
    )
    db.add(log)
    db.commit()

    return sent


def generate_pdf_report(report: EmergencyReport, user: User) -> bytes:
    from fpdf import FPDF
    
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", size=12)
    
    pdf.set_font("Helvetica", style="B", size=16)
    pdf.cell(200, 10, text="CyberShield AI Emergency Report", ln=1, align="C")
    
    pdf.set_font("Helvetica", size=12)
    pdf.cell(200, 10, text=f"Date: {report.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}", ln=1)
    pdf.cell(200, 10, text=f"Monitored User: {user.name}", ln=1)
    pdf.cell(200, 10, text=f"Risk Score: {report.risk_score}/100", ln=1)
    pdf.cell(200, 10, text=f"Severity: {report.severity}", ln=1)
    
    pdf.ln(10)
    pdf.set_font("Helvetica", style="B", size=12)
    pdf.cell(200, 10, text="Incident Details:", ln=1)
    
    pdf.set_font("Helvetica", size=10)
    data = report.report_data or {}
    pdf.multi_cell(0, 10, text=f"Type: {data.get('incident_type', 'critical_content')}")
    pdf.multi_cell(0, 10, text=f"Content Preview: {data.get('content_preview', 'N/A')}")
    
    return bytes(pdf.output())
