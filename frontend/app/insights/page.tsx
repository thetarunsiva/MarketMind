'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getInsights } from '@/lib/api';
import type { InsightListItem } from '@/types';

const INSIGHT_TYPE_BADGE: Record<string, string> = {
  messaging_shift: 'badge-blue', pricing_change: 'badge-amber', repeated_angle: 'badge-purple',
  overused_angle: 'badge-red', whitespace: 'badge-green',
};
const TYPES = ['all', 'messaging_shift', 'pricing_change', 'repeated_angle', 'overused_angle', 'whitespace'];

function ScoreRow({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 70 }}>{label}</span>
      <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 2 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-blue)', borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-secondary)', width: 30, textAlign: 'right' }}>{pct}</span>
    </div>
  );
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<InsightListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    getInsights(50).then(setInsights).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: 'var(--text-muted)', fontSize: 15, paddingTop: 100, textAlign: 'center' }}>Loading insights…</div>;
  if (error) return <div style={{ color: 'var(--accent-red)', fontSize: 15, padding: 32, textAlign: 'center' }}>⚠ {error}</div>;

  const filtered = filter === 'all' ? insights : insights.filter(i => i.insight_type === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Insights</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{insights.length} scored insights · sorted by priority</p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {TYPES.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, border: '1px solid',
            cursor: 'pointer', transition: 'all 0.15s',
            borderColor: filter === t ? 'var(--accent-blue)' : 'var(--border)',
            background: filter === t ? 'rgba(79,125,243,0.15)' : 'transparent',
            color: filter === t ? 'var(--accent-blue)' : 'var(--text-muted)',
          }}>
            {t === 'all' ? 'All' : t.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: 'center' }}><p style={{ color: 'var(--text-muted)', fontSize: 15, margin: 0 }}>No insights match this filter.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(ins => (
            <Link key={ins.id} href={`/insights/${ins.id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s', padding: 24 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
                  <div style={{ flex: '1 1 500px', minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                      <span className={`badge ${INSIGHT_TYPE_BADGE[ins.insight_type] || 'badge-gray'}`}>{ins.insight_type.replace(/_/g, ' ')}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>{ins.competitor_names.join(', ')}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 'auto' }}>{ins.evidence_count} evidence · {new Date(ins.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1.4 }}>{ins.title}</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{ins.summary}</p>
                    <div style={{ fontSize: 14, color: 'var(--accent-blue)', fontWeight: 500 }}>→ {ins.recommendation.slice(0, 120)}{ins.recommendation.length > 120 ? '…' : ''}</div>
                  </div>
                  <div style={{ width: 140, flexShrink: 0 }}>
                    <ScoreRow label="Novelty" value={ins.novelty_score} />
                    <div style={{ height: 6 }} />
                    <ScoreRow label="Frequency" value={ins.frequency_score} />
                    <div style={{ height: 6 }} />
                    <ScoreRow label="Relevance" value={ins.relevance_score} />
                    <div style={{ height: 12 }} />
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Priority Score</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: ins.priority_score > 0.75 ? 'var(--accent-green)' : 'var(--accent-blue)' }}>{Math.round(ins.priority_score * 100)}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
