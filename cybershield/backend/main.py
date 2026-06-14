from fastapi import FastAPI, WebSocket, Query
from fastapi.middleware.cors import CORSMiddleware
from app.database.base import init_db
from app.api.auth.routes import router as auth_router
from app.api.monitoring.routes import router as monitor_router
from app.api.alerts.routes import router as alerts_router
from app.api.analytics.routes import router as analytics_router
from app.api.conversations.routes import router as conversations_router
from app.api.emergency.routes import router as emergency_router
from app.api.websocket import websocket_endpoint
from app.core.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.APP_NAME, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(monitor_router, prefix="/api")
app.include_router(alerts_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(conversations_router, prefix="/api")
app.include_router(emergency_router, prefix="/api")

@app.websocket("/ws")
async def ws(websocket: WebSocket, token: str = Query(...)):
    await websocket_endpoint(websocket, token)

@app.on_event("startup")
def startup():
    init_db()
    logger.info("CyberShield AI started")

@app.get("/health")
def health():
    return {"success": True, "message": "Running", "data": {}}
