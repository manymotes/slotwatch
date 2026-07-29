import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SERVICE_CENTERS, centerBySlug } from '@/lib/service-centers'
import { Logo, LogoMark } from '@/components/Logo'

// re-export for consumers that import from this page
export type { CenterMeta } from '@/lib/service-centers'

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const today = new Date().toISOString().split('T')[0]
  return SERVICE_CENTERS
    .filter(c => c.releaseDate <= today)
    .map(c => ({ center: c.slug }))
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { center: string }
}): Promise<Metadata> {
  const data = centerBySlug.get(params.center)
  if (!data) return {}

  const n = data.centers.length
  const title = `Earlier Tesla Service Appointments in ${data.city} | SlotWatch`
  const description = `SlotWatch watches ${n === 1 ? 'the' : n} Tesla Service ${n === 1 ? 'Center' : 'Centers'} in ${data.city}, ${data.stateAbbr} and emails you when an earlier appointment opens. No Tesla login required.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://slotwatcher.app/${data.slug}`,
      images: [
        {
          url: 'https://slotwatcher.app/og-image.png',
          width: 1200,
          height: 630,
          alt: 'SlotWatch — Tesla Service Appointment Alerts',
        },
      ],
    },
    twitter: {
      title,
      description,
      images: ['https://slotwatcher.app/og-image.png'],
    },
    alternates: {
      canonical: `https://slotwatcher.app/${data.slug}`,
    },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CenterPage({ params }: { params: { center: string } }) {
  const data = centerBySlug.get(params.center)
  if (!data || data.releaseDate > new Date().toISOString().split('T')[0]) {
    notFound()
  }

  const n = data.centers.length
  const centerWord = n === 1 ? 'center' : 'centers'

  // ── Structured data ──────────────────────────────────────────────────────
  const appSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SlotWatch',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '24.00', priceCurrency: 'USD' },
    description: `SlotWatch monitors Tesla Service Center appointment availability across ${data.city}, ${data.stateAbbr} and emails you when an earlier slot opens.`,
    url: `https://slotwatcher.app/${data.slug}/`,
    areaServed: { '@type': 'City', name: data.city, containedInPlace: { '@type': 'State', name: data.state } },
  })

  // Real, verifiable list of the actual service centers this page covers.
  const centersSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Tesla Service Centers in ${data.city}`,
    numberOfItems: n,
    itemListElement: data.centers.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'AutomotiveBusiness',
        name: c.name,
        address: {
          '@type': 'PostalAddress',
          streetAddress: c.street,
          addressLocality: c.city,
          addressRegion: data.stateAbbr,
          postalCode: c.zip,
          addressCountry: 'US',
        },
      },
    })),
  })

  const localFaqs = [
    {
      q: `Which Tesla service centers does SlotWatch watch in ${data.city}?`,
      a: `SlotWatch can watch ${n === 1 ? 'the' : `any of the ${n}`} Tesla Service ${n === 1 ? 'Center' : 'Centers'} in the ${data.city} area${n > 1 ? ` — including ${data.centers.slice(0, 3).map((c) => c.name.replace('Tesla Service ', '')).join(', ')}${n > 3 ? ', and more' : ''}` : `: ${data.centers[0].name}`}. You can monitor up to 3 of them at once on a single subscription.`,
    },
    {
      q: 'How quickly will I get the alert?',
      a: 'SlotWatch checks availability about every 15 minutes. When an earlier opening appears in your date range, we email you right away so you can reschedule in the Tesla app before it fills.',
    },
    {
      q: 'Do I need to connect my Tesla account?',
      a: `No — you never connect your Tesla account and we never see your login. Just tell us which ${data.city} service center to watch and where to email you. When an earlier slot opens, you reschedule it yourself in the Tesla app.`,
    },
    {
      q: 'Why would an earlier appointment open up?',
      a: `Tesla service in ${data.city} is often booked weeks out, but people cancel and reschedule constantly — each time, an earlier slot briefly opens. SlotWatch catches those the moment they appear so you don't have to refresh the app.`,
    },
    {
      q: 'Is there a free option?',
      a: 'The self-hosted version on GitHub is completely free and open source. The managed plan is a one-time $24 for a 60-day watch of up to 3 centers, with a money-back guarantee if no earlier slot opens — no subscription. If you need longer, you can keep watching for $6.99/mo.',
    },
  ]
  const faqSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: localFaqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  })

  const breadcrumbSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://slotwatcher.app/' },
      { '@type': 'ListItem', position: 2, name: 'Cities', item: 'https://slotwatcher.app/cities/' },
      { '@type': 'ListItem', position: 3, name: data.city, item: `https://slotwatcher.app/${data.slug}/` },
    ],
  })

  // Related metros for internal linking — same state first, then others, capped.
  const sameState = SERVICE_CENTERS.filter((c) => c.slug !== data.slug && c.stateAbbr === data.stateAbbr)
  const otherState = SERVICE_CENTERS.filter((c) => c.slug !== data.slug && c.stateAbbr !== data.stateAbbr)
  const otherAreas = [...sameState, ...otherState].slice(0, 12)

  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: appSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: centersSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
          <Logo size={28} />
          <Link href={`/start?city=${encodeURIComponent(`${data.city}, ${data.stateAbbr}`)}`} style={{ background: '#e31937', color: '#fff', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600, padding: '7px 14px', borderRadius: '6px' }}>
            Start watching
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '80px 24px 56px' }}>
        <div style={{ maxWidth: '640px' }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.14em', color: '#e31937', textTransform: 'uppercase', marginBottom: '20px' }}>
            Tesla Service — {data.city}, {data.stateAbbr}
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#f0f0f0', textWrap: 'balance' as never, marginBottom: '20px' }}>
            Earlier Tesla service appointments in {data.city}
          </h1>
          <p style={{ fontSize: '1.0625rem', lineHeight: 1.65, color: '#8a8a8a', marginBottom: '12px', maxWidth: '520px' }}>
            Tesla service in {data.city} is booked weeks out — but earlier slots open all day as people cancel and reschedule. SlotWatch watches {n === 1 ? 'the local center' : `all ${n} ${data.city}-area centers`} and emails you the moment a sooner opening appears, so you can grab it before it fills.
          </p>
          <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: '#5a5a5a', marginBottom: '36px', maxWidth: '520px' }}>
            No refreshing the Tesla app. No Tesla login. Just an email when a real earlier slot opens.
          </p>

          {/* Email CTA */}
          <div style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '24px', maxWidth: '480px', marginBottom: '20px' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e8e8e8', marginBottom: '14px', letterSpacing: '-0.01em' }}>
              Get alerted when a {data.city} slot opens
            </p>
            <form action="/start" method="GET" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input type="hidden" name="city" value={`${data.city}, ${data.stateAbbr}`} />
              <input type="email" name="email" required placeholder="your@email.com" style={{ flex: '1 1 200px', background: '#161616', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#f0f0f0', fontSize: '0.875rem', padding: '10px 14px', outline: 'none', minWidth: 0 }} />
              <button type="submit" style={{ background: '#e31937', color: '#fff', fontWeight: 700, fontSize: '0.875rem', border: 'none', borderRadius: '6px', padding: '10px 18px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Watch {data.city}
              </button>
            </form>
            <p style={{ fontSize: '0.75rem', color: '#3a3a3a', marginTop: '10px' }}>
              $24 one-time · 60-day watch · money-back guarantee
            </p>
          </div>

          <a href="https://github.com/manymotes/slotwatch" style={{ color: '#3a3a3a', textDecoration: 'none', fontSize: '0.8125rem' }}>
            Or self-host for free on GitHub →
          </a>
        </div>
      </section>

      {/* Stats bar — real numbers only */}
      <div style={{ borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px', display: 'flex', flexWrap: 'wrap', gap: '0', overflowX: 'auto' }}>
          {[
            { label: `Tesla ${centerWord} in area`, value: n.toString() },
            { label: 'Centers you can watch', value: `${Math.min(n, 3)}` },
            { label: 'Check interval', value: '15 min' },
            { label: 'Alerts', value: 'Email' },
          ].map((stat, i, arr) => (
            <div key={stat.label} style={{ padding: '28px 40px 28px 0', marginRight: i < arr.length - 1 ? '40px' : 0, borderRight: i < arr.length - 1 ? '1px solid #1a1a1a' : 'none', flexShrink: 0 }}>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f0f0f0', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', marginBottom: '4px' }}>{stat.value}</p>
              <p style={{ fontSize: '0.8125rem', color: '#3a3a3a', letterSpacing: '0.01em' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Real service centers — the substantive, unique local content */}
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '72px 24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f0f0f0', marginBottom: '10px' }}>
          Tesla service centers in {data.city}
        </h2>
        <p style={{ fontSize: '1rem', color: '#6b6b6b', lineHeight: 1.6, marginBottom: '32px', maxWidth: '620px' }}>
          {n === 1 ? 'This is the Tesla-owned service center' : `These are the ${n} Tesla-owned service centers`} in the {data.city} area. Pick the one nearest you (or watch several at once) and SlotWatch will email you when an earlier appointment opens at any of them.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1px', background: '#1a1a1a', borderRadius: '12px', overflow: 'hidden' }}>
          {data.centers.map((c) => (
            <div key={c.name + c.zip} style={{ background: '#0d0d0d', padding: '22px 24px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f0f0f0', marginBottom: '8px', letterSpacing: '-0.01em' }}>
                {c.name}
              </h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.5, color: '#6b6b6b', margin: 0 }}>
                {c.street}<br />
                {c.city}, {data.stateAbbr} {c.zip}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px 72px' }}>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', color: '#3a3a3a', textTransform: 'uppercase', marginBottom: '36px' }}>
          How it works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2px', background: '#1a1a1a', borderRadius: '12px', overflow: 'hidden' }}>
          {[
            { label: 'Sign up in 30 seconds', body: 'Just your email — no Tesla login, no password, nothing to connect.' },
            { label: `Pick your ${data.city} centers`, body: `Choose up to 3 of the area's Tesla service centers and set your earliest acceptable date.` },
            { label: 'Get an email, then book', body: 'An earlier slot opens. We email you within minutes — you reschedule in the Tesla app before it fills.' },
          ].map((step) => (
            <div key={step.label} style={{ background: '#0d0d0d', padding: '32px 28px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f0f0f0', marginBottom: '10px', letterSpacing: '-0.01em' }}>{step.label}</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#6b6b6b' }}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Local FAQ */}
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px 72px' }}>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', color: '#3a3a3a', textTransform: 'uppercase', marginBottom: '36px' }}>
          Frequently asked — {data.city}
        </h2>
        <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '1px', background: '#1e1e1e', borderRadius: '10px', overflow: 'hidden' }}>
          {localFaqs.map((faq) => (
            <div key={faq.q} style={{ background: '#0d0d0d', padding: '24px' }}>
              <p style={{ fontWeight: 600, color: '#e8e8e8', marginBottom: '8px', fontSize: '0.9375rem' }}>{faq.q}</p>
              <p style={{ color: '#6b6b6b', fontSize: '0.9rem', lineHeight: 1.65, margin: 0 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <div style={{ borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '64px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#f0f0f0', letterSpacing: '-0.02em', marginBottom: '6px' }}>
              Stop waiting for a {data.city} Tesla appointment.
            </h2>
            <p style={{ color: '#6b6b6b', fontSize: '0.9375rem' }}>$24 one-time · money-back guarantee · no subscription</p>
          </div>
          <Link href={`/start?city=${encodeURIComponent(`${data.city}, ${data.stateAbbr}`)}`} style={{ display: 'inline-flex', alignItems: 'center', background: '#e31937', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.9375rem', padding: '13px 26px', borderRadius: '8px', whiteSpace: 'nowrap' }}>
            Start watching {data.city}
          </Link>
        </div>
      </div>

      {/* Other areas */}
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '48px 24px 64px', borderTop: '1px solid #0f0f0f' }}>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', color: '#3a3a3a', textTransform: 'uppercase', marginBottom: '24px' }}>
          SlotWatch in other areas
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {otherAreas.map((c) => (
            <Link key={c.slug} href={`/${c.slug}`} style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', color: '#6b6b6b', textDecoration: 'none', fontSize: '0.8125rem', padding: '6px 13px', borderRadius: '6px' }}>
              {c.city}, {c.stateAbbr}
            </Link>
          ))}
          <Link href="/cities" style={{ background: '#0d0d0d', border: '1px solid #2a1519', color: '#e5556f', textDecoration: 'none', fontSize: '0.8125rem', padding: '6px 13px', borderRadius: '6px' }}>
            All cities →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1a1a1a', maxWidth: '1120px', margin: '0 auto', padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LogoMark size={22} />
          <span style={{ color: '#3a3a3a', fontSize: '0.8125rem' }}>SlotWatch</span>
        </Link>
        <span style={{ color: '#2a2a2a', fontSize: '0.8125rem' }}>Not affiliated with Tesla, Inc.</span>
      </footer>
    </div>
  )
}
