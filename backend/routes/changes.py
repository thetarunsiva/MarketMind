"""
Routes: /changes
GET /changes — list detected diffs with competitor context
"""
from fastapi import APIRouter, Query
from models.schemas import ChangeSchema
import db.queries as queries

router = APIRouter()


@router.get("/changes", response_model=list[ChangeSchema])
def get_changes(
    competitor_id: str = Query(None),
    limit: int = Query(20, le=100),
):
    diffs = queries.get_diffs(competitor_id=competitor_id, limit=limit)
    competitors = {c["id"]: c for c in queries.get_all_competitors()}
    sources = {s["id"]: s for s in queries.get_all_sources()}

    result = []
    for d in diffs:
        comp = competitors.get(d["competitor_id"], {})
        src = sources.get(d["source_id"], {})
        result.append(ChangeSchema(
            id=d["id"],
            competitor_id=d["competitor_id"],
            competitor_name=comp.get("name", "Unknown"),
            source_url=src.get("url", ""),
            change_type=d["change_type"],
            field=d["field"],
            before=d.get("before_value"),
            after=d["after_value"],
            snapshot_before_id=d.get("snapshot_before_id"),
            snapshot_after_id=d["snapshot_after_id"],
            detected_at=d["detected_at"],
        ))
    return result
