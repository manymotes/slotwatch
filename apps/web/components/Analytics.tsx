'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const API = 'https://slotwatch.motesmass.workers.dev'

// Lightweight, cookieless first-party analytics. Sends a page view (path,
// referrer, and a random localStorage session id) on every route change.
export default function Analytics() {
  const pathname = usePathname()
  useEffect(() => {
    try {
      let s = localStorage.getItem('sw_sess')
      if (!s) { s = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('sw_sess', s) }
      fetch(`${API}/api/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pathname, ref: document.referrer || '', session: s }),
        keepalive: true,
      }).catch(() => {})
    } catch { /* no-op */ }
  }, [pathname])
  return null
}
