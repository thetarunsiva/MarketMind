# API Contracts — Market Intelligence Engine
# STATUS: LOCKED ✅
# Last validated: 2026-03-25 (live server)
# Do NOT add fields without updating both this doc and consuming code.

---

## Base URL

```
Backend:  http://localhost:8000          (local)
API base: /api/v1
```

---

## Conventions

- All timestamps are ISO 8601 UTC strings: `"2026-01-15T08:00:00+00:00"`
- All IDs are UUIDs: `"9669dac9-67bf-4d9c-ad80-a8d91068b55a"`
- Scores are `float` in range `0.0–1.0` (insights) or `-1.0–1.0` (comparison dimensions)
- `null` means the field is optional and may be absent from the DB row
- `[STUBBED]` = field is always returned but value is seeded/hardcoded, not computed live

---

## GET /health

**Response:**
```json
{
  "status": "ok",
  "mode": "demo",
  "version": "1.0.0"
}
```

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `status` | string | No | Always `"ok"` if server is up |
| `mode` | string | No | `"demo"` or `"live"` from `APP_MODE` env var |
| `version` | string | No | Hardcoded `"1.0.0"` |

---

## GET /api/v1/competitors

**Response — array of competitor objects:**
```json
[
  {
    "id": "9669dac9-67bf-4d9c-ad80-a8d91068b55a",
    "name": "Notion",
    "website": "https://notion.so",
    "category": "b2b_productivity",
    "sources": [
      {
        "id": "ed2fde94-4ef6-46c8-9471-20b82559c1ca",
        "url": "https://notion.so",
        "source_type": "landing_page",
        "last_crawled_at": null
      },
      {
        "id": "...",
        "url": "https://notion.so/pricing",
        "source_type": "pricing_page",
        "last_crawled_at": null
      }
    ],
    "snapshot_count": 3,
    "last_updated": null
  }
]
```

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | uuid | No | |
| `name` | string | No | |
| `website` | string | No | Base URL |
| `category` | string | No | Always `"b2b_productivity"` for this product |
| `sources` | Source[] | No | May be empty `[]` if no sources added yet |
| `sources[].source_type` | string | No | `landing_page` \| `pricing_page` \| `product_page` |
| `sources[].last_crawled_at` | string | **Yes** | `null` in demo mode — no live crawl has run |
| `snapshot_count` | int | No | Live count from DB |
| `last_updated` | string | **Yes** | `null` if no source has ever been crawled |

**Stubbed fields:** `last_crawled_at`, `last_updated` — both `null` in demo mode.

---

## GET /api/v1/changes?limit=N&competitor_id=UUID

**Response — array of diff objects:**
```json
[
  {
    "id": "...",
    "competitor_id": "...",
    "competitor_name": "Asana",
    "source_url": "https://asana.com",
    "change_type": "changed_cta",
    "field": "cta_text",
    "before": "Get started for free",
    "after": "Try Asana for free",
    "snapshot_before_id": "...",
    "snapshot_after_id": "9177aed0-b662-47b2-b0b8-ab8f6d34f0e2",
    "detected_at": "2026-02-28T10:00:00+00:00"
  }
]
```

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `change_type` | string | No | One of: `added_claim`, `removed_claim`, `changed_pricing`, `changed_cta`, `changed_positioning`, `changed_audience` |
| `field` | string | No | Which extracted claim field changed |
| `before` | string | **Yes** | `null` for `added_claim` type |
| `after` | string | No | Always present |
| `snapshot_before_id` | uuid | **Yes** | `null` if this is the first snapshot for the source |
| `snapshot_after_id` | uuid | No | Always present |

---

## GET /api/v1/insights?limit=N&insight_type=TYPE

**Response — array of insight list items:**
```json
[
  {
    "id": "...",
    "title": "Notion pivots hero messaging toward AI positioning",
    "insight_type": "messaging_shift",
    "summary": "Notion changed its hero headline...",
    "recommendation": "Consider testing 'AI-native workspace...'",
    "novelty_score": 0.85,
    "frequency_score": 0.6,
    "relevance_score": 0.9,
    "priority_score": 0.88,
    "competitor_ids": ["uuid-1"],
    "competitor_names": ["Notion"],
    "evidence_count": 2,
    "created_at": "2026-03-25T17:38:12.123456+00:00"
  }
]
```

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `insight_type` | string | No | `messaging_shift` \| `pricing_change` \| `repeated_angle` \| `overused_angle` \| `whitespace` |
| `novelty_score` | float | No | `0.0–1.0` |
| `frequency_score` | float | No | `0.0–1.0` |
| `relevance_score` | float | No | `0.0–1.0` |
| `priority_score` | float | No | `0.0–1.0` — list is sorted by this descending |
| `competitor_ids` | uuid[] | No | May have 1–5 entries |
| `competitor_names` | string[] | No | Parallel array to `competitor_ids` |
| `evidence_count` | int | No | Computed live from `insight_sources` table |

