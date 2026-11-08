import Link from 'next/link'
import type { Metadata } from 'next'
import SignupForm from '../../components/SignupForm'
import CheckEarliest from '../../components/CheckEarliest'
import TrackEvent from '../../components/TrackEvent'
import SiteNav from '../../components/SiteNav'
import SiteFooter from '../../components/SiteFooter'

export const metadata: Metadata = {
  title: 'Start watching — SlotWatch',
  description: 'Pick your Tesla service center and get emailed when an earlier appointment opens. No Tesla login required.',
  alternates: {
    canonical: 'https://slotwatcher.app/start/',
  },
  openGraph: {
    title: 'Start watching — SlotWatch',
    description: 'Pick your Tesla service center and get emailed when an earlier appointment opens. No Tesla login required.',
    url: 'https://slotwatcher.app/start/',
    images: [{ url: 'https://slotwatcher.app/og-image.png', width: 1200, height: 630, alt: 'SlotWatch — Tesla Service Appointment Alerts' }],
  },
  twitter: {
    title: 'Start watching — SlotWatch',
    description: 'Pick your Tesla service center and get emailed when an earlier appointment opens. No Tesla login required.',
    images: ['https://slotwatcher.app/og-image.png'],
  },
}

export default function StartPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <TrackEvent event="start_view" />
      <SiteNav />

      <section style={{ maxWidth: '560px', margin: '0 auto', padding: '64px 24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '10px' }}>
          Start watching for an earlier slot
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '8px' }}>
          Tell us your service center, your current appointment date, and your email. We check roughly every 5 minutes and email you the moment an earlier appointment opens — then you reschedule in the Tesla app.
        </p>
        {/* Shared / metro-page links arrive as /start/?city=… — show the live earliest-slot result for that city first. Renders nothing without a city param. */}
        <div style={{ margin: '24px 0 8px' }}>
          <CheckEarliest autoRunFromQuery ctaHref="#watch" />
        </div>
        <div id="watch">
          <SignupForm />
        </div>
      </section>
      <SiteFooter />
    </div>
  )
}
