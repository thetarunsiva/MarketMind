"""
Routes: /competitors
GET /competitors — list all with sources and snapshot count
POST /competitors — add new competitor
"""
import logging
from fastapi import APIRouter, HTTPException
from models.schemas import CompetitorSchema, CompetitorCreateRequest, SourceSchema
import db.queries as queries

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/competitors", response_model=list[CompetitorSchema])
def get_competitors():
    competitors = queries.get_all_competitors()
    result = []
    for comp in competitors:
        sources = queries.get_sources_for_competitor(comp["id"])
        snap_count = queries.count_snapshots_for_competitor(comp["id"])
        last_updated = None
        if sources:
            crawled = [s["last_crawled_at"] for s in sources if s.get("last_crawled_at")]
            if crawled:
                last_updated = max(crawled)
        result.append(CompetitorSchema(
            id=comp["id"],
            name=comp["name"],
            website=comp["website"],
            category=comp["category"],
            sources=[SourceSchema(
                id=s["id"],
                url=s["url"],
                source_type=s["source_type"],
                last_crawled_at=s.get("last_crawled_at"),
            ) for s in sources],
            snapshot_count=snap_count,
            last_updated=last_updated,
        ))
    return result


@router.post("/competitors", response_model=CompetitorSchema)
def create_competitor(req: CompetitorCreateRequest):
    row = queries.insert_competitor(req.name, req.website, req.category)
    logger.info(f"[API] Competitor created: {req.name}")
    return CompetitorSchema(
        id=row["id"],
        name=row["name"],
        website=row["website"],
        category=row["category"],
        sources=[],
        snapshot_count=0,
        last_updated=None,
    )
