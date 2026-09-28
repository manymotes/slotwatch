'use client'

import { useEffect, useState, type ReactNode } from 'react'

// Renders `fallback` on the server and first paint, then swaps to `match` if the
// URL has `?<param>=1` (static export: query params are client-side only).
// Lets server-rendered pages with metadata vary their copy without becoming
// client components — e.g. /checkout/success/?unlocked=1.
export default function QueryVariant({ param, match, fallback }: { param: string; match: ReactNode; fallback: ReactNode }) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    setOn(new URLSearchParams(window.location.search).get(param) === '1')
  }, [param])
  return <>{on ? match : fallback}</>
}
