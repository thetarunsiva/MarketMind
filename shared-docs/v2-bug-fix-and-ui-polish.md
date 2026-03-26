# V2 Bugfix and UI Polish Plan

## Purpose
Stabilize and refine the current V2 build before adding V2.5 auth/admin features.

This pass is focused on:
- data correctness
- dynamic updating
- date accuracy
- shorter UI copy
- stronger visual hierarchy
- improved source credibility visuals
- runtime reliability

This is not a rebuild.
This is not a product scope expansion.
This is a targeted correctness and polish pass.

---

## Primary Problems To Fix

### 1. Incorrect Dates
Some pages show future dates or obviously wrong timestamps for live changes.

Required fix:
- audit all timestamp generation and parsing
- distinguish seeded demo timestamps vs live timestamps
- do not show impossible future dates unless they are genuinely present in source data
- format dates consistently
- if freshness is unknown, show a safe label such as:
  - "timestamp unavailable"
  - "captured recently"
  - "seeded sample data"

### 2. Live Data Not Updating Dynamically
The app appears static even after live extraction or refresh attempts.

Required fix:
- identify whether live refresh is actually hitting backend routes
- ensure frontend re-fetches after live actions
- ensure backend updates are reflected in returned payloads
- ensure cache or stale state issues are not blocking visible updates
- make demo mode and live mode behavior explicit

### 3. Network / Backend Errors
The demo often encounters backend/network failures.

Required fix:
- improve frontend handling for slow/unavailable backend
- improve backend failure responses
- improve retry-safe behavior where useful
- ensure the app degrades gracefully without looking broken

### 4. Too Much Text
Pages are too text-heavy and feel AI-generated.

Required fix:
- compress copy
- reduce paragraph size
- convert long explanations into:
  - short labels
  - bold stats
  - compact subtext
  - concise evidence snippets
- use clearer hierarchy and spacing

### 5. Weak Visual Credibility
The UI needs more life and better evidence signaling.

Required fix:
- show more company/source logos where appropriate
- make source provenance more visual
- strengthen chart/cards layout
- highlight key numbers with larger type and stronger contrast
- preserve a professional B2B intelligence feel

---

## UI Polish Principles

### Shorter Copy
All major cards and sections should become shorter and more readable.

### Better Hierarchy
Use:
- larger numbers
- bigger section headings
- stronger bold text
- lighter supporting text

### Better Contrast
Use a more premium, cleaner contrast system without adding noisy colors or gimmicky animation.

### Source Credibility
Where data sources are shown, use:
- company logos
- source tags
- page type labels
- small evidence chips

Do not fake logos for unsupported entities.

---

## Dynamic Data Rules

### Seeded Mode
Seeded mode must remain:
- deterministic
- safe
- clearly labeled

### Live Mode
Live mode must:
- refresh visible state after a successful action
- show last-updated time
- show if only snapshots were captured
- avoid implying insights were recomputed if they were not

### Date Handling
All timestamps must:
- use one formatting utility
- clearly distinguish demo vs live freshness
- avoid fabricated dates

---

## Required Fix Areas

### Backend
- timestamp generation/parsing
- live refresh route behavior
- returned freshness metadata
- structured error responses
- caching/staleness bugs if present

### Frontend
- stale data re-fetch flow
- loading and refresh states
- compact copy rewrite
- cards with larger numeric emphasis
- source/logo display
- consistent date formatting
- safer rendering of live vs seeded status

---

## Out of Scope For This Pass
- auth
- admin systems
- exports
- enterprise features
- broad data-source expansion
- predictive system rewrite

---

## Success Criteria
This pass is successful if:
- dates look believable and consistent
- live refresh visibly updates state when expected
- backend/network failures look graceful
- pages feel shorter and sharper
- source evidence looks more visual and trustworthy
- the UI feels more polished and less AI-generated