import type { Metadata } from 'next'
import { Logo } from '../../components/Logo'
import AccountDashboard from '../../components/AccountDashboard'

export const metadata: Metadata = {
  title: 'Your account — SlotWatch',
  description: 'Manage your SlotWatch alerts.',
  robots: { index: false },
  alternates: { canonical: 'https://slotwatcher.app/account' },
}

export default function AccountPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      <nav style={{ borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: '56px' }}>
          <Logo size={28} />
        </div>
      </nav>
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '56px 24px' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f0f0', marginBottom: '24px' }}>
          Your account
        </h1>
        <AccountDashboard />
      </section>
    </div>
  )
}
