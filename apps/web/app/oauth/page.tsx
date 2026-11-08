'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { LogoMark } from '../../components/Logo'

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

export default function OAuthPage() {
  const [url, setUrl] = useState('')
  const [state, setState] = useState<SubmitState>('idle')
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isValid = url.trim().startsWith('tesla://')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return

    setState('submitting')
    setError(null)

    try {
      const res = await fetch('/api/oauth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callbackUrl: url.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Authorization failed')
      }

      setState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <PageShell>
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          boxShadow: 'var(--shadow)',
          borderRadius: '14px',
          padding: '48px',
          width: '100%',
          maxWidth: '500px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(22,20,15,0.08)',
            border: '1px solid rgba(22,20,15,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '12px', letterSpacing: '-0.02em' }}>
            Account connected
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9375rem', lineHeight: 1.65, marginBottom: '36px' }}>
            SlotWatch is now authorized. Head to your dashboard to set up your first watch.
          </p>
          <Link href="/account/" style={{
            display: 'block',
            background: 'var(--accent)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.9375rem',
            padding: '12px 20px',
            borderRadius: '7px',
          }}>
            Go to dashboard
          </Link>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        boxShadow: 'var(--shadow)',
        borderRadius: '14px',
        padding: '48px',
        width: '100%',
        maxWidth: '500px',
      }}>
        <h1 style={{
          fontSize: '1.375rem',
          fontWeight: 800,
          color: 'var(--ink)',
          marginBottom: '8px',
          letterSpacing: '-0.02em',
        }}>
          Connect your account
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '36px' }}>
          Complete the steps below to authorize SlotWatch.
        </p>

        {/* Step 1 */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: '10px',
          }}>
            Step 1 — Authorize with Tesla
          </p>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/oauth/start`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--line)',
              border: '1px solid var(--line-strong)',
              color: 'var(--ink)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.9375rem',
              padding: '11px 18px',
              borderRadius: '7px',
              transition: 'border-color 0.15s',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Authorize via Tesla login
          </a>
          <p style={{ color: 'var(--muted)', fontSize: '0.8125rem', marginTop: '8px', lineHeight: 1.5 }}>
            This opens Tesla's official login page. We never see your password.
          </p>
        </div>

        {/* Step 2 */}
        <form onSubmit={handleSubmit}>
          <p style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: '10px',
          }}>
            Step 2 — Paste the callback URL
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '14px' }}>
            After authorizing, your browser will redirect to a{' '}
            <code style={{
              background: 'var(--line)',
              border: '1px solid var(--line-strong)',
              borderRadius: '4px',
              padding: '1px 5px',
              fontSize: '0.8125rem',
              color: 'var(--muted)',
              fontFamily: '"SF Mono", "Fira Code", monospace',
            }}>tesla://</code>{' '}
            URL. Copy it from the address bar and paste it here.
          </p>
          <textarea
            ref={textareaRef}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="tesla://callback?code=..."
            aria-label="Tesla callback URL"
            rows={3}
            style={{
              width: '100%',
              background: 'var(--surface-2)',
              border: `1px solid ${error ? 'var(--accent)' : 'var(--line)'}`,
              borderRadius: '7px',
              padding: '12px 14px',
              color: 'var(--ink)',
              fontSize: '0.875rem',
              fontFamily: '"SF Mono", "Fira Code", monospace',
              resize: 'vertical',
              lineHeight: 1.5,
              transition: 'border-color 0.15s',
              outline: 'none',
              marginBottom: '8px',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--muted)' }}
            onBlur={(e) => { e.target.style.borderColor = error ? 'var(--accent)' : 'var(--line)' }}
          />
          {error && (
            <p style={{ color: 'var(--accent)', fontSize: '0.8125rem', marginBottom: '16px' }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={!isValid || state === 'submitting'}
            style={{
              width: '100%',
              background: isValid ? 'var(--accent)' : 'var(--line)',
              color: isValid ? '#fff' : 'var(--muted)',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9375rem',
              padding: '12px 20px',
              borderRadius: '7px',
              cursor: isValid ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s, color 0.15s, opacity 0.15s',
              opacity: state === 'submitting' ? 0.6 : 1,
            }}
          >
            {state === 'submitting' ? 'Connecting...' : 'Connect account'}
          </button>
        </form>
      </div>

      <p style={{ marginTop: '24px', color: 'var(--line-strong)', fontSize: '0.8125rem' }}>
        Need help?{' '}
        <a href="mailto:support@slotwatch.app" style={{ color: 'var(--muted)', textDecoration: 'underline' }}>
          support@slotwatch.app
        </a>
      </p>
    </PageShell>
  )
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '56px' }}>
        <LogoMark size={28} />
        <span style={{ color: 'var(--ink)', fontWeight: 600, fontSize: '0.9375rem' }}>SlotWatch</span>
      </Link>
      {children}
    </div>
  )
}
