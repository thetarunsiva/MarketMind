
---

## company-guidelines.md

```md
# Company Guidelines — Market Intelligence Engine Hackathon Build

This document defines the behavioral rules, engineering philosophy, model boundaries, and quality standards for the project.  
It exists to prevent drift, reduce wasted model output, and force the codebase toward a deployable, debuggable, strategic product within five hours.

---

## 1. Mission

Build a deployable market intelligence dashboard that turns competitor page content and historical changes into source-traceable strategic insights.

This product is not a toy crawler.  
This product is not a generic AI summarizer.  
This product is a focused intelligence interface for non-technical decision-makers.

The app must make a judge think:
- “I understand what this does”
- “I trust where the insight came from”
- “This is strategically useful”
- “This team knew what to finish”

---

## 2. Product Philosophy

### 2.1 Truth over spectacle
We prefer a narrow, accurate, traceable system over a broad, flashy, fragile one.

### 2.2 Evidence over opinion
Every major insight must be traceable to source-backed evidence.

### 2.3 Strategy over raw scraping
Collecting signals is not enough.  
The product must transform those signals into decision-ready output.

### 2.4 Reliability over ambition
A fully working seeded flow beats an unstable real-time pipeline.

### 2.5 One core flow, beautifully finished
Hackathons reward clarity and completeness more than theoretical platform breadth.

---

## 3. Non-Negotiable Product Principles

### 3.1 Traceability is mandatory
Every insight, recommendation, whitespace output, or comparison statement must be explainable via:
- source URL
- evidence snippet
- snapshot context
- reasoning summary

### 3.2 Fixed strategic dimensions
Use a constrained set of comparison axes. Do not freely invent categories during implementation.

### 3.3 Transparent scoring
Scoring logic must be simple enough to explain and inspect.  
Avoid opaque “AI says so” output.

### 3.4 Demo-safe architecture
The app must work in a deterministic seeded mode even if live fetching fails.

### 3.5 No fake omniscience
Do not pretend the system sees the entire market.  
It only sees the tracked competitor set and selected source types.

---

## 4. Model Collaboration Constitution

### 4.1 Claude role
Claude owns backend architecture and backend implementation.

Claude is responsible for:
- database design
- API contracts
- extraction logic
- diff engine
- insight scoring
- whitespace logic
- seed fixtures
- backend reliability
- backend testing
- backend deployment readiness

Claude must think like a systems engineer under deadline.

Claude must not:
- redesign frontend flows
- invent frontend UI behavior outside documented contracts
- create backend features that are not tied to the core product flow
- add speculative abstractions for future scale

### 4.2 Gemini role
Gemini owns frontend architecture and frontend implementation.

Gemini is responsible for:
- dashboard structure
- page composition
- visual hierarchy
- cards/tables/filters
- insight evidence panel
- loading/empty/error states
- API integration using documented contracts
- frontend deployment readiness

Gemini must think like a product UI engineer under deadline.

Gemini must not:
- invent backend routes
- assume undocumented payload fields
- add unrequested frontend pages unrelated to the demo
- overcomplicate animations or visuals

### 4.3 Shared truth
The shared truth between backend and frontend is the documented API contract, not assumptions.

### 4.4 Boundary rule
No model should change the other model’s domain except for shared documentation and explicit contract changes.

---

## 5. Engineering Philosophy

### 5.1 Prefer boring code
Boring, readable, modular code is better than clever, compressed, hard-to-debug code.

### 5.2 Small files, clear responsibilities
Each file should have a single clear role.

Avoid:
- giant utility dumps
- giant components
- giant service layers
- multi-hundred-line mixed-logic files

### 5.3 Shallow abstractions
Abstract only when repeated twice or when structure clearly demands it.  
Do not build speculative architecture for post-hackathon scale.

### 5.4 Data first, polish second
The product’s trust comes from evidence and reasoning, not glossy animations.

### 5.5 Deployment awareness from the start
Every implementation choice should consider:
- environment variables
- hosted DB behavior
- public endpoint behavior
- frontend/backend base URL integration
- fallback data path

---

## 6. Product Scope Discipline

### 6.1 Allowed source types
Allowed:
- landing pages
- pricing pages
- product pages
- seeded review-like snippets

Not required:
- social scraping
- ad libraries
- forums
- private sales notes
- influencer content APIs
- authenticated sources

### 6.2 Allowed feature set
Allowed:
- tracked competitors
- snapshots
- extracted claims
- diffs
- scored insights
- comparison view
- whitespace recommendation
- evidence panel

Disallowed during initial build:
- authentication
- team workspaces
- user accounts
- notifications
- saved reports
- export systems
- vector search
- autonomous agents
- broad universal ingestion pipelines

### 6.3 Category discipline
The project must remain scoped to one demo category.  
Do not expand across industries during the hackathon.

---

## 7. Anti-Hallucination Rules

### 7.1 No invented evidence
Never fabricate:
- source text
- extracted claims
- pricing details
- review findings
- competitor changes
- whitespace reasoning

### 7.2 No invented API contracts
Never invent request or response fields not documented in the shared contract.

### 7.3 No invented feature completion
Do not label a feature “working” if it only exists visually without real data flow.

### 7.4 No invented AI certainty
If a classification or recommendation is low-confidence, represent it accordingly.

### 7.5 Use deterministic data where possible
For demo-critical sections, prefer seeded or deterministic data over unstable live behavior.

---

## 8. UX Principles

### 8.1 Insight first
The product should show value quickly.  
The user should see strategic signal before they see technical plumbing.

### 8.2 Trust first
Every major screen should reinforce credibility through evidence access and clear labeling.

### 8.3 Clean scanability
A non-technical user should understand:
- what changed
- why it matters
- what to test next
without deciphering clutter.

### 8.4 Detail on demand
Show summaries upfront.  
Reveal full evidence only when requested.

### 8.5 Graceful failure
Missing data, empty states, and backend issues must still feel controlled and intentional.

---

## 9. Data Principles

### 9.1 Preserve raw source context
Store raw or near-raw source content wherever practical.

### 9.2 Preserve structured extraction
Store extracted claim structures separately from raw content so evidence remains inspectable.

### 9.3 Do not hide simplifications
If seeded data is being used, the system may indicate demo mode or silently operate safely, but internal implementation must remain honest.

### 9.4 Comparison dimensions are fixed
Use the same comparison dimension set throughout the product to preserve coherence.

---

## 10. Scoring and Insight Principles

### 10.1 Scores are ranking aids, not mystical truths
Scores exist to help prioritize.  
They should not pretend to be objective market truth.

### 10.2 Relevance should dominate
An insight that matters strategically is more useful than one that is merely rare.

### 10.3 Recommendations require justification
Every recommendation must answer:
- what was observed
- why it matters
- why this is underused or overused
- what should be tested next

### 10.4 Empty states are acceptable
If no strong recommendation exists, the product should say so cleanly rather than inventing one.

---

## 11. Debugging Philosophy

### 11.1 Debuggability is a feature
The codebase must be easy to inspect under time pressure.

### 11.2 Useful logs only
Log:
- mode selected
- source processed
- snapshot created
- diff count
- insight count
- whitespace output count

Do not flood logs with noise.

### 11.3 Consistent error shapes
Backend errors should be structured and readable.  
Frontend errors should be human-readable and calm.

### 11.4 Reproducible local behavior
The app should run locally with seeded data even if live source calls fail.

---

## 12. Quality Standards

### 12.1 Backend quality bar
Backend is acceptable only if:
- routes are clear
- models are coherent
- seed/demo mode works
- diff logic works on known examples
- insights have evidence links/snippets
- whitespace endpoint behaves safely
- no endpoint crashes on normal empty scenarios

### 12.2 Frontend quality bar
Frontend is acceptable only if:
- overview is readable
- cards render cleanly
- evidence view works
- comparison view is understandable
- whitespace panel is understandable
- loading/empty/error states exist
- UI does not rely on broken data assumptions

### 12.3 Product quality bar
The product is acceptable only if a judge can understand it in under three minutes.

---

## 13. Time Discipline Rules

### 13.1 Every feature must justify itself
If a feature does not strengthen the core story, it should not be built.

### 13.2 Cut breadth aggressively
When under time pressure, cut optional feature breadth before cutting core reliability.

### 13.3 Demo path is sacred
Once a stable demo path exists, protect it.  
Do not destabilize the demo to chase extras.

### 13.4 Freeze scope early
Do not continuously expand the product during implementation.

---

## 14. Deployment Principles

### 14.1 Deployability is part of completion
Code that only works locally is not finished.

### 14.2 Environment clarity
All env vars must be explicit, named clearly, and easy to set.

### 14.3 Public reliability
The hosted app must degrade gracefully if live crawling is unavailable.

### 14.4 Frontend-backend contract sanity
Frontend base URL usage and backend CORS must be intentionally configured.

---

## 15. Communication Style Inside the Codebase

### 15.1 Naming
Names should be literal and clear:
- `get_insights`
- `generate_diffs`
- `score_claims`
- `WhitespacePanel`
- `InsightCard`
- `EvidenceDrawer`

Avoid vague names like:
- `processor`
- `manager`
- `handler`
- `magic`
unless their scope is truly obvious.

### 15.2 Comments
Comments should explain:
- why something exists
- important assumptions
- fallback behavior
- hackathon-specific shortcuts

Comments should not narrate obvious syntax.

### 15.3 Documentation
Shared docs should remain concise and operational.

---

## 16. Expected System Character

The final system should feel:
- practical
- deliberate
- trustworthy
- modular
- demo-ready

It should not feel:
- bloated
- unfinished
- overpromised
- reliant on vague AI language
- visually noisy
- operationally fragile

---

## 17. Final Standard for Success

We succeed if:
- the app works end-to-end
- the dashboard tells a clear story
- the evidence path is visible
- the whitespace USP is credible
- the product feels finished enough to trust
- the demo can be delivered calmly without excuses

We fail if:
- the app only “sort of” works
- the insights are untraceable
- the frontend and backend drift apart
- live fetch instability breaks the experience
- the team spends time on features the judges will not remember

---

## 18. Final Instruction to All Models

Build with discipline.

Treat the five-hour time limit as a design tool, not a tragedy.

Finish the spine.
Finish the proof.
Finish the one thing that makes this product memorable.

Everything else is mist.