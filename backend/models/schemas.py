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


# --- GEO Signals ---

class GeoSignalSchema(BaseModel):
    id: str
    provider: str
    prompt: str
    surfaced_companies: list[str]
    appearance_frequency: float
    rank: Optional[int] = None
    response_snippet: Optional[str] = None
    extracted_reasoning: Optional[str] = None
    created_at: str


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


# --- V2: Normalized Intelligence ---

class NormalizedIntel(BaseModel):
    competitor_id: str
    competitor_name: str
    pricing_posture: Optional[str] = None
    pricing_tiers_raw: list[str] = []
    target_segment: Optional[str] = None
    value_proposition: Optional[str] = None
    cta_strategy: Optional[str] = None
    cta_secondary_strategy: Optional[str] = None
    cta_raw: Optional[str] = None
    feature_themes: list[str] = []
    trust_signals: list[str] = []
    differentiation_phrases: list[str] = []
    evidence_snippets: list[dict] = []
    meta_description: Optional[str] = None


# --- V2: Recommendation Engine ---

class RecommendationEvidenceItem(BaseModel):
    source_type: str  # 'website' | 'geo'
    source_label: str
    snippet: str
    competitor: str
    signal_reason: Optional[str] = None


class RecommendationV2(BaseModel):
    id: str
    target_company: str
    title: str
    recommendation_type: str  # messaging | pricing | segment | geo | competitive_response
    executive_summary: str
    why_it_matters: str
    evidence_summary: str
    website_signal_weight: float  # 0-1
    geo_signal_weight: float  # 0-1
    supporting_competitors: list[str] = []
    confidence: str  # high | medium | low
    next_test: str
    evidence_items: list[RecommendationEvidenceItem] = []
    future_signal_preview: Optional[str] = None


class RecommendationsResponse(BaseModel):
    generated_at: str
    target_company: str
    mode: str
    recommendations: list[RecommendationV2]


# --- V2: Predictive Preview ---

class PredictivePreview(BaseModel):
    id: str
    title: str
    summary: str
    direction: str  # likely_up | likely_down | stable | emerging
    confidence: str
    basis: str
    disclaimer: str = "This is a directional preview, not a forecast."


# --- V2: GEO Intelligence ---

class GeoSignalV2(BaseModel):
    id: Optional[str] = None
    provider: str
    prompt: str
    prompt_category: Optional[str] = None  # product_comparison | use_case | tool_recommendation | workflow
    surfaced_companies: list[str] = []
    appearance_frequency: float  # 0.0–1.0
    rank: Optional[int] = None
    signal_strength: Optional[str] = None  # strong | moderate | weak
    response_snippet: Optional[str] = None
    extracted_reasoning: Optional[str] = None
    created_at: Optional[str] = None


class GeoCompanyFrequency(BaseModel):
    company: str
    total_frequency: float
    prompt_count: int
    avg_rank: Optional[float] = None
    best_rank: Optional[int] = None


class GeoSummary(BaseModel):
    total_prompts: int
    total_providers: int
    prompt_categories: list[str] = []
    company_frequencies: list[GeoCompanyFrequency] = []
    coverage_ratio: float  # what % of prompts surface the target company


class GeoResponse(BaseModel):
    signals: list[GeoSignalV2] = []
    summary: GeoSummary
