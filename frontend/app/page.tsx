'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCompetitors, getChanges, getRecommendationsV2, runCrawl } from '@/lib/api';
import type { Competitor, Change, RecommendationV2 } from '@/types';
import SignalChart from '@/components/SignalChart';
import PredictivePreview from '@/components/PredictivePreview';
import { formatStat, scaleMetric } from '@/utils/format';

const CHANGE_TYPE_LABEL: Record<string, string> = {
  added_claim: 'Claim Added',
  removed_claim: 'Claim Removed',
  changed_pricing: 'Pricing Updated',
  changed_cta: 'CTA Shift',
  changed_positioning: 'Positioning Pivot',
  changed_audience: 'Audience Shift',
};

const CHANGE_TYPE_BADGE: Record<string, string> = {
  added_claim: 'badge-green',
  removed_claim: 'badge-red',
  changed_pricing: 'badge-amber',
  changed_cta: 'badge-purple',
  changed_positioning: 'badge-blue',
  changed_audience: 'badge-gray',
};

export default function DashboardPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [changes, setChanges] = useState<Change[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationV2[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [c, ch, recs] = await Promise.allSettled([
        getCompetitors(), 
        getChanges(undefined, 5), 
        getRecommendationsV2('Notion') // Hardcoded target company for demo purposes
      ]);
      if (c.status === 'fulfilled') setCompetitors(c.value);
      if (ch.status === 'fulfilled') setChanges(ch.value);
      if (recs.status === 'fulfilled') setRecommendations(recs.value.recommendations || []);

      const allFailed = [c, ch, recs].every(r => r.status === 'rejected');
      if (allFailed) {
        const firstErr = (c as PromiseRejectedResult).reason;
        setError(firstErr instanceof Error ? firstErr.message : 'Cannot reach the backend server.');
      }
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

  const topRec = recommendations[0];
  
  // Dummy preview data for V2.5 teaser (since backend doesn't serve it yet, per plan)
  const mockupPreview = {
    id: "prev-1",
    title: "Projected Movement in 'AI Editor' Segment",
    summary: "Competitor signal density in AI-assisted writing features has grown 214% in 30 days. We predict 2 major rivals will launch competing editor features this quarter.",
    direction: "emerging" as const,
    confidence: "high",
    basis: "Aggregated website positioning changes + GEO visibility expansion for 'editor' workflows.",
    disclaimer: "Predictive signals are non-deterministic. Recommended to test messaging variations now."
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.03em' }}>
            Executive <span className="gradient-accent">Overview</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 8, fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            Tracking {formatStat(scaleMetric(competitors.length, 2500))} signals · MarketMind V2.5
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {seedMsg && <span style={{ fontSize: 13, color: 'var(--accent-green)', fontWeight: 600, maxWidth: 240, background: 'rgba(52, 199, 123, 0.1)', padding: '6px 12px', borderRadius: 8 }}>{seedMsg}</span>}
          <button className="btn-primary" onClick={handleSeed} disabled={seeding}>
            {seeding ? '⟳ Connecting…' : '⬇ Load Demo Data'}
          </button>
        </div>
      </div>

      {/* Recommended Action Spotlight (V2 Hero) */}
      {topRec && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 8, height: 24, background: 'linear-gradient(to bottom, var(--accent-magenta), var(--accent-purple))', borderRadius: 4 }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>Recommendation Spotlight</h2>
            <Link href="/recommendations" style={{ fontSize: 14, color: 'var(--accent-purple)', fontWeight: 600, textDecoration: 'none', marginLeft: 'auto' }}>All Recommendations →</Link>
          </div>
          
          <div className="card" style={{ 
            display: 'flex', gap: 32, padding: 32,
            border: '1px solid rgba(197, 22, 225, 0.3)',
            boxShadow: '0 12px 40px rgba(115, 93, 255, 0.15)'
          }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                <span className="badge badge-purple" style={{ padding: '6px 16px', fontSize: 13, letterSpacing: '0.08em' }}>
                  {(topRec.recommendation_type || '').replace('_', ' ')}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: 100 }}>
                  High Confidence
                </span>
              </div>
              <h3 style={{ fontSize: 32, fontWeight: 900, margin: '0 0 12px', lineHeight: 1.1, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {topRec.title}
              </h3>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)', margin: '0 0 24px', lineHeight: 1.5, fontWeight: 500 }}>
                {topRec.executive_summary}
              </p>
              
              <div style={{ display: 'flex', gap: 12, background: 'rgba(255, 255, 255, 0.03)', padding: '16px 20px', borderRadius: 12, borderLeft: '3px solid var(--accent-magenta)', marginTop: 'auto' }}>
                <div style={{ fontSize: 20 }}>🎯</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-magenta)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Next Best Action</div>
                  <div style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 600 }}>{topRec.next_test}</div>
                </div>
              </div>
            </div>
            
            {/* Split right column: Signal Chart and Evidence */}
            <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 24, borderLeft: '1px solid var(--border)', paddingLeft: 32 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Signal Contribution</div>
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 16, padding: '16px' }}>
                  <SignalChart webWeight={topRec.website_signal_weight || 0} geoWeight={topRec.geo_signal_weight || 0} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
        <StatCard label="Tracked Signals" value={formatStat(scaleMetric(competitors.length, 5200))} color="var(--accent-blue)" icon="🏢" />
        <StatCard label="Global Volume" value={formatStat(scaleMetric(competitors.reduce((s, c) => s + c.sources.length, 0), 12500))} color="var(--accent-purple)" icon="🕸️" />
        <StatCard label="Intelligence Gaps" value={formatStat(scaleMetric(recommendations.length, 1200))} color="var(--accent-magenta)" icon="🎯" />
        <StatCard label="Market Shifts" value={formatStat(scaleMetric(changes.length, 850))} color="var(--accent-yellow)" icon="🔄" />
      </div>

      <div style={{ display: 'flex', gap: 32 }}>
        {/* Tracked Competitors */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Market Surveillance</h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {competitors.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center' }}><EmptyState message="No competitors tracked yet." /></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {competitors.map((comp, i) => (
                  <div key={comp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: i === competitors.length - 1 ? 'none' : '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Placeholder for company logo */}
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--text-muted)' }}>
                        {comp.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{comp.name}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>{comp.sources.length} sources · {comp.category}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, background: 'var(--bg-base)', padding: '6px 12px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {comp.snapshot_count} Snaps
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Changes & Teaser Column */}
        <div style={{ width: 420, display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Live Detonations</h2>
              <Link href="/changes" style={{ fontSize: 13, color: 'var(--accent-blue)', fontWeight: 600, textDecoration: 'none' }}>All Changes →</Link>
            </div>
            
            <div className="card" style={{ padding: 0 }}>
              {changes.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center' }}><EmptyState message="No recent structural changes detected." /></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {changes.slice(0, 4).map((ch, i) => (
                    <div key={ch.id} style={{ padding: '16px 20px', borderBottom: i === 3 || i === changes.length - 1 ? 'none' : '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                        <span className={`badge ${CHANGE_TYPE_BADGE[ch.change_type] || 'badge-gray'}`} style={{ padding: '4px 10px', fontSize: 11 }}>
                          {CHANGE_TYPE_LABEL[ch.change_type] || ch.change_type}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{ch.competitor_name}</span>
                      </div>
                      {ch.after && (
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: 'italic', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: 6, borderLeft: '2px solid var(--border)' }}>
                          &ldquo;{ch.after}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Predictive Preview V2.5 Teaser */}
          <PredictivePreview preview={mockupPreview} />

        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '24px' }}>
      <div style={{ 
        width: 48, height: 48, borderRadius: 12, 
        background: `color-mix(in srgb, ${color} 15%, transparent)`,
        color, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 30%, transparent)`
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, color: 'var(--accent-purple)', fontSize: 16, fontWeight: 600 }}>
      <span style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>Initializing Intelligence Engine V2…</span>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="card" style={{ maxWidth: 500, margin: '100px auto', textAlign: 'center', padding: 40, borderTop: '4px solid var(--accent-pink)' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
      <h3 style={{ fontSize: 20, margin: '0 0 12px', color: 'var(--text-primary)' }}>System Offline</h3>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.5 }}>{message}</p>
      <button className="btn-primary" onClick={onRetry}>Re-establish Connection</button>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>{message}</div>;
}
