'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = [
  "Productivity / Collaboration",
  "Project Management",
  "Knowledge Base",
  "Workflow Automation",
  "Team Docs",
  "CRM",
  "Design Collaboration",
  "Dev Tools"
]

export default function OnboardingPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  const [companyName, setCompanyName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  
  const supabase = createClient()
  const router = useRouter()
  const checkedRef = useRef(false)

  useEffect(() => {
    if (checkedRef.current) return
    checkedRef.current = true
    
    // Single call: get user and check profile in parallel
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: any } }) => {
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      
      // Check profile — but don't block the form render on it
      supabase.from('user_profiles').select('company_name').eq('id', user.id).single()
        .then(({ data }: { data: any }) => {
          if (data?.company_name) {
            router.push('/')
          } else {
            setLoading(false)
          }
        })
        .catch(() => {
          // No profile yet — show the form
          setLoading(false)
        })
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCompleteSetup(e: React.FormEvent) {
    e.preventDefault()
    if (!companyName.trim()) return

    setSubmitting(true)
    
    const { error } = await supabase.from('user_profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || '',
      company_name: companyName,
      company_domain_category: category,
      role: 'user'
    })

    if (error) {
      console.error(error)
      setSubmitting(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTop: '3px solid var(--accent-purple)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500 }}>
          Preparing workspace...
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 24 }}>
      <div className="card" style={{ maxWidth: 440, width: '100%', padding: 40 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Welcome to MarketMind
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 32px', lineHeight: 1.5 }}>
          Complete your company profile to get started.
        </p>

        <form onSubmit={handleCompleteSetup} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Company Name
            </label>
            <input 
              type="text" 
              required
              placeholder="e.g. Acme Corp" 
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              autoFocus
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 15, outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Market Category
            </label>
            <div style={{ position: 'relative' }}>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{ width: '100%', padding: '14px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 15, outline: 'none', appearance: 'none', cursor: 'pointer', transition: 'border-color 0.2s' }}
              >
                {CATEGORIES.map(c => <option key={c} value={c} style={{ background: 'var(--bg-base)' }}>{c}</option>)}
              </select>
              <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5, fontSize: 12 }}>
                ▼
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              Used to calibrate AI competitor clustering.
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting || !companyName.trim()}
            className="btn-primary"
            style={{ marginTop: 8, padding: '14px 24px', width: '100%', justifyContent: 'center', opacity: (submitting || !companyName.trim()) ? 0.5 : 1 }}
          >
            {submitting ? 'Setting up...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  )
}
