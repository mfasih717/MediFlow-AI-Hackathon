from fastapi import APIRouter
from app.api.v1.endpoints import health, ingestion, chat, timeline, history

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health & Telemetry"])
api_router.include_router(ingestion.router, tags=["Prescription Ingestion & OCR"])
api_router.include_router(chat.router, tags=["Multimodal AI Chat & Triage"])
api_router.include_router(timeline.router, tags=["Daily Schedule & Adherence"])
api_router.include_router(history.router, tags=["Doctor Handover & Longitudinal History"])
