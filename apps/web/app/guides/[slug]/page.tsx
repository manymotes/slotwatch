import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Logo } from '../../../components/Logo'
import Markdown from '../../../components/Markdown'
import { GUIDES, guideBySlug } from '../../../lib/guides'

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = guideBySlug.get(params.slug)
  if (!g) return {}
  return {
    title: `${g.title} | SlotWatch`,
    description: g.description,
    alternates: { canonical: `https://slotwatcher.app/guides/${g.slug}` },
    openGraph: { title: g.title, description: g.description, url: `https://slotwatcher.app/guides/${g.slug}`, type: 'article' },
  }
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const g = guideBySlug.get(params.slug)
  if (!g) notFound()

  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: g.title,
    description: g.description,
    url: `https://slotwatcher.app/guides/${g.slug}`,
    publisher: { '@type': 'Organization', name: 'SlotWatch', url: 'https://slotwatcher.app' },
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

      <article style={{ maxWidth: '760px', margin: '0 auto', padding: '56px 24px 40px' }}>
        <Link href="/guides" style={{ color: '#8a8a8a', textDecoration: 'none', fontSize: '0.8125rem' }}>← All guides</Link>
        <div style={{ marginTop: '20px' }}>
          <Markdown md={g.md} />
        </div>
      </article>

      <section style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px 96px' }}>
        <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: '14px', padding: '28px', textAlign: 'center' }}>
          <p style={{ color: '#f0f0f0', fontSize: '1.125rem', fontWeight: 700, margin: '0 0 8px' }}>Let SlotWatch catch the earlier slot for you</p>
          <p style={{ color: '#8a8a8a', fontSize: '0.9375rem', margin: '0 0 18px' }}>One-time $24 · 60-day watch · money-back guarantee · no Tesla login</p>
          <Link href="/start" style={{ display: 'inline-block', background: '#e31937', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.9375rem', padding: '13px 26px', borderRadius: '8px' }}>
            Start watching — $24 →
          </Link>
        </div>
      </section>
    </div>
  )
}
