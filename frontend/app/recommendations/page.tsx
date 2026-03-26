'use client';
import { useState, useEffect } from 'react';
import { getRecommendationsV2 } from '@/lib/api';
import SignalChart from '@/components/SignalChart';
import PredictivePreview from '@/components/PredictivePreview';
import type { RecommendationV2 } from '@/types';

const CONF_COLOR: Record<string, string> = { high: 'var(--accent-green)', medium: 'var(--accent-purple)', low: 'var(--accent-yellow)' };
const TYPE_LABEL: Record<string, string> = {
  messaging: 'Messaging', pricing: 'Pricing', segment: 'Segment',
  geo: 'GEO Visibility', competitive_response: 'Competitive Response',
};

export default function RecommendationsPage() {
  const [recs, setRecs] = useState<RecommendationV2[]>([]);
  const [target, setTarget] = useState('');
  const [mode, setMode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getRecommendationsV2()
      .then(res => { setRecs(res.recommendations || []); setTarget(res.target_company); setMode(res.mode); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, color: 'var(--accent-purple)', fontSize: 16, fontWeight: 600 }}>
      <span style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>Synthesizing Strategic Intelligence…</span>
    </div>
  );
  if (error) return <div className="card" style={{ margin: '100px auto', maxWidth: 500, textAlign: 'center' }}><h3 style={{ color: 'var(--accent-pink)' }}>System Offline</h3><p style={{ color: 'var(--text-secondary)' }}>{error}</p></div>;

  const mockupPreview = {
    id: "prev-1",
    title: "Projected Movement in 'AI Editor' Segment",
    summary: "Competitor signal density in AI-assisted writing features has grown 214% in 30 days. We predict 2 major rivals will launch competing editor features this quarter.",
    direction: "emerging" as const,
    confidence: "high",
    basis: "Aggregated website positioning changes + GEO visibility expansion for 'editor' workflows.",
    disclaimer: "Predictive signals are non-deterministic."
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <h1 style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-0.03em', margin: 0, color: 'var(--text-primary)' }}>
            Strategic <span className="gradient-accent">Recommendations</span>
          </h1>
          <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-magenta))', color: '#fff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            V2 Engine Active
          </span>
        </div>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
          {recs.length} actionable intelligence gaps for {target}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {recs.length === 0 ? (
            <div className="card" style={{ padding: 64, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🗃️</div>
              <h3 style={{ fontSize: 20, margin: '0 0 8px', color: 'var(--text-primary)' }}>No Recommendations Generated</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, margin: 0 }}>Load demo data from the dashboard to populate the engine.</p>
            </div>
          ) : (
            recs.map((rec, idx) => (
              <div key={rec.id} className="card" style={{ padding: 0, overflow: 'hidden', border: idx === 0 ? '1px solid rgba(197, 22, 225, 0.4)' : undefined, boxShadow: idx === 0 ? '0 12px 40px rgba(115, 93, 255, 0.15)' : undefined }}>
                {/* Spotlight header for first rec */}
                {idx === 0 && (
                  <div style={{ padding: '12px 32px', background: 'linear-gradient(90deg, rgba(197, 22, 225, 0.15), transparent)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-magenta)', boxShadow: '0 0 10px var(--accent-magenta)' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Highest Confidence Action</span>
                  </div>
                )}

                <div style={{ padding: 32 }}>
                  {/* Title Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 40 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                        <span className="badge badge-purple" style={{ padding: '6px 14px', fontSize: 12 }}>
                          {TYPE_LABEL[rec.recommendation_type] || rec.recommendation_type}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: CONF_COLOR[rec.confidence] || 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: 999 }}>
                          {rec.confidence.toUpperCase()} CONFIDENCE
                        </span>
                      </div>
                      <h2 style={{ fontSize: 32, fontWeight: 900, margin: '0 0 12px', color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                        {rec.title}
                      </h2>
                    </div>
                    <div style={{ width: 140, flexShrink: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, textAlign: 'center' }}>Signal Distribution</div>
                      <SignalChart webWeight={rec.website_signal_weight || 0} geoWeight={rec.geo_signal_weight || 0} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 32 }}>
                    <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 24 }}>
                      {/* Executive Summary */}
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-purple)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Executive Summary</div>
                        <p style={{ fontSize: 16, color: 'var(--text-primary)', margin: 0, lineHeight: 1.6 }}>
                          {rec.executive_summary}
                        </p>
                      </div>

                      {/* Why It Matters & Action */}
                      <div style={{ display: 'flex', gap: 24 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Strategic Context</div>
                          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                            {rec.why_it_matters}
                          </p>
                        </div>
                        <div style={{ flex: 1, padding: '20px', background: 'rgba(255, 213, 34, 0.05)', borderRadius: 12, borderLeft: '3px solid var(--accent-yellow)' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-yellow)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Suggested Next Test</div>
                          <p style={{ fontSize: 15, color: 'var(--text-primary)', margin: 0, lineHeight: 1.5, fontWeight: 600 }}>
                            {rec.next_test}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ flex: 1, borderLeft: '1px solid var(--border)', paddingLeft: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {/* Supporting Competitors */}
                      {(rec.supporting_competitors || []).length > 0 && (
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Supporting Evidence From</div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {rec.supporting_competitors.map(c => (
                              <span key={c} style={{ fontSize: 13, padding: '4px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontWeight: 600 }}>{c}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Evidence Toggle */}
                      <div style={{ marginTop: 'auto' }}>
                        <button
                          onClick={() => setExpanded(expanded === rec.id ? null : rec.id)}
                          className="btn-primary"
                          style={{ width: '100%', background: expanded === rec.id ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-magenta) 100%)', boxShadow: expanded === rec.id ? 'none' : undefined }}
                        >
                          {expanded === rec.id ? 'Hide Source Evidence' : `View ${rec.evidence_items?.length || 0} Evidence Points`}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Evidence Drawer */}
                  {expanded === rec.id && (rec.evidence_items || []).length > 0 && (
                    <div style={{ marginTop: 24, padding: 24, background: 'rgba(0,0,0,0.2)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.02)' }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>🔍</span> Extracted Source Signals
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {(rec.evidence_items || []).map((ev, i) => (
                          <div key={i} style={{ padding: '16px 20px', background: 'rgba(47, 32, 84, 0.4)', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', gap: 16 }}>
                            <div style={{ width: 140, flexShrink: 0 }}>
                              <span className={`badge ${ev.source_type === 'geo' ? 'badge-amber' : 'badge-blue'}`} style={{ marginBottom: 8, display: 'inline-block' }}>
                                {ev.source_type === 'geo' ? '🤖 GEO' : '🌐 Website'}
                              </span>
                              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{ev.competitor}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{ev.source_label}</div>
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 8px', lineHeight: 1.6, fontStyle: 'italic', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: 6, borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                                &ldquo;{ev.snippet}&rdquo;
                              </p>
                              {ev.signal_reason && (
                                <p style={{ fontSize: 13, color: 'var(--accent-purple)', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
                                  Engine Note: {ev.signal_reason}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 32 }}>
          <div className="card" style={{ padding: 24, background: 'rgba(255, 213, 34, 0.03)', border: '1px solid rgba(255, 213, 34, 0.15)' }}>
            <h3 style={{ fontSize: 12, fontWeight: 800, margin: '0 0 10px', color: 'var(--accent-yellow)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Engine Feedback
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              MarketMind v2.5 detects subtle shifts in competitor messaging by analyzing weekly delta changes in landing page hero sections and pricing tables.
            </p>
          </div>
          <PredictivePreview preview={mockupPreview} />
        </div>
      </div>
    </div>
  );
}
