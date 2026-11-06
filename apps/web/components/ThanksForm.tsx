'use client'

import { useEffect, useState } from 'react'

const API = 'https://slotwatch.motesmass.workers.dev'

// /thanks/?t=TOKEN&booked=yes|no — linked from the "did you book it?" follow-up email.
// booked=yes: show the win in their numbers and the pay-what-it-was-worth tiers.
// booked=no (or missing): no money ask; we're still watching.
type Info = { center?: string; slotDate?: string; slotTime?: string; earlierByDays?: number | null; apptLabel?: string | null; paid?: boolean }

const TIERS: { cents: number; label: string; note: string; suggested?: boolean }[] = [
  { cents: 900, label: '$9 — Just an owner', note: 'Covers the checks for your watch.' },
  { cents: 1900, label: '$19 — Time matters', note: 'Suggested.', suggested: true },
  { cents: 4900, label: '$49 — Rideshare, Turo or fleet', note: 'A day of downtime costs more than this.' },
]

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function shortMDY(mdy?: string): string | null {
  if (!mdy) return null
  const [m, d] = mdy.split('/').map(Number)
  return m && d ? `${MON[m - 1]} ${d}` : null
}

const h1: React.CSSProperties = { fontSize: '1.375rem', fontWeight: 800, color: '#f0f0f0', marginBottom: '12px', letterSpacing: '-0.02em' }
const body: React.CSSProperties = { color: '#6b6b6b', fontSize: '0.9375rem', lineHeight: 1.65, marginBottom: '28px' }
const link: React.CSSProperties = { display: 'block', color: '#3a3a3a', textDecoration: 'none', fontSize: '0.875rem', padding: '8px' }

export default function ThanksForm() {
  const [t, setT] = useState('')
  const [booked, setBooked] = useState<'yes' | 'no' | null>(null)
  const [info, setInfo] = useState<Info | null>(null)
  const [busy, setBusy] = useState<number | 'custom' | null>(null)
  const [err, setErr] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const tok = p.get('t') || ''
    const b = p.get('booked') === 'yes' ? 'yes' : 'no'
    setT(tok); setBooked(b); setReady(true)
    if (tok && (p.get('booked') === 'yes' || p.get('booked') === 'no')) {
      fetch(`${API}/api/thanks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ t: tok, booked: b }) }).catch(() => {})
    }
    if (tok && b === 'yes') {
      fetch(`${API}/api/thanks/info?t=${encodeURIComponent(tok)}`).then((r) => r.json()).then((d) => { if (d && d.ok) setInfo(d) }).catch(() => {})
    }
  }, [])

  async function pay(amount: number | 'custom') {
    setBusy(amount); setErr('')
    try {
      const payload = amount === 'custom' ? { t, custom: true } : { t, amountCents: amount }
      const r = await fetch(`${API}/api/thanks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const d = await r.json()
      if (!d.ok || !d.url) throw new Error(d.error || 'no url')
      window.location.href = d.url
    } catch {
      setErr('Couldn’t open checkout — try again in a minute.')
      setBusy(null)
    }
  }

  if (!ready) return <p style={{ color: '#8a8a8a' }}>Loading…</p>

  if (booked !== 'yes') {
    return (
      <>
        <h1 style={h1}>Not yet? We&rsquo;re still watching</h1>
        <p style={body}>You&rsquo;ll get the next one in full, the moment it opens.</p>
        <a href="/" style={{ display: 'block', background: '#e31937', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.9375rem', padding: '12px 20px', borderRadius: '7px' }}>Back to home</a>
      </>
    )
  }

  const slot = shortMDY(info?.slotDate)
  const win = info && slot && info.apptLabel && info.earlierByDays != null && info.earlierByDays > 0
    ? `You moved from ${info.apptLabel} to ${slot} — ${info.earlierByDays} day${info.earlierByDays === 1 ? '' : 's'} sooner.`
    : 'Glad it worked.'

  if (info?.paid) {
    return (
      <>
        <h1 style={h1}>{win}</h1>
        <p style={body}>You&rsquo;ve already chipped in for this watch &mdash; thank you. That keeps SlotWatch running.</p>
        <a href="/" style={link}>Back to home</a>
      </>
    )
  }

  return (
    <>
      <h1 style={h1}>{win}</h1>
      <p style={body}>SlotWatch is free. If it was worth something to you, chip in what it was worth.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
        {TIERS.map((tier) => {
          const on = busy === tier.cents
          return (
            <button
              key={tier.cents}
              type="button"
              disabled={busy !== null}
              onClick={() => void pay(tier.cents)}
              style={{
                textAlign: 'left',
                background: tier.suggested ? '#e31937' : '#141414',
                border: tier.suggested ? '1px solid #e31937' : '1px solid #2a2a2a',
                color: '#fff',
                borderRadius: '9px',
                padding: '13px 16px',
                cursor: busy !== null ? 'default' : 'pointer',
                opacity: busy !== null && !on ? 0.6 : 1,
                fontFamily: 'inherit',
              }}
            >
              <span style={{ display: 'block', fontWeight: 700, fontSize: '0.9375rem' }}>{on ? 'Opening checkout…' : tier.label}</span>
              <span style={{ display: 'block', fontSize: '0.8125rem', color: tier.suggested ? 'rgba(255,255,255,0.85)' : '#8a8a8a', marginTop: '2px' }}>{tier.note}</span>
            </button>
          )
        })}
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void pay('custom')}
          style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#c8c8c8', borderRadius: '9px', padding: '11px 16px', cursor: busy !== null ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600 }}
        >
          {busy === 'custom' ? 'Opening checkout…' : 'Other amount'}
        </button>
      </div>
      {err && <p style={{ color: '#f87171', fontSize: '0.8125rem', margin: '0 0 10px' }}>{err}</p>}
      <a href="/" style={link}>No thanks, it was free</a>
      <p style={{ color: '#4a4a4a', fontSize: '0.8125rem', lineHeight: 1.5, margin: '18px 0 0' }}>
        SlotWatch is one person and a server. This is the only way it earns anything.
      </p>
    </>
  )
}
