# Implementation Plan — Market Intelligence Engine (Hackathon Build)
**Time budget:** 5 hours maximum  
**Primary goal:** Ship a deployable MVP that works reliably end-to-end  
**Secondary goal:** Ship exactly one USP fully working with edge cases handled  
**Non-goal:** Do not attempt a broad internet-scale intelligence platform in this build

---

## 1. Product Lock

### 1.1 One-line product definition
A source-traceable market intelligence dashboard that tracks competitor website messaging and pricing changes over time, compares positioning across competitors, and surfaces prioritized strategic insights with evidence.

### 1.2 User
Primary user:
- Product marketer
- Growth strategist
- Founder
- Competitive intelligence analyst

### 1.3 Core pain
Competitor signals are scattered across landing pages, pricing pages, product pages, and review-style messaging. Teams waste time manually tracking changes and still struggle to convert noise into clear strategic decisions.

### 1.4 Demo category lock
Use **one category only** for the hackathon.

**Locked category recommendation:**
B2B productivity / collaboration SaaS

**Locked competitor set recommendation:**
- Notion
- ClickUp
- Monday.com
- Airtable
- Asana

If a different category is chosen, the same architecture must remain unchanged.

### 1.5 MVP promise
The MVP must let a user:
1. view tracked competitors
2. run or simulate data ingestion
3. view extracted competitor claims and pricing/messaging snapshots
4. view changes between snapshots
5. see scored insight cards
6. open evidence for each insight
7. view one whitespace recommendation backed by source evidence

---

## 2. Hackathon Strategy

### 2.1 What must work
The app must fully support this exact end-to-end flow:

1. User opens the dashboard
2. User sees tracked competitors in one category
3. User sees latest detected changes from existing snapshot history
4. User sees scored insights derived from those changes
5. User opens an insight and sees source-backed reasoning
6. User views one whitespace recommendation
7. User can trust that the insight is traceable to a real source or seeded source snapshot

### 2.2 What must not be attempted
Do not attempt:
- broad autonomous crawling across arbitrary web sources
- login/auth unless absolutely necessary
- social platform integrations
- vector DB integration
- complex browser automation as core runtime
- Gartner/G2/Trustpilot scraping as a hard dependency
- ad library integrations unless already available and reliable
- full semantic search platform
- enterprise-grade role management
- “AI agent” features with fuzzy, untraceable answers

### 2.3 The one USP
**Locked USP: Traceable Whitespace Engine**

Definition:
A constrained recommendation module that identifies underused messaging angles or gaps across tracked competitors and surfaces one or more “what to test next” suggestions, with explicit evidence and reasoning.

This must be fully working.

The USP is successful only if:
- it uses real or seeded extracted claims
- it compares competitor messaging across fixed dimensions
- it outputs at least one whitespace or underused angle
- it links that conclusion to source evidence
- it does not hallucinate unsupported recommendations

---

## 3. Build Scope

### 3.1 Realistic source types for hackathon
Supported source types:
- landing pages
- pricing pages
- product/feature pages
- seeded review snippets or seeded customer objection snippets

### 3.2 Minimum supported insight types
The system must support these insight types:
- messaging shift
- pricing change
- repeated positioning angle
- overused angle
- whitespace recommendation

### 3.3 Required positioning dimensions
Use a fixed set of comparison dimensions. Do not invent new ones mid-build.

Required dimensions:
- premium vs cost leadership
- feature-driven vs outcome-driven
- enterprise-oriented vs SMB/team-oriented
- simplicity/ease vs power/flexibility
- collaboration/teamwork vs individual productivity
- speed/efficiency vs control/customization

These dimensions may be represented as tags, labels, or score axes.

---

## 4. Architecture Lock

### 4.1 Stack lock
**Frontend**
- Next.js
- TypeScript
- Tailwind CSS
- component system: simple modular components
- deployment target: Vercel

**Backend**
- FastAPI preferred
- Python
- deployment target: Railway or Render

**Database**
- Supabase Postgres

### 4.2 Why this stack is locked
- Frontend must be fast to assemble and deploy
- Backend must be good at HTML/text parsing, diffing, and scoring
- Database must store snapshots, claims, diffs, and insights cleanly
- Supabase is already available and reduces setup overhead

### 4.3 Directory lock
Repository root assumed to be `/test`

Required folder structure:
```txt
/test
  /frontend
  /backend
  /shared-docs
  /seed-data