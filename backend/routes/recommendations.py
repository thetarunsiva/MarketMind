"""
Routes: /recommendations
GET /api/v1/recommendations — V2 recommendation engine output
"""
import os
import logging
from datetime import datetime, timezone
from fastapi import APIRouter
from models.schemas import RecommendationsResponse
from services.recommendation_engine import generate_recommendations_v2

router = APIRouter(tags=["Recommendations V2"])
logger = logging.getLogger(__name__)


@router.get("/recommendations", response_model=RecommendationsResponse)
def get_recommendations(target: str = "Notion"):
    """
    Returns V2 strategic recommendations for the target company.
    Combines website intelligence + GEO signals into evidence-backed strategy notes.
    """
    mode = os.getenv("APP_MODE", "demo")
    try:
        recs = generate_recommendations_v2(target=target)
        return RecommendationsResponse(
            generated_at=datetime.now(timezone.utc).isoformat(),
            target_company=target,
            mode=mode,
            recommendations=recs,
        )
    except Exception as e:
        logger.error(f"[RECOMMENDATIONS] Generation failed: {e}")
        return RecommendationsResponse(
            generated_at=datetime.now(timezone.utc).isoformat(),
            target_company=target,
            mode=mode,
            recommendations=[],
        )
