'use client'

import { useEffect, useState } from 'react'

const API = 'https://slotwatch.motesmass.workers.dev'
const MAX = 280

// One-line review after a chip-in. Posts to the worker with the signed token from the URL (?t=).
export default function ReviewBox() {
  const [t, setT] = useState('')
  const [text, setText] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  useEffect(() => { setT(new URLSearchParams(window.location.search).get('t') || '') }, [])

  async function send() {
    if (!text.trim()) return
    setState('sending')
    try {
      const r = await fetch(`${API}/api/review`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ t, text: text.trim().slice(0, MAX) }) })
      const d = await r.json()
      if (!d.ok) throw new Error(d.error || 'failed')
      setState('done')
    } catch {
      setState('error')
    }
  }

  if (state === 'done') return <p style={{ color: '#4ade80', fontSize: '0.875rem', margin: 0 }}>Thanks &mdash; we read every one.</p>

  return (
    <div style={{ textAlign: 'left' }}>
      <label htmlFor="review" style={{ display: 'block', color: '#8a8a8a', fontSize: '0.8125rem', marginBottom: '6px' }}>One line on how it went? It helps other Tesla owners decide.</label>
      <textarea
        id="review"
        value={text}
        maxLength={MAX}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        style={{ width: '100%', boxSizing: 'border-box', background: '#141414', border: '1px solid #2a2a2a', borderRadius: '7px', color: '#f0f0f0', padding: '10px 12px', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <span style={{ color: '#4a4a4a', fontSize: '0.75rem' }}>{text.length}/{MAX}</span>
        <button
          type="button"
          onClick={() => void send()}
          disabled={state === 'sending' || !text.trim()}
          style={{ background: '#e31937', color: '#fff', border: 'none', borderRadius: '7px', padding: '8px 16px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit', opacity: !text.trim() ? 0.5 : 1 }}
        >
          {state === 'sending' ? 'Sending…' : 'Send'}
        </button>
      </div>
      {state === 'error' && <p style={{ color: '#f87171', fontSize: '0.8125rem', margin: '8px 0 0' }}>Couldn&rsquo;t send &mdash; try again in a minute.</p>}
    </div>
  )
}
