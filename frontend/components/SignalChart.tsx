import React from 'react';

/**
 * A beautiful CSS-only Donut Chart for visualizing signal contribution.
 * Colors adapt to the premium V2 palette.
 */
export default function SignalChart({ 
  webWeight = 0, 
  geoWeight = 0 
}: { 
  webWeight?: number, 
  geoWeight?: number 
}) {
  const webPct = Math.round((webWeight || 0) * 100);
  const geoPct = Math.round((geoWeight || 0) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0' }}>
        <div style={{
          position: 'relative',
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: `conic-gradient(var(--accent-purple) 0% ${webPct}%, var(--accent-yellow) ${webPct}% 100%)`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Inner cutout for donut effect */}
          <div style={{
            position: 'absolute',
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'var(--bg-card)',
            boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>100%</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Signals</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: 4, background: 'var(--accent-purple)', boxShadow: '0 0 8px var(--accent-purple)' }} />
          <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Website Signal</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{webPct}%</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: 4, background: 'var(--accent-yellow)', boxShadow: '0 0 8px var(--accent-yellow)' }} />
          <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>GEO Signal</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{geoPct}%</div>
        </div>
      </div>
    </div>
  );
}
