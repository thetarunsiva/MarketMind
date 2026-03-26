'use client';
import { useState, useEffect } from 'react';
import { getSnapshots } from '@/lib/api';
import type { Snapshot } from '@/types';

export default function SnapshotsPage() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSnapshots(undefined, 50)
      .then(setSnapshots)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: 'var(--text-muted)', fontSize: 15, paddingTop: 100, textAlign: 'center' }}>Loading extracted snapshots…</div>;
  if (error) return <div style={{ color: 'var(--accent-red)', fontSize: 15, padding: 32, textAlign: 'center' }}>⚠ {error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Raw Evidence Extraction</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
          {snapshots.length} recent landing page snapshots · BeautifulSoup heuristics
        </p>
      </div>

      {snapshots.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <span style={{ fontSize: 32 }}>🕸️</span>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 12 }}>
            No snapshots found. Run <strong>Live Extraction</strong> on the dashboard to scrape live competitive claims.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {snapshots.map(snap => (
            <div key={snap.id} className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                    {snap.competitor_name}
                  </h3>
                  <a href={snap.source_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--accent-blue)', textDecoration: 'none' }}>
                    {snap.source_url}
                  </a>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="badge badge-gray">{snap.source_type?.replace(/_/g, ' ') || 'unknown'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                    {snap.captured_at.replace('T', ' ').substring(0, 16)}
                  </div>
                </div>
              </div>
              
              <div style={{ background: '#0a0a0a', padding: 16, borderRadius: 6, overflowX: 'auto', border: '1px solid #333' }}>
                <div style={{ fontSize: 10, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 700 }}>
                  Extracted Claims Payload
                </div>
                <pre style={{ fontSize: 13, color: '#f8f8f2', margin: 0, fontFamily: 'monospace', lineHeight: 1.5 }}>
                  {JSON.stringify(snap.extracted_claims, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
