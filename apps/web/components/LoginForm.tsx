'use client'

import { useState } from 'react'

const API = 'https://slotwatch.motesmass.workers.dev'

const input: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', background: '#111', border: '1px solid #2a2a2a',
  borderRadius: '8px', color: '#f0f0f0', fontSize: '1rem', padding: '13px 16px', outline: 'none',
}
const label: React.CSSProperties = { display: 'block', fontSize: '0.8125rem', color: '#8a8a8a', margin: '18px 0 7px', fontWeight: 500 }
const btn: React.CSSProperties = {
  border: 'none', borderRadius: '8px', color: '#fff', background: '#e31937', fontWeight: 700,
  fontSize: '0.9375rem', padding: '13px 20px', width: '100%', marginTop: '20px', cursor: 'pointer',
}

export default function LoginForm() {
  const [stage, setStage] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function requestCode() {
    if (!email.trim()) return setErr('Enter your email.')
    setBusy(true); setErr('')
    try {
      const r = await fetch(`${API}/api/auth/otp/request`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!(await r.json()).ok) throw new Error('Could not send code')
      setStage('code')
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Something went wrong') }
    finally { setBusy(false) }
  }

  async function verify() {
    if (!code.trim()) return setErr('Enter the 6-digit code.')
    setBusy(true); setErr('')
    try {
      const r = await fetch(`${API}/api/auth/otp/verify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      })
      const d = await r.json()
      if (!d.ok || !d.token) throw new Error(d.error || 'Invalid code')
      localStorage.setItem('sw_token', d.token)
      window.location.href = '/account/'
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Invalid code') }
    finally { setBusy(false) }
  }

  return (
    <div style={{ maxWidth: '400px' }}>
      {stage === 'email' ? (
        <>
          <label style={label}>Email</label>
          <input style={input} type="email" placeholder="you@example.com" value={email}
            onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void requestCode() }} />
          <button style={btn} disabled={busy} onClick={() => void requestCode()}>
            {busy ? 'Sending…' : 'Email me a login code'}
          </button>
          <p style={{ color: '#5a5a5a', fontSize: '0.8125rem', marginTop: '12px' }}>
            We&rsquo;ll email a 6-digit code to the address on your subscription.
          </p>
        </>
      ) : (
        <>
          <p style={{ color: '#8a8a8a', fontSize: '0.9375rem', marginBottom: '4px' }}>
            Enter the 6-digit code we sent to <strong style={{ color: '#f0f0f0' }}>{email}</strong>.
          </p>
          <label style={label}>Login code</label>
          <input style={{ ...input, letterSpacing: '0.3em', fontSize: '1.25rem' }} inputMode="numeric" maxLength={6}
            placeholder="000000" value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} onKeyDown={(e) => { if (e.key === 'Enter') void verify() }} />
          <button style={btn} disabled={busy} onClick={() => void verify()}>{busy ? 'Verifying…' : 'Log in'}</button>
          <button onClick={() => { setStage('email'); setCode(''); setErr('') }}
            style={{ background: 'none', border: 'none', color: '#8a8a8a', fontSize: '0.8125rem', marginTop: '14px', cursor: 'pointer' }}>
            ← Use a different email
          </button>
        </>
      )}
      {err && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '12px' }}>{err}</p>}
    </div>
  )
}
