# MarketMind  
### AI-Native Market Intelligence Engine for Competitive Strategy

<p align="center">
  <img alt="MarketMind Banner" src="https://img.shields.io/badge/MarketMind-V2.5-8B5CF6?style=for-the-badge" />
  <img alt="Status" src="https://img.shields.io/badge/Status-Hackathon%20Ready-EC4899?style=for-the-badge" />
  <img alt="Mode" src="https://img.shields.io/badge/Modes-Demo%20%7C%20Live%20%7C%20Hybrid-6366F1?style=for-the-badge" />
</p>

<p align="center">
  <b>Track competitors. Surface whitespace. Validate positioning with GEO signals. Turn scattered signals into strategic action.</b>
</p>

---

## 🚀 Live Demo

**Frontend:** `PASTE_YOUR_VERCEL_LINK_HERE`  
**Backend/API:** `PASTE_YOUR_BACKEND_LINK_HERE`

> For judges: the safest walkthrough uses **Demo Mode** first, then optionally pivots into **Live Extraction** for authenticity.

---

## ✨ What is MarketMind?

**MarketMind** is a competitive intelligence platform built for modern product, growth, and strategy teams.

It helps answer questions like:

- What are competitors changing on their websites?
- Which messaging angles are becoming common?
- What positioning is overused?
- Where is the whitespace in the market?
- Which brands are surfacing in **LLM-driven discovery**?
- What should a company test next?

MarketMind combines:

- **Official website intelligence**
- **Change tracking across snapshots**
- **GEO / LLM visibility signals**
- **Evidence-backed recommendations**
- **Admin + company onboarding flows**
- **Fallback-safe demo mode for stable judging**

---

## 🧠 Why MarketMind Stands Out

Most competitor tools stop at dashboards and scraped summaries.

MarketMind goes further by combining **two worlds of intelligence**:

### 1. Traditional Web Intelligence
We track official competitor pages such as:
- homepages
- pricing pages
- feature / product pages
- selected comparison pages

From these, we extract:
- pricing posture
- value proposition
- CTA style
- feature themes
- target segment language
- differentiation claims
- evidence snippets

### 2. GEO Validation Layer
We also evaluate **LLM-era discoverability** using fixed buyer-intent prompts.

This reveals:
- which competitors appear most often in model-generated suggestions
- where visibility gaps exist
- whether website positioning aligns with AI-native discovery patterns

This is what gives MarketMind its edge.

---

## 🏆 Hackathon Value Proposition

MarketMind is designed to feel like a product teams would actually use after the hackathon.

It delivers:

- **Real business relevance**
- **Traceable intelligence**
- **Live + demo-safe hybrid reliability**
- **Clear recommendations**
- **A modern GEO layer**
- **A polished UI with fallback states**

---

# 📌 Core Features

## 1. Competitive Snapshot Tracking
Capture and compare curated official competitor pages over time.

**Tracks**
- homepage messaging
- pricing changes
- feature emphasis
- CTA shifts
- positioning drift

---

## 2. Change Detection Engine
Highlights meaningful changes between snapshots instead of just dumping raw HTML differences.

**Surfaces**
- new claims
- removed claims
- pricing changes
- CTA changes
- audience shifts
- messaging rewrites

---

## 3. Recommendation Engine V2
Generates concise, strategic, evidence-backed recommendations for a selected target company.

Each recommendation includes:
- title
- executive summary
- why it matters
- supporting competitors
- evidence summary
- next action
- confidence indicator
- Website vs GEO signal split

---

## 4. GEO / LLM Visibility Signals
A dedicated validation layer that measures which competitors surface in AI-era buyer-intent prompts.

**Examples**
- best alternatives to Notion
- best productivity tools for teams
- top collaboration platforms for startups
- best tools for docs + project tracking

This helps teams understand how brands are being discovered **beyond classic SEO**.

---

## 5. Whitespace Analysis
Find underused positioning angles and strategic gaps in the market.

This helps answer:
- what is everyone saying?
- what is no one saying?
- what should our company test next?

---

## 6. Competitor Matrix
Compare companies across structured dimensions such as:
- premium vs cost-led
- feature-led vs outcome-led
- enterprise vs SMB
- simplicity vs flexibility
- collaboration vs individual productivity

---

## 7. Source Evidence & Traceability
Every important insight in MarketMind is designed to be tied back to:
- source page
- snippet
- signal type
- supporting competitor
- captured state

This avoids black-box intelligence.

---

## 8. Auth + Admin Layer (V2.5)
A lightweight but working product layer for demo realism.

Includes:
- company onboarding
- Google sign-in
- company category/domain selection
- admin access
- simple usage/company overview

---

# 🧩 Product Screens / Modules

## Overview
- platform health
- tracked competitors
- total signal volume
- latest status
- quick navigation

## Recommendations
- 4–5 strategic recommendation cards
- signal contribution visuals
- evidence summaries
- competitor support chips

## GEO Validation
- prompt-bank coverage
- surfaced competitor patterns
- visibility trends
- GEO-backed recommendation cues

## Whitespace Analysis
- opportunity cards
- validation layer support
- recommended tests

## Competitor Matrix
- structured comparison view
- positioning patterns at a glance

## Strategic Insights
- evidence-backed intelligence summaries

## Detected Changes
- content drift
- messaging shifts
- page updates
- pricing language changes

## Source Snapshots
- captured/raw evidence
- extracted structures
- traceability support

## Admin Dashboard
- total companies
- total users
- category stats
- company list

---

# 🏗️ Tech Stack

## Frontend
- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- modular component-based architecture

## Backend
- **FastAPI**
- **Python**
- structured routes + services + seed loaders

## Data / Auth
- **Supabase**
- Seeded + Live-compatible data model
- Google auth support
- company/user/admin metadata

## Deployment
- **Vercel** for frontend
- **Render / Railway** for backend

---

# 🧠 Architecture Overview

```text
Official Competitor Pages
        │
        ▼
 Crawl / Extract / Normalize
        │
        ├── Snapshots
        ├── Change Detection
        ├── Structured Signals
        └── Evidence Snippets
                │
                ▼
      GEO / Prompt Visibility Layer
                │
                ▼
      Recommendation + Whitespace Logic
                │
                ▼
        MarketMind Frontend UI