**Stubbed fields:** All scores are seeded values from `seed.json` — not computed by ML.

---

## GET /api/v1/insights/{id}

**Response — single insight detail with evidence:**
```json
{
  "id": "...",
  "title": "Notion pivots hero messaging toward AI positioning",
  "insight_type": "messaging_shift",
  "summary": "Notion changed its hero headline from individual/personal productivity...",
  "recommendation": "Consider testing 'AI-native workspace for teams'...",
  "reasoning": "Notion's hero headline shifted from '...' (December 2025) to '...' (January 2026). The CTA simultaneously shifted...",
  "novelty_score": 0.85,
  "frequency_score": 0.6,
  "relevance_score": 0.9,
  "priority_score": 0.88,
  "competitor_ids": ["..."],
  "competitor_names": ["Notion"],
  "evidence": [
    {
      "id": "...",
      "source_url": "https://notion.so",
      "source_type": "landing_page",
      "competitor_name": "Notion",
      "snapshot_id": "...",
      "captured_at": "2025-12-01T08:00:00+00:00",
      "snippet": "One workspace for your notes, docs, and projects",
      "before_snippet": "One workspace for your notes, docs, and projects",
      "after_snippet": "Connected workspace for modern teams",
      "field": "hero_headline"
    }
  ],
  "created_at": "..."
}
```

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `reasoning` | string | No | Full explanation text — from seed data |
| `evidence` | EvidenceItem[] | No | May be `[]` if no insight_sources rows linked |
| `evidence[].before_snippet` | string | **Yes** | `null` for non-diff evidence |
| `evidence[].after_snippet` | string | **Yes** | `null` for non-diff evidence |
| `evidence[].snippet` | string | No | The core evidence text — always present |
| `evidence[].captured_at` | string | No | From the linked snapshot row |

---

## GET /api/v1/comparison

**Response:**
```json
{
  "dimensions": [
    "premium_vs_cost",
    "feature_vs_outcome",
    "enterprise_vs_smb",
    "simplicity_vs_power",
    "collaboration_vs_individual",
    "speed_vs_control"
  ],
  "competitors": [
    {
      "id": "...",
      "name": "Notion",
      "scores": {
        "premium_vs_cost": 0.1,
        "feature_vs_outcome": 0.6,
        "enterprise_vs_smb": -0.2,
        "simplicity_vs_power": 0.5,
        "collaboration_vs_individual": 0.4,
        "speed_vs_control": 0.2
      },
      "top_claims": [
        "Connected workspace for modern teams",
        "One workspace for your notes, docs, and projects"
      ],
      "positioning_tags": [
        "connected workspace",
        "docs + wiki",
        "flexible blocks",
        "SMB friendly"
      ]
    }
  ]
}
```

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `dimensions` | string[] | No | Fixed list of 6 — do not change |
| `competitors[].scores` | Record<string, float> | No | All 6 keys always present. Range: `-1.0` to `+1.0`. Negative = left pole, positive = right pole |
| `competitors[].top_claims` | string[] | No | 1–3 items. From snapshot hero_headline + seeded fallback |
| `competitors[].positioning_tags` | string[] | No | **[SEEDED]** — hardcoded per competitor name in `comparison_scorer.py` |

**Score semantics per dimension:**

| Dimension | `-1.0` (left) | `+1.0` (right) |
|-----------|--------------|----------------|
| `premium_vs_cost` | Cost leader / free | Premium / enterprise pricing |
| `feature_vs_outcome` | Outcome-focused | Feature list focused |
| `enterprise_vs_smb` | SMB / team-first | Enterprise / org-wide |
| `simplicity_vs_power` | Simplicity / ease | Power / flexibility |
| `collaboration_vs_individual` | Individual productivity | Team collaboration |
| `speed_vs_control` | Control / customization | Speed / efficiency |

**Stubbed fields:** `positioning_tags` are hardcoded seeds. Scores blend keyword-signal computation from snapshot claims with seeded fallbacks — the seeds dominate when snapshot data is sparse.

---

## GET /api/v1/whitespace

