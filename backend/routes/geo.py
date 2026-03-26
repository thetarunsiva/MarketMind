"""
Routes: /geo
GET /api/v1/geo — V2 GEO intelligence signals with summary statistics
"""
import logging
from fastapi import APIRouter, HTTPException
from db import queries
from models.schemas import GeoResponse, GeoSignalV2, GeoSummary, GeoCompanyFrequency

router = APIRouter(tags=["GEO Signals"])
logger = logging.getLogger(__name__)


def _classify_prompt(prompt: str) -> str:
    """Classify a GEO prompt into a category for display grouping."""
    p = prompt.lower()
    if any(w in p for w in ["compare", "vs", "versus", "difference", "alternative"]):
        return "product_comparison"
    if any(w in p for w in ["best", "top", "recommend", "suggestion"]):
        return "tool_recommendation"
    if any(w in p for w in ["workflow", "process", "automate", "pipeline"]):
        return "workflow"
    if any(w in p for w in ["for", "use", "help", "need"]):
        return "use_case"
    return "general"


def _classify_signal_strength(freq: float, rank: int | None) -> str:
    """Classify signal strength from frequency and rank."""
    if freq >= 0.8 and rank and rank <= 2:
        return "strong"
    if freq >= 0.5 or (rank and rank <= 3):
        return "moderate"
    return "weak"


def _build_summary(signals: list[dict], target: str = "Notion") -> GeoSummary:
    """Build aggregate GEO summary from raw signal data."""
    providers = set()
    categories = set()
    freq_map: dict[str, dict] = {}  # company -> {total_freq, count, ranks}

    for sig in signals:
        providers.add(sig.get("provider", "Unknown"))
        categories.add(_classify_prompt(sig.get("prompt", "")))

        for company in (sig.get("surfaced_companies") or []):
            if company not in freq_map:
                freq_map[company] = {"total_freq": 0.0, "count": 0, "ranks": []}
            freq_map[company]["total_freq"] += sig.get("appearance_frequency", 0)
            freq_map[company]["count"] += 1
            if sig.get("rank"):
                freq_map[company]["ranks"].append(sig["rank"])

    company_freqs = []
    for company, data in sorted(freq_map.items(), key=lambda x: x[1]["total_freq"], reverse=True):
        ranks = data["ranks"]
        company_freqs.append(GeoCompanyFrequency(
            company=company,
            total_frequency=round(data["total_freq"], 2),
            prompt_count=data["count"],
            avg_rank=round(sum(ranks) / len(ranks), 1) if ranks else None,
            best_rank=min(ranks) if ranks else None,
        ))

    # Target coverage: what % of prompts mention the target
    target_prompts = sum(1 for s in signals if target in (s.get("surfaced_companies") or []))
    coverage = round(target_prompts / max(len(signals), 1), 2)

    return GeoSummary(
        total_prompts=len(signals),
        total_providers=len(providers),
        prompt_categories=sorted(categories),
        company_frequencies=company_freqs,
        coverage_ratio=coverage,
    )


@router.get("/geo", response_model=GeoResponse)
def get_geo_signals(limit: int = 50, target: str = "Notion"):
    """
    Returns V2 GEO intelligence signals with aggregate summary.
    Each signal is enriched with prompt_category and signal_strength.
    """
    try:
        raw = queries.get_geo_signals(limit=limit)

        signals = []
        for sig in raw:
            prompt = sig.get("prompt", "")
            freq = sig.get("appearance_frequency", 0)
            rank = sig.get("rank")

            signals.append(GeoSignalV2(
                id=sig.get("id"),
                provider=sig.get("provider", "Unknown"),
                prompt=prompt,
                prompt_category=_classify_prompt(prompt),
                surfaced_companies=sig.get("surfaced_companies") or [],
                appearance_frequency=freq,
                rank=rank,
                signal_strength=_classify_signal_strength(freq, rank),
                response_snippet=sig.get("response_snippet"),
                extracted_reasoning=sig.get("extracted_reasoning"),
                created_at=sig.get("created_at"),
            ))

        summary = _build_summary(raw, target=target)

        return GeoResponse(signals=signals, summary=summary)

    except Exception as e:
        logger.error(f"[GEO] Failed to fetch signals: {e}")
        raise HTTPException(status_code=500, detail=str(e))
