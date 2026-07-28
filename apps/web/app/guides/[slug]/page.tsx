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
    twitter: { title: g.title, description: g.description },
  }
}

function extractFaqs(md: string): { q: string; a: string }[] {
  const lines = md.split('\n')
  const start = lines.findIndex((l) => /^## (FAQ|Frequently asked questions)\s*$/i.test(l.trim()))
  if (start === -1) return []
  const faqs: { q: string; a: string }[] = []
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.startsWith('## ')) break
    const q = line.match(/^\*\*(.+)\*\*$/)
    if (q) {
      const a = (lines[i + 1] || '').trim()
      if (a && !a.startsWith('**')) faqs.push({ q: q[1], a })
    }
  }
  return faqs
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const g = guideBySlug.get(params.slug)
  if (!g) notFound()

  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: g.title,
    description: g.description,
    image: 'https://slotwatcher.app/og-image.png',
    datePublished: g.datePublished,
    dateModified: g.datePublished,
    author: { '@type': 'Organization', name: 'SlotWatch', url: 'https://slotwatcher.app' },
    url: `https://slotwatcher.app/guides/${g.slug}`,
    publisher: { '@type': 'Organization', name: 'SlotWatch', url: 'https://slotwatcher.app' },
  })

  const faqs = extractFaqs(g.md)
  const faqSchema = faqs.length
    ? JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      })
    : null

  const breadcrumbSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://slotwatcher.app/' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://slotwatcher.app/guides' },
      { '@type': 'ListItem', position: 3, name: g.title, item: `https://slotwatcher.app/guides/${g.slug}` },
    ],
  })

  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />
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
