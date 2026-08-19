import type { Metadata } from 'next'
import { Logo } from '../../components/Logo'
import LoginForm from '../../components/LoginForm'

export const metadata: Metadata = {
  title: 'Log in — SlotWatch',
  description: 'Log in to manage your SlotWatch alerts.',
  robots: { index: false },
  alternates: { canonical: 'https://slotwatcher.app/login/' },
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      <nav style={{ borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: '56px' }}>
          <Logo size={28} />
        </div>
      </nav>
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '72px 24px' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f0f0', marginBottom: '10px' }}>
          Log in to your account
        </h1>
        <p style={{ color: '#8a8a8a', fontSize: '1rem', marginBottom: '8px' }}>
          Manage the centers you watch, adjust your dates, or cancel — no password needed.
        </p>
        <LoginForm />
      </section>
    </div>
  )
}
