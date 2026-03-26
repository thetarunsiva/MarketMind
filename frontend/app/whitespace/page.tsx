'use client';
import { useState, useEffect } from 'react';
import { getWhitespace } from '@/lib/api';
import type { WhitespaceResponse, WhitespaceRecommendation } from '@/types';

const CONFIDENCE_BADGE: Record<string, string> = { high: 'badge-green', medium: 'badge-amber', low: 'badge-red' };

function RecommendationCard({ reco, index }: { reco: WhitespaceRecommendation; index: number }) {
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', borderTop: '4px solid var(--accent-green)' }}>
      <div style={{ padding: 32 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(52, 199, 123, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'var(--accent-green)' }}>{index + 1}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>{reco.title}</h2>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{reco.dimension.replace(/_/g, ' ')}</span>
          </div>
          <span className={`badge ${CONFIDENCE_BADGE[reco.confidence] || 'badge-gray'}`} style={{ fontSize: 13, padding: '4px 12px' }}>{reco.confidence.toUpperCase()} CONFIDENCE</span>
        </div>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 32px' }}>{reco.summary}</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 24 }}>
          <div style={{ padding: '20px 24px', background: 'rgba(168,85,247,0.05)', borderRadius: 12, borderLeft: '3px solid var(--accent-purple)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-purple)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Why it matters</div>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{reco.why_it_matters}</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '20px 24px', background: 'rgba(79,125,243,0.05)', borderRadius: 12, borderLeft: '3px solid var(--accent-blue)', flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-blue)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Why this is whitespace</div>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                {reco.why_its_whitespace?.split('GEO Signal Match:')[0]?.trim() || ''}
              </p>
            </div>

            {reco.why_its_whitespace?.includes('GEO Signal Match:') && (
              <div style={{ padding: '20px 24px', background: 'rgba(168,85,247,0.05)', borderRadius: 12, borderLeft: '3px solid var(--accent-purple)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 18 }}>🤖</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>LLM Signal Validation</span>
                </div>
                <p style={{ fontSize: 15, color: 'var(--text-primary)', margin: 0, fontWeight: 500, lineHeight: 1.6 }}>
                  {reco.why_its_whitespace.split('GEO Signal Match:')[1]?.trim() || ''}
                </p>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 24, padding: '20px 24px', background: 'rgba(52,199,123,0.05)', borderRadius: 12, borderLeft: '3px solid var(--accent-green)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-green)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>What to test next</div>
          <p style={{ fontSize: 16, color: 'var(--text-primary)', margin: 0, lineHeight: 1.6, fontWeight: 600 }}>{reco.recommended_action}</p>
        </div>

        <button onClick={() => setEvidenceOpen(!evidenceOpen)} className="btn-secondary" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'background 0.2s', width: '100%', justifyContent: 'center' }}>
          {evidenceOpen ? '▾ Hide Source Evidence' : '▸ View Source Evidence'} ({reco.evidence.length} extracted claims)
        </button>

        {evidenceOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
            {reco.evidence.map((ev, i) => (
              <div key={i} style={{ padding: '20px 24px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{ev.competitor_name}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>· {ev.field.replace(/_/g, ' ')}</span>
                </div>
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: '0 0 16px', fontStyle: 'italic', lineHeight: 1.6, background: 'var(--bg-main)', padding: '12px 16px', borderRadius: 6, borderLeft: '2px solid var(--border)' }}>&ldquo;{ev.snippet}&rdquo;</p>
                {ev.source_url && <a href={ev.source_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>{ev.source_url}</a>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WhitespacePage() {
  const [data, setData] = useState<WhitespaceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWhitespace().then(setData).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, color: 'var(--accent-purple)', fontSize: 16, fontWeight: 600 }}>
      <span style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>Analyzing Market Whitespace…</span>
    </div>
  );
  if (error) return <div className="card" style={{ maxWidth: 500, margin: '100px auto', padding: 40, textAlign: 'center', borderTop: '4px solid var(--accent-pink)' }}><h3 style={{ color: 'var(--text-primary)' }}>System Offline</h3><p style={{ color: 'var(--text-secondary)' }}>{error}</p></div>;
  if (!data) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, maxWidth: 1000, margin: '0 auto' }}>
      <div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 24 }}>🎯</span>
          <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-magenta))', color: '#fff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>V2 Engine Active</span>
          <span className="badge badge-gray" style={{ fontSize: 11, padding: '4px 10px', textTransform: 'uppercase' }}>{data.mode} mode</span>
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 900, margin: '0 0 12px', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>MarketMind <span className="gradient-accent">Whitespace Engine</span></h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
          Real claims mapped against LLM validations
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 16, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Generated: {data.generated_at.split('T')[0]}</p>
      </div>
      
      {data.recommendations.length === 0 ? (
        <div className="card" style={{ padding: 64, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📈</div>
          <h3 style={{ fontSize: 20, margin: '0 0 8px', color: 'var(--text-primary)' }}>No Whitespace Detected</h3>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>Load demo data first to populate the engine metrics.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {data.recommendations.map((reco, i) => <RecommendationCard key={reco.id} reco={reco} index={i} />)}
        </div>
      )}
    </div>
  );
}
