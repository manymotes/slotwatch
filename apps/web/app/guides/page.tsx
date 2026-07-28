import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '../../components/Logo'
import { GUIDES } from '../../lib/guides'

export const metadata: Metadata = {
  title: 'Tesla Service Guides — SlotWatch',
  description: 'Guides on getting an earlier Tesla service appointment: wait times, cancellation slots, rescheduling, and how to beat the queue.',
  alternates: { canonical: 'https://slotwatcher.app/guides' },
  openGraph: {
    title: 'Tesla Service Guides — SlotWatch',
    description: 'How to get an earlier Tesla service appointment — wait times, cancellations, and rescheduling.',
    url: 'https://slotwatcher.app/guides',
  },
  twitter: {
    title: 'Tesla Service Guides — SlotWatch',
    description: 'How to get an earlier Tesla service appointment — wait times, cancellations, and rescheduling.',
  },
}

export default function GuidesIndex() {
  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      <nav style={{ borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
          <Logo size={28} />
          <Link href="/start" style={{ background: '#e31937', color: '#fff', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600, padding: '7px 14px', borderRadius: '6px' }}>Start watching</Link>
        </div>
      </nav>

      <section style={{ maxWidth: '760px', margin: '0 auto', padding: '72px 24px 96px' }}>
        <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.14em', color: '#e31937', textTransform: 'uppercase', marginBottom: '16px' }}>Guides</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f0f0', marginBottom: '16px' }}>
          Get seen sooner at Tesla service
        </h1>
        <p style={{ color: '#8a8a8a', fontSize: '1.0625rem', lineHeight: 1.6, marginBottom: '40px' }}>
          Practical guides on beating the Tesla service queue — how earlier slots open up, and how to catch them.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#1e1e1e', borderRadius: '12px', overflow: 'hidden' }}>
          {GUIDES.map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} style={{ display: 'block', background: '#0d0d0d', padding: '22px 24px', textDecoration: 'none' }}>
              <span style={{ display: 'block', color: '#f0f0f0', fontSize: '1.0625rem', fontWeight: 600, marginBottom: '6px' }}>{g.title}</span>
              <span style={{ display: 'block', color: '#8a8a8a', fontSize: '0.9375rem', lineHeight: 1.55 }}>{g.description}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
