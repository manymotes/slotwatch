import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page not found — SlotWatch',
}

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#080808',
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
        color: '#3a3a3a',
        marginBottom: '20px',
      }}>
        404
      </p>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: 800,
        color: '#f0f0f0',
        letterSpacing: '-0.03em',
        marginBottom: '12px',
      }}>
        Page not found
      </h1>
      <p style={{ color: '#6b6b6b', fontSize: '0.9375rem', marginBottom: '36px' }}>
        That page doesn't exist.
      </p>
      <Link href="/" style={{
        background: '#e31937',
        color: '#fff',
        textDecoration: 'none',
        fontWeight: 700,
        fontSize: '0.9375rem',
        padding: '12px 24px',
        borderRadius: '7px',
      }}>
        Back to home
      </Link>
    </div>
  )
}
