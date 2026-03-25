'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getInsightDetail } from '@/lib/api';
import type { InsightDetail, EvidenceItem } from '@/types';

const INSIGHT_TYPE_BADGE: Record<string, string> = {
  messaging_shift: 'badge-blue', pricing_change: 'badge-amber', repeated_angle: 'badge-purple',
  overused_angle: 'badge-red', whitespace: 'badge-green',
};

function EvidenceCard({ ev }: { ev: EvidenceItem }) {
  return (
    <div className="card" style={{ padding: 20, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{ev.competitor_name}</span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>· {ev.field.replace(/_/g, ' ')}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {new Date(ev.captured_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      </div>
      {ev.before_snippet && (
        <div style={{ padding: '12px 16px', background: 'rgba(240,85,85,0.05)', borderRadius: 8, borderLeft: '3px solid var(--accent-red)' }}>
          <div style={{ fontSize: 11, color: 'var(--accent-red)', marginBottom: 6, fontWeight: 700, letterSpacing: '0.05em' }}>BEFORE</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.5 }}>&ldquo;{ev.before_snippet}&rdquo;</div>
        </div>
      )}
      {ev.after_snippet ? (
        <div style={{ padding: '12px 16px', background: 'rgba(52,199,123,0.05)', borderRadius: 8, borderLeft: '3px solid var(--accent-green)' }}>
          <div style={{ fontSize: 11, color: 'var(--accent-green)', marginBottom: 6, fontWeight: 700, letterSpacing: '0.05em' }}>AFTER</div>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.5 }}>&ldquo;{ev.after_snippet}&rdquo;</div>
        </div>
      ) : (
        <div style={{ padding: '12px 16px', background: 'rgba(79,125,243,0.05)', borderRadius: 8, borderLeft: '3px solid var(--accent-blue)' }}>
          <div style={{ fontSize: 11, color: 'var(--accent-blue)', marginBottom: 6, fontWeight: 700, letterSpacing: '0.05em' }}>EVIDENCE SNIPPET</div>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.5 }}>&ldquo;{ev.snippet}&rdquo;</div>
        </div>
      )}
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
        <span style={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 600, marginRight: 8 }}>Source</span>
        <a href={ev.source_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 500 }}>
          {ev.source_url || 'Unknown Source'}
        </a>
        <span style={{ marginLeft: 12, color: 'var(--text-secondary)' }}>({ev.source_type.replace(/_/g, ' ')})</span>
      </div>
    </div>
  );
}

export default function InsightDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [insight, setInsight] = useState<InsightDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getInsightDetail(id).then(setInsight).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ color: 'var(--text-muted)', fontSize: 15, paddingTop: 100, textAlign: 'center' }}>Loading evidence vault…</div>;
  if (error) return <div style={{ color: 'var(--accent-red)', fontSize: 15, padding: 32, textAlign: 'center' }}>⚠ {error}</div>;
  if (!insight) return <div style={{ color: 'var(--text-muted)', fontSize: 15, padding: 32, textAlign: 'center' }}>Insight not found.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 860, margin: '0 auto' }}>
      <Link href="/insights" style={{ fontSize: 14, fontWeight: 500, color: 'var(--accent-blue)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        ← Back to Insights
      </Link>
      <div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
          <span className={`badge ${INSIGHT_TYPE_BADGE[insight.insight_type] || 'badge-gray'}`}>{insight.insight_type.replace(/_/g, ' ')}</span>
          {insight.competitor_names.map(n => <span key={n} className="badge badge-gray">{n}</span>)}
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 12px', color: 'var(--text-primary)', lineHeight: 1.3 }}>{insight.title}</h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{insight.summary}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
        {[['Novelty', insight.novelty_score], ['Frequency', insight.frequency_score], ['Relevance', insight.relevance_score], ['Priority', insight.priority_score]].map(([label, value]) => (
          <div key={label as string} className="card" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: (value as number) > 0.75 ? 'var(--accent-green)' : 'var(--accent-blue)' }}>{Math.round((value as number) * 100)}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ borderLeft: '4px solid var(--accent-blue)', background: 'rgba(79,125,243,0.05)' }}>
        <div style={{ fontSize: 12, color: 'var(--accent-blue)', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>What to test next</div>
        <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', margin: 0, lineHeight: 1.6 }}>{insight.recommendation}</p>
      </div>
      {insight.reasoning && (
        <div className="card" style={{ background: 'var(--bg-surface)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Reasoning</div>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>{insight.reasoning}</p>
        </div>
      )}
      <div style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
          Evidence ({insight.evidence.length} items)
        </h2>
        {insight.evidence.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No evidence items linked to this insight.</p>
        ) : (
          <div>{insight.evidence.map(ev => <EvidenceCard key={ev.id} ev={ev} />)}</div>
        )}
      </div>
    </div>
  );
}
