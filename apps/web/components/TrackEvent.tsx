'use client'

import { useEffect, useRef } from 'react'
import { track } from './Analytics'

// Fires a single conversion event when mounted (e.g. <TrackEvent event="start_view" />).
// Lets server-rendered pages record a view without becoming client components.
export default function TrackEvent({ event }: { event: string }) {
  const fired = useRef(false)
  useEffect(() => {
    if (fired.current) return
    fired.current = true
    track(event)
  }, [event])
  return null
}
