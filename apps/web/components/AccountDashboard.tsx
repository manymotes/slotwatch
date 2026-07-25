'use client'

import { useEffect, useState } from 'react'

const API = 'https://slotwatch.motesmass.workers.dev'
const MAX = 3

type Center = { trtId: number; name: string; distance?: number }

const input: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', background: '#111', border: '1px solid #2a2a2a',
  borderRadius: '8px', color: '#f0f0f0', fontSize: '1rem', padding: '12px 14px', outline: 'none',
}
const label: React.CSSProperties = { display: 'block', fontSize: '0.8125rem', color: '#8a8a8a', margin: '18px 0 7px', fontWeight: 500 }
const btn = (bg: string): React.CSSProperties => ({
  border: 'none', borderRadius: '8px', color: '#fff', background: bg, fontWeight: 700,
  fontSize: '0.9375rem', padding: '12px 18px', cursor: 'pointer', whiteSpace: 'nowrap',
})

function tokenHeader(): Record<string, string> {
  const t = typeof window !== 'undefined' ? localStorage.getItem('sw_token') : ''
  return t ? { Authorization: `Bearer ${t}` } : {}
}

function relTime(iso: string): string {
  const secs = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (secs < 90) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`
  return `${Math.floor(hrs / 24)} day(s) ago`
}

export default function AccountDashboard() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [picked, setPicked] = useState<Center[]>([])
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [loc, setLoc] = useState('')
  const [results, setResults] = useState<Center[]>([])
  const [sel, setSel] = useState<number | ''>('')
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [lastChecked, setLastChecked] = useState('')
  const [daysLeft, setDaysLeft] = useState<number | null>(null)
  const [plan, setPlan] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('sw_token')) { window.location.href = '/login/'; return }
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function load() {
    try {
      const r = await fetch(`${API}/api/me`, { headers: tokenHeader() })
      if (r.status === 401) { localStorage.removeItem('sw_token'); window.location.href = '/login/'; return }
      const d = await r.json()
      if (!d.ok) throw new Error(d.error || 'Could not load account')
      setEmail(d.email || ''); setStatus(d.status || '')
      setPicked((d.centers || []).map((c: Center) => ({ trtId: c.trtId, name: c.name })))
      setFrom(d.dateFrom || ''); setTo(d.dateTo || ''); setLastChecked(d.lastChecked || '')
      setDaysLeft(d.daysLeft ?? null); setPlan(d.plan || '')
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Could not load account') }
    finally { setLoading(false) }
  }

  async function search() {
    if (!loc.trim()) return
    setBusy('find'); setErr('')
    try {
      const r = await fetch(`${API}/api/centers?address=${encodeURIComponent(loc)}`)
      const d = await r.json()
      if (!d.ok) throw new Error(d.error || 'Lookup failed')
      setResults(d.centers || [])
      if (d.centers?.length) setSel(d.centers[0].trtId)
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Lookup failed') }
    finally { setBusy(null) }
  }
  function addSelected() {
    if (!sel) return
    if (picked.length >= MAX) return setErr(`Up to ${MAX} centers.`)
    if (picked.some((c) => c.trtId === sel)) return
    const c = results.find((x) => x.trtId === sel)
    if (c) { setPicked([...picked, { trtId: c.trtId, name: c.name }]); setErr(''); setMsg('') }
  }
  function remove(trtId: number) { setPicked(picked.filter((c) => c.trtId !== trtId)); setMsg('') }

  async function save() {
    if (!picked.length) return setErr('Keep at least one center.')
    setBusy('save'); setErr(''); setMsg('')
    try {
      const r = await fetch(`${API}/api/config`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...tokenHeader() },
        body: JSON.stringify({ centers: picked.map((c) => ({ trtId: c.trtId, name: c.name })), dateFrom: from, dateTo: to }),
      })
      const d = await r.json()
      if (!d.ok) throw new Error(d.error || 'Could not save')
      setMsg('Saved. Your watch is updated.')
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Could not save') }
    finally { setBusy(null) }
  }

  async function reactivate() {
    if (!confirm('Keep watching for $6.99/mo? Your card on file will be charged. Cancel anytime.')) return
    setBusy('reactivate'); setErr(''); setMsg('')
    try {
      const r = await fetch(`${API}/api/reactivate`, { method: 'POST', headers: tokenHeader() })
      const d = await r.json()
      if (!d.ok) throw new Error(d.error || 'Could not reactivate')
      if (d.checkoutUrl) { window.location.href = d.checkoutUrl; return } // no saved card → hosted checkout
      setStatus('active'); setMsg('Reactivated — your watches are running again.')
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Could not reactivate') }
    finally { setBusy(null) }
  }

  async function cancelSub() {
    if (!confirm('Cancel your SlotWatch subscription? Your watches will stop.')) return
    setBusy('cancel'); setErr(''); setMsg('')
    try {
      const r = await fetch(`${API}/api/cancel`, { method: 'POST', headers: tokenHeader() })
      if (!(await r.json()).ok) throw new Error('Could not cancel')
      setStatus('canceled'); setMsg('Your subscription has been canceled.')
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Could not cancel') }
    finally { setBusy(null) }
  }

  function logout() { localStorage.removeItem('sw_token'); window.location.href = '/login/' }

  if (loading) return <p style={{ color: '#8a8a8a' }}>Loading your account…</p>

  const active = status === 'active'
  return (
    <div style={{ maxWidth: '520px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div>
          <p style={{ color: '#8a8a8a', fontSize: '0.875rem', margin: 0 }}>{email}</p>
          <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px',
            background: active ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: active ? '#4ade80' : '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {active ? 'Active' : status || 'inactive'}
          </span>
        </div>
        <button onClick={logout} style={{ background: 'none', border: '1px solid #2a2a2a', color: '#8a8a8a', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '0.8125rem' }}>Log out</button>
      </div>

      {!active && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '16px 18px', marginTop: '18px' }}>
          <p style={{ color: '#f87171', fontSize: '0.9375rem', fontWeight: 600, margin: '0 0 4px' }}>Your watch has ended</p>
          <p style={{ color: '#c58a8a', fontSize: '0.8125rem', margin: '0 0 14px', lineHeight: 1.5 }}>
            Your 60-day watch is over. Keep watching for $6.99/mo — billed to your card on file, cancel anytime.
          </p>
          <button onClick={() => void reactivate()} disabled={busy === 'reactivate'}
            style={{ ...btn('#e31937'), width: '100%' }}>
            {busy === 'reactivate' ? 'Starting…' : 'Keep watching — $6.99/mo'}
          </button>
        </div>
      )}

      {active && (
        <>
          {lastChecked && (
            <p style={{ color: '#4ade80', fontSize: '0.8125rem', marginTop: '18px', marginBottom: 0 }}>
              ● Watching now — last checked {relTime(lastChecked)}. We email you the moment an earlier slot opens.
            </p>
          )}
          {daysLeft != null && (
            <p style={{ color: '#8a8a8a', fontSize: '0.8125rem', marginTop: '6px', marginBottom: 0 }}>
              One-time watch · <strong style={{ color: '#c8c8c8' }}>{daysLeft} day{daysLeft === 1 ? '' : 's'} left</strong>. No earlier slot in your window? Email hello@slotwatcher.app for a full refund.
            </p>
          )}
          {plan === 'subscription' && (
            <p style={{ color: '#8a8a8a', fontSize: '0.8125rem', marginTop: '6px', marginBottom: 0 }}>Continuation plan · $6.99/mo · cancel anytime below.</p>
          )}
        </>
      )}

      <h2 style={{ fontSize: '1.0625rem', color: '#f0f0f0', marginTop: '20px', marginBottom: 0 }}>Centers you&rsquo;re watching <span style={{ color: '#5a5a5a', fontWeight: 400 }}>({picked.length}/{MAX})</span></h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
        {picked.length === 0 && <p style={{ color: '#5a5a5a', fontSize: '0.875rem' }}>No centers yet — add one below.</p>}
        {picked.map((c) => (
          <span key={c.trtId} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '999px', padding: '6px 8px 6px 14px', fontSize: '0.8125rem', color: '#f0f0f0' }}>
            {c.name}
            <button onClick={() => remove(c.trtId)} aria-label="Remove"
              style={{ border: 'none', background: '#2e2e2e', color: '#bbb', borderRadius: '999px', width: '20px', height: '20px', cursor: 'pointer', lineHeight: 1 }}>×</button>
          </span>
        ))}
      </div>

      {picked.length < MAX && (
        <>
          <label style={label}>Add a center</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input style={{ ...input, flex: 1 }} placeholder="City or ZIP" value={loc}
              onChange={(e) => setLoc(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void search() }} />
            <button style={btn('#2a2a2a')} disabled={busy === 'find'} onClick={() => void search()}>{busy === 'find' ? 'Finding…' : 'Search'}</button>
          </div>
          {results.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <select style={{ ...input, flex: 1 }} value={sel} onChange={(e) => setSel(Number(e.target.value))}>
                {results.map((c) => <option key={c.trtId} value={c.trtId}>{c.name}{c.distance != null ? ` — ${c.distance} mi away` : ''}</option>)}
              </select>
              <button style={btn('#2a2a2a')} onClick={addSelected}>+ Add</button>
            </div>
          )}
        </>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1 }}><label style={label}>From</label><input style={input} type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div style={{ flex: 1 }}><label style={label}>Watch until</label><input style={input} type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
      </div>

      <button style={{ ...btn('#e31937'), width: '100%', marginTop: '22px' }} disabled={!!busy} onClick={() => void save()}>
        {busy === 'save' ? 'Saving…' : 'Save changes'}
      </button>
      {msg && <p style={{ color: '#4ade80', fontSize: '0.875rem', marginTop: '12px' }}>{msg}</p>}
      {err && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '12px' }}>{err}</p>}

      {active && plan === 'subscription' && (
        <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #1a1a1a' }}>
          <button onClick={() => void cancelSub()} disabled={busy === 'cancel'}
            style={{ background: 'none', border: '1px solid #3a2222', color: '#f87171', borderRadius: '8px', padding: '10px 16px', cursor: 'pointer', fontSize: '0.875rem' }}>
            {busy === 'cancel' ? 'Canceling…' : 'Cancel subscription'}
          </button>
        </div>
      )}
    </div>
  )
}
