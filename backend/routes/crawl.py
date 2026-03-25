"""
Routes: /crawl/run
POST /crawl/run — triggers seed or live ingestion
"""
import os
import logging
from fastapi import APIRouter, HTTPException
from models.schemas import CrawlRequest, CrawlResponse
from seed.loader import run_seed
import db.queries as queries

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/crawl/run", response_model=CrawlResponse)
async def run_crawl(req: CrawlRequest):
    mode = req.mode or os.getenv("APP_MODE", "demo")
    logger.info(f"[CRAWL] Mode: {mode}")

    if mode == "demo":
        summary = run_seed(force=False)
        if summary.get("skipped"):
            competitors = queries.get_all_competitors()
            return CrawlResponse(
                mode="demo",
                processed=len(competitors),
                snapshots_created=0,
                diffs_generated=0,
                insights_generated=0,
                message="Demo data already loaded. Dashboard is ready.",
            )
        return CrawlResponse(
            mode="demo",
            processed=summary["competitors"],
            snapshots_created=summary["snapshots"],
            diffs_generated=summary["diffs"],
            insights_generated=summary["insights"],
            message=f"Demo seed complete: {summary['competitors']} competitors, {summary['snapshots']} snapshots, {summary['insights']} insights",
        )

    elif mode == "live":
        # Live mode: attempt real crawling — fallback to demo if unavailable
        try:
            from services.live_crawler import crawl_all
            result = await crawl_all(req.competitor_ids)
            logger.info(f"[CRAWL] Live crawl complete: {result}")
            return CrawlResponse(mode="live", **result)
        except Exception as e:
            logger.warning(f"[CRAWL] Live crawl failed: {e} — falling back to demo mode")
            run_seed(force=False)
            return CrawlResponse(
                mode="demo",
                processed=0,
                snapshots_created=0,
                diffs_generated=0,
                insights_generated=0,
                message=f"Live crawl unavailable ({str(e)[:80]}). Demo data is active.",
            )

    else:
        raise HTTPException(status_code=400, detail=f"Invalid mode: {mode}. Use 'demo' or 'live'.")
