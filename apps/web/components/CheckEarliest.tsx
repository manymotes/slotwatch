'use client'

import { useState } from 'react'

const API = 'https://slotwatch.motesmass.workers.dev'

const input: React.CSSProperties = {
  flex: 1, minWidth: 0, boxSizing: 'border-box', background: '#0d0d0d', border: '1px solid #2a2a2a',
  borderRadius: '8px', color: '#f0f0f0', fontSize: '1rem', padding: '13px 16px', outline: 'none',
}

type Result = { center: string; earliest: { date: string; time: string } | null; openings: number; city: string }

export default function CheckEarliest() {
  const [loc, setLoc] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [res, setRes] = useState<Result | null>(null)

  async function check() {
    if (!loc.trim()) return setErr('Enter a city or ZIP.')
    setBusy(true); setErr(''); setRes(null)
    try {
      const c = await (await fetch(`${API}/api/centers?address=${encodeURIComponent(loc)}`)).json()
      if (!c.ok || !c.centers?.length) throw new Error(c.error || 'No Tesla service center found near there.')
      const nearest = c.centers[0]
      const e = await (await fetch(`${API}/api/earliest?trtId=${nearest.trtId}`)).json()
      if (!e.ok) throw new Error(e.error || "Couldn't check availability — try again in a moment.")
      setRes({ center: nearest.name, earliest: e.earliest, openings: e.openings, city: loc.trim() })
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Something went wrong') }
    finally { setBusy(false) }
  }

  return (
    <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: '16px', padding: '28px', maxWidth: '560px' }}>
      <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.14em', color: '#e31937', textTransform: 'uppercase', margin: '0 0 10px' }}>Free check — no signup</p>
      <h3 style={{ color: '#f0f0f0', fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 6px' }}>What&rsquo;s the earliest opening near you?</h3>
      <p style={{ color: '#8a8a8a', fontSize: '0.9375rem', margin: '0 0 18px', lineHeight: 1.55 }}>
        See the soonest Tesla service appointment at your nearest center right now — free.
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input style={input} placeholder="City or ZIP (e.g. 90001)" value={loc}
          onChange={(e) => setLoc(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void check() }} />
        <button onClick={() => void check()} disabled={busy}
          style={{ border: 'none', borderRadius: '8px', background: '#e31937', color: '#fff', fontWeight: 700, fontSize: '0.9375rem', padding: '13px 20px', cursor: busy ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}>
          {busy ? 'Checking…' : 'Check now'}
        </button>
      </div>

      {err && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '14px' }}>{err}</p>}

      {res && (
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #1f1f1f' }}>
          <p style={{ color: '#8a8a8a', fontSize: '0.8125rem', margin: '0 0 4px' }}>{res.center}</p>
          {res.earliest ? (
            <>
              <p style={{ color: '#f0f0f0', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
                Earliest opening: {res.earliest.date} at {res.earliest.time}
              </p>
              <p style={{ color: '#8a8a8a', fontSize: '0.9375rem', margin: '0 0 16px', lineHeight: 1.55 }}>
                Want something sooner? Slots open all day as people cancel. SlotWatch watches this center and emails you the moment an earlier one appears — $24 for a 60-day watch.
              </p>
            </>
          ) : (
            <p style={{ color: '#f0f0f0', fontSize: '1.05rem', fontWeight: 600, margin: '0 0 16px', lineHeight: 1.5 }}>
              No openings showing right now — which is exactly when watching pays off. SlotWatch emails you the moment one appears.
            </p>
          )}
          <a href={`/start/?city=${encodeURIComponent(res.city)}`}
            style={{ display: 'inline-block', background: '#e31937', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.9375rem', padding: '12px 22px', borderRadius: '8px' }}>
            Watch {res.center.replace('Tesla Service ', '')} — $24 →
          </a>
        </div>
      )}
    </div>
  )
}
