# Data Model — Market Intelligence Engine
# STATUS: LOCKED ✅
# Last validated: 2026-03-25 (live Supabase project: fbcoeaaatwfbiodivwhk)
# Do NOT add columns without updating both this doc and queries.py/schemas.py.

---

## Supabase Project

| Key | Value |
|-----|-------|
| Project ID | `fbcoeaaatwfbiodivwhk` |
| URL | `https://fbcoeaaatwfbiodivwhk.supabase.co` |
| Region | `ap-south-1` |
| Auth | Service role key (backend only, never expose to browser) |

---

## Tables

### `competitors`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | uuid PK | No | Auto-generated |
| `name` | text | No | e.g. `"Notion"` |
| `website` | text | No | Base URL e.g. `"https://notion.so"` |
| `category` | text | No | Locked to `"b2b_productivity"` for this product |
| `created_at` | timestamptz | No | Auto-set by Supabase |

---

### `sources`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | uuid PK | No | |
| `competitor_id` | uuid FK → competitors | No | |
| `url` | text | No | Full page URL |
| `source_type` | text | No | `landing_page` \| `pricing_page` \| `product_page` |
| `last_crawled_at` | timestamptz | **Yes** | `null` in demo mode — set on live crawl |
| `created_at` | timestamptz | No | |

---

### `snapshots`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | uuid PK | No | |
| `source_id` | uuid FK → sources | No | |
| `competitor_id` | uuid FK → competitors | No | Denormalized — avoids join in hot queries |
| `raw_content` | text | No | Raw text scraped from page (may be empty string in demo) |
| `extracted_claims` | jsonb | No | Structured extraction — see shape below |
| `captured_at` | timestamptz | No | When this snapshot was taken |
| `is_seed` | boolean | No | `true` = loaded from seed.json, `false` = live crawl |

**`extracted_claims` JSONB shape (all fields nullable):**
```json
{
  "hero_headline":   "string | null",
  "subheadline":     "string | null",
  "cta_text":        "string | null",
  "pricing_text":    "string | null",
  "feature_bullets": ["string"],
  "social_proof":    ["string"],
  "audience_terms":  ["string"],
  "major_claims":    ["string"]
}
```
Array fields default to `[]` — never `null`.

---

### `diffs`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | uuid PK | No | |
| `source_id` | uuid FK → sources | No | |
| `competitor_id` | uuid FK → competitors | No | Denormalized |
| `snapshot_before_id` | uuid FK → snapshots | **Yes** | `null` for the first snapshot of a source |
| `snapshot_after_id` | uuid FK → snapshots | No | Always present |
| `change_type` | text | No | See allowed values below |
| `field` | text | No | Which `extracted_claims` field changed |
| `before_value` | text | **Yes** | `null` for `added_claim` |
| `after_value` | text | No | Always present |
| `detected_at` | timestamptz | No | |

**`change_type` allowed values:**
```
added_claim · removed_claim · changed_pricing
changed_cta · changed_positioning · changed_audience
```

---

### `insights`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | uuid PK | No | |
| `title` | text | No | Short headline |
| `insight_type` | text | No | See allowed values below |
| `summary` | text | No | 1–2 sentence summary |
| `recommendation` | text | No | Actionable "what to test next" |
| `reasoning` | text | No | Full evidence-based explanation |
| `novelty_score` | float8 | No | `0.0–1.0` |
| `frequency_score` | float8 | No | `0.0–1.0` |
| `relevance_score` | float8 | No | `0.0–1.0` |
| `priority_score` | float8 | No | `0.0–1.0` — sorted by this in API |
| `competitor_ids` | uuid[] | No | Postgres native array — 1–5 entries |
| `created_at` | timestamptz | No | Auto-set by Supabase |

**`insight_type` allowed values:**
```
messaging_shift · pricing_change · repeated_angle · overused_angle · whitespace
```

---

### `insight_sources` (evidence links)

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | uuid PK | No | |
| `insight_id` | uuid FK → insights | No | |
| `snapshot_id` | uuid FK → snapshots | No | The snapshot containing the evidence |
| `diff_id` | uuid FK → diffs | **Yes** | `null` if evidence is from a snapshot, not a diff |
| `snippet` | text | No | The exact evidence text — always present |
| `before_snippet` | text | **Yes** | `null` for non-change evidence |
| `after_snippet` | text | **Yes** | `null` for non-change evidence |
| `field` | text | No | Which `extracted_claims` key this came from |

---

## Relationships

```
competitors 1──* sources 1──* snapshots
competitors 1──* diffs ──── snapshot_before (FK, nullable)
                         └── snapshot_after (FK)
insights   *──* insight_sources ──── snapshots
                                └── diffs (nullable FK)
```

---

## Comparison Dimensions (fixed — do not add or remove)

Computed in `services/comparison_scorer.py`. Scores range from `-1.0` to `+1.0`.

| Key | Left pole (`-1.0`) | Right pole (`+1.0`) |
|-----|--------------------|---------------------|
| `premium_vs_cost` | Cost leadership / free pricing | Premium / enterprise pricing |
| `feature_vs_outcome` | Outcome / results messaging | Feature depth messaging |
| `enterprise_vs_smb` | SMB / team-first | Enterprise / org-wide |
| `simplicity_vs_power` | Simplicity / ease | Power / flexibility |
| `collaboration_vs_individual` | Individual productivity | Team collaboration |
| `speed_vs_control` | Control / auditability | Speed / time-to-value |

**Score derivation:**
1. Count positive-pole and negative-pole keyword signals in all `extracted_claims` text for a competitor
2. Score = `(pos_count - neg_count) / max(total, 1)` — clamped to `[-1, 1]`
3. If score = 0.0 AND a seeded fallback exists for this competitor+dimension, use the seeded value
4. Seeded fallbacks are in `SEED_SCORES` dict in `comparison_scorer.py`

**Whitespace saturation threshold:** `±0.25` — if dimension average across all competitors exceeds this, it is considered saturated (a gap exists on the other side).

---

## Seed Data Summary (demo mode)

Loaded from `seed-data/seed.json` via `POST /api/v1/crawl/run` with `mode=demo`.

| Entity | Count | Notes |
|--------|-------|-------|
| competitors | 5 | Notion, ClickUp, Monday.com, Airtable, Asana |
| sources | 10 | 2 per competitor (landing page + pricing page) |
| snapshots | 11 | Multiple per source, dated Dec 2025 – Feb 2026 |
| diffs | 11 | Covering 5 different `change_type` values |
| insights | 5 | Covering 4 different `insight_type` values |
| insight_sources | 11 | Evidence links across the 5 insights |

All seed IDs in `seed.json` use string keys (`"c1"`, `"s1"`, `"snap1"`) that the loader maps to real Postgres UUIDs. The mapping is only held in memory during the seed run — do not reference seed IDs elsewhere.
