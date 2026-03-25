"""
Routes: /whitespace
GET /whitespace — USP: detect underused positioning angles across competitors.
"""
import os
from datetime import datetime, timezone
from fastapi import APIRouter
from models.schemas import WhitespaceResponse
from services.whitespace_engine import generate_whitespace_recommendations
import db.queries as queries

router = APIRouter()


@router.get("/whitespace", response_model=WhitespaceResponse)
def get_whitespace():
    mode = os.getenv("APP_MODE", "demo")
    competitors = queries.get_all_competitors()
    all_snapshots = {}
    sources_map = {s["id"]: s for s in queries.get_all_sources()}

    for comp in competitors:
        snaps = queries.get_snapshots(competitor_id=comp["id"], limit=3)
        all_snapshots[comp["id"]] = snaps

    recommendations = generate_whitespace_recommendations(
        competitors=competitors,
        snapshots_by_competitor=all_snapshots,
        sources_map=sources_map,
    )

    return WhitespaceResponse(
        generated_at=datetime.now(timezone.utc).isoformat(),
        mode=mode,
        recommendations=recommendations,
    )
