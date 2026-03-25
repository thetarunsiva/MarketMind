"""
Routes: /health
"""
import os
from fastapi import APIRouter
from models.schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health_check():
    mode = os.getenv("APP_MODE", "demo")
    return HealthResponse(status="ok", mode=mode, version="1.0.0")
