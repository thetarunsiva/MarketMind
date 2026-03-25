"""
Routes: /insights and /insights/{id}
GET /insights — list all insights sorted by priority
GET /insights/{id} — insight detail with full evidence
"""
from fastapi import APIRouter, HTTPException, Query
from models.schemas import InsightListItem, InsightDetail, EvidenceItem
import db.queries as queries

router = APIRouter()


def _build_list_item(ins: dict, competitors: dict) -> InsightListItem:
    comp_ids = ins.get("competitor_ids") or []
    comp_names = [competitors.get(cid, {}).get("name", "Unknown") for cid in comp_ids]
    ev_count = len(queries.get_insight_sources(ins["id"]))
    return InsightListItem(
        id=ins["id"],
        title=ins["title"],
        insight_type=ins["insight_type"],
        summary=ins["summary"],
        recommendation=ins["recommendation"],
        novelty_score=ins["novelty_score"],
        frequency_score=ins["frequency_score"],
        relevance_score=ins["relevance_score"],
        priority_score=ins["priority_score"],
        competitor_ids=comp_ids,
        competitor_names=comp_names,
        evidence_count=ev_count,
        created_at=ins["created_at"],
    )


@router.get("/insights", response_model=list[InsightListItem])
def get_insights(
    limit: int = Query(20, le=100),
    insight_type: str = Query(None),
):
    insights = queries.get_insights(limit=limit, insight_type=insight_type)
    competitors = {c["id"]: c for c in queries.get_all_competitors()}
    return [_build_list_item(ins, competitors) for ins in insights]


@router.get("/insights/{insight_id}", response_model=InsightDetail)
def get_insight_detail(insight_id: str):
    ins = queries.get_insight_by_id(insight_id)
    if not ins:
        raise HTTPException(status_code=404, detail="Insight not found")

    competitors = {c["id"]: c for c in queries.get_all_competitors()}
    sources = {s["id"]: s for s in queries.get_all_sources()}
    snapshots_map = {}

    comp_ids = ins.get("competitor_ids") or []
    comp_names = [competitors.get(cid, {}).get("name", "Unknown") for cid in comp_ids]

    ev_rows = queries.get_insight_sources(insight_id)
    evidence = []
    for ev in ev_rows:
        snap_id = ev["snapshot_id"]
        if snap_id not in snapshots_map:
            snapshots_map[snap_id] = queries.get_snapshot_by_id(snap_id)
        snap = snapshots_map.get(snap_id) or {}
        src = sources.get(snap.get("source_id", ""), {})
        comp = competitors.get(snap.get("competitor_id", ""), {})
        evidence.append(EvidenceItem(
            id=ev["id"],
            source_url=src.get("url", ""),
            source_type=src.get("source_type", ""),
            competitor_name=comp.get("name", "Unknown"),
            snapshot_id=snap_id,
            captured_at=snap.get("captured_at", ""),
            snippet=ev["snippet"],
            before_snippet=ev.get("before_snippet"),
            after_snippet=ev.get("after_snippet"),
            field=ev["field"],
        ))

    return InsightDetail(
        id=ins["id"],
        title=ins["title"],
        insight_type=ins["insight_type"],
        summary=ins["summary"],
        recommendation=ins["recommendation"],
        novelty_score=ins["novelty_score"],
        frequency_score=ins["frequency_score"],
        relevance_score=ins["relevance_score"],
        priority_score=ins["priority_score"],
        competitor_ids=comp_ids,
        competitor_names=comp_names,
        reasoning=ins.get("reasoning", ""),
        evidence=evidence,
        created_at=ins["created_at"],
    )
