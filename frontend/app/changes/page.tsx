'use client';
import { useState, useEffect } from 'react';
import { getChanges } from '@/lib/api';
import type { Change } from '@/types';

const CHANGE_TYPE_BADGE: Record<string, string> = {
  added_claim: 'badge-green', removed_claim: 'badge-red', changed_pricing: 'badge-amber',
  changed_cta: 'badge-purple', changed_positioning: 'badge-blue', changed_audience: 'badge-gray',
};
const CHANGE_TYPE_LABEL: Record<string, string> = {
  added_claim: 'Added Claim', removed_claim: 'Removed Claim', changed_pricing: 'Pricing Change',
  changed_cta: 'CTA Change', changed_positioning: 'Positioning', changed_audience: 'Audience Shift',
};

export default function ChangesPage() {
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getChanges(undefined, 50).then(setChanges).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: 'var(--text-muted)', fontSize: 15, paddingTop: 100, textAlign: 'center' }}>Loading recent changes…</div>;
  if (error) return <div style={{ color: 'var(--accent-red)', fontSize: 15, padding: 32, textAlign: 'center' }}>⚠ {error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Recent Changes</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{changes.length} detected changes from snapshot comparisons</p>
      </div>
      {changes.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🛡️</div>
          <h3 style={{ fontSize: 18, margin: '0 0 8px', color: 'var(--text-primary)' }}>Evidence Collection Mode</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, margin: '0 auto', maxWidth: 500, lineHeight: 1.5 }}>
            No synthetic changes detected. To prevent hallucinations during live demos, <strong>Live Extraction</strong> strictly prioritizes raw evidence capture (snapshots). For full strategic change tracking, run <strong>Load Demo Data</strong> from the dashboard.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {changes.map(ch => (
            <div key={ch.id} className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
                <span className={`badge ${CHANGE_TYPE_BADGE[ch.change_type] || 'badge-gray'}`}>{CHANGE_TYPE_LABEL[ch.change_type] || ch.change_type}</span>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{ch.competitor_name}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>· {ch.field?.replace(/_/g, ' ') || 'system'}</span>
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: 500 }}>{ch.detected_at.split('T')[0]}</span>
              </div>
              {ch.before && (
                <div style={{ marginBottom: 12, padding: '12px 16px', background: 'rgba(240,85,85,0.05)', borderRadius: 8, borderLeft: '3px solid var(--accent-red)' }}>
                  <div style={{ fontSize: 11, color: 'var(--accent-red)', marginBottom: 6, fontWeight: 700, letterSpacing: '0.05em' }}>BEFORE</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.5 }}>&ldquo;{ch.before}&rdquo;</div>
                </div>
              )}
              {ch.after && (
                <div style={{ padding: '12px 16px', background: 'rgba(52,199,123,0.05)', borderRadius: 8, borderLeft: '3px solid var(--accent-green)' }}>
                  <div style={{ fontSize: 11, color: 'var(--accent-green)', marginBottom: 6, fontWeight: 700, letterSpacing: '0.05em' }}>AFTER</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.5 }}>&ldquo;{ch.after}&rdquo;</div>
                </div>
              )}
              <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                <span style={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 600, marginRight: 8 }}>Source</span>
                <a href={ch.source_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 500 }}>{ch.source_url}</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
