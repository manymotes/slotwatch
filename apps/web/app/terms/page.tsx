import type { Metadata } from 'next'
import { Logo } from '../../components/Logo'
import Markdown from '../../components/Markdown'
import { TERMS_MD } from '../../lib/content'

export const metadata: Metadata = {
  title: 'Terms of Service — SlotWatch',
  description: 'SlotWatch Terms of Service.',
  alternates: { canonical: 'https://slotwatcher.app/terms' },
}

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      <nav style={{ borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: '56px' }}>
          <Logo size={28} />
        </div>
      </nav>
      <section style={{ maxWidth: '760px', margin: '0 auto', padding: '56px 24px 96px' }}>
        <Markdown md={TERMS_MD} />
      </section>
    </div>
  )
}
