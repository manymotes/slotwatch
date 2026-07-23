'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LogoMark } from '../../components/Logo'

type CheckoutState = 'idle' | 'loading' | 'error'

export default function CheckoutPage() {
  const [state, setState] = useState<CheckoutState>('idle')
  const [error, setError] = useState<string | null>(null)

  const startCheckout = async () => {
    setState('loading')
    setError(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          successUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: `${window.location.origin}/checkout/cancel`,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Could not create checkout session')
      }

      const { url } = await res.json()
      if (!url) throw new Error('No checkout URL returned')
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setState('error')
    }
  }

  // Auto-start on mount
  useEffect(() => {
    startCheckout()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080808',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '64px' }}>
        <LogoMark size={28} />
        <span style={{ color: '#f0f0f0', fontWeight: 600, fontSize: '0.9375rem' }}>SlotWatch</span>
      </Link>

      <div style={{
        background: '#0d0d0d',
        border: '1px solid #1e1e1e',
        borderRadius: '14px',
        padding: '48px',
        width: '100%',
        maxWidth: '440px',
        textAlign: 'center',
      }}>
        {state === 'loading' && (
          <>
            <Spinner />
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f0f0f0', marginTop: '24px', marginBottom: '8px', letterSpacing: '-0.02em' }}>
              Preparing checkout
            </h1>
            <p style={{ color: '#6b6b6b', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Redirecting to Stripe for secure payment processing...
            </p>
          </>
        )}

        {state === 'error' && (
          <>
            <div style={{ color: '#e31937', marginBottom: '20px', fontSize: '32px' }}>!</div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f0f0f0', marginBottom: '12px', letterSpacing: '-0.02em' }}>
              Checkout failed
            </h1>
            <p style={{ color: '#6b6b6b', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '32px' }}>
              {error ?? 'An unexpected error occurred. Please try again.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={startCheckout}
                style={{
                  background: '#e31937',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  padding: '12px 20px',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s',
                  width: '100%',
                }}
              >
                Try again
              </button>
              <Link href="/" style={{
                display: 'block',
                color: '#6b6b6b',
                textDecoration: 'none',
                fontSize: '0.875rem',
                padding: '8px',
              }}>
                Back to home
              </Link>
            </div>
          </>
        )}

        {state === 'idle' && (
          <>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f0f0', marginBottom: '12px', letterSpacing: '-0.02em' }}>
              SlotWatch Pro
            </h1>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'center',
              gap: '4px',
              marginBottom: '8px',
            }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f0f0f0', letterSpacing: '-0.03em' }}>$9.99</span>
              <span style={{ color: '#6b6b6b', fontSize: '0.875rem' }}>/month</span>
            </div>
            <p style={{ color: '#6b6b6b', fontSize: '0.875rem', marginBottom: '32px' }}>
              Cancel anytime. No annual contracts.
            </p>
            <button
              onClick={startCheckout}
              style={{
                background: '#e31937',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                padding: '14px 28px',
                borderRadius: '8px',
                cursor: 'pointer',
                width: '100%',
                transition: 'opacity 0.15s',
              }}
            >
              Continue to payment
            </button>
          </>
        )}
      </div>

      <p style={{ marginTop: '32px', color: '#3a3a3a', fontSize: '0.8125rem', textAlign: 'center' }}>
        Secured by Stripe. Not affiliated with Tesla, Inc.
      </p>
    </div>
  )
}

function Spinner() {
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        width: '40px',
        height: '40px',
        margin: '0 auto',
        border: '2px solid #1e1e1e',
        borderTopColor: '#e31937',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
