"""
All Supabase DB queries in one place.
Each function maps to exactly one logical operation.
No raw SQL — uses Supabase Python client query builder.
"""
from typing import Optional
from db.client import get_client


def get_all_competitors():
    client = get_client()
    return client.table("competitors").select("*").execute().data


def insert_competitor(name: str, website: str, category: str):
    client = get_client()
    return client.table("competitors").insert({
        "name": name, "website": website, "category": category
    }).execute().data[0]


def get_sources_for_competitor(competitor_id: str):
    client = get_client()
    return client.table("sources").select("*").eq("competitor_id", competitor_id).execute().data


def get_all_sources():
    client = get_client()
    return client.table("sources").select("*").execute().data


def insert_source(competitor_id: str, url: str, source_type: str):
    client = get_client()
    return client.table("sources").insert({
        "competitor_id": competitor_id, "url": url, "source_type": source_type
    }).execute().data[0]


def upsert_source_crawled(source_id: str, crawled_at: str):
    client = get_client()
    client.table("sources").update({"last_crawled_at": crawled_at}).eq("id", source_id).execute()


def get_snapshots(competitor_id: Optional[str] = None, source_id: Optional[str] = None, limit: int = 20):
    client = get_client()
    q = client.table("snapshots").select("*").order("captured_at", desc=True).limit(limit)
    if competitor_id:
        q = q.eq("competitor_id", competitor_id)
    if source_id:
        q = q.eq("source_id", source_id)
    return q.execute().data


def get_snapshots_for_source(source_id: str):
    client = get_client()
    return (
        client.table("snapshots")
        .select("*")
        .eq("source_id", source_id)
        .order("captured_at", desc=True)
        .execute()
        .data
    )


def insert_snapshot(source_id: str, competitor_id: str, raw_content: str, extracted_claims: dict, captured_at: str, is_seed: bool = False):
    client = get_client()
    return client.table("snapshots").insert({
        "source_id": source_id,
        "competitor_id": competitor_id,
        "raw_content": raw_content,
        "extracted_claims": extracted_claims,
        "captured_at": captured_at,
        "is_seed": is_seed,
    }).execute().data[0]


def get_diffs(competitor_id: Optional[str] = None, limit: int = 20):
    client = get_client()
    q = client.table("diffs").select("*").order("detected_at", desc=True).limit(limit)
    if competitor_id:
        q = q.eq("competitor_id", competitor_id)
    return q.execute().data


def insert_diff(source_id: str, competitor_id: str, snapshot_before_id, snapshot_after_id: str,
                change_type: str, field: str, before_value, after_value: str, detected_at: str):
    client = get_client()
    return client.table("diffs").insert({
        "source_id": source_id,
        "competitor_id": competitor_id,
        "snapshot_before_id": snapshot_before_id,
        "snapshot_after_id": snapshot_after_id,
        "change_type": change_type,
        "field": field,
        "before_value": before_value,
        "after_value": after_value,
        "detected_at": detected_at,
    }).execute().data[0]


def get_insights(limit: int = 20, insight_type: Optional[str] = None):
    client = get_client()
    q = client.table("insights").select("*").order("priority_score", desc=True).limit(limit)
    if insight_type:
        q = q.eq("insight_type", insight_type)
    return q.execute().data


def get_insight_by_id(insight_id: str):
    client = get_client()
    result = client.table("insights").select("*").eq("id", insight_id).execute().data
    return result[0] if result else None


def insert_insight(data: dict):
    client = get_client()
    return client.table("insights").insert(data).execute().data[0]


def get_insight_sources(insight_id: str):
    client = get_client()
    return client.table("insight_sources").select("*").eq("insight_id", insight_id).execute().data


def insert_insight_source(data: dict):
    client = get_client()
    return client.table("insight_sources").insert(data).execute().data[0]


def get_competitor_by_id(competitor_id: str):
    client = get_client()
    result = client.table("competitors").select("*").eq("id", competitor_id).execute().data
    return result[0] if result else None


def get_snapshot_by_id(snapshot_id: str):
    client = get_client()
    result = client.table("snapshots").select("*").eq("id", snapshot_id).execute().data
    return result[0] if result else None


def get_source_by_id(source_id: str):
    client = get_client()
    result = client.table("sources").select("*").eq("id", source_id).execute().data
    return result[0] if result else None


def count_snapshots_for_competitor(competitor_id: str) -> int:
    client = get_client()
    result = client.table("snapshots").select("id", count="exact").eq("competitor_id", competitor_id).execute()
    return result.count or 0


def check_data_seeded() -> bool:
    """Returns True if any competitors exist — used to skip re-seeding."""
    client = get_client()
    comps = client.table("competitors").select("id").limit(1).execute()
    return len(comps.data) > 0


def get_geo_signals(limit: int = 50):
    client = get_client()
    return client.table("geo_signals").select("*").order("created_at", desc=True).limit(limit).execute().data


def insert_geo_signal(data: dict):
    client = get_client()
    return client.table("geo_signals").insert(data).execute().data[0]
