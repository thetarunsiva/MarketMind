# Recommendation Engine V2 Specification

## Purpose
Define the V2 recommendation system for the Market Intelligence Engine.

The engine must convert structured competitor intelligence and GEO signals into concise, professional, evidence-backed recommendations for a target company.

---

## Design Principles

### 1. Recommendations must be evidence-backed
Every recommendation must be connected to:
- normalized website intelligence
- GEO visibility signals
- explicit evidence snippets

### 2. Recommendations must be concise
The top-level recommendation should read like a professional strategic note, not a giant AI essay.

### 3. Recommendations must be business-facing
The writing should feel like it belongs in a product strategy or growth intelligence tool.

### 4. Recommendations must not invent business outcomes
Do not fabricate:
- sales uplift
- conversion uplift
- revenue gain
- adoption lift
unless the source data explicitly supports it.

Instead use:
- likely upside
- opportunity area
- reasonable hypothesis
- recommended experiment

---

## Inputs

### A. Website Intelligence Inputs
Normalized fields from official pages:
- pricing posture
- target segment
- differentiation themes
- CTA style
- trust signals
- product claims
- feature clusters
- recently changed positioning

### B. GEO Inputs
Structured GEO records:
- provider
- prompt
- surfaced competitors
- relative order
- frequency
- reason phrases
- response evidence

### C. Comparative Signals
Derived scores such as:
- overused angle
- underused angle
- whitespace
- visibility gap
- messaging consistency
- recent messaging drift

---

## Recommendation Types

### 1. Messaging Recommendation
Example:
Refine or strengthen a specific value proposition or positioning angle.

### 2. Pricing/Packaging Recommendation
Example:
Clarify value framing, plan differentiation, or packaging narrative.

### 3. Segment Recommendation
Example:
Target an under-addressed audience more explicitly.

### 4. GEO Recommendation
Example:
Strengthen prompts/phrases/positioning patterns associated with higher LLM surfacing.

### 5. Competitive Response Recommendation
Example:
Counter or differentiate from an overused competitor angle.

---

## Required Output Fields

Each recommendation should contain:

- id
- target_company
- title
- executive_summary
- recommendation_type
- why_it_matters
- evidence_summary
- website_signal_weight
- geo_signal_weight
- supporting_competitors
- confidence
- next_test
- evidence_items

---

## Executive Summary Format
The executive summary should sound like:

“Notion could strengthen its AI-native discoverability by explicitly linking team knowledge management with workflow execution. Competitors such as ClickUp and Monday appear more frequently across high-intent LLM prompts, while official site messaging in this category increasingly rewards outcome-led framing over feature inventory.”

It should be:
- crisp
- professional
- specific
- believable

---

## Confidence Labels
Use:
- High
- Medium
- Low

Confidence should depend on:
- signal agreement between website intelligence and GEO
- evidence density
- consistency across competitors
- freshness of data

---

## Source Contribution Logic
Every recommendation should show a split between:
- website intelligence contribution
- GEO contribution

This is for display in charts and summary labels.

Example:
- Website Signals: 65%
- GEO Signals: 35%

This split must be transparent and simple, not fake-precise.

---

## Evidence Items
Each recommendation should include a list of evidence items with fields like:
- source_type
- source_label
- snippet
- competitor
- page_type
- signal_reason

---

## Recommendation Generation Flow
1. collect normalized website signals
2. collect GEO signals
3. identify repeated, missing, overused, or underrepresented angles
4. score strategic importance
5. generate concise recommendation draft
6. attach evidence summary
7. compute source contribution split
8. assign confidence
9. expose display-ready output

---

## V2 Constraints
- no unsupported ROI claims
- no unsupported sales or revenue claims
- no vague AI fluff
- no giant paragraphs
- no fake certainty
- no breaking current insight logic

---

## V2.5 Preview Hook
Optionally include one preview field:
- future_signal_preview

This should be clearly marked as:
- preview
- experimental
- directional

It must not be presented as a production prediction engine.