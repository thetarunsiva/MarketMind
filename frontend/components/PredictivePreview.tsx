import React from 'react';
import type { PredictivePreview as PredictivePreviewType } from '@/types';

export default function PredictivePreview({ preview }: { preview: PredictivePreviewType }) {
  const isUp = preview.direction === 'likely_up' || preview.direction === 'emerging';
  const colorVar = isUp ? 'var(--accent-green)' : 'var(--accent-pink)';
  const icon = isUp ? '↗' : '↘';

  return (
    <div className="card" style={{ 
      position: 'relative', 
      overflow: 'hidden',
      borderColor: 'rgba(197, 22, 225, 0.2)',
      background: 'linear-gradient(145deg, rgba(47, 32, 84, 0.8) 0%, rgba(30, 20, 50, 0.9) 100%)'
    }}>
      {/* Subtle glow behind the card */}
      <div style={{ 
        position: 'absolute', top: -50, right: -50, width: 150, height: 150, 
        background: 'var(--accent-magenta)', filter: 'blur(80px)', opacity: 0.15, pointerEvents: 'none' 
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ 
          width: 28, height: 28, borderRadius: 8, 
          background: 'rgba(197, 22, 225, 0.15)', color: 'var(--accent-magenta)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
        }}>
          ✨
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
          Predictive Insight <span style={{ fontSize: 11, padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginLeft: 8 }}>V2.5 Teaser</span>
        </h3>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <h4 style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.3, margin: 0, color: 'var(--text-primary)' }}>
            {preview.title}
          </h4>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: 6, 
            color: colorVar, background: `color-mix(in srgb, ${colorVar} 15%, transparent)`,
            padding: '4px 10px', borderRadius: 999, fontSize: 13, fontWeight: 700
          }}>
            {icon} {preview.direction.replace('_', ' ')}
          </div>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 12 }}>
          {preview.summary}
        </p>
      </div>

      <div style={{ 
        padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, 
        borderLeft: '2px solid var(--accent-magenta)', fontSize: 13, color: 'var(--text-muted)' 
      }}>
        <strong>Basis:</strong> {preview.basis}
      </div>

      <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'right', opacity: 0.7 }}>
        {preview.disclaimer}
      </div>
    </div>
  );
}
