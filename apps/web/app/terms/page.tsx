import type { Metadata } from 'next'
import SiteNav from '../../components/SiteNav'
import SiteFooter from '../../components/SiteFooter'
import Markdown from '../../components/Markdown'
import { TERMS_MD } from '../../lib/content'

export const metadata: Metadata = {
  title: 'Terms of Service — SlotWatch',
  description: 'SlotWatch Terms of Service.',
  alternates: { canonical: 'https://slotwatcher.app/terms/' },
  openGraph: {
    title: 'Terms of Service — SlotWatch',
    description: 'SlotWatch Terms of Service.',
    url: 'https://slotwatcher.app/terms/',
    images: [{ url: 'https://slotwatcher.app/og-image.png', width: 1200, height: 630, alt: 'SlotWatch — Tesla Service Appointment Alerts' }],
  },
  twitter: {
    title: 'Terms of Service — SlotWatch',
    description: 'SlotWatch Terms of Service.',
    images: ['https://slotwatcher.app/og-image.png'],
  },
}

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <SiteNav />
      <section style={{ maxWidth: '760px', margin: '0 auto', padding: '56px 24px 96px' }}>
        <Markdown md={TERMS_MD} />
      </section>
      <SiteFooter />
    </div>
  )
}
