import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '../../components/SiteNav'
import SiteFooter from '../../components/SiteFooter'

export const metadata: Metadata = {
  title: 'Contact — SlotWatch',
  description: 'Get in touch with the SlotWatch team. Email hello@slotwatcher.app and we’ll get back to you.',
  alternates: { canonical: 'https://slotwatcher.app/contact/' },
  openGraph: {
    title: 'Contact — SlotWatch',
    description: 'Questions about SlotWatch? Email hello@slotwatcher.app.',
    url: 'https://slotwatcher.app/contact/',
    images: [{ url: 'https://slotwatcher.app/og-image.png', width: 1200, height: 630, alt: 'SlotWatch — Tesla Service Appointment Alerts' }],
  },
  twitter: {
    title: 'Contact — SlotWatch',
    description: 'Questions about SlotWatch? Email hello@slotwatcher.app.',
    images: ['https://slotwatcher.app/og-image.png'],
  },
}

export default function ContactPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <SiteNav />
      <section style={{ maxWidth: '640px', margin: '0 auto', padding: '80px 24px' }}>
        <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '18px' }}>
          Contact
        </p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: '20px' }}>
          Get in touch
        </h1>
        <p style={{ fontSize: '1.0625rem', lineHeight: 1.65, color: 'var(--muted)', marginBottom: '32px' }}>
          Questions, feedback, or need help with your subscription? Email us and a real
          person will get back to you — usually within a day.
        </p>

        <a href="mailto:hello@slotwatcher.app" className="sw-card" style={{
          display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '18px 24px',
          textDecoration: 'none', color: 'var(--ink)',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: 'var(--ink)', color: '#fff', borderRadius: '10px', fontSize: '20px' }}>✉</span>
          <span>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Email us</span>
            <span style={{ display: 'block', fontSize: '1.125rem', fontWeight: 700 }}>hello@slotwatcher.app</span>
          </span>
        </a>

        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '40px', lineHeight: 1.6 }}>
          Already a subscriber? You can manage your watched centers, dates, and billing from
          your <Link href="/account/" style={{ color: 'var(--muted)' }}>account dashboard</Link>.
          <br />
          SlotWatch is an independent service and is not affiliated with Tesla, Inc.
        </p>
      </section>
      <SiteFooter />
    </div>
  )
}
