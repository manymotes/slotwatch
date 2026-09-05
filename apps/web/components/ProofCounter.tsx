'use client'

import { useEffect, useState } from 'react'

const API = 'https://slotwatch.motesmass.workers.dev'

type PerCenter = { trtId: number; name: string; openings: number }
type Stats = { ok: boolean; openingsTotal: number; centersWatched: number; since: string; perCenter: PerCenter[] }

// One request per page load, shared by every counter on the page. Resolves to
// null on any failure so callers render nothing rather than a zero or placeholder.
let statsPromise: Promise<Stats | null> | null = null
function loadStats(): Promise<Stats | null> {
  if (!statsPromise) {
    statsPromise = fetch(`${API}/api/stats/public`)
      .then((r) => (r.ok ? (r.json() as Promise<Stats>) : null))
      .then((d) => (d && d.ok && Array.isArray(d.perCenter) ? d : null))
      .catch(() => null)
  }
  return statsPromise
}

// Center names in lib/service-centers.ts and the worker's directory both come from
// Tesla's public find-us data, so a normalised name is a reliable join key.
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

function sinceLabel(iso: string): string {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

const plural = (n: number) => (n === 1 ? 'appointment slot' : 'appointment slots')

type Props = {
  /** Metro mode: only count openings at these centers (by name) and name the metro. */
  centerNames?: string[]
  metro?: string
  style?: React.CSSProperties
}

// Honest proof line built from real slot observations (seen_slots includes the
// activation baseline, so say "tracked", not "openings detected"). Renders an empty reserved line
// (no zeros, no placeholders) when the fetch fails, returns non-ok, or the count is 0.
export default function ProofCounter({ centerNames, metro, style }: Props) {
  const [text, setText] = useState('')

  useEffect(() => {
    let alive = true
    loadStats().then((s) => {
      if (!alive || !s) return
      if (centerNames && metro) {
        const want = new Set(centerNames.map(norm))
        const n = s.perCenter.filter((c) => want.has(norm(c.name))).reduce((sum, c) => sum + (c.openings || 0), 0)
        if (n > 0) setText(`${n.toLocaleString()} ${plural(n)} tracked at ${metro} centers`)
        return
      }
      const total = s.openingsTotal || 0
      if (total <= 0) return
      const across = s.centersWatched > 0 ? ` across ${s.centersWatched.toLocaleString()} service centers` : ''
      const since = sinceLabel(s.since)
      setText(`${total.toLocaleString()} ${plural(total)} tracked${across}${since ? ` since ${since}` : ''}`)
    })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <p aria-hidden={!text} style={{ minHeight: '1.4em', lineHeight: 1.4, margin: 0, fontSize: '0.875rem', color: '#6b6b6b', ...style }}>
      {text}
    </p>
  )
}
