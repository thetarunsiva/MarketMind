/**
 * Typed API client for the Market Intelligence Engine backend.
 * All methods use documented fields from api-contracts.md only.
 */
import type {
  Competitor, Change, InsightListItem, InsightDetail,
  ComparisonResponse, WhitespaceResponse, CrawlResult, HealthStatus, Snapshot, GeoResponse,
  RecommendationsResponse,
} from '@/types';

const BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

const FETCH_TIMEOUT_MS = 15_000; // 15s — prevents infinite hangs during demos

async function fetchJSON<T>(path: string, options?: RequestInit, _retry = true): Promise<T> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${BASE}${cleanPath}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      ...options,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });
    clearTimeout(timer);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    return res.json();
  } catch (e: unknown) {
    clearTimeout(timer);
    const err = e as Error;

    // Retry once on network / timeout errors (not on HTTP errors)
    if (_retry && (err.name === 'AbortError' || err.message === 'Failed to fetch' || err.message?.includes('fetch'))) {
      console.warn(`[API] Retrying ${cleanPath} after: ${err.message}`);
      return fetchJSON<T>(path, options, false);
    }

    // Produce human-readable error for UI
    if (err.name === 'AbortError') {
      throw new Error('Backend request timed out. Please check that the backend server is running.');
    }
    if (err.message === 'Failed to fetch') {
      throw new Error('Cannot reach the backend server. Please verify it is running and accessible.');
    }
    throw err;
  }
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

export async function getGeoSignals(limit = 50, target = 'Notion'): Promise<GeoResponse> {
  const q = new URLSearchParams({ limit: String(limit), target });
  return fetchJSON<GeoResponse>(`/api/v1/geo?${q}`);
}

export async function getRecommendationsV2(target = 'Notion'): Promise<RecommendationsResponse> {
  const q = new URLSearchParams({ target });
  return fetchJSON<RecommendationsResponse>(`/api/v1/recommendations?${q}`);
}
