/**
 * Typed API client for the Market Intelligence Engine backend.
 * All methods use documented fields from api-contracts.md only.
 */
import type {
  Competitor, Change, InsightListItem, InsightDetail,
  ComparisonResponse, WhitespaceResponse, CrawlResult, HealthStatus, Snapshot,
} from '@/types';

const BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const res = await fetch(`${BASE}${cleanPath}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getHealth(): Promise<HealthStatus> {
  return fetchJSON<HealthStatus>('/health');
}

export async function getCompetitors(): Promise<Competitor[]> {
  return fetchJSON<Competitor[]>('/api/v1/competitors');
}

export async function getChanges(competitorId?: string, limit = 20): Promise<Change[]> {
  const q = new URLSearchParams({ limit: String(limit) });
  if (competitorId) q.set('competitor_id', competitorId);
  return fetchJSON<Change[]>(`/api/v1/changes?${q}`);
}

export async function getSnapshots(competitorId?: string, limit = 20): Promise<Snapshot[]> {
  const q = new URLSearchParams({ limit: String(limit) });
  if (competitorId) q.set('competitor_id', competitorId);
  return fetchJSON<Snapshot[]>(`/api/v1/snapshots?${q}`);
}

export async function getInsights(limit = 20, insightType?: string): Promise<InsightListItem[]> {
  const q = new URLSearchParams({ limit: String(limit) });
  if (insightType) q.set('insight_type', insightType);
  return fetchJSON<InsightListItem[]>(`/api/v1/insights?${q}`);
}

export async function getInsightDetail(id: string): Promise<InsightDetail> {
  return fetchJSON<InsightDetail>(`/api/v1/insights/${id}`);
}

export async function getComparison(): Promise<ComparisonResponse> {
  return fetchJSON<ComparisonResponse>('/api/v1/comparison');
}

export async function getWhitespace(): Promise<WhitespaceResponse> {
  return fetchJSON<WhitespaceResponse>('/api/v1/whitespace');
}

export async function runCrawl(mode: 'demo' | 'live' = 'demo'): Promise<CrawlResult> {
  return fetchJSON<CrawlResult>('/api/v1/crawl/run', {
    method: 'POST',
    body: JSON.stringify({ mode }),
  });
}
