import Link from 'next/link'
import type { Metadata } from 'next'
import { LogoMark } from '../../components/Logo'
import ThanksForm from '../../components/ThanksForm'

export const metadata: Metadata = {
  title: 'Did it work? — SlotWatch',
  robots: { index: false },
  alternates: {
    canonical: 'https://slotwatcher.app/thanks/',
  },
}

// Linked from the "did you book it?" follow-up email: /thanks/?t=TOKEN&booked=yes|no.
// Static export — the token and answer are read client-side by ThanksForm.
export default function ThanksPage() {
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
        padding: '40px 32px',
        width: '100%',
        maxWidth: '440px',
        textAlign: 'center',
      }}>
        <ThanksForm />
      </div>
    </div>
  )
}
