import type { Metadata } from 'next';
import Link from 'next/link';
import SignOutButton from '@/components/SignOutButton';
import './globals.css';

export const metadata: Metadata = {
  title: 'MarketMind V2.5',
  description: 'Evidence-backed market intelligence with GEO verification',
};

const NAV_GROUPS = [
  {
    title: 'Overview',
    items: [
      { href: '/', label: 'Dashboard', icon: '⚡' },
      { href: '/recommendations', label: 'Recommendations', icon: '🎯' },
    ]
  },
  {
    title: 'Market Signals',
    items: [
      { href: '/geo', label: 'GEO Validation', icon: '🤖' },
      { href: '/whitespace', label: 'Whitespace Analysis', icon: '🧩' },
      { href: '/comparison', label: 'Competitor Matrix', icon: '📊' },
    ]
  },
  {
    title: 'Raw Evidence',
    items: [
      { href: '/insights', label: 'Strategic Insights', icon: '💡' },
      { href: '/changes', label: 'Detected Changes', icon: '🔄' },
      { href: '/snapshots', label: 'Source Snapshots', icon: '🕸️' },
    ]
  }
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ display: 'flex', minHeight: '100vh', margin: 0 }}>
        {/* Premium Sidebar Shell */}
        <aside style={{
          width: 260,
          background: 'rgba(40, 27, 69, 0.4)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '32px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          flexShrink: 0,
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          overflowY: 'auto',
          zIndex: 10,
        }}>
          <div style={{ padding: '0 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ 
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-magenta))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800, fontSize: 18,
                boxShadow: '0 4px 12px rgba(197, 22, 225, 0.3)'
              }}>
                M
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em', lineHeight: 1.2 }}>
                  MarketMind
                </div>
                <div style={{ fontSize: 11, color: 'var(--accent-yellow)', fontWeight: 600, marginTop: 2, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Intelligence V2.5
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
            {NAV_GROUPS.map((group) => (
              <div key={group.title}>
                <div style={{ 
                  fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', 
                  textTransform: 'uppercase', letterSpacing: '0.08em', 
                  padding: '0 12px', marginBottom: 8 
                }}>
                  {group.title}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {group.items.map(({ href, label, icon }) => (
                    <Link key={href} href={href} className="nav-link">
                      <span style={{ fontSize: 16, opacity: 0.9 }}>{icon}</span>
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Version badge */}
          <div style={{
            marginTop: 'auto',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>System Status</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 8px var(--accent-green)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>Operational</span>
            </div>
          </div>
          <SignOutButton />
        </aside>

        {/* Main Content Area */}
        <main style={{ 
          marginLeft: 260, 
          flex: 1, 
          padding: '40px 48px', 
          maxWidth: '100%',
          minWidth: 0, /* Fixes flexbox overflow */
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
