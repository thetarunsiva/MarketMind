# Market Intelligence Engine V1.5 Upgrade Plan
# STATUS: DRAFT

## 1. Architectural Strategy
This upgrade enriches the existing MVP without rewriting the core `FastAPI + Next.js` scaffolding. The primary additions are limited live crawling, enhanced extraction, explicit recommendations, and a net-new **Generative Engine Optimization (GEO)** layer. 

## 2. Live Crawling & Better Extraction (Narrow Scope)
- **Live vs Seeded**: `POST /api/v1/crawl/run?mode=demo` will continue to use `seed.json`. When `mode=live`, we will perform `httpx` GET requests to the official competitor URLs already situated in the `sources` table.
- **Extraction Upgrades**: `services/extractor.py` will be upgraded. The `extracted_claims` JSONB shape in `data-model.md` already supports `hero_headline`, `subheadline`, `cta_text`, `pricing_text`, `feature_bullets`, `social_proof`, `audience_terms`, and `major_claims`. We will implement stronger regex/parsing targeting to populate these comprehensively during live crawls, falling back cleanly.

## 3. Better Recommendations
- **Target Files**: `services/whitespace_engine.py` and Insight generators.
- **Goal**: Make output actionable. Instead of passive observations, output strict actions: "Test this angle", "Avoid this overused framing", "This whitespace is underrepresented."
- **Data Change**: We will augment the `recommendation` and `reasoning` text generation blocks. No schema changes are strictly required here as text fields already exist.

## 4. GEO Signal Layer
### Data Model Additions
A new `geo_signals` table (or analogously mapped to existing insights if denormalized, but a distinct table is cleaner):
```sql
CREATE TABLE geo_signals (
  id uuid PK,
  provider text, -- e.g., "ChatGPT-4", "Claude 3.5"
  prompt text, 
  surfaced_companies text[], -- e.g., ["Notion", "Asana"]
  appearance_frequency float,
  rank int,
  response_snippet text,
  extracted_reasoning text,
  created_at timestamptz
)
```

### Seeded Ingestion Pipeline
- Update `seed-data/seed.json` to include a `geo_signals` array.
- Update `backend/seed/loader.py` to upsert these records when `mode=demo`.

### New API Endpoints
- **GET** `/api/v1/geo` (returns list of GEO signal metrics for comparison)
- **GET** `/api/v1/geo/prompts` (returns aggregate LLM visibility scores by prompt)

## 5. GEO Dashboard Surface
- **New Page**: `frontend/app/geo/page.tsx` will display a ranking/comparison view of which competitors dominate which fixed LLM intents.
- **Insight Linkage**: Existing Insight and Whitespace recommendation cards will be augmented to show a "GEO Signal Support" badge if a recommendation aligns with LLM visibility data.

## 6. Implementation Priorities
1. **[DONE] Model & API Definition**: Update `api-contracts.md` and `data-model.md` for GEO.
2. **[DONE] Backend**: Upgrade `loader.py` and `routes/geo.py` for seeded GEO signals.
3. **[DONE] Backend**: Upgrade live crawling in `routes/crawl.py` and `extractor.py` using `httpx` and `BeautifulSoup`.
4. **[DONE] Backend**: Enhance recommendation text inside `whitespace_engine.py` to weave GEO analytics into gaps.
5. **[PENDING] Frontend**: Create the GEO Dashboard surface and weave signals into existing cards.
6. **[PENDING] Validation**: Validate both `mode=demo` and `mode=live` deployment reliability.

