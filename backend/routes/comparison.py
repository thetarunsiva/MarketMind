"""
Routes: /comparison
GET /comparison — competitor positioning scores across fixed dimensions.
"""
from fastapi import APIRouter
from models.schemas import ComparisonResponse
from services.comparison_scorer import compute_comparison
import db.queries as queries

router = APIRouter()

DIMENSIONS = [
    "premium_vs_cost",
    "feature_vs_outcome",
    "enterprise_vs_smb",
    "simplicity_vs_power",
    "collaboration_vs_individual",
    "speed_vs_control",
]


@router.get("/comparison", response_model=ComparisonResponse)
def get_comparison():
    competitors = queries.get_all_competitors()
    result = []
    for comp in competitors:
        snapshots = queries.get_snapshots(competitor_id=comp["id"], limit=5)
        scored = compute_comparison(comp, snapshots)
        result.append(scored)
    return ComparisonResponse(dimensions=DIMENSIONS, competitors=result)
