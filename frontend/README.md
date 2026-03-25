# Market Intelligence Engine — Frontend

Next.js 16 dashboard for the Market Intelligence Engine.

## Quick Start

```bash
cd frontend
npm install
cp .env.local.example .env.local   # set your backend URL
npm run dev
```

Visit `http://localhost:3000`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend base URL (default: `http://localhost:8000`) |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Overview dashboard — competitors, stats, top insights |
| `/changes` | All detected snapshot diffs with before/after |
| `/insights` | Scored insight list with filter tabs |
| `/insights/[id]` | Insight detail with full evidence drawer |
| `/comparison` | Competitor positioning map across 6 dimensions |
| `/whitespace` | **USP: Traceable Whitespace Engine** recommendations |

## Load Demo Data

From the dashboard header, click **Load Demo Data** to trigger `POST /api/v1/crawl/run?mode=demo`.
This seeds all 5 competitors, snapshots, diffs, and insights.

## Deploy to Vercel

1. Connect this `/frontend` directory to Vercel
2. Set `NEXT_PUBLIC_API_BASE_URL` to your deployed backend URL
3. Deploy — all pages are statically generated or server-rendered on demand
