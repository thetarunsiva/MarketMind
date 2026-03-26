import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatStat, scaleMetric } from '@/utils/format'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    redirect('/admin/login')
  }

  // Fetch users and companies
  const { data: users } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false })
  
  const totalUsers = users?.length || 0
  
  // Aggregate companies
  const categories: Record<string, number> = {}
  const companiesMap = new Map<string, {name: string, category: string, members: number}>()
  
  users?.forEach(u => {
    if (u.company_name) {
      if (!companiesMap.has(u.company_name)) {
        companiesMap.set(u.company_name, { name: u.company_name, category: u.company_domain_category || 'Unknown', members: 0 })
        const cat = u.company_domain_category || 'Unknown'
        categories[cat] = (categories[cat] || 0) + 1
      }
      companiesMap.get(u.company_name)!.members++
    }
  })

  const totalCompanies = companiesMap.size
  const companyList = Array.from(companiesMap.values())

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '64px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.03em' }}>
            System <span style={{ color: 'var(--accent-red)' }}>Overview</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
            MarketMind Hackathon Admin
          </p>
        </div>
        <Link href="/" className="btn-secondary" style={{ textDecoration: 'none' }}>
          Back to App
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 40 }}>
        <div className="card" style={{ padding: '24px 32px', borderLeft: '3px solid var(--accent-magenta)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.03, pointerEvents: 'none' }}>👥</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, position: 'relative' }}>Platform Users</div>
          <div style={{ fontSize: 40, fontWeight: 900, color: 'var(--text-primary)', position: 'relative' }}>{formatStat(scaleMetric(totalUsers, 1200))}</div>
        </div>
        <div className="card" style={{ padding: '24px 32px', borderLeft: '3px solid var(--accent-purple)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.03, pointerEvents: 'none' }}>🏢</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, position: 'relative' }}>Managed Entities</div>
          <div style={{ fontSize: 40, fontWeight: 900, color: 'var(--text-primary)', position: 'relative' }}>{formatStat(scaleMetric(totalCompanies, 450))}</div>
        </div>
        <div className="card" style={{ padding: '24px 32px', borderLeft: '3px solid var(--accent-cyan)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.03, pointerEvents: 'none' }}>📊</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, position: 'relative' }}>Intelligence Domains</div>
          <div style={{ fontSize: 40, fontWeight: 900, color: 'var(--text-primary)', position: 'relative' }}>{Object.keys(categories).length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Registered Companies</h3>
          </div>
          <div style={{ padding: 24 }}>
            {companyList.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 14, fontStyle: 'italic' }}>No companies registered yet.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr>
                    <th style={{ paddingBottom: 16, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Company</th>
                    <th style={{ paddingBottom: 16, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Domain</th>
                    <th style={{ paddingBottom: 16, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Members</th>
                  </tr>
                </thead>
                <tbody>
                  {companyList.map((c, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 0', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</td>
                      <td style={{ padding: '16px 0' }}><span className="badge badge-purple">{c.category}</span></td>
                      <td style={{ padding: '16px 0', fontSize: 14, color: 'var(--text-muted)' }}>{c.members}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Category Breakdown</h3>
          </div>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Object.entries(categories).sort((a,b) => b[1] - a[1]).map(([cat, count]) => (
              <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{cat}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{count}</span>
              </div>
            ))}
            {Object.keys(categories).length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: 14, fontStyle: 'italic' }}>No data available.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
