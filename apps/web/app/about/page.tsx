import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '../../components/Logo'

export const metadata: Metadata = {
  title: 'About SlotWatch — Earlier Tesla Service Appointment Alerts',
  description: 'SlotWatch is an independent service that monitors Tesla service centers for earlier appointment openings and emails you when one appears. No Tesla login. $24 one-time.',
  alternates: { canonical: 'https://slotwatcher.app/about' },
  openGraph: {
    title: 'About SlotWatch',
    description: 'An independent service that watches Tesla service centers for earlier appointment openings and emails you when one appears.',
    url: 'https://slotwatcher.app/about',
  },
  twitter: {
    title: 'About SlotWatch',
    description: 'An independent service that watches Tesla service centers for earlier appointment openings and emails you when one appears.',
  },
}

const facts: [string, string][] = [
  ['What it is', 'SlotWatch is an independent web service that monitors Tesla service centers for earlier appointment openings and emails you the moment one appears, so you can reschedule in the Tesla app.'],
  ['How it works', 'You tell SlotWatch which US service centers to watch (up to 3) and your date range. It checks availability roughly every 15 minutes and emails you when a new, earlier slot opens. You reschedule it yourself in the official Tesla app.'],
  ['Alerts', 'Email only — no SMS.'],
  ['No Tesla login', 'SlotWatch never asks for or stores your Tesla credentials. It watches availability and emails you; your Tesla account stays entirely yours.'],
  ['Pricing', 'A one-time $24 for a 60-day watch of up to 3 centers, with a money-back guarantee if no earlier slot opens. Optional $6.99/month to keep watching after 60 days. No subscription trap.'],
  ['Open source', 'A free, self-host version is available on GitHub for anyone who prefers to run it themselves.'],
  ['Independent', 'SlotWatch is not affiliated with, endorsed by, or connected to Tesla, Inc. “Tesla” is a trademark of Tesla, Inc.'],
  ['Contact', 'hello@slotwatcher.app'],
]

export default function AboutPage() {
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SlotWatch',
    url: 'https://slotwatcher.app',
    email: 'hello@slotwatcher.app',
    description: 'SlotWatch monitors Tesla service centers for earlier appointment openings and emails you when one appears. Independent; not affiliated with Tesla, Inc.',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
      <nav style={{ borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
          <Logo size={28} />
          <Link href="/start" style={{ background: '#e31937', color: '#fff', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600, padding: '7px 14px', borderRadius: '6px' }}>Start watching</Link>
        </div>
      </nav>

      <section style={{ maxWidth: '720px', margin: '0 auto', padding: '64px 24px 96px' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f0f0', marginBottom: '16px' }}>
          About SlotWatch
        </h1>
        <p style={{ color: '#8a8a8a', fontSize: '1.0625rem', lineHeight: 1.65, marginBottom: '40px' }}>
          SlotWatch watches Tesla service centers for earlier appointment openings and emails you the moment one appears — so you can reschedule in the Tesla app before the slot is taken.
        </p>

        <dl style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#1e1e1e', borderRadius: '12px', overflow: 'hidden' }}>
          {facts.map(([k, v]) => (
            <div key={k} style={{ background: '#0d0d0d', padding: '18px 22px' }}>
              <dt style={{ color: '#e5556f', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{k}</dt>
              <dd style={{ color: '#c8c8c8', fontSize: '0.9375rem', lineHeight: 1.6, margin: 0 }}>{v}</dd>
            </div>
          ))}
        </dl>

        <div style={{ marginTop: '36px' }}>
          <Link href="/start" style={{ display: 'inline-block', background: '#e31937', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.9375rem', padding: '13px 26px', borderRadius: '8px' }}>
            Start watching — $24 →
          </Link>
        </div>
      </section>
    </div>
  )
}
