'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const err = new URLSearchParams(window.location.search).get('error')
      if (err) setErrorMsg(err)
    }
  }, [])

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    
    // Try sign in first
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    
    if (signInError?.message?.includes('Invalid login')) {
      // Auto-provision: create account
      setSuccessMsg('Creating workspace...')
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          // Skip email confirmation for hackathon speed
          emailRedirectTo: undefined
        }
      })
      
      if (signUpError) {
        setSuccessMsg(null)
        // Handle rate limit gracefully
        if (signUpError.message?.includes('rate') || signUpError.message?.includes('limit') || signUpError.message?.includes('exceeded')) {
          setErrorMsg('Email signup is temporarily rate-limited. Please use Google Sign-In instead, or wait a minute and retry.')
        } else {
          setErrorMsg(signUpError.message)
        }
        setLoading(false)
      } else if (signUpData?.user?.identities?.length === 0) {
        // User exists but wrong password — Supabase returns this pattern
        setSuccessMsg(null)
        setErrorMsg('Account exists but password is incorrect. Please try again or use Google Sign-In.')
        setLoading(false)
      } else {
        router.push('/onboarding')
        router.refresh()
      }
    } else if (signInError) {
      // Handle rate limit on sign-in too
      if (signInError.message?.includes('rate') || signInError.message?.includes('limit') || signInError.message?.includes('exceeded')) {
        setErrorMsg('Too many login attempts. Please wait a moment or use Google Sign-In.')
      } else {
        setErrorMsg(signInError.message)
      }
      setLoading(false)
    } else {
      setSuccessMsg('Authenticated. Loading...')
      router.push('/')
      router.refresh()
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    setErrorMsg(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`
      }
    })
    if (error) {
      if (error.message?.includes('provider')) {
        setErrorMsg('Google Sign-In is not yet configured. Please use email/password login.')
      } else {
        setErrorMsg(error.message)
      }
      setGoogleLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 24 }}>
      <div className="card" style={{ maxWidth: 420, width: '100%', padding: 48, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 200, height: 200, background: 'var(--accent-purple)', filter: 'blur(100px)', opacity: 0.1, zIndex: 0 }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-magenta))', borderRadius: 12, margin: '0 0 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 8px 32px rgba(115, 93, 255, 0.2)' }}>
            ⚡
          </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            Welcome to MarketMind
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 28px', lineHeight: 1.5 }}>
            Advanced Market Intelligence Platform
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

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Work Email
              </label>
              <input 
                type="email" 
                required
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={!!successMsg}
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 15, outline: 'none', transition: 'border-color 0.2s' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Password
              </label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={!!successMsg}
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 15, outline: 'none', transition: 'border-color 0.2s' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || !!successMsg}
              className="btn-primary"
              style={{ marginTop: 8, padding: '14px 24px', width: '100%', justifyContent: 'center', opacity: (loading || !!successMsg) ? 0.7 : 1 }}
            >
              {loading ? (successMsg || 'Signing in...') : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Google OAuth Button */}
          <button 
            onClick={handleGoogleLogin} 
            disabled={googleLoading || !!successMsg}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, padding: '12px 24px', borderRadius: 8, cursor: googleLoading ? 'wait' : 'pointer', transition: 'all 0.2s ease', opacity: (googleLoading || !!successMsg) ? 0.6 : 1 }}
          >
            {googleLoading ? 'Connecting to Google...' : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 24, marginBottom: 0, textAlign: 'center' }}>
            By continuing, you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  )
}
