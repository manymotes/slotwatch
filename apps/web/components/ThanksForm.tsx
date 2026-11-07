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

const SLIDER_CSS = `
input[type=range].sw-amt::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:#fff;border:3px solid #e31937;box-shadow:0 2px 8px rgba(0,0,0,.5);cursor:pointer}
input[type=range].sw-amt::-moz-range-thumb{width:26px;height:26px;border-radius:50%;background:#fff;border:3px solid #e31937;cursor:pointer}
`

export default function ThanksForm() {
  const [t, setT] = useState('')
  const [booked, setBooked] = useState<'yes' | 'no' | null>(null)
  const [info, setInfo] = useState<Info | null>(null)
  const [invalid, setInvalid] = useState(false)
  const [busy, setBusy] = useState(false)
  const [dollars, setDollars] = useState(19)
  const [err, setErr] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const tok = p.get('t') || ''
    const b = p.get('booked') === 'no' ? 'no' : 'yes'
    setT(tok); setBooked(b); setReady(true)
    if (!tok) setInvalid(true)
    if (tok && (p.get('booked') === 'yes' || p.get('booked') === 'no')) {
      fetch(`${API}/api/thanks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ t: tok, booked: b }) }).catch(() => {})
    }
    if (tok && b === 'yes') {
      fetch(`${API}/api/thanks/info?t=${encodeURIComponent(tok)}`).then((r) => r.json()).then((d) => { if (d && d.ok) setInfo(d); else setInvalid(true) }).catch(() => {})
    }
  }, [])

  async function pay() {
    setBusy(true); setErr('')
    try {
      const payload = { t, amountCents: Math.round(dollars * 100) }
      const r = await fetch(`${API}/api/thanks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const d = await r.json()
      if (!d.ok || !d.url) throw new Error(d.error || 'no url')
      window.location.href = d.url
    } catch {
      setErr('Couldn’t open checkout — try again in a minute.')
      setBusy(false)
    }
  }

  if (!ready) return <p style={{ color: '#8a8a8a' }}>Loading…</p>

  if (invalid) {
    return (
      <>
        <h1 style={h1}>This link isn&rsquo;t valid</h1>
        <p style={body}>Open the link from your latest SlotWatch email, or log in to your account to see your alerts.</p>
        <a href="/account/" style={{ display: 'block', background: '#e31937', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.9375rem', padding: '12px 20px', borderRadius: '7px' }}>Go to my account</a>
        <a href="/" style={link}>Back to home</a>
      </>
    )
  }

  if (booked === 'no') {
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
    : 'Glad SlotWatch helped.'

  if (info?.paid) {
    return (
      <>
        <h1 style={h1}>{win}</h1>
        <p style={body}>You&rsquo;ve already chipped in for this watch &mdash; thank you. That keeps SlotWatch running.</p>
        <a href="/" style={link}>Back to home</a>
      </>
    )
  }

  // Slider owns the amount; the three chips are quick-picks that move it. Default = suggested $19.
  const tierFor = (d: number) => (d < 14 ? TIERS[0] : d < 30 ? TIERS[1] : TIERS[2])
  // Rocket Money-style band: the floor is a real price, the range is narrow, default = suggested.
  const MIN = 1, MAX = 100
  const pct = ((dollars - MIN) / (MAX - MIN)) * 100
  return (
    <>
      <style>{SLIDER_CSS}</style>
      <h1 style={h1}>{win}</h1>
      <p style={body}>SlotWatch is free for everyone, and stays that way. If it saved you days of waiting, chip in whatever that was worth to you &mdash; every dollar keeps it running for the next owner.</p>

      <div style={{ fontSize: '2.75rem', fontWeight: 800, color: '#f0f0f0', letterSpacing: '-0.03em', lineHeight: 1 }}>${dollars}</div>
      <div style={{ color: '#8a8a8a', fontSize: '0.8125rem', margin: '6px 0 18px', minHeight: '1.2em' }}>
        {tierFor(dollars).label.split(' — ')[1]} · {tierFor(dollars).note}
      </div>

      <input
        className="sw-amt" type="range" min={MIN} max={MAX} step={1} value={dollars}
        aria-label="Amount in dollars"
        disabled={busy}
        onChange={(e) => setDollars(Number(e.target.value))}
        style={{
          width: '100%', margin: '0 0 6px', cursor: busy ? 'default' : 'pointer', accentColor: '#e31937',
          background: `linear-gradient(to right, #e31937 ${pct}%, #2a2a2a ${pct}%)`, height: '6px', borderRadius: '3px',
          appearance: 'none', WebkitAppearance: 'none', outline: 'none',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4a4a4a', fontSize: '0.75rem', marginBottom: '14px' }}>
        <span>${MIN}</span><span>${MAX}</span>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {TIERS.map((tier) => {
          const d = tier.cents / 100
          const on = dollars === d
          return (
            <button
              key={tier.cents} type="button" disabled={busy} onClick={() => setDollars(d)}
              style={{
                flex: 1, background: on ? '#e31937' : '#141414', border: on ? '1px solid #e31937' : '1px solid #2a2a2a',
                color: on ? '#fff' : '#c8c8c8', borderRadius: '9px', padding: '10px 6px', cursor: busy ? 'default' : 'pointer', fontFamily: 'inherit',
              }}
            >
              <span style={{ display: 'block', fontWeight: 700, fontSize: '0.9375rem' }}>${d}{tier.suggested ? ' ✓' : ''}</span>
              <span style={{ display: 'block', fontSize: '0.6875rem', color: on ? 'rgba(255,255,255,0.85)' : '#6b6b6b', marginTop: '2px' }}>{tier.label.split(' — ')[1]}</span>
            </button>
          )
        })}
      </div>

      <button
        type="button" disabled={busy} onClick={() => void pay()}
        style={{ display: 'block', width: '100%', background: '#e31937', border: '1px solid #e31937', color: '#fff', borderRadius: '9px', padding: '13px 16px', cursor: busy ? 'default' : 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.9375rem', opacity: busy ? 0.7 : 1 }}
      >
        {busy ? 'Opening checkout…' : `Pay $${dollars}`}
      </button>
      {err && <p style={{ color: '#f87171', fontSize: '0.8125rem', margin: '10px 0 0' }}>{err}</p>}
      <a href="/" style={{ ...link, marginTop: '8px' }}>No thanks, it was free</a>
      <p style={{ color: '#4a4a4a', fontSize: '0.8125rem', lineHeight: 1.5, margin: '18px 0 0' }}>
        SlotWatch is one person and a server. There are no ads and no fees &mdash; this is the only way it earns anything. Thank you either way.
      </p>
    </>
  )
}
