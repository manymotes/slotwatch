'use client'

import { useEffect, useState } from 'react'

const API = 'https://slotwatch.motesmass.workers.dev'

// /checkout/success/?unlocked=1&session_id=cs_… — Stripe sends the user here after the $19
// unlock. Instead of trusting that the webhook already ran, confirm the payment with the worker
// (which checks the session straight from Stripe and reveals/emails if the webhook hasn't yet).
// So the page can only say "the times are in your inbox" once that is actually true.
type State = { kind: 'checking' } | { kind: 'done'; email: string | null } | { kind: 'unpaid' } | { kind: 'error' }

export default function UnlockStatus() {
  const [st, setSt] = useState<State>({ kind: 'checking' })
  useEffect(() => {
    const sid = new URLSearchParams(window.location.search).get('session_id')
    if (!sid) { setSt({ kind: 'done', email: null }); return } // older link without a session id
    let tries = 0
    const run = async () => {
      tries++
      try {
        const r = await fetch(`${API}/api/unlock/confirm?session_id=${encodeURIComponent(sid)}`)
        const d = await r.json()
        if (d.ok && d.paid) { setSt({ kind: 'done', email: d.email || null }); return }
        if (r.status === 402) { setSt({ kind: 'unpaid' }); return }
        throw new Error(d.error || `HTTP ${r.status}`)
      } catch {
        if (tries < 3) setTimeout(run, 2500 * tries)
        else setSt({ kind: 'error' })
      }
    }
    run()
  }, [])

  const h1: React.CSSProperties = { fontSize: '1.375rem', fontWeight: 800, color: '#f0f0f0', marginBottom: '12px', letterSpacing: '-0.02em' }
  const body: React.CSSProperties = { color: '#6b6b6b', fontSize: '0.9375rem', lineHeight: 1.65, marginBottom: '36px' }

  if (st.kind === 'checking') return (
    <>
      <h1 style={h1}>Confirming your payment…</h1>
      <p style={body}>One moment — we&rsquo;re unlocking your alerts.</p>
    </>
  )
  if (st.kind === 'done') return (
    <>
      <h1 style={h1}>Unlocked — the exact times are in your inbox</h1>
      <p style={body}>
        {st.email ? <>Sent to <strong style={{ color: '#c8c8c8' }}>{st.email}</strong>. </> : null}
        Every future alert for this watch arrives in full. Open the Tesla app → Service → Reschedule to grab it.
      </p>
    </>
  )
  if (st.kind === 'unpaid') return (
    <>
      <h1 style={h1}>Payment not completed</h1>
      <p style={body}>Stripe hasn&rsquo;t confirmed this payment. Nothing was charged. Open the unlock link from your alert email to try again.</p>
    </>
  )
  return (
    <>
      <h1 style={h1}>Payment received — unlocking shortly</h1>
      <p style={body}>
        We couldn&rsquo;t reach our server just now. Your alerts are unlocked automatically within the hour and the times are emailed to you.
        If nothing arrives, reply to any SlotWatch email and we&rsquo;ll sort it the same day.
      </p>
    </>
  )
}
