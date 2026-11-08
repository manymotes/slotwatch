'use client'

import { useEffect, useState } from 'react'
import { track } from './Analytics'

const API = 'https://slotwatch.motesmass.workers.dev'
const SITE = 'https://slotwatcher.app'

const input: React.CSSProperties = { flex: 1, minWidth: 0, width: 'auto' }
const smallBtn: React.CSSProperties = {}

type Result = { center: string; earliest: { date: string; time: string } | null; openings: number; city: string }

type Props = {
  /** Read `?city=` from the URL on mount and run the lookup automatically (shared links land on a live result). Renders nothing if no city param is present. */
  autoRunFromQuery?: boolean
  /** Override the CTA href (default: `/start/?city=<city>`). Use an in-page anchor when the signup form is on the same page. */
  ctaHref?: string
}

/** Worker returns dates as MM/DD/YYYY; render "Sep 23" for prose, fall back to the raw string. */
export function shortDate(mdy: string): string {
  const [m, d, y] = mdy.split('/').map(Number)
  if (!m || !d || !y) return mdy
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** The live-lookup URL for a city, e.g. https://slotwatcher.app/start/?city=Austin%2C%20TX */
function lookupUrl(city: string): string {
  return `${SITE}/start/${city ? `?city=${encodeURIComponent(city)}` : ''}`
}

/**
 * Forum/Reddit-friendly summary of a result. Honest framing: it's the earliest slot
 * we could see at that moment (dated), not a guarantee — and links back to a live re-check.
 */
function shareText(r: Result & { earliest: { date: string; time: string } }): string {
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `Earliest Tesla service slot near ${r.city}: ${r.center} — ${shortDate(r.earliest.date)}, ${r.earliest.time} (as of ${today}, via ${lookupUrl(r.city).replace('https://', '')})`
}

export default function CheckEarliest({ autoRunFromQuery = false, ctaHref }: Props) {
  const [loc, setLoc] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [res, setRes] = useState<Result | null>(null)
  const [copied, setCopied] = useState(false)
  // In auto-run mode the card is hidden until we know a city param exists (static export: params are client-side only).
  const [show, setShow] = useState(!autoRunFromQuery)

  useEffect(() => {
    if (!autoRunFromQuery) return
    const city = new URLSearchParams(window.location.search).get('city')?.trim()
    if (!city) return
    setShow(true); setLoc(city)
    void check(city)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRunFromQuery])

  async function check(address = loc) {
    const city = address.trim()
    if (!city) return setErr('Enter a city or ZIP.')
    setBusy(true); setErr(''); setRes(null); setCopied(false)
    try {
      const c = await (await fetch(`${API}/api/centers?address=${encodeURIComponent(city)}`)).json()
      if (!c.ok || !c.centers?.length) throw new Error(c.error || "We couldn't find that location. Try a city and state (e.g. Carlsbad, CA) or a 5-digit ZIP.")
      const nearest = c.centers[0]
      const e = await (await fetch(`${API}/api/earliest?trtId=${nearest.trtId}`)).json()
      if (!e.ok) throw new Error(e.error || "Couldn't check availability — try again in a moment.")
      setRes({ center: nearest.name, earliest: e.earliest, openings: e.openings, city })
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Something went wrong') }
    finally { setBusy(false) }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true); track('share_copy')
      setTimeout(() => setCopied(false), 2000)
    } catch { setErr("Couldn't copy — select the text above and copy it manually.") }
  }

  if (!show) return null

  const shareable = res && res.earliest ? { ...res, earliest: res.earliest } : null
  const text = shareable ? shareText(shareable) : ''
  const xHref = shareable
    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(text.replace(/, via .*\)$/, ', via SlotWatch)'))}&url=${encodeURIComponent(lookupUrl(shareable.city))}`
    : ''

  return (
    <div className="sw-card" style={{ padding: '28px', maxWidth: '560px' }}>
      <p className="sw-eyebrow" style={{ margin: '0 0 10px' }}>Free check — no signup</p>
      <h3 className="sw-h3" style={{ fontSize: '1.375rem', margin: '0 0 6px' }}>What&rsquo;s the earliest opening near you?</h3>
      <p style={{ color: 'var(--ink-2)', fontSize: '0.9375rem', margin: '0 0 18px', lineHeight: 1.55 }}>
        See the soonest Tesla service appointment at your nearest center right now — free.
      </p>
      <label htmlFor="check-city" className="sw-label">City or ZIP</label>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input id="check-city" name="city" className="sw-input" style={input} placeholder="City or ZIP (e.g. 90001)" value={loc}
          onChange={(e) => setLoc(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void check() }} />
        <button onClick={() => void check()} disabled={busy} className="sw-btn sw-btn-primary" style={{ cursor: busy ? 'wait' : 'pointer' }}>
          {busy ? 'Checking…' : 'Check now'}
        </button>
      </div>

      {err && <p style={{ color: 'var(--accent)', fontSize: '0.875rem', marginTop: '14px' }}>{err}</p>}

      {res && (
        <div style={{ marginTop: '20px', background: 'var(--surface-2)', borderRadius: '10px', padding: '18px 20px' }}>
          <p style={{ color: 'var(--muted)', fontSize: '0.8125rem', margin: '0 0 4px' }}>{res.center}</p>
          {res.earliest ? (
            <>
              <p className="sw-display" style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 6px' }}>
                Earliest opening: {res.earliest.date} at {res.earliest.time}
              </p>
              <p style={{ color: 'var(--ink-2)', fontSize: '0.9375rem', margin: '0 0 16px', lineHeight: 1.55 }}>
                Want something sooner? Slots open all day as people cancel. SlotWatch watches this center and emails you the moment an earlier one appears — free, no card, every alert in full. If it works, pay what it was worth.
              </p>
            </>
          ) : (
            <p style={{ color: 'var(--ink)', fontSize: '1.05rem', fontWeight: 600, margin: '0 0 16px', lineHeight: 1.5 }}>
              No openings showing right now — which is exactly when watching pays off. SlotWatch emails you the moment one appears.
            </p>
          )}
          <a href={ctaHref ?? `/start/?city=${encodeURIComponent(res.city)}`}
            className="sw-btn sw-btn-primary">
            Watch {res.center.replace('Tesla Service ', '')} — free, no card →
          </a>

          {shareable && (
            <div style={{ marginTop: '22px', paddingTop: '18px', borderTop: '1px solid var(--line)' }}>
              <p style={{ color: 'var(--muted)', fontSize: '0.8125rem', fontWeight: 600, margin: '0 0 8px' }}>
                Know someone waiting weeks? Paste this into the thread — the link re-runs the check live.
              </p>
              <p style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--ink-2)', fontSize: '0.875rem', lineHeight: 1.55, padding: '12px 14px', margin: '0 0 10px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', userSelect: 'all' }}>
                {text}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={() => void copy(text)} className="sw-btn sw-btn-sm" style={{ ...smallBtn, ...(copied ? { borderColor: 'var(--ok)', color: 'var(--ok)' } : {}) }}>
                  {copied ? 'Copied ✓' : 'Copy'}
                </button>
                <a href={xHref} target="_blank" rel="noopener noreferrer" onClick={() => track('share_x')} className="sw-btn sw-btn-sm" style={smallBtn}>
                  Post on X
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
