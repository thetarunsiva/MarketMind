'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  return (
    <button 
      onClick={async () => {
        setLoading(true)
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
      }}
      disabled={loading}
      style={{
        width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', 
        color: 'var(--text-secondary)', border: '1px solid var(--border)', 
        borderRadius: 8, fontSize: 13, cursor: loading ? 'wait' : 'pointer', textAlign: 'center', fontWeight: 600,
        opacity: loading ? 0.7 : 1, transition: 'all 0.2s'
      }}
    >
      {loading ? 'Signing out...' : 'Sign Out'}
    </button>
  )
}
