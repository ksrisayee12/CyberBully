"""
WebSocket Gateway
Auth: JWT passed as ?token= query param
Broadcasts: new_comment, new_message, new_alert, emergency_triggered
"""
import json
import logging
from fastapi import WebSocket, WebSocketDisconnect, Query
from app.core.security import decode_token
import app.services.analysis_pipeline as pipeline

logger = logging.getLogger(__name__)

_connections: list[WebSocket] = []


async def broadcast(data: dict):
    dead = []
    for ws in _connections:
        try:
            await ws.send_text(json.dumps(data))
        except Exception:
            dead.append(ws)
    for ws in dead:
        _connections.remove(ws)


# Hook broadcast into pipeline
pipeline.broadcast_fn = broadcast


async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    # Validate JWT
    try:
        decode_token(token)
    except Exception:
        await websocket.close(code=1008)
        return

    await websocket.accept()
    _connections.append(websocket)
    logger.info(f"WS connected. Total: {len(_connections)}")

    try:
        while True:
            # Keep alive — wait for ping or disconnect
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text(json.dumps({"event": "pong"}))
    except WebSocketDisconnect:
        _connections.remove(websocket)
        logger.info(f"WS disconnected. Total: {len(_connections)}")
