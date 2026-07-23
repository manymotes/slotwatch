import Link from 'next/link'
import type { Metadata } from 'next'
import { LogoMark } from '../../../components/Logo'

export const metadata: Metadata = {
  title: 'Payment cancelled — SlotWatch',
  robots: { index: false },
}

export default function CheckoutCancelPage() {
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
        <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#f0f0f0', marginBottom: '12px', letterSpacing: '-0.02em' }}>
          Payment cancelled
        </h1>
        <p style={{ color: '#6b6b6b', fontSize: '0.9375rem', lineHeight: 1.65, marginBottom: '36px' }}>
          No charge was made. You can try again whenever you're ready.
        </p>
        <Link href="/checkout" style={{
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
          Try again
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
