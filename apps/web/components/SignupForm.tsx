'use client'

import { useEffect, useState } from 'react'

// The backend worker (API + cron). CORS allows this origin.
const API = 'https://slotwatch.motesmass.workers.dev'

type Center = { trtId: number; name: string; city?: string; distance?: number }

const input: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', background: '#111', border: '1px solid #2a2a2a',
  borderRadius: '8px', color: '#f0f0f0', fontSize: '1rem', padding: '13px 16px', outline: 'none',
}
const label: React.CSSProperties = { display: 'block', fontSize: '0.8125rem', color: '#8a8a8a', margin: '18px 0 7px', fontWeight: 500 }

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [loc, setLoc] = useState('')
  const [centers, setCenters] = useState<Center[]>([])
  const [sel, setSel] = useState<number | ''>('')
  const [geo, setGeo] = useState<{ lat: number; lon: number } | null>(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [busy, setBusy] = useState<'find' | 'go' | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    if (p.get('email')) setEmail(p.get('email') as string)
    const now = new Date()
    const fmt = (d: Date) => d.toISOString().slice(0, 10)
    setFrom(fmt(now)); setTo(fmt(new Date(now.getTime() + 90 * 864e5)))
    const city = p.get('city')
    if (city) { setLoc(city); void findCenters(city) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function findCenters(address: string) {
    setBusy('find'); setErr('')
    try {
      const r = await fetch(`${API}/api/centers?address=${encodeURIComponent(address)}`)
      const d = await r.json()
      if (!d.ok) throw new Error(d.error || 'Lookup failed')
      setGeo({ lat: d.lat, lon: d.lon })
      setCenters(d.centers || [])
      if (d.centers?.length) setSel(d.centers[0].trtId)
      else setErr('No Tesla service centers found near that location.')
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Lookup failed') }
    finally { setBusy(null) }
  }

  async function submit() {
    if (!email.trim()) return setErr('Enter your email.')
    if (!sel) return setErr('Find and pick a service center first.')
    const c = centers.find((x) => x.trtId === sel)
    setBusy('go'); setErr('')
    try {
      const r = await fetch(`${API}/api/signup`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), trtId: sel, name: c?.name, city: c?.city, lat: geo?.lat, lon: geo?.lon, dateFrom: from, dateTo: to }),
      })
      const d = await r.json()
      if (!d.ok) throw new Error(d.error || 'Signup failed')
      if (d.checkoutUrl) { window.location.href = d.checkoutUrl; return }
      setErr(''); window.location.href = '/checkout/success'
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Signup failed') }
    finally { setBusy(null) }
  }

  const btn = (bg: string): React.CSSProperties => ({
    border: 'none', borderRadius: '8px', color: '#fff', background: bg, fontWeight: 700,
    fontSize: '0.9375rem', padding: '13px 20px', cursor: busy ? 'wait' : 'pointer', whiteSpace: 'nowrap',
  })

  return (
    <div style={{ maxWidth: '460px' }}>
      <label style={label}>Your email</label>
      <input style={input} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />

      <label style={label}>Your city or ZIP</label>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input style={{ ...input, flex: 1 }} type="text" placeholder="e.g. Provo, UT or 84604" value={loc}
          onChange={(e) => setLoc(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void findCenters(loc) }} />
        <button style={btn('#2a2a2a')} disabled={busy === 'find'} onClick={() => void findCenters(loc)}>
          {busy === 'find' ? 'Finding…' : 'Find centers'}
        </button>
      </div>

      {centers.length > 0 && (
        <>
          <label style={label}>Service center</label>
          <select style={input} value={sel} onChange={(e) => setSel(Number(e.target.value))}>
            {centers.map((c) => <option key={c.trtId} value={c.trtId}>{c.name}{c.distance != null ? ` — ${c.distance} mi away` : c.city ? ` — ${c.city}` : ''}</option>)}
          </select>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}><label style={label}>From</label><input style={input} type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
            <div style={{ flex: 1 }}><label style={label}>Watch until</label><input style={input} type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          </div>
        </>
      )}

      <button style={{ ...btn('#e31937'), width: '100%', marginTop: '22px' }} disabled={!!busy} onClick={() => void submit()}>
        {busy === 'go' ? 'Starting…' : 'Start watching — $9.99/mo →'}
      </button>
      <p style={{ color: '#5a5a5a', fontSize: '0.8125rem', marginTop: '10px', textAlign: 'center' }}>
        No Tesla login required. Cancel anytime.
      </p>
      {err && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '12px' }}>{err}</p>}
    </div>
  )
}
