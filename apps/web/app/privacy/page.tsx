import type { Metadata } from 'next'
import SiteNav from '../../components/SiteNav'
import SiteFooter from '../../components/SiteFooter'
import Markdown from '../../components/Markdown'
import { PRIVACY_MD } from '../../lib/content'

export const metadata: Metadata = {
  title: 'Privacy Policy — SlotWatch',
  description: 'How SlotWatch handles your data.',
  alternates: { canonical: 'https://slotwatcher.app/privacy/' },
  openGraph: {
    title: 'Privacy Policy — SlotWatch',
    description: 'How SlotWatch handles your data.',
    url: 'https://slotwatcher.app/privacy/',
    images: [{ url: 'https://slotwatcher.app/og-image.png', width: 1200, height: 630, alt: 'SlotWatch — Tesla Service Appointment Alerts' }],
  },
  twitter: {
    title: 'Privacy Policy — SlotWatch',
    description: 'How SlotWatch handles your data.',
    images: ['https://slotwatcher.app/og-image.png'],
  },
}

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <SiteNav />
      <section style={{ maxWidth: '760px', margin: '0 auto', padding: '56px 24px 96px' }}>
        <Markdown md={PRIVACY_MD} />
      </section>
      <SiteFooter />
    </div>
  )
}
