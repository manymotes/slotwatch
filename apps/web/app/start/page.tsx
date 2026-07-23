import Link from 'next/link'
import type { Metadata } from 'next'
import SignupForm from '../../components/SignupForm'
import { Logo } from '../../components/Logo'

export const metadata: Metadata = {
  title: 'Start watching — SlotWatch',
  description: 'Pick your Tesla service center and get emailed when an earlier appointment opens. No Tesla login required.',
}

export default function StartPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      <nav style={{ borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: '56px' }}>
          <Logo size={28} />
        </div>
      </nav>

      <section style={{ maxWidth: '560px', margin: '0 auto', padding: '64px 24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f0f0f0', letterSpacing: '-0.02em', marginBottom: '10px' }}>
          Start watching for an earlier slot
        </h1>
        <p style={{ color: '#8a8a8a', fontSize: '1rem', lineHeight: 1.6, marginBottom: '8px' }}>
          Tell us your service center and email. We check every 30 minutes and email you the moment an earlier appointment opens — then you reschedule in the Tesla app.
        </p>
        <SignupForm />
      </section>
    </div>
  )
}
