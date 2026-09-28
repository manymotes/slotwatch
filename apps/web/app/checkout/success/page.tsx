import Link from 'next/link'
import type { Metadata } from 'next'
import { LogoMark } from '../../../components/Logo'
import QueryVariant from '../../../components/QueryVariant'

export const metadata: Metadata = {
  title: 'You’re all set — SlotWatch',
  robots: { index: false },
  alternates: {
    canonical: 'https://slotwatcher.app/checkout/success/',
  },
}

const h1: React.CSSProperties = { fontSize: '1.375rem', fontWeight: 800, color: '#f0f0f0', marginBottom: '12px', letterSpacing: '-0.02em' }
const body: React.CSSProperties = { color: '#6b6b6b', fontSize: '0.9375rem', lineHeight: 1.65, marginBottom: '36px' }
const primary: React.CSSProperties = {
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
}
const secondary: React.CSSProperties = {
  display: 'block',
  color: '#3a3a3a',
  textDecoration: 'none',
  fontSize: '0.875rem',
  padding: '8px',
}

// Default: a new watch was just created (no card, nothing charged).
// ?unlocked=1: Stripe sent the user back after paying the $19 unlock.
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
        <QueryVariant
          param="unlocked"
          match={
            <>
              <h1 style={h1}>Unlocked — the exact times are in your inbox</h1>
              <p style={body}>
                Every future alert for this watch arrives in full. Open the Tesla app → Service → Reschedule to grab it.
              </p>
              <Link href="/account/" style={primary}>View your watch</Link>
              <Link href="/" style={secondary}>Back to home</Link>
            </>
          }
          fallback={
            <>
              <h1 style={h1}>You&rsquo;re all set — we&rsquo;re watching</h1>
              <p style={body}>
                No card needed. When an opening at least 3 days before your appointment appears, we&rsquo;ll email you; you can unlock the exact time for $19.
              </p>
              <Link href="/" style={primary}>Done</Link>
              <Link href="/account/" style={secondary}>View your watch</Link>
            </>
          }
        />
      </div>
    </div>
  )
}
