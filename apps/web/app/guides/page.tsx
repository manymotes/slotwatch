import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '../../components/SiteNav'
import SiteFooter from '../../components/SiteFooter'
import { GUIDES } from '../../lib/guides'

export const metadata: Metadata = {
  title: 'Tesla Service Guides — SlotWatch',
  description: 'Guides on getting an earlier Tesla service appointment: wait times, cancellation slots, rescheduling, and how to beat the queue.',
  alternates: { canonical: 'https://slotwatcher.app/guides/' },
  openGraph: {
    title: 'Tesla Service Guides — SlotWatch',
    description: 'How to get an earlier Tesla service appointment — wait times, cancellations, and rescheduling.',
    url: 'https://slotwatcher.app/guides/',
    images: [{ url: 'https://slotwatcher.app/og-image.png', width: 1200, height: 630, alt: 'SlotWatch — Tesla Service Appointment Alerts' }],
  },
  twitter: {
    title: 'Tesla Service Guides — SlotWatch',
    description: 'How to get an earlier Tesla service appointment — wait times, cancellations, and rescheduling.',
    images: ['https://slotwatcher.app/og-image.png'],
  },
}

export default function GuidesIndex() {
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Tesla Service Guides — SlotWatch',
    url: 'https://slotwatcher.app/guides/',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: GUIDES.map((g, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://slotwatcher.app/guides/${g.slug}/`,
        name: g.title,
      })),
    },
  })

  const breadcrumbSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://slotwatcher.app/' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://slotwatcher.app/guides/' },
    ],
  })

  return (
    <div style={{ minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />
      <SiteNav />

      <section style={{ maxWidth: '760px', margin: '0 auto', padding: '72px 24px 96px' }}>
        <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '16px' }}>Guides</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: '16px' }}>
          Get seen sooner at Tesla service
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.0625rem', lineHeight: 1.6, marginBottom: '40px' }}>
          Practical guides on beating the Tesla service queue — how earlier slots open up, and how to catch them.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--line)', borderRadius: '12px', overflow: 'hidden' }}>
          {GUIDES.map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}/`} style={{ display: 'block', background: 'var(--surface)', padding: '22px 24px', textDecoration: 'none' }}>
              <span style={{ display: 'block', color: 'var(--ink)', fontSize: '1.0625rem', fontWeight: 600, marginBottom: '6px' }}>{g.title}</span>
              <span style={{ display: 'block', color: 'var(--muted)', fontSize: '0.9375rem', lineHeight: 1.55 }}>{g.description}</span>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  )
}
