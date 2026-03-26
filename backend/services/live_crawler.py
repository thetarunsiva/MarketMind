import asyncio
import httpx
import logging
from datetime import datetime, timezone

from db import queries
from services.extractor import extract_claims_from_html

logger = logging.getLogger(__name__)

from typing import Optional

async def fetch_page(client: httpx.AsyncClient, url: str) -> str:
    try:
        response = await client.get(url, timeout=10.0, follow_redirects=True)
        response.raise_for_status()
        return response.text
    except Exception as e:
        logger.error(f"[CRAWLER] Failed to fetch {url}: {e}")
        return ""

async def crawl_all(competitor_ids: Optional[list[str]] = None) -> dict:
    """
    Performs narrow live crawling on official pages from the sources table.
    Gracefully falls back to skipping bad URLs.
    """
    sources = queries.get_all_sources()
    if competitor_ids:
        sources = [s for s in sources if s["competitor_id"] in competitor_ids]

    if not sources:
        return {
            "processed": 0, "snapshots_created": 0,
            "diffs_generated": 0, "insights_generated": 0,
            "message": "No sources found to crawl."
        }

    now = datetime.now(timezone.utc).isoformat()
    snapshots_created = 0

    async with httpx.AsyncClient(headers={"User-Agent": "Market-Intelligence-V2"}) as client:
        tasks = [fetch_page(client, src["url"]) for src in sources]
        results = await asyncio.gather(*tasks)

        for src, html in zip(sources, results):
            if not html:
                continue
            
            extracted = extract_claims_from_html(html)
            queries.insert_snapshot(
                source_id=src["id"],
                competitor_id=src["competitor_id"],
                raw_content=html[:5000],  # store a truncated sample for DB safety
                extracted_claims=extracted,
                captured_at=now,
                is_seed=False
            )
            queries.upsert_source_crawled(src["id"], now)
            snapshots_created += 1

    unique_comps_touched = len(set(s["competitor_id"] for s in sources))

    if snapshots_created == 0 and sources:
        raise Exception("Live crawl failed: all targets timed out or blocked access.")

    return {
        "processed": unique_comps_touched,
        "snapshots_created": snapshots_created,
        "diffs_generated": 0,  # Diffs/Insights bypassed in this pure crawl implementation for V1.5 MVP scope
        "insights_generated": 0,
        "message": f"Live crawled {snapshots_created} pages."
    }
