'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  
  const supabase = createClient()
  const router = useRouter()

  async function handleAdminAuth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    
    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error?.message?.includes('Invalid login')) {
      // Hackathon: auto-provision admin
      setSuccessMsg('Provisioning admin access...')
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (!signUpError && signUpData?.user) {
        await supabase.from('user_profiles').upsert({
          id: signUpData.user.id,
          email: email,
          role: 'admin'
        })
        setSuccessMsg('Admin ready. Loading...')
        router.push('/admin')
        router.refresh()
      } else {
        setSuccessMsg(null)
        if (signUpError?.message?.includes('rate') || signUpError?.message?.includes('limit') || signUpError?.message?.includes('exceeded')) {
          setErrorMsg('Signup rate limit reached. Wait a minute and retry.')
        } else {
          setErrorMsg(signUpError?.message || error.message)
        }
        setLoading(false)
      }
    } else if (!error && signInData?.user) {
       const { data } = await supabase.from('user_profiles').select('role').eq('id', signInData.user.id).single()
       if (data?.role === 'admin') {
         setSuccessMsg('Verified. Loading...')
         router.push('/admin')
         router.refresh()
       } else {
         setErrorMsg('Access denied. Not an administrator.')
         setLoading(false)
         await supabase.auth.signOut()
       }
    } else {
       if (error?.message?.includes('rate') || error?.message?.includes('limit')) {
         setErrorMsg('Too many attempts. Wait a moment and retry.')
       } else {
         setErrorMsg(error?.message || 'Authentication failed')
       }
       setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 24 }}>
      <div className="card" style={{ maxWidth: 400, width: '100%', padding: 48, position: 'relative', overflow: 'hidden', borderTop: '4px solid var(--accent-red)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          System Administration
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 28px', lineHeight: 1.5 }}>
          Admin credentials required.
        </p>

        {errorMsg && (
          <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(255, 75, 108, 0.1)', border: '1px solid rgba(255, 75, 108, 0.2)', borderRadius: 8, color: 'var(--accent-red)', fontSize: 13, fontWeight: 500 }}>
            ⚠ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(0, 209, 178, 0.1)', border: '1px solid rgba(0, 209, 178, 0.2)', borderRadius: 8, color: 'var(--accent-green)', fontSize: 13, fontWeight: 600 }}>
            ✓ {successMsg}
          </div>
        )}

        <form onSubmit={handleAdminAuth} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Admin Email
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={!!successMsg}
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 15, outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Password
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={!!successMsg}
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 15, outline: 'none' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
            style={{ marginTop: 12, padding: '14px 24px', width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, var(--accent-red), #93192B)', boxShadow: '0 8px 24px rgba(255, 75, 108, 0.2)', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (successMsg || 'Authenticating...') : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
