'use client'

import { useEffect, useState } from 'react'

const API = 'https://slotwatch.motesmass.workers.dev'
const MAX = 3

type Center = { trtId: number; name: string; distance?: number }
// An opening we emailed about. `locked` is a legacy flag from the old unlock model — every alert now renders in full.
type Alert = { center: string; slotDate: string; slotTime: string | null; earlierByDays: number | null; sentAt: string; locked: boolean }

const input: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', background: 'var(--surface)', border: '1px solid var(--line-strong)',
  borderRadius: '8px', color: 'var(--ink)', fontSize: '1rem', padding: '12px 14px', outline: 'none',
}
const label: React.CSSProperties = { display: 'block', fontSize: '0.8125rem', color: 'var(--ink-2)', margin: '18px 0 7px', fontWeight: 600 }
const btn = (bg: string): React.CSSProperties => ({
  border: bg === 'var(--accent)' ? '1px solid var(--accent)' : '1px solid var(--line-strong)', borderRadius: '8px', color: bg === 'var(--accent)' ? '#fff' : 'var(--ink)', background: bg === 'var(--accent)' ? bg : 'var(--surface)', fontWeight: 600,
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

// Plain YYYY-MM-DD parses as UTC midnight, which shows the previous day in US
// timezones — pin it to local midnight first.
function fmtDate(iso: string): string {
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00` : iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Worker sends slot dates as MM/DD/YYYY.
function fmtSlotDate(mdy: string): string {
  const [m, d, y] = mdy.split('/').map(Number)
  if (!m || !d || !y) return mdy
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtFee(cents: number | null): string {
  const c = cents ?? 1900
  return c % 100 === 0 ? `$${c / 100}` : `$${(c / 100).toFixed(2)}`
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
  const [currentApptAt, setCurrentApptAt] = useState('')
  const [watchExpiresAt, setWatchExpiresAt] = useState('')
  const [successFeeCents, setSuccessFeeCents] = useState<number | null>(null)
  const [successChargedAt, setSuccessChargedAt] = useState('')
  const [successChargeFailedAt, setSuccessChargeFailedAt] = useState('')
  const [hasCard, setHasCard] = useState(false)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [unlockUrl, setUnlockUrl] = useState('')

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
      setCurrentApptAt(d.currentApptAt || ''); setWatchExpiresAt(d.watchExpiresAt || '')
      setSuccessFeeCents(typeof d.successFeeCents === 'number' ? d.successFeeCents : null)
      setSuccessChargedAt(d.successChargedAt || ''); setSuccessChargeFailedAt(d.successChargeFailedAt || '')
      setHasCard(!!d.hasCard); setAlerts(Array.isArray(d.alerts) ? d.alerts : []); setUnlockUrl(d.unlockUrl || '')
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
    if (!confirm(`Resume your SlotWatch subscription for $6.99/mo? ${hasCard ? 'Your card on file will be charged.' : "You'll enter a card on the next screen."} Cancel anytime.`)) return
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

  if (loading) return <p style={{ color: 'var(--muted)' }}>Loading your account…</p>

  const active = status === 'active'
  const successFee = plan === 'success-fee'
  const fee = fmtFee(successFeeCents)
  const watchUntil = watchExpiresAt || currentApptAt
  return (
    <div style={{ maxWidth: '520px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', margin: 0 }}>{email}</p>
          <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px',
            background: active ? 'var(--ok-soft)' : 'var(--warn-soft)', color: active ? 'var(--ok)' : 'var(--warn)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {active ? 'Active' : status || 'inactive'}
          </span>
        </div>
        <button onClick={logout} className="sw-btn sw-btn-sm">Log out</button>
      </div>

      {!active && (
        <div style={{ background: 'var(--warn-soft)', border: '1px solid rgba(154,91,0,0.25)', borderRadius: '10px', padding: '16px 18px', marginTop: '18px' }}>
          <p style={{ color: 'var(--warn)', fontSize: '0.9375rem', fontWeight: 600, margin: '0 0 4px' }}>{successFee ? 'Your watch has ended' : 'Your subscription is inactive'}</p>
          <p style={{ color: 'var(--ink-2)', fontSize: '0.8125rem', margin: '0 0 14px', lineHeight: 1.5 }}>
            {successFee
              ? <>Your watch ran until {watchUntil ? fmtDate(watchUntil) : 'your appointment date'} and is no longer checking. Keep watching for $6.99/mo — {hasCard ? 'billed to your card on file, ' : ''}cancel anytime.</>
              : <>Your watches are paused. Resume for $6.99/mo — {hasCard ? 'billed to your card on file, ' : ''}cancel anytime.</>}
          </p>
          <button onClick={() => void reactivate()} disabled={busy === 'reactivate'}
            style={{ ...btn('var(--accent)'), width: '100%' }}>
            {busy === 'reactivate' ? 'Starting…' : successFee ? 'Keep watching — $6.99/mo' : 'Resume — $6.99/mo'}
          </button>
        </div>
      )}

      {active && (
        <>
          {lastChecked && (
            <p style={{ color: 'var(--ok)', fontSize: '0.8125rem', marginTop: '18px', marginBottom: 0 }}>
              ● Watching now — last checked {relTime(lastChecked)}. We email you the moment an earlier slot opens.
            </p>
          )}
          {successFee ? (
            <>
              {watchUntil && (
                <p style={{ color: 'var(--muted)', fontSize: '0.8125rem', marginTop: '6px', marginBottom: 0 }}>
                  Watching until <strong style={{ color: 'var(--ink-2)' }}>{fmtDate(watchUntil)}</strong>{currentApptAt ? ' — your current appointment date' : ''}{daysLeft != null ? ` · ${daysLeft} day${daysLeft === 1 ? '' : 's'} left` : ''} · {hasCard ? 'card on file' : 'no card on file'}.
                </p>
              )}
              {successChargedAt ? (
                <p style={{ color: 'var(--muted)', fontSize: '0.8125rem', marginTop: '6px', marginBottom: 0 }}>
                  <strong style={{ color: 'var(--ink-2)' }}>Thanks for chipping in on {fmtDate(successChargedAt)}</strong> — that keeps SlotWatch running.
                </p>
              ) : (
                <p style={{ color: 'var(--muted)', fontSize: '0.8125rem', marginTop: '6px', marginBottom: 0 }}>
                  <strong style={{ color: 'var(--ink-2)' }}>Free — nothing charged.</strong> Every alert arrives in full; if one gets you in sooner, chip in what it was worth afterward.
                </p>
              )}
            </>
          ) : (
            <>
              {daysLeft != null && (
                <p style={{ color: 'var(--muted)', fontSize: '0.8125rem', marginTop: '6px', marginBottom: 0 }}>
                  <strong style={{ color: 'var(--ink-2)' }}>{daysLeft} day{daysLeft === 1 ? '' : 's'} left</strong> in your current watch · cancel anytime below.
                </p>
              )}
              {plan === 'subscription' && (
                <p style={{ color: 'var(--muted)', fontSize: '0.8125rem', marginTop: '6px', marginBottom: 0 }}>$6.99/mo · cancel anytime below.</p>
              )}
            </>
          )}
        </>
      )}

      {alerts.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '10px', padding: '16px 18px', marginTop: '18px' }}>
          <p style={{ color: 'var(--ink)', fontSize: '0.9375rem', fontWeight: 600, margin: '0 0 10px' }}>Openings we found</p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
            {alerts.map((a, i) => (
              <li key={`${a.center}-${a.sentAt}-${i}`} style={{ fontSize: '0.875rem', lineHeight: 1.5, color: 'var(--muted)', padding: '8px 0', borderBottom: i < alerts.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{a.center}</span>
                {a.slotDate ? (
                  <> — <span style={{ color: 'var(--ink)' }}>{fmtSlotDate(a.slotDate)}{a.slotTime ? ` at ${a.slotTime}` : ''}</span>{a.earlierByDays != null ? ` · ${a.earlierByDays} day${a.earlierByDays === 1 ? '' : 's'} earlier` : ''}</>
                ) : (
                  <> — an opening {a.earlierByDays != null ? `${a.earlierByDays} day${a.earlierByDays === 1 ? '' : 's'}` : 'days'} before your appointment · details in your email</>
                )}
                {a.sentAt && <span style={{ color: 'var(--muted)' }}> · {relTime(a.sentAt)}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {successFee && successChargeFailedAt && !successChargedAt && (
        <div style={{ background: 'var(--accent-soft)', border: '1px solid rgba(210,24,46,0.25)', borderRadius: '10px', padding: '16px 18px', marginTop: '18px' }}>
          <p style={{ color: 'var(--accent)', fontSize: '0.9375rem', fontWeight: 600, margin: '0 0 4px' }}>We couldn&rsquo;t charge your card</p>
          <p style={{ color: 'var(--ink-2)', fontSize: '0.8125rem', margin: '0 0 14px', lineHeight: 1.5 }}>
            We found you an earlier slot on {fmtDate(successChargeFailedAt)}, but the {fee} charge didn&rsquo;t go through on your card on file. Email us and we&rsquo;ll send a secure link to update it.
          </p>
          <a href={`mailto:hello@slotwatcher.app?subject=${encodeURIComponent('Update my card — SlotWatch')}&body=${encodeURIComponent(`Hi — my ${fee} charge didn't go through. Please send me a link to update my card.\n\nAccount: ${email}`)}`}
            style={{ ...btn('var(--accent)'), display: 'block', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box', width: '100%' }}>
            Update my card
          </a>
        </div>
      )}

      <h2 style={{ fontSize: '1.0625rem', color: 'var(--ink)', marginTop: '20px', marginBottom: 0 }}>Centers you&rsquo;re watching <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({picked.length}/{MAX})</span></h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
        {picked.length === 0 && <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>No centers yet — add one below.</p>}
        {picked.map((c) => (
          <span key={c.trtId} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--surface-2)', border: '1px solid var(--line-strong)', borderRadius: '999px', padding: '6px 8px 6px 14px', fontSize: '0.8125rem', color: 'var(--ink)' }}>
            {c.name}
            <button onClick={() => remove(c.trtId)} aria-label="Remove"
              style={{ border: 'none', background: 'var(--line-strong)', color: 'var(--ink-2)', borderRadius: '999px', width: '20px', height: '20px', cursor: 'pointer', lineHeight: 1 }}>×</button>
          </span>
        ))}
      </div>

      {picked.length < MAX && (
        <>
          <label style={label}>Add a center</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input aria-label="City or ZIP" style={{ ...input, flex: 1 }} placeholder="City or ZIP" value={loc}
              onChange={(e) => setLoc(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void search() }} />
            <button style={btn('var(--line-strong)')} disabled={busy === 'find'} onClick={() => void search()}>{busy === 'find' ? 'Finding…' : 'Search'}</button>
          </div>
          {results.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <select style={{ ...input, flex: 1 }} value={sel} onChange={(e) => setSel(Number(e.target.value))}>
                {results.map((c) => <option key={c.trtId} value={c.trtId}>{c.name}{c.distance != null ? ` — ${c.distance} mi away` : ''}</option>)}
              </select>
              <button style={btn('var(--line-strong)')} onClick={addSelected}>+ Add</button>
            </div>
          )}
        </>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1 }}><label style={label}>From</label><input style={input} type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div style={{ flex: 1 }}><label style={label}>Watch until</label><input style={input} type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
      </div>

      <button style={{ ...btn('var(--accent)'), width: '100%', marginTop: '22px' }} disabled={!!busy} onClick={() => void save()}>
        {busy === 'save' ? 'Saving…' : 'Save changes'}
      </button>
      {msg && <p style={{ color: 'var(--ok)', fontSize: '0.875rem', marginTop: '12px' }}>{msg}</p>}
      {err && <p style={{ color: 'var(--accent)', fontSize: '0.875rem', marginTop: '12px' }}>{err}</p>}

      {active && plan === 'subscription' && (
        <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--line)' }}>
          <button onClick={() => void cancelSub()} disabled={busy === 'cancel'}
            style={{ background: 'none', border: '1px solid var(--accent-soft)', color: 'var(--accent)', borderRadius: '8px', padding: '10px 16px', cursor: 'pointer', fontSize: '0.875rem' }}>
            {busy === 'cancel' ? 'Canceling…' : 'Cancel subscription'}
          </button>
        </div>
      )}
    </div>
  )
}
