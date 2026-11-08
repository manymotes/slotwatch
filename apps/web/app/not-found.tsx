import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page not found — SlotWatch',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      textAlign: 'center',
    }}>
      <p style={{
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--muted)',
        marginBottom: '20px',
      }}>
        404
      </p>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: 800,
        color: 'var(--ink)',
        letterSpacing: '-0.03em',
        marginBottom: '12px',
      }}>
        Page not found
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.9375rem', marginBottom: '36px' }}>
        That page doesn't exist.
      </p>
      <Link href="/" className="sw-btn sw-btn-primary">
        Back to home
      </Link>
    </div>
  )
}
