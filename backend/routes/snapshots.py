"""
Routes: /snapshots
GET /snapshots — list snapshots, optional filters
"""
from fastapi import APIRouter, Query
from models.schemas import SnapshotSchema, ExtractedClaims
import db.queries as queries

router = APIRouter()


def _enrich_snapshot(snap: dict, competitors: dict, sources: dict) -> SnapshotSchema:
    comp = competitors.get(snap["competitor_id"], {})
    src = sources.get(snap["source_id"], {})
    claims_raw = snap.get("extracted_claims") or {}
    return SnapshotSchema(
        id=snap["id"],
        source_id=snap["source_id"],
        competitor_id=snap["competitor_id"],
        competitor_name=comp.get("name", "Unknown"),
        source_url=src.get("url", ""),
        source_type=src.get("source_type", ""),
        captured_at=snap["captured_at"],
        extracted_claims=ExtractedClaims(
            hero_headline=claims_raw.get("hero_headline"),
            subheadline=claims_raw.get("subheadline"),
            cta_text=claims_raw.get("cta_text"),
            pricing_text=claims_raw.get("pricing_text"),
            feature_bullets=claims_raw.get("feature_bullets", []),
            social_proof=claims_raw.get("social_proof", []),
            audience_terms=claims_raw.get("audience_terms", []),
            major_claims=claims_raw.get("major_claims", []),
        ),
    )


@router.get("/snapshots", response_model=list[SnapshotSchema])
def get_snapshots(
    competitor_id: str = Query(None),
    source_id: str = Query(None),
    limit: int = Query(20, le=100),
):
    snaps = queries.get_snapshots(competitor_id=competitor_id, source_id=source_id, limit=limit)
    comp_ids = list({s["competitor_id"] for s in snaps})
    src_ids = list({s["source_id"] for s in snaps})
    competitors = {c["id"]: c for c in queries.get_all_competitors() if c["id"] in comp_ids}
    sources = {s["id"]: s for s in queries.get_all_sources() if s["id"] in src_ids}
    return [_enrich_snapshot(s, competitors, sources) for s in snaps]
