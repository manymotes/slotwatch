'use client'

import { useEffect, useRef, useState } from 'react'
import { track } from './Analytics'
import { shortDate } from './CheckEarliest'

const API = 'https://slotwatch.motesmass.workers.dev'

type Earliest = { date: string; time: string } | null
type BatchResult = { trtId: number; name: string; earliest: Earliest; openings: number }
type Batch = { ok: boolean; cachedAt: string; results: BatchResult[] }

type Center = { trtId: number; name: string }
type Row = { trtId: number; name: string; earliest: Earliest; openings: number }

type Props = {
  /** This metro's centers (from lib/service-centers.ts); the first 10 trtIds are queried. */
  centers: Center[]
  /** Prefill for /start, e.g. "Austin, TX" — same value the page's other CTAs use. */
  city: string
  style?: React.CSSProperties
}

/** "2:41 PM" when the snapshot is from today, otherwise "Sep 6, 2:41 PM". Empty on a bad timestamp. */
function asOfLabel(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const today = new Date()
  const sameDay = d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate()
  return sameDay ? time : `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${time}`
}

const openingsLabel = (n: number) => `${n.toLocaleString()} ${n === 1 ? 'opening' : 'openings'}`

// A dated snapshot of the earliest slot the worker could see at each of this metro's
// centers. Renders an empty reserved line (never placeholder data) when the fetch fails,
// the worker answers non-ok / 429, or no center has any opening listed.
export default function LiveAvailability({ centers, city, style }: Props) {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [asOf, setAsOf] = useState('')
  const viewed = useRef(false)

  useEffect(() => {
    const ids = centers.slice(0, 10).map((c) => c.trtId)
    if (ids.length === 0) return
    let alive = true
    fetch(`${API}/api/earliest/batch?trtIds=${ids.join(',')}`)
      .then((r) => (r.ok ? (r.json() as Promise<Batch>) : null))
      .then((d) => {
        if (!alive || !d || !d.ok || !Array.isArray(d.results)) return
        const byId = new Map(d.results.map((r) => [r.trtId, r]))
        // Keep the page's own order and names; skip centers the worker didn't answer for.
        const next: Row[] = []
        for (const c of centers.slice(0, 10)) {
          const r = byId.get(c.trtId)
          if (!r) continue
          const earliest = r.earliest && r.earliest.date && r.earliest.time ? r.earliest : null
          next.push({ trtId: c.trtId, name: c.name || r.name, earliest, openings: Number(r.openings) || 0 })
        }
        if (!next.some((r) => r.earliest)) return
        setRows(next)
        setAsOf(asOfLabel(d.cachedAt))
        if (!viewed.current) { viewed.current = true; track('live_availability_view') }
      })
      .catch(() => {})
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!rows) {
    return <p aria-hidden style={{ minHeight: '1.4em', lineHeight: 1.4, margin: 0, ...style }} />
  }

  return (
    <div style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '20px 24px', maxWidth: '680px', ...style }}>
      <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.14em', color: '#e31937', textTransform: 'uppercase', margin: '0 0 12px' }}>
        Live availability snapshot{asOf ? <span style={{ color: '#5a5a5a', fontWeight: 500, letterSpacing: 0, textTransform: 'none', marginLeft: '10px' }}>as of {asOf}</span> : null}
      </p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {rows.map((r) => (
          <li key={r.trtId} style={{ fontSize: '0.875rem', lineHeight: 1.5, color: '#8a8a8a' }}>
            <span style={{ color: '#e8e8e8', fontWeight: 600 }}>{r.name}</span>
            {' · '}
            {r.earliest ? (
              <>earliest we can see right now: <span style={{ color: '#f0f0f0' }}>{shortDate(r.earliest.date)}, {r.earliest.time}</span> ({openingsLabel(r.openings)})</>
            ) : (
              <>no openings listed right now</>
            )}
          </li>
        ))}
      </ul>
      <p style={{ fontSize: '0.75rem', lineHeight: 1.5, color: '#5a5a5a', margin: '14px 0 0' }}>
        A snapshot of what Tesla&rsquo;s scheduler showed at that moment, not a guarantee — slots change all day as people cancel, which is why we watch them for you.
      </p>
      <a
        href={`/start/?city=${encodeURIComponent(city)}`}
        onClick={() => track('live_availability_cta')}
        style={{ display: 'inline-block', marginTop: '14px', color: '#e5556f', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}
      >
        Watch these centers — free to start →
      </a>
    </div>
  )
}
