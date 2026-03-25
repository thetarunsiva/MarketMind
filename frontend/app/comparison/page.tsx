'use client';
import { useState, useEffect } from 'react';
import { getComparison } from '@/lib/api';
import type { ComparisonResponse, CompetitorComparison } from '@/types';

const DIMENSION_LABELS: Record<string, { label: string; left: string; right: string }> = {
  premium_vs_cost: { label: 'Pricing Position', left: 'Cost Leader', right: 'Premium' },
  feature_vs_outcome: { label: 'Messaging Style', left: 'Outcome-Driven', right: 'Feature-Driven' },
  enterprise_vs_smb: { label: 'Target Segment', left: 'SMB / Team', right: 'Enterprise' },
  simplicity_vs_power: { label: 'UX Priority', left: 'Simplicity', right: 'Power' },
  collaboration_vs_individual: { label: 'Work Model', left: 'Individual', right: 'Collaboration' },
  speed_vs_control: { label: 'Execution', left: 'Control', right: 'Speed' },
};

const COLORS = ['var(--accent-blue)', 'var(--accent-green)', 'var(--accent-amber)', 'var(--accent-purple)', 'var(--accent-red)'];

function DimensionRow({ dim, competitors }: { dim: string; competitors: CompetitorComparison[] }) {
  const meta = DIMENSION_LABELS[dim] || { label: dim, left: 'Low', right: 'High' };
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{meta.label}</span>
        <div style={{ display: 'flex', gap: 16 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>← {meta.left}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{meta.right} →</span>
        </div>
      </div>
      <div style={{ position: 'relative', height: 32, background: 'var(--border)', borderRadius: 4 }}>
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.15)' }} />
        {competitors.map((comp, i) => {
          const score = comp.scores[dim] ?? 0;
          const leftPct = ((score + 1) / 2) * 100;
          return (
            <div key={comp.id} title={`${comp.name}: ${score > 0 ? '+' : ''}${score.toFixed(2)}`} style={{
              position: 'absolute', left: `${leftPct}%`, top: '50%', transform: 'translate(-50%, -50%)',
              width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length],
              border: '2px solid var(--bg-card)', zIndex: 2,
            }} />
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 6, flexWrap: 'wrap' }}>
        {competitors.map((comp, i) => (
          <div key={comp.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{comp.name} ({comp.scores[dim] > 0 ? '+' : ''}{(comp.scores[dim] ?? 0).toFixed(2)})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ComparisonPage() {
  const [data, setData] = useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getComparison().then(setData).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: 'var(--text-muted)', fontSize: 15, paddingTop: 100, textAlign: 'center' }}>Loading comparison map…</div>;
  if (error) return <div style={{ color: 'var(--accent-red)', fontSize: 15, padding: 32, textAlign: 'center' }}>⚠ {error}</div>;
  if (!data) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Competitor Comparison</h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.6 }}>Positioning scores on fixed strategic dimensions. Scale: -1 (left pole) to +1 (right pole).</p>
      </div>
      <div className="card" style={{ padding: '24px 32px' }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 28px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Positioning Map</h2>
        {data.dimensions.map(dim => <DimensionRow key={dim} dim={dim} competitors={data.competitors} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {data.competitors.map((comp, i) => (
          <div key={comp.id} className="card" style={{ borderTop: `4px solid ${COLORS[i % COLORS.length]}`, padding: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 12px', color: 'var(--text-primary)' }}>{comp.name}</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {comp.positioning_tags.map(tag => <span key={tag} className="badge badge-gray">{tag}</span>)}
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>TOP CLAIMS</div>
              {comp.top_claims.map((claim, ci) => (
                <div key={ci} style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8, borderLeft: '3px solid var(--border)', paddingLeft: 12, lineHeight: 1.5 }}>&ldquo;{claim}&rdquo;</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
