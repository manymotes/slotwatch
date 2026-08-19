import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '../../components/Logo'

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
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      <nav style={{ borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
          <Logo size={28} />
          <Link href="/login/" style={{ color: '#8a8a8a', textDecoration: 'none', fontSize: '0.875rem' }}>Log in</Link>
        </div>
      </nav>
      <section style={{ maxWidth: '640px', margin: '0 auto', padding: '80px 24px' }}>
        <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.14em', color: '#e31937', textTransform: 'uppercase', marginBottom: '18px' }}>
          Contact
        </p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#f0f0f0', marginBottom: '20px' }}>
          Get in touch
        </h1>
        <p style={{ fontSize: '1.0625rem', lineHeight: 1.65, color: '#8a8a8a', marginBottom: '32px' }}>
          Questions, feedback, or need help with your subscription? Email us and a real
          person will get back to you — usually within a day.
        </p>

        <a href="mailto:hello@slotwatcher.app" style={{
          display: 'inline-flex', alignItems: 'center', gap: '12px', background: '#111',
          border: '1px solid #2a2a2a', borderRadius: '12px', padding: '18px 24px',
          textDecoration: 'none', color: '#f0f0f0',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: '#e31937', borderRadius: '10px', fontSize: '20px' }}>✉</span>
          <span>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#8a8a8a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Email us</span>
            <span style={{ display: 'block', fontSize: '1.125rem', fontWeight: 700 }}>hello@slotwatcher.app</span>
          </span>
        </a>

        <p style={{ color: '#5a5a5a', fontSize: '0.875rem', marginTop: '40px', lineHeight: 1.6 }}>
          Already a subscriber? You can manage your watched centers, dates, and billing from
          your <Link href="/account/" style={{ color: '#8a8a8a' }}>account dashboard</Link>.
          <br />
          SlotWatch is an independent service and is not affiliated with Tesla, Inc.
        </p>
      </section>
    </div>
  )
}
