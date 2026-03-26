"""
FastAPI application entry point.
Registers all routers, configures CORS, and sets up the app.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from routes import health, competitors, crawl, snapshots, changes, insights, comparison, whitespace, geo, recommendations

load_dotenv()

app = FastAPI(
    title="MarketMind Intelligence Engine",
    version="2.5.0",
    description="Evidence-backed market intelligence with GEO verification",
)

@app.get("/")
def root():
    return JSONResponse({
        "message": "MarketMind backend is running",
        "docs": "/docs",
        "health": "/health",
        "api_base": "/api/v1"
    })

# CORS: allow frontend origin — configure in env for production
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
allowed_origins = [o.strip() for o in FRONTEND_ORIGIN.split(",")]
if "http://localhost:3000" not in allowed_origins:
    allowed_origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    # Allow any localhost port (dev flexibility) + Vercel deployments
    allow_origin_regex=r"(https://.*\.vercel\.app|http://localhost:\d+|http://127\.0\.0\.1:\d+)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health (no prefix)
app.include_router(health.router)

# All other routes under /api/v1
API_PREFIX = "/api/v1"
app.include_router(competitors.router, prefix=API_PREFIX)
app.include_router(crawl.router, prefix=API_PREFIX)
app.include_router(snapshots.router, prefix=API_PREFIX)
app.include_router(changes.router, prefix=API_PREFIX)
app.include_router(insights.router, prefix=API_PREFIX)
app.include_router(comparison.router, prefix=API_PREFIX)
app.include_router(whitespace.router, prefix=API_PREFIX)
app.include_router(geo.router, prefix=API_PREFIX)
app.include_router(recommendations.router, prefix=API_PREFIX)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
