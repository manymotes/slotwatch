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

// Default: the user backed out of a (legacy) hosted checkout.
// ?unlock=1: the user backed out of paying the $19 unlock — their watch is unaffected.
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
        <QueryVariant
          param="unlock"
          match={
            <>
              <h1 style={h1}>Nothing was charged</h1>
              <p style={body}>
                Your watch is still running and the opening we found is still listed in your account — unlock it any time from{' '}
                <Link href="/account/" style={{ color: '#e5556f', textDecoration: 'none' }}>/account/</Link>.
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
