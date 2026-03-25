import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Market Intelligence Engine',
  description: 'Source-traceable competitor intelligence dashboard for B2B SaaS',
};

const NAV = [
  { href: '/', label: 'Dashboard', icon: '⬛' },
  { href: '/changes', label: 'Recent Changes', icon: '🔄' },
  { href: '/insights', label: 'Insights', icon: '💡' },
  { href: '/comparison', label: 'Comparison', icon: '📊' },
  { href: '/whitespace', label: 'Whitespace', icon: '🎯' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <aside style={{
          width: 220,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          padding: '24px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          flexShrink: 0,
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          overflowY: 'auto',
        }}>
          <div style={{ padding: '0 12px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              MIE
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Market Intelligence
            </div>
          </div>
          <div className="divider" style={{ margin: '0 12px 12px' }} />
          {NAV.map(({ href, label, icon }) => (
            <Link key={href} href={href} className="nav-link">
              <span style={{ fontSize: 14 }}>{icon}</span>
              {label}
            </Link>
          ))}
        </aside>

        {/* Main content */}
        <main style={{ marginLeft: 220, flex: 1, padding: '32px 40px', maxWidth: 1200 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
