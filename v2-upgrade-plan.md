# V2 Upgrade Plan — Market Intelligence Engine

## Purpose
Upgrade V1.5 into a more stable, more credible, and more business-ready V2 without rewriting the product architecture.

This is not a rebuild.
This is not a platform expansion.
This is a focused V2 upgrade for demo quality, recommendation quality, GEO quality, and product polish.

---

## Keep From Existing Versions
Preserve the following:
- implementation.md constraints
- company-guidelines.md principles
- seeded demo-safe mode
- official-page competitor tracking
- snapshots
- changes
- insights
- whitespace engine
- GEO as an additional signal layer
- traceability and evidence visibility

---

## V2 Objectives

### 1. Runtime Stability
Reduce backend/network instability and improve frontend resilience when the backend is slow, unavailable, or partially returns data.

### 2. UI Credibility Upgrade
Replace generic AI-generated styling with a cleaner B2B intelligence product aesthetic:
- stronger layout hierarchy
- clearer information grouping
- more premium cards and spacing
- stronger typography
- cleaner navigation
- clearer mode/status banners

### 3. Better Source Normalization
Improve how scraped website content is transformed into structured business intelligence fields.

### 4. Recommendation Engine V2
Generate stronger, more actionable, company-specific recommendations using:
- normalized official website data
- GEO signal data
- scoring logic
- evidence-backed reasoning

### 5. GEO System V2
Upgrade GEO into a more serious intelligence signal:
- fixed prompt bank
- provider-specific records
- surfaced brand frequency
- rank/order where possible
- reason-phrase extraction
- contribution to recommendation logic

### 6. V2.5 Teaser
Add only a small preview block for predictive analysis.
Do not implement a real predictive model in this pass.

---

## Product Framing
The product should now feel like:

A market intelligence engine that tracks competitor website changes, measures LLM-era brand visibility, and produces evidence-backed recommendations for what a target company should test next.

---

## V2 Scope

### Included
- backend stability improvements
- frontend resilience improvements
- UI redesign/polish
- normalized intelligence model improvements
- recommendation engine V2
- GEO V2
- signal-source visual breakdown
- source-backed recommendation surfaces
- small predictive teaser block

### Excluded
- auth
- arbitrary user prompt generation for GEO
- export workflows
- enterprise user management
- social scraping
- broad autonomous web crawling
- unsupported performance or sales claims
- full predictive analytics engine

---

## Core Recommendation Principle
Recommendations must be:
- short
- professional
- evidence-backed
- specific to the target company
- fact-sensitive
- transparent about confidence

Do not fabricate:
- revenue lift
- sales conversion rates
- traffic gains
- adoption gains
unless sourced from actual evidence.

If exact business outcomes are unknown, use:
- likely impact
- plausible upside
- test hypothesis
- potential improvement area

---

## Official Web Intelligence Inputs
Use only curated official sources:
- homepage
- pricing page
- feature/product page
- comparison page if official

Extract and normalize:
- company name
- page type
- pricing posture
- product category
- target audience
- primary value proposition
- CTA style
- feature themes
- trust signals
- differentiation phrases
- evidence snippets

---

## GEO Inputs
Use a fixed prompt bank only.
Each GEO record should store:
- provider
- prompt
- surfaced companies
- surfaced order if available
- response snippet
- extracted reason phrases
- timestamp or run label
- confidence marker if needed

---

## Recommendation Output Format
For a selected target company, output recommendation cards like:

- recommendation title
- short executive recommendation
- why this matters
- evidence summary
- source contribution split
- confidence label
- suggested next test
- optional supporting competitor examples

Do not pretend certainty where the evidence is weak.

---

## Visual Requirements
V2 should include:
- cleaner dashboard shell
- recommendation spotlight section
- GEO intelligence section
- signal contribution pie/donut chart
- evidence panel
- comparison matrix
- small predictive preview card

---

## Stability Requirements
V2 must improve:
- null safety
- loading/error states
- backend unavailable handling
- partial-data rendering
- live vs seeded mode clarity
- retry-safe UI interactions where useful

---

## V2 Build Order
1. inspect current V1.5 state
2. stabilize backend connectivity and API assumptions
3. improve frontend runtime handling
4. redesign UI shell and page presentation
5. upgrade source normalization pipeline
6. implement recommendation engine V2 backend logic
7. integrate GEO V2 signal processing
8. add recommendation and GEO visualizations
9. add predictive teaser block
10. run deployment-safe stabilization

---

## Success Criteria
V2 is successful if:
- it looks significantly more credible
- it fails gracefully
- it produces clearer recommendations
- GEO feels real and useful
- evidence remains visible
- live signals improve authenticity
- demo mode remains the safest path