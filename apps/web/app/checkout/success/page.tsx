import Link from 'next/link'
import type { Metadata } from 'next'
import { LogoMark } from '../../../components/Logo'
import QueryVariant from '../../../components/QueryVariant'
import ReviewBox from '../../../components/ReviewBox'

export const metadata: Metadata = {
  title: 'You’re all set — SlotWatch',
  robots: { index: false },
  alternates: {
    canonical: 'https://slotwatcher.app/checkout/success/',
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

// Default: a new watch was just created (no card, nothing charged).
// ?unlocked=1: Stripe sent the user back after paying the legacy unlock (old emails still link here).
// ?thanks=1&t=TOKEN: Stripe sent the user back after a pay-what-it-was-worth chip-in.
export default function CheckoutSuccessPage() {
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
        <QueryVariant
          param="thanks"
          match={
            <>
              <h1 style={h1}>Thank you — that keeps SlotWatch running</h1>
              <p style={body}>
                Your watch keeps running until your appointment date, and every alert arrives in full.
              </p>
              <div style={{ marginBottom: '28px' }}><ReviewBox /></div>
              <Link href="/account/" style={primary}>View your watch</Link>
              <Link href="/" style={secondary}>Back to home</Link>
            </>
          }
          fallback={
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
                No card, no fee. The moment an earlier opening appears we&rsquo;ll email you the center and the exact date and time.
              </p>
              <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '14px 16px', margin: '-16px 0 28px', textAlign: 'left', fontSize: '0.875rem', lineHeight: 1.55, color: 'var(--ink-2)' }}>
                <strong style={{ color: 'var(--ink)' }}>How SlotWatch stays free.</strong> If an alert gets you an earlier appointment, we&rsquo;ll ask once what it was worth: <strong>$9</strong>, <strong>$19</strong> or <strong>$49</strong>, or nothing. That&rsquo;s the only time money comes up.
                <a href="https://slotwatch.motesmass.workers.dev/api/thanks/go" style={{ display: 'block', marginTop: 8, color: 'var(--muted)', fontSize: '0.8125rem' }}>Want to chip in now anyway?</a>
              </div>
              <Link href="/" style={primary}>Done</Link>
              <Link href="/account/" style={secondary}>View your watch</Link>
            </>
          }
        />
          }
        />
      </div>
    </div>
  )
}
