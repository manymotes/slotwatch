import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '../../components/SiteNav'
import SiteFooter from '../../components/SiteFooter'
import Markdown from '../../components/Markdown'
import { HOWITWORKS_MD, FOUNDER_MD, FAQ } from '../../lib/content'

export const metadata: Metadata = {
  title: 'How SlotWatch Works — Earlier Tesla Service Appointments',
  description: 'How SlotWatch watches Tesla service centers and emails you when an earlier appointment opens. No Tesla login required.',
  alternates: { canonical: 'https://slotwatcher.app/how-it-works/' },
  openGraph: {
    title: 'How SlotWatch Works',
    description: 'We watch your Tesla service center and email you the moment an earlier appointment opens.',
    url: 'https://slotwatcher.app/how-it-works/',
    images: [{ url: 'https://slotwatcher.app/og-image.png', width: 1200, height: 630, alt: 'SlotWatch — Tesla Service Appointment Alerts' }],
  },
  twitter: {
    title: 'How SlotWatch Works',
    description: 'We watch your Tesla service center and email you the moment an earlier appointment opens.',
    images: ['https://slotwatcher.app/og-image.png'],
  },
}

// Mirrors extractHowToSteps() in app/guides/[slug]/page.tsx — pulls the
// numbered "N. **lead-in.** rest" steps straight out of HOWITWORKS_MD so the
// schema can never drift from the visible content.
function extractHowToSteps(md: string): { name: string; text: string }[] {
  const lines = md.split('\n')
  let best: { name: string; text: string }[] = []
  let current: { name: string; text: string }[] = []
  let expectedNext = 1
  for (const raw of lines) {
    const line = raw.trim()
    const m = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*\s*(.*)$/)
    if (m && Number(m[1]) === expectedNext) {
      current.push({ name: m[2].replace(/\.$/, ''), text: `${m[2]} ${m[3]}`.trim() })
      expectedNext++
    } else if (!line) {
      continue
    } else {
      if (current.length > best.length) best = current
      current = []
      expectedNext = 1
    }
  }
  if (current.length > best.length) best = current
  return best.length >= 3 ? best : []
}

export default function HowItWorksPage() {
  const faqSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  })

  const steps = extractHowToSteps(HOWITWORKS_MD)
  const howToSchema = steps.length
    ? JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How SlotWatch works',
        description: 'How SlotWatch watches Tesla service centers and emails you when an earlier appointment opens.',
        step: steps.map((s) => ({ '@type': 'HowToStep', name: s.name, text: s.text })),
      })
    : null

  return (
    <div style={{ minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />
      {howToSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: howToSchema }} />
      )}
      <SiteNav />

      <section style={{ maxWidth: '760px', margin: '0 auto', padding: '56px 24px 40px' }}>
        <Markdown md={HOWITWORKS_MD} />

        <div className="sw-card" style={{ margin: '32px 0', padding: '24px 28px' }}>
          <p className="sw-eyebrow" style={{ margin: '0 0 12px' }}>Why I built this</p>
          <div style={{ color: 'var(--ink-2)', fontSize: '0.9375rem', lineHeight: 1.7 }}>
            <Markdown md={FOUNDER_MD} />
          </div>
        </div>

        <Link href="/start/" className="sw-btn sw-btn-primary sw-btn-lg">
          Start watching — free →
        </Link>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: '760px', margin: '0 auto', padding: '24px 24px 96px' }}>
        <h2 style={{ color: 'var(--ink)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '20px' }}>Frequently asked questions</h2>
        {FAQ.map((f, i) => (
          <div key={i} style={{ borderTop: '1px solid var(--line)', padding: '18px 0' }}>
            <h3 style={{ color: 'var(--ink)', fontSize: '1rem', fontWeight: 600, margin: '0 0 8px' }}>{f.q}</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9375rem', lineHeight: 1.65, margin: 0 }}>{f.a}</p>
          </div>
        ))}
      </section>
      <SiteFooter />
    </div>
  )
}
