import type { Metadata } from 'next'
import SiteNav from '../../components/SiteNav'
import SiteFooter from '../../components/SiteFooter'
import AccountDashboard from '../../components/AccountDashboard'

export const metadata: Metadata = {
  title: 'Your account — SlotWatch',
  description: 'Manage your SlotWatch alerts.',
  robots: { index: false },
  alternates: { canonical: 'https://slotwatcher.app/account/' },
}

export default function AccountPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <SiteNav />
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '56px 24px' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: '24px' }}>
          Your account
        </h1>
        <AccountDashboard />
      </section>
      <SiteFooter />
    </div>
  )
}
