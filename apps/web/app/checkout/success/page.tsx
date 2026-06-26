import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Payment successful — SlotWatch',
  robots: { index: false },
}

export default function CheckoutSuccessPage() {
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
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '64px' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          background: '#e31937',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: 800,
          color: '#fff',
        }}>S</span>
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
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'rgba(227, 25, 55, 0.1)',
          border: '1px solid rgba(227, 25, 55, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e31937" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#f0f0f0', marginBottom: '12px', letterSpacing: '-0.02em' }}>
          You're all set
        </h1>
        <p style={{ color: '#6b6b6b', fontSize: '0.9375rem', lineHeight: 1.65, marginBottom: '36px' }}>
          Payment confirmed. Connect your account to start watching for open slots.
        </p>
        <Link href="/oauth" style={{
          display: 'block',
          background: '#e31937',
          color: '#fff',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: '0.9375rem',
          padding: '12px 20px',
          borderRadius: '7px',
          transition: 'opacity 0.15s',
          marginBottom: '12px',
        }}>
          Connect your account
        </Link>
        <Link href="/" style={{
          display: 'block',
          color: '#3a3a3a',
          textDecoration: 'none',
          fontSize: '0.875rem',
          padding: '8px',
        }}>
          Back to home
        </Link>
      </div>
    </div>
  )
}
