'use client';

import { useEffect, useState } from 'react';
import { getGeoSignals } from '@/lib/api';
import type { GeoSignal, GeoSummary } from '@/types';

const STRENGTH_COLORS: Record<string, string> = {
  strong: 'var(--accent-green)',
  moderate: 'var(--accent-purple)',
  weak: 'var(--accent-amber)',
};

const CATEGORY_LABELS: Record<string, string> = {
  product_comparison: 'Product Comparison',
  tool_recommendation: 'Tool Recommendation',
  use_case: 'Use Case',
  workflow: 'Workflow',
  general: 'General',
};

export default function GeoDashboardPage() {
  const [signals, setSignals] = useState<GeoSignal[]>([]);
  const [summary, setSummary] = useState<GeoSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGeoSignals()
      .then((res) => {
        setSignals(res.signals || []);
        setSummary(res.summary || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, color: 'var(--accent-purple)', fontSize: 16, fontWeight: 600 }}>
        <span style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>Synthesizing GEO Intelligence…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ maxWidth: 500, margin: '100px auto', padding: 40, textAlign: 'center', borderTop: '4px solid var(--accent-pink)' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>System Offline</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
      </div>
    );
  }

  if (!signals.length) {
    return (
      <div className="card" style={{ padding: 64, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🤖</div>
        <h3 style={{ fontSize: 20, marginBottom: 8, color: 'var(--text-primary)' }}>No GEO Signals Available</h3>
        <p style={{ color: 'var(--text-muted)' }}>
          LLM visibility metrics have not been seeded or crawled yet. 
          Use the <strong>Load Demo Data</strong> button on the dashboard to populate the intelligence engine.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {/* Page Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <h1 style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-0.03em', margin: 0, color: 'var(--text-primary)' }}>
            LLM Visibility <span className="gradient-accent">Signals</span>
          </h1>
          <span style={{ 
            fontSize: 11, padding: '4px 10px', borderRadius: 4, 
            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-magenta))', color: '#fff', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.04em'
          }}>
            V2 Engine Active
          </span>
        </div>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
          Validating competitive gaps against AI engines
        </p>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 24 }}>
          <div className="card" style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-blue)', lineHeight: 1.1 }}>
              {summary.total_prompts}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Tracked Prompts
            </div>
          </div>
          <div className="card" style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-purple)', lineHeight: 1.1 }}>
              {summary.total_providers}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              LLM Providers
            </div>
          </div>
          <div className="card" style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-green)', lineHeight: 1.1 }}>
              {Math.round(summary.coverage_ratio * 100)}%
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Target Coverage
            </div>
          </div>
          <div className="card" style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-amber)', lineHeight: 1.1 }}>
              {summary.prompt_categories.length}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Prompt Categories
            </div>
          </div>
        </div>
      )}

      {/* Company Frequency Rankings */}
      {summary && summary.company_frequencies.length > 0 && (
        <div className="card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, margin: '0 0 24px', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Company Visibility Rankings
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {summary.company_frequencies.map((cf, i) => {
              const maxFreq = summary.company_frequencies[0]?.total_frequency || 1;
              const pct = Math.round((cf.total_frequency / maxFreq) * 100);
              return (
                <div key={cf.company} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, minWidth: 28, color: i < 3 ? 'var(--accent-magenta)' : 'var(--text-muted)' }}>
                    #{i + 1}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 600, minWidth: 140, color: 'var(--text-primary)' }}>{cf.company}</span>
                  <div style={{ flex: 1, height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: i === 0 ? 'linear-gradient(90deg, var(--accent-purple), var(--accent-magenta))' : 'var(--accent-blue)', borderRadius: 5, transition: 'width 1s ease-out' }} />
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', minWidth: 100, textAlign: 'right', fontWeight: 500 }}>
                    {cf.prompt_count} prompts
                    {cf.best_rank ? ` · Best #${cf.best_rank}` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Signal Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 32 }}>
        {signals.map((signal) => (
          <div key={signal.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ 
                    color: 'var(--accent-blue)', fontSize: 12, fontWeight: 700, 
                    background: 'rgba(79, 125, 243, 0.1)', padding: '4px 10px', borderRadius: 6,
                    border: '1px solid rgba(79, 125, 243, 0.2)'
                  }}>
                    {signal.provider}
                  </span>
                  {signal.prompt_category && (
                    <span style={{ 
                      fontSize: 11, padding: '4px 10px', borderRadius: 6, 
                      background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
                      fontWeight: 600
                    }}>
                      {CATEGORY_LABELS[signal.prompt_category] || signal.prompt_category}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {signal.signal_strength && (
                    <span style={{ 
                      fontSize: 11, padding: '4px 10px', borderRadius: 6,
                      background: STRENGTH_COLORS[signal.signal_strength] || 'var(--text-muted)',
                      color: '#fff', fontWeight: 700, textTransform: 'uppercase'
                    }}>
                      {signal.signal_strength}
                    </span>
                  )}
                  {signal.rank && (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                      Rank #{signal.rank}
                    </span>
                  )}
                </div>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4, margin: 0, color: 'var(--text-primary)' }}>
                &quot;{signal.prompt}&quot;
              </h3>
            </div>

            {/* Content */}
            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 12 }}>
                  Surfaced Companies
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(signal.surfaced_companies || []).map(comp => (
                    <span key={comp} style={{
                      fontSize: 13, padding: '4px 12px', borderRadius: 16,
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                      fontWeight: 600, color: 'var(--text-primary)'
                    }}>
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Appearance Frequency:</div>
                <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${signal.appearance_frequency * 100}%`, 
                    height: '100%', 
                    background: STRENGTH_COLORS[signal.signal_strength || 'moderate'] || 'var(--accent-green)',
                    borderRadius: 4
                  }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {Math.round(signal.appearance_frequency * 100)}%
                </div>
              </div>

              {/* Rationale & Snippet */}
              {signal.response_snippet && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 8 }}>
                    LLM Snippet
                  </div>
                  <div style={{ 
                    fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic', 
                    padding: '16px', background: 'rgba(0,0,0,0.2)', 
                    borderLeft: '3px solid var(--accent-blue)', borderRadius: '0 8px 8px 0', lineHeight: 1.6
                  }}>
                    &ldquo;{signal.response_snippet}&rdquo;
                  </div>
                </div>
              )}

              {signal.extracted_reasoning && (
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 8 }}>
                    Engine Analysis
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, fontWeight: 500 }}>
                    {signal.extracted_reasoning}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
