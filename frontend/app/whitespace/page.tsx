'use client';
import { useState, useEffect } from 'react';
import { getWhitespace } from '@/lib/api';
import type { WhitespaceResponse, WhitespaceRecommendation } from '@/types';

const CONFIDENCE_BADGE: Record<string, string> = { high: 'badge-green', medium: 'badge-amber', low: 'badge-red' };

function RecommendationCard({ reco, index }: { reco: WhitespaceRecommendation; index: number }) {
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  return (
    <div className="card" style={{ borderTop: '4px solid var(--accent-blue)', padding: 24 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(79,125,243,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--accent-blue)' }}>{index + 1}</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>{reco.title}</h2>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{reco.dimension.replace(/_/g, ' ')}</span>
        </div>
        <span className={`badge ${CONFIDENCE_BADGE[reco.confidence] || 'badge-gray'}`} style={{ fontSize: 12 }}>{reco.confidence} confidence</span>
      </div>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 24px' }}>{reco.summary}</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 20 }}>
        <div style={{ padding: '16px 20px', background: 'rgba(168,85,247,0.05)', borderRadius: 8, borderLeft: '3px solid var(--accent-purple)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-purple)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Why it matters</div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{reco.why_it_matters}</p>
        </div>
        <div style={{ padding: '16px 20px', background: 'rgba(79,125,243,0.05)', borderRadius: 8, borderLeft: '3px solid var(--accent-blue)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-blue)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Why this is whitespace</div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{reco.why_its_whitespace}</p>
        </div>
      </div>

      <div style={{ marginBottom: 20, padding: '16px 20px', background: 'rgba(52,199,123,0.05)', borderRadius: 8, borderLeft: '3px solid var(--accent-green)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-green)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>What to test next</div>
        <p style={{ fontSize: 15, color: 'var(--text-primary)', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{reco.recommended_action}</p>
      </div>

      <button onClick={() => setEvidenceOpen(!evidenceOpen)} className="btn-secondary" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'background 0.2s' }}>
        {evidenceOpen ? '▾ Hide' : '▸ View'} Source Evidence ({reco.evidence.length} items)
      </button>

      {evidenceOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          {reco.evidence.map((ev, i) => (
            <div key={i} style={{ padding: '16px 20px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{ev.competitor_name}</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>· {ev.field.replace(/_/g, ' ')}</span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px', fontStyle: 'italic', lineHeight: 1.5 }}>&ldquo;{ev.snippet}&rdquo;</p>
              {ev.source_url && <a href={ev.source_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 500 }}>{ev.source_url}</a>}
            </div>
          ))}
        </div>
      )}
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

  if (loading) return <div style={{ color: 'var(--text-muted)', fontSize: 15, paddingTop: 100, textAlign: 'center' }}>Analyzing whitespace footprint…</div>;
  if (error) return <div style={{ color: 'var(--accent-red)', fontSize: 15, padding: 32, textAlign: 'center' }}>⚠ {error}</div>;
  if (!data) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 900, margin: '0 auto' }}>
      <div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 20 }}>🎯</span>
          <span className="badge badge-green" style={{ fontSize: 12, padding: '4px 12px' }}>Traceable Whitespace Engine</span>
          <span className="badge badge-gray" style={{ fontSize: 12, padding: '4px 12px' }}>{data.mode} mode</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 12px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Unclaimed Positioning Lanes</h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          Identified by comparing all tracked competitor positioning scores across fixed dimensions. Each recommendation is derived from real extracted claims — not guesswork.
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12, fontWeight: 500 }}>Generated: {new Date(data.generated_at).toLocaleString()}</p>
      </div>
      {data.recommendations.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: 'center' }}><p style={{ fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>No strong whitespace detected. Load demo data first.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {data.recommendations.map((reco, i) => <RecommendationCard key={reco.id} reco={reco} index={i} />)}
        </div>
      )}
    </div>
  );
}
