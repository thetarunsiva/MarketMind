/**
 * TypeScript types — mirrors api-contracts.md exactly.
 * Frontend must only use fields defined here.
 */

export interface Source {
  id: string;
  url: string;
  source_type: 'landing_page' | 'pricing_page' | 'product_page';
  last_crawled_at: string | null;
}

export interface Competitor {
  id: string;
  name: string;
  website: string;
  category: string;
  sources: Source[];
  snapshot_count: number;
  last_updated: string | null;
}

export interface ExtractedClaims {
  hero_headline: string | null;
  subheadline: string | null;
  cta_text: string | null;
  pricing_text: string | null;
  feature_bullets: string[];
  social_proof: string[];
  audience_terms: string[];
  major_claims: string[];
}

export interface Snapshot {
  id: string;
  source_id: string;
  competitor_id: string;
  competitor_name: string;
  source_url: string;
  source_type: string;
  captured_at: string;
  extracted_claims: ExtractedClaims;
}

export interface Change {
  id: string;
  competitor_id: string;
  competitor_name: string;
  source_url: string;
  change_type: 'added_claim' | 'removed_claim' | 'changed_pricing' | 'changed_cta' | 'changed_positioning' | 'changed_audience';
  field: string;
  before: string | null;
  after: string | null;
  snapshot_before_id: string | null;
  snapshot_after_id: string;
  detected_at: string;
}

export interface InsightListItem {
  id: string;
  title: string;
  insight_type: 'messaging_shift' | 'pricing_change' | 'repeated_angle' | 'overused_angle' | 'whitespace';
  summary: string;
  recommendation: string;
  novelty_score: number;
  frequency_score: number;
  relevance_score: number;
  priority_score: number;
  competitor_ids: string[];
  competitor_names: string[];
  evidence_count: number;
  created_at: string;
}

export interface EvidenceItem {
  id: string;
  source_url: string;
  source_type: string;
  competitor_name: string;
  snapshot_id: string;
  captured_at: string;
  snippet: string;
  before_snippet: string | null;
  after_snippet: string | null;
  field: string;
}

export interface InsightDetail extends InsightListItem {
  reasoning: string;
  evidence: EvidenceItem[];
}

export interface CompetitorComparison {
  id: string;
  name: string;
  scores: Record<string, number>;
  top_claims: string[];
  positioning_tags: string[];
}

export interface ComparisonResponse {
  dimensions: string[];
  competitors: CompetitorComparison[];
}

export interface WhitespaceEvidence {
  competitor_name: string;
  source_url: string;
  snippet: string;
  field: string;
}

export interface WhitespaceRecommendation {
  id: string;
  title: string;
  summary: string;
  why_it_matters: string;
  why_its_whitespace: string;
  recommended_action: string;
  confidence: 'low' | 'medium' | 'high';
  dimension: string;
  evidence: WhitespaceEvidence[];
}

export interface WhitespaceResponse {
  generated_at: string;
  mode: string;
  recommendations: WhitespaceRecommendation[];
}

export interface CrawlResult {
  mode: string;
  processed: number;
  snapshots_created: number;
  diffs_generated: number;
  insights_generated: number;
  message: string;
}

export interface HealthStatus {
  status: string;
  mode: string;
  version: string;
}
