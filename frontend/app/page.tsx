'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCompetitors, getChanges, getInsights, getWhitespace, runCrawl } from '@/lib/api';
import type { Competitor, Change, InsightListItem, WhitespaceResponse } from '@/types';

// Badge color per insight type
const INSIGHT_TYPE_BADGE: Record<string, string> = {
  messaging_shift: 'badge-blue',
  pricing_change: 'badge-amber',
  repeated_angle: 'badge-purple',
  overused_angle: 'badge-red',
  whitespace: 'badge-green',
};

const CHANGE_TYPE_LABEL: Record<string, string> = {
  added_claim: 'Added',
  removed_claim: 'Removed',
  changed_pricing: 'Pricing',
  changed_cta: 'CTA',
  changed_positioning: 'Positioning',
  changed_audience: 'Audience',
};

const CHANGE_TYPE_BADGE: Record<string, string> = {
  added_claim: 'badge-green',
  removed_claim: 'badge-red',
  changed_pricing: 'badge-amber',
  changed_cta: 'badge-purple',
  changed_positioning: 'badge-blue',
  changed_audience: 'badge-gray',
};

function PriorityBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = score > 0.75 ? 'var(--accent-green)' : score > 0.5 ? 'var(--accent-blue)' : 'var(--accent-amber)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="score-bar" style={{ flex: 1 }}>
        <div className="score-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 30 }}>{pct}%</span>
    </div>
  );
}

export default function DashboardPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [changes, setChanges] = useState<Change[]>([]);
  const [insights, setInsights] = useState<InsightListItem[]>([]);
  const [whitespace, setWhitespace] = useState<WhitespaceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [c, ch, ins, ws] = await Promise.all([
        getCompetitors(), 
        getChanges(undefined, 5), 
        getInsights(5),
        getWhitespace()
      ]);
      setCompetitors(c);
      setChanges(ch);
      setInsights(ins);
      setWhitespace(ws);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  async function handleSeed() {
    setSeeding(true);
    setSeedMsg(null);
    try {
      const result = await runCrawl('demo');
      setSeedMsg(result.message);
      await loadAll();
    } catch (e: unknown) {
      setSeedMsg(e instanceof Error ? e.message : 'Seed failed');
    } finally {
      setSeeding(false);
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={loadAll} />;

  const topWhitespace = whitespace?.recommendations?.[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Market Intelligence
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
            Tracking {competitors.length} competitors · B2B Productivity SaaS
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {seedMsg && <span style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 240 }}>{seedMsg}</span>}
          <button className="btn-primary" onClick={handleSeed} disabled={seeding}>
            {seeding ? '⟳ Loading…' : '⬇ Load Demo Data'}
          </button>
        </div>
      </div>

      {/* Top Whitespace Highlight */}
      {topWhitespace && (
        <div className="card" style={{ borderLeft: '4px solid var(--accent-green)', background: 'rgba(52,199,123,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>🎯</span>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-green)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Whitespace Opportunity Detected
              </h2>
            </div>
            <Link href="/whitespace" style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 600, textDecoration: 'none' }}>View all recommendations →</Link>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>{topWhitespace.title}</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.6 }}>
            {topWhitespace.summary}
          </p>
          <div style={{ padding: '12px 16px', background: 'rgba(52,199,123,0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-green)', marginBottom: 4, textTransform: 'uppercase' }}>Recommended Action</div>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>{topWhitespace.recommended_action}</p>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <StatCard label="Competitors" value={competitors.length} color="var(--accent-blue)" />
        <StatCard label="Total Snapshots" value={competitors.reduce((s, c) => s + c.snapshot_count, 0)} color="var(--accent-green)" />
        <StatCard label="Recent Changes" value={changes.length} color="var(--accent-amber)" />
        <StatCard label="Active Insights" value={insights.length} color="var(--accent-purple)" />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        {/* Competitors */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Tracked Competitors
          </h2>
          {competitors.length === 0 ? (
            <EmptyState message="No competitors yet. Load demo data to get started." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {competitors.map((comp, i) => (
                <div key={comp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i === competitors.length - 1 ? 'none' : '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{comp.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{comp.sources.length} sources · {comp.snapshot_count} snapshots</div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {comp.last_updated ? new Date(comp.last_updated).toLocaleDateString() : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Changes */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Recent Changes
            </h2>
            <Link href="/changes" style={{ fontSize: 13, fontWeight: 500, color: 'var(--accent-blue)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {changes.length === 0 ? (
            <EmptyState message="No changes detected yet." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {changes.slice(0, 5).map((ch, i) => (
                <div key={ch.id} style={{ padding: '12px 0', borderBottom: i === 4 || i === changes.length - 1 ? 'none' : '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                    <span className={`badge ${CHANGE_TYPE_BADGE[ch.change_type] || 'badge-gray'}`}>
                      {CHANGE_TYPE_LABEL[ch.change_type] || ch.change_type}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{ch.competitor_name}</span>
                  </div>
                  {ch.after && (
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      &ldquo;{ch.after}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Insights */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Top Insights
          </h2>
          <Link href="/insights" style={{ fontSize: 13, fontWeight: 500, color: 'var(--accent-blue)', textDecoration: 'none' }}>View all →</Link>
        </div>
        {insights.length === 0 ? (
          <EmptyState message="No insights yet. Load demo data." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {insights.map((ins, i) => (
              <div key={ins.id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, padding: '20px 0', borderBottom: i === insights.length - 1 ? 'none' : '1px solid var(--border)' }}>
                <div style={{ flex: '1 1 400px', minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                    <span className={`badge ${INSIGHT_TYPE_BADGE[ins.insight_type] || 'badge-gray'}`}>{ins.insight_type.replace('_', ' ')}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>{ins.competitor_names.join(', ')}</span>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{ins.title}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
                    {ins.summary}
                  </div>
                  <div style={{ padding: '12px 16px', background: 'rgba(79,125,243,0.05)', borderRadius: 8, borderLeft: '3px solid var(--accent-blue)', marginBottom: 16 }}>
                     <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-blue)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommendation</div>
                     <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5 }}>{ins.recommendation}</div>
                  </div>
                  <Link href={`/insights/${ins.id}`}>
                    <button className="btn-secondary" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '6px', fontSize: 13, fontWeight: 600, padding: '8px 16px', cursor: 'pointer', transition: 'background 0.2s' }}>
                      View Evidence ({ins.evidence_count}) →
                    </button>
                  </Link>
                </div>
                <div style={{ width: 140, flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Priority Score</div>
                  <PriorityBar score={ins.priority_score} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: 'var(--text-muted)', fontSize: 14 }}>
      Loading dashboard…
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 300, gap: 16 }}>
      <div style={{ fontSize: 14, color: 'var(--accent-red)' }}>⚠ Backend unavailable</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 400, textAlign: 'center' }}>{message}</div>
      <button className="btn-primary" onClick={onRetry}>Retry</button>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '16px 0' }}>{message}</div>;
}