**Response:**
```json
{
  "generated_at": "2026-03-25T17:45:03.123456+00:00",
  "mode": "demo",
  "recommendations": [
    {
      "id": "3f2a1c9e-...",
      "title": "Whitespace: Collaboration/Teamwork vs. Individual Productivity",
      "summary": "All 5 tracked competitors position strongly toward team collaboration...",
      "why_it_matters": "All 5 tracked competitors position strongly toward team collaboration. This creates an unclaimed positioning lane for individual productivity...",
      "why_its_whitespace": "Dimension average score: 0.54 (scale: -1 to +1). Values above ±0.25 indicate cluster saturation.",
      "recommended_action": "Launch an 'individual plan' or 'personal productivity' track...",
      "confidence": "high",
      "dimension": "collaboration_vs_individual",
      "evidence": [
        {
          "competitor_name": "Airtable",
          "source_url": "https://airtable.com",
          "snippet": "Customizable to your exact process",
          "field": "major_claims"
        }
      ]
    }
  ]
}
```

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `generated_at` | string | No | Computed at request time (not cached) |
| `mode` | string | No | From `APP_MODE` env var |
| `recommendations` | Recommendation[] | No | `[]` if no saturation threshold exceeded |
| `recommendations[].id` | uuid | No | **Generated fresh per request** — do not persist these |
| `recommendations[].confidence` | string | No | `low` \| `medium` \| `high` — derived from dimension avg score magnitude |
| `recommendations[].evidence` | WhitespaceEvidence[] | No | May be `[]` if no matching keyword found in snapshots |
| `evidence[].source_url` | string | No | May be empty string `""` if source not found in sources_map |

**Computed fields:** `title`, `summary`, `why_it_matters`, `why_its_whitespace`, `recommended_action` — all deterministic text templates in `whitespace_engine.py`. No LLM.

---

## POST /api/v1/crawl/run

**Request body:**
```json
{ "mode": "demo" }
```

**Response:**
```json
{
  "mode": "demo",
  "processed": 5,
  "snapshots_created": 11,
  "diffs_generated": 11,
  "insights_generated": 5,
  "message": "Demo seed complete: 5 competitors, 11 snapshots, 5 insights"
}
```

**Behavior:**
- `mode=demo`: Idempotent. Loads `seed-data/seed.json`. If data already seeded, returns `processed=N` with `snapshots_created=0`.
- `mode=live`: Attempts real HTTP crawl. **Falls back to demo** if crawling fails. Safe to call in any environment.

---

## GET /api/v1/snapshots?competitor_id=UUID&limit=N

**Response — array of snapshots with structured extracted claims:**
```json
[
  {
    "id": "...",
    "source_id": "...",
    "competitor_id": "...",
    "competitor_name": "Notion",
    "source_url": "https://notion.so",
    "source_type": "landing_page",
    "captured_at": "2026-01-15T08:00:00+00:00",
    "extracted_claims": {
      "hero_headline": "Connected workspace for modern teams",
      "subheadline": "Notion AI helps your team write, plan...",
      "cta_text": "Try Notion AI free",
      "pricing_text": "Free plan available. Plus at $10/user/month.",
      "feature_bullets": ["Notion AI writing assistant", "..."],
      "social_proof": ["30M+ users worldwide", "..."],
      "audience_terms": ["modern teams", "knowledge workers", "..."],
      "major_claims": ["AI-powered workspace...", "..."]
    }
  }
]
```

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `extracted_claims.hero_headline` | string | **Yes** | `null` if not found |
| `extracted_claims.subheadline` | string | **Yes** | `null` if not found |
| `extracted_claims.cta_text` | string | **Yes** | `null` if not found |
| `extracted_claims.pricing_text` | string | **Yes** | `null` if not found |
| `extracted_claims.feature_bullets` | string[] | No | `[]` if none |
| `extracted_claims.social_proof` | string[] | No | `[]` if none |
| `extracted_claims.audience_terms` | string[] | No | `[]` if none |
| `extracted_claims.major_claims` | string[] | No | `[]` if none |

---

## Error Shape (all endpoints)

```json
{ "detail": "Human-readable error message" }
```

HTTP codes: `400` bad request · `404` not found · `422` validation error · `500` internal error

---

## Stubbed / Seeded Fields Summary

| Endpoint | Field | State | Notes |
|----------|-------|-------|-------|
| `/competitors` | `last_crawled_at` | **Seeded null** | Will populate only after live crawl |
| `/competitors` | `last_updated` | **Seeded null** | Derived from `last_crawled_at` |
| `/comparison` | `positioning_tags` | **Hardcoded** | In `comparison_scorer.py` SEED_TAGS dict |
| `/comparison` | `scores` | **Blended** | Keyword-signal + seeded fallback |
| `/comparison` | `top_claims` | **Blended** | From snapshot hero_headline + seeded |
| `/insights` | All `*_score` fields | **Seeded** | From `seed.json`, not ML-computed |
| `/whitespace` | `id` per recommendation | **Ephemeral** | Generated fresh per request, don't persist |
| `/whitespace` | `evidence[].source_url` | **May be empty** | If source_id missing from sources map |
