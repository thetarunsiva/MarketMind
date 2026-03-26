"""
Seed data loader — inserts the full demo dataset into Supabase if not already seeded.
This is the demo-safe mode path. Runs on POST /crawl/run with mode=demo.
Also called automatically on first startup if DB is empty.
"""
import json
import logging
from pathlib import Path

import db.queries as queries

logger = logging.getLogger(__name__)

SEED_FILE = Path(__file__).parent.parent.parent / "seed-data" / "seed.json"


def load_seed_data() -> dict:
    with open(SEED_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def run_seed(force: bool = False) -> dict:
    """
    Insert all seed data. Skips if already seeded unless force=True.
    Returns a summary dict of what was created.
    """
    if not force and queries.check_data_seeded():
        logger.info("[SEED] Data already seeded — skipping. Use force=True to re-seed.")
        return {"skipped": True, "message": "Already seeded"}

    data = load_seed_data()
    logger.info(f"[SEED] Starting seed with {len(data['competitors'])} competitors")

    competitor_id_map = {}  # seed_id -> real db uuid
    source_id_map = {}      # seed_id -> real db uuid
    snapshot_id_map = {}    # seed_id -> real db uuid

    # Insert competitors
    for comp in data["competitors"]:
        row = queries.upsert_competitor(comp["name"], comp["website"], comp["category"])
        competitor_id_map[comp["seed_id"]] = row["id"]
        logger.info(f"[SEED] Competitor upserted: {comp['name']}")

    # Insert sources
    for src in data["sources"]:
        real_comp_id = competitor_id_map[src["competitor_seed_id"]]
        row = queries.insert_source(real_comp_id, src["url"], src["source_type"])
        source_id_map[src["seed_id"]] = row["id"]

    # Insert snapshots
    for snap in data["snapshots"]:
        real_source_id = source_id_map[snap["source_seed_id"]]
        real_comp_id = competitor_id_map[snap["competitor_seed_id"]]
        row = queries.insert_snapshot(
            source_id=real_source_id,
            competitor_id=real_comp_id,
            raw_content=snap.get("raw_content", ""),
            extracted_claims=snap["extracted_claims"],
            captured_at=snap["captured_at"],
            is_seed=True,
        )
        snapshot_id_map[snap["seed_id"]] = row["id"]
        logger.info(f"[SEED] Snapshot inserted for source {snap['source_seed_id']}")

    # Insert diffs
    diff_id_map = {}
    for diff in data["diffs"]:
        real_source_id = source_id_map[diff["source_seed_id"]]
        real_comp_id = competitor_id_map[diff["competitor_seed_id"]]
        before_id = snapshot_id_map.get(diff.get("snapshot_before_seed_id")) if diff.get("snapshot_before_seed_id") else None
        after_id = snapshot_id_map[diff["snapshot_after_seed_id"]]
        row = queries.insert_diff(
            source_id=real_source_id,
            competitor_id=real_comp_id,
            snapshot_before_id=before_id,
            snapshot_after_id=after_id,
            change_type=diff["change_type"],
            field=diff["field"],
            before_value=diff.get("before_value"),
            after_value=diff["after_value"],
            detected_at=diff["detected_at"],
        )
        diff_id_map[diff["seed_id"]] = row["id"]

    logger.info(f"[SEED] {len(data['diffs'])} diffs inserted")

    # Insert insights
    insight_id_map = {}
    for ins in data["insights"]:
        real_comp_ids = [competitor_id_map[cid] for cid in ins["competitor_seed_ids"]]
        row = queries.insert_insight({
            "title": ins["title"],
            "insight_type": ins["insight_type"],
            "summary": ins["summary"],
            "recommendation": ins["recommendation"],
            "reasoning": ins["reasoning"],
            "novelty_score": ins["novelty_score"],
            "frequency_score": ins["frequency_score"],
            "relevance_score": ins["relevance_score"],
            "priority_score": ins["priority_score"],
            "competitor_ids": real_comp_ids,
        })
        insight_id_map[ins["seed_id"]] = row["id"]

    logger.info(f"[SEED] {len(data['insights'])} insights inserted")

    # Insert insight sources (evidence links)
    for ev in data["insight_sources"]:
        real_insight_id = insight_id_map[ev["insight_seed_id"]]
        real_snapshot_id = snapshot_id_map[ev["snapshot_seed_id"]]
        real_diff_id = diff_id_map.get(ev.get("diff_seed_id")) if ev.get("diff_seed_id") else None
        queries.insert_insight_source({
            "insight_id": real_insight_id,
            "snapshot_id": real_snapshot_id,
            "diff_id": real_diff_id,
            "snippet": ev["snippet"],
            "before_snippet": ev.get("before_snippet"),
            "after_snippet": ev.get("after_snippet"),
            "field": ev["field"],
        })

    logger.info("[SEED] All insight evidence links inserted")

    geo_count = 0
    if "geo_signals" in data:
        for geo in data["geo_signals"]:
            queries.insert_geo_signal({
                "provider": geo["provider"],
                "prompt": geo["prompt"],
                "surfaced_companies": geo["surfaced_companies"],
                "appearance_frequency": geo["appearance_frequency"],
                "rank": geo.get("rank"),
                "response_snippet": geo.get("response_snippet"),
                "extracted_reasoning": geo.get("extracted_reasoning"),
            })
            geo_count += 1
        logger.info(f"[SEED] {geo_count} GEO signals inserted")

    logger.info("[SEED] Seed complete")

    return {
        "skipped": False,
        "competitors": len(data["competitors"]),
        "sources": len(data["sources"]),
        "snapshots": len(data["snapshots"]),
        "diffs": len(data["diffs"]),
        "insights": len(data["insights"]),
        "geo_signals": geo_count,
    }
