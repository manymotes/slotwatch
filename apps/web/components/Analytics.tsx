'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const API = 'https://slotwatch.motesmass.workers.dev'

// First-touch UTM attribution, persisted in localStorage and attached to every
// pageview / event so conversions can be tied back to the campaign that landed them.
export type Utm = { source?: string; medium?: string; campaign?: string; content?: string; term?: string }
const UTM_KEYS = ['source', 'medium', 'campaign', 'content', 'term'] as const

function sessionId(): string {
  let s = localStorage.getItem('sw_sess')
  if (!s) { s = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('sw_sess', s) }
  return s
}

// Persist utm_* params from the current URL — first touch only, never overwrite.
function captureUtm() {
  try {
    if (localStorage.getItem('sw_utm')) return
    const p = new URLSearchParams(window.location.search)
    const utm: Utm = {}
    for (const k of UTM_KEYS) { const v = p.get(`utm_${k}`); if (v) utm[k] = v.slice(0, 200) }
    if (Object.keys(utm).length) localStorage.setItem('sw_utm', JSON.stringify(utm))
  } catch { /* no-op */ }
}

/** The stored first-touch UTM object, or undefined if the visitor arrived without one. */
export function getUtm(): Utm | undefined {
  try {
    const raw = localStorage.getItem('sw_utm')
    return raw ? (JSON.parse(raw) as Utm) : undefined
  } catch { return undefined }
}

function post(body: Record<string, unknown>) {
  fetch(`${API}/api/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {})
}

/** Fire a named conversion event (e.g. 'start_view', 'checkout_started'). Fire-and-forget. */
export function track(event: string) {
  try {
    post({ path: window.location.pathname, session: sessionId(), event, utm: getUtm() })
  } catch { /* no-op */ }
}

// Lightweight, cookieless first-party analytics. Sends a page view (path,
// referrer, a random localStorage session id, and first-touch UTM) on every route change.
export default function Analytics() {
  const pathname = usePathname()
  useEffect(() => {
    try {
      captureUtm()
      post({ path: pathname, ref: document.referrer || '', session: sessionId(), utm: getUtm() })
    } catch { /* no-op */ }
  }, [pathname])
  return null
}
