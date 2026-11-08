import Link from 'next/link'
import type { Metadata } from 'next'
import { LogoMark } from '../../../components/Logo'
import QueryVariant from '../../../components/QueryVariant'

export const metadata: Metadata = {
  title: 'Nothing was charged — SlotWatch',
  robots: { index: false },
  alternates: {
    canonical: 'https://slotwatcher.app/checkout/cancel/',
  },
}

const h1: React.CSSProperties = { fontSize: '1.375rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '12px', letterSpacing: '-0.02em' }
const body: React.CSSProperties = { color: 'var(--muted)', fontSize: '0.9375rem', lineHeight: 1.65, marginBottom: '36px' }
const primary: React.CSSProperties = {
  display: 'block',
  background: 'var(--accent)',
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
  color: 'var(--muted)',
  textDecoration: 'none',
  fontSize: '0.875rem',
  padding: '8px',
}

// Default: the user backed out of a (legacy) hosted checkout.
// ?unlock=1: the user backed out of a chip-in checkout — their watch is unaffected.
export default function CheckoutCancelPage() {
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
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '64px' }}>
        <LogoMark size={28} />
        <span style={{ color: 'var(--ink)', fontWeight: 600, fontSize: '0.9375rem' }}>SlotWatch</span>
      </Link>

      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        boxShadow: 'var(--shadow)',
        borderRadius: '14px',
        padding: '48px',
        width: '100%',
        maxWidth: '440px',
        textAlign: 'center',
      }}>
        <QueryVariant
          param="unlock"
          match={
            <>
              <h1 style={h1}>Nothing was charged</h1>
              <p style={body}>
                Your watch is still running and every opening we found is listed in full in your account at{' '}
                <Link href="/account/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>/account/</Link>.
              </p>
              <Link href="/account/" style={primary}>Go to your account</Link>
              <Link href="/" style={secondary}>Back to home</Link>
            </>
          }
          fallback={
            <>
              <h1 style={h1}>No problem — nothing was charged</h1>
              <p style={body}>
                Starting a watch is free and needs no card. Come back whenever you&rsquo;re ready.
              </p>
              <Link href="/start/" style={primary}>Start watching — free</Link>
              <Link href="/" style={secondary}>Back to home</Link>
            </>
          }
        />
      </div>
    </div>
  )
}
