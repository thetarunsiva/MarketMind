"""
Pydantic schemas matching the API contract exactly.
Every field here maps to a documented field in shared-docs/api-contracts.md.
"""
from __future__ import annotations
from typing import Optional
from pydantic import BaseModel


# --- Source ---

class SourceSchema(BaseModel):
    id: str
    url: str
    source_type: str
    last_crawled_at: Optional[str] = None


# --- Competitor ---

class CompetitorSchema(BaseModel):
    id: str
    name: str
    website: str
    category: str
    sources: list[SourceSchema] = []
    snapshot_count: int = 0
    last_updated: Optional[str] = None


class CompetitorCreateRequest(BaseModel):
    name: str
    website: str
    category: str


# --- Snapshot ---

class ExtractedClaims(BaseModel):
    hero_headline: Optional[str] = None
    subheadline: Optional[str] = None
    cta_text: Optional[str] = None
    pricing_text: Optional[str] = None
    feature_bullets: list[str] = []
    social_proof: list[str] = []
    audience_terms: list[str] = []
    major_claims: list[str] = []


class SnapshotSchema(BaseModel):
    id: str
    source_id: str
    competitor_id: str
    competitor_name: str
    source_url: str
    source_type: str
    captured_at: str
    extracted_claims: ExtractedClaims


# --- Diff / Change ---

class ChangeSchema(BaseModel):
    id: str
    competitor_id: str
    competitor_name: str
    source_url: str
    change_type: str
    field: str
    before: Optional[str] = None
    after: Optional[str] = None
    snapshot_before_id: Optional[str] = None
    snapshot_after_id: str
    detected_at: str


# --- Insight ---

class InsightListItem(BaseModel):
    id: str
    title: str
    insight_type: str
    summary: str
    recommendation: str
    novelty_score: float
    frequency_score: float
    relevance_score: float
    priority_score: float
    competitor_ids: list[str]
    competitor_names: list[str]
    evidence_count: int
    created_at: str


class EvidenceItem(BaseModel):
    id: str
    source_url: str
    source_type: str
    competitor_name: str
    snapshot_id: str
    captured_at: str
    snippet: str
    before_snippet: Optional[str] = None
    after_snippet: Optional[str] = None
    field: str


class InsightDetail(BaseModel):
    id: str
    title: str
    insight_type: str
    summary: str
    recommendation: str
    novelty_score: float
    frequency_score: float
    relevance_score: float
    priority_score: float
    competitor_ids: list[str]
    competitor_names: list[str]
    reasoning: str
    evidence: list[EvidenceItem]
    created_at: str


# --- Comparison ---

class CompetitorComparison(BaseModel):
    id: str
    name: str
    scores: dict[str, float]
    top_claims: list[str]
    positioning_tags: list[str]


class ComparisonResponse(BaseModel):
    dimensions: list[str]
    competitors: list[CompetitorComparison]


# --- Whitespace ---

class WhitespaceEvidence(BaseModel):
    competitor_name: str
    source_url: str
    snippet: str
    field: str


class WhitespaceRecommendation(BaseModel):
    id: str
    title: str
    summary: str
    why_it_matters: str
    why_its_whitespace: str
    recommended_action: str
    confidence: str  # low | medium | high
    dimension: str
    evidence: list[WhitespaceEvidence]


class WhitespaceResponse(BaseModel):
    generated_at: str
    mode: str
    recommendations: list[WhitespaceRecommendation]


# --- Crawl ---

class CrawlRequest(BaseModel):
    mode: str = "demo"
    competitor_ids: Optional[list[str]] = None


class CrawlResponse(BaseModel):
    mode: str
    processed: int
    snapshots_created: int
    diffs_generated: int
    insights_generated: int
    message: str


# --- Health ---

class HealthResponse(BaseModel):
    status: str
    mode: str
    version: str
