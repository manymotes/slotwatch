import type { Metadata } from 'next'
import SiteNav from '../../components/SiteNav'
import SiteFooter from '../../components/SiteFooter'
import LoginForm from '../../components/LoginForm'

export const metadata: Metadata = {
  title: 'Log in — SlotWatch',
  description: 'Log in to manage your SlotWatch alerts.',
  robots: { index: false },
  alternates: { canonical: 'https://slotwatcher.app/login/' },
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <SiteNav />
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '72px 24px' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: '10px' }}>
          Log in to your account
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1rem', marginBottom: '8px' }}>
          Manage the centers you watch, adjust your dates, or cancel — no password needed.
        </p>
        <LoginForm />
      </section>
      <SiteFooter />
    </div>
  )
}
