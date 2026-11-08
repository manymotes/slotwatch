import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SERVICE_CENTERS, centerBySlug } from '@/lib/service-centers'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import ProofCounter from '@/components/ProofCounter'
import LiveAvailability from '@/components/LiveAvailability'

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
      url: `https://slotwatcher.app/${data.slug}/`,
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
      canonical: `https://slotwatcher.app/${data.slug}/`,
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
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Free — no card. If it works, pay what it was worth.' },
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
      a: `SlotWatch can watch ${n === 1 ? 'the' : `any of the ${n}`} Tesla Service ${n === 1 ? 'Center' : 'Centers'} in the ${data.city} area${n > 1 ? ` — including ${data.centers.slice(0, 3).map((c) => c.name.replace('Tesla Service ', '')).join(', ')}${n > 3 ? ', and more' : ''}` : `: ${data.centers[0].name}`}. You can monitor up to 3 of them at once on a single watch.`,
    },
    {
      q: 'How quickly will I get the alert?',
      a: 'SlotWatch checks availability about every 5 minutes. When an earlier opening appears in your date range, we email you right away so you can reschedule in the Tesla app before it fills.',
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
      a: 'Yes — SlotWatch itself is free: no card, no fee, watch up to 3 centers, every alert in full. If an alert gets you an earlier appointment, you can chip in what it was worth afterward (suggested $19), but that’s up to you. You never connect your Tesla login. A self-hosted version is also on GitHub, free and open source.',
    },
    {
      q: 'What counts as an earlier slot?',
      a: 'Any opening at one of your watched centers on an earlier day than the appointment date you gave us. We email you the center and the exact date and time, in full, free. A same-day slot at an earlier time doesn’t count.',
    },
    {
      q: 'What if I find a slot myself, or the slot is gone by the time I check?',
      a: 'Nothing — SlotWatch is free. Finding one on your own costs nothing, and so does an alert that didn’t work out. Cancellations do get grabbed fast, so open the Tesla app the moment an alert lands. We keep watching either way.',
    },
    {
      q: 'When do I pay?',
      a: 'You don’t have to. SlotWatch is free: no card, no fee, every alert in full. After an alert, we’ll ask whether you managed to book it. If you did, you can chip in whatever it was worth to you — $9, $19 or $49, or any amount. If it didn’t work, you pay nothing.',
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

  // Real neighborhood names (from the actual centers list) and 2-3 sibling
  // metros for a contextual paragraph — no invented data, just what's already above.
  const neighborhoods = Array.from(new Set(data.centers.map((c) => c.city))).filter(
    (city) => city.toLowerCase() !== data.city.toLowerCase()
  )
  const joinNatural = (items: string[]) =>
    items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
  const neighborhoodList = joinNatural(neighborhoods.slice(0, 4))
  const siblingMetros = (sameState.length > 0 ? sameState : otherState).slice(0, 3)

  return (
    <div style={{ minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: appSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: centersSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />

      <SiteNav cta="Start watching" ctaHref={`/start/?city=${encodeURIComponent(`${data.city}, ${data.stateAbbr}`)}`} />

      {/* Hero */}
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '80px 24px 56px' }}>
        <div style={{ maxWidth: '640px' }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '20px' }}>
            Tesla Service — {data.city}, {data.stateAbbr}
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--ink)', textWrap: 'balance' as never, marginBottom: '20px' }}>
            Earlier Tesla service appointments in {data.city}
          </h1>
          <p style={{ fontSize: '1.0625rem', lineHeight: 1.65, color: 'var(--muted)', marginBottom: '12px', maxWidth: '520px' }}>
            Tesla service wait times in {data.city} can stretch weeks — but earlier slots open all day as people cancel and reschedule. SlotWatch watches {n === 1 ? 'the local center' : `all ${n} ${data.city}-area centers`} and emails you the moment a sooner opening appears, so you can grab it before it fills.
          </p>
          <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--muted)', marginBottom: '36px', maxWidth: '520px' }}>
            No refreshing the Tesla app. No Tesla login. Just an email when a real earlier slot opens.
          </p>

          {/* Email CTA */}
          <div className="sw-card" style={{ padding: '24px', maxWidth: '480px', marginBottom: '20px' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '14px', letterSpacing: '-0.01em' }}>
              Get alerted when a {data.city} slot opens
            </p>
            <form action="/start/" method="GET" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input type="hidden" name="city" value={`${data.city}, ${data.stateAbbr}`} />
              <input type="email" name="email" required placeholder="your@email.com" className="sw-input" style={{ flex: '1 1 200px', width: 'auto', minWidth: 0, padding: '11px 14px', fontSize: '0.9375rem' }} />
              <button type="submit" className="sw-btn sw-btn-primary" style={{ flexShrink: 0 }}>
                Watch {data.city}
              </button>
            </form>
            <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', fontWeight: 500, marginTop: '10px' }}>
              Free — no card. If it works, pay what it was worth.
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>
              No card required · up to 3 centers · no Tesla login
            </p>
          </div>
          {/* Local proof — real openings detected at this metro's centers; renders nothing if none */}
          <ProofCounter metro={data.city} centerNames={data.centers.map((c) => c.name)} style={{ fontSize: '0.875rem', color: 'var(--muted)' }} />
        </div>
      </section>

      {/* Stats bar — real numbers only */}
      <div style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px', display: 'flex', flexWrap: 'wrap', gap: '0', overflowX: 'auto' }}>
          {[
            { label: `Tesla ${centerWord} in area`, value: n.toString() },
            { label: 'Centers you can watch', value: `${Math.min(n, 3)}` },
            { label: 'Check interval', value: '5 min' },
            { label: 'Alerts', value: 'Email' },
          ].map((stat, i, arr) => (
            <div key={stat.label} style={{ padding: '28px 40px 28px 0', marginRight: i < arr.length - 1 ? '40px' : 0, borderRight: i < arr.length - 1 ? '1px solid var(--line)' : 'none', flexShrink: 0 }}>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', marginBottom: '4px' }}>{stat.value}</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', letterSpacing: '0.01em' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Real service centers — the substantive, unique local content */}
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '72px 24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: '10px' }}>
          Tesla service centers in {data.city}
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '32px', maxWidth: '620px' }}>
          {n === 1 ? 'This is the Tesla-owned service center' : `These are the ${n} Tesla-owned service centers`} in the {data.city} area. Pick the one nearest you (or watch several at once) and SlotWatch will email you when an earlier appointment opens at any of them.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1px', background: 'var(--line)', borderRadius: '12px', overflow: 'hidden' }}>
          {data.centers.map((c) => (
            <div key={c.name + c.zip} style={{ background: 'var(--surface)', padding: '22px 24px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px', letterSpacing: '-0.01em' }}>
                {c.name}
              </h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.5, color: 'var(--muted)', margin: 0 }}>
                {c.street}<br />
                {c.city}, {data.stateAbbr} {c.zip}
              </p>
            </div>
          ))}
        </div>

        {/* Live snapshot of the earliest slot at each center above — renders an empty line if the worker can't answer */}
        <LiveAvailability centers={data.centers} city={`${data.city}, ${data.stateAbbr}`} style={{ marginTop: '28px' }} />

        {data.localNote && (
          <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--muted)', marginTop: '24px', maxWidth: '680px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '10px', padding: '18px 20px' }}>
            {data.localNote}
          </p>
        )}

        <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--muted)', marginTop: '28px', maxWidth: '680px' }}>
          {n === 1 ? (
            <>With just one Tesla-owned center covering the whole {data.city} area, an earlier opening can fill within minutes of appearing. Tesla&apos;s own advice is to keep checking and grab whatever opens first — SlotWatch automates exactly that.</>
          ) : (
            <>{data.city}&apos;s {n} centers are spread across {neighborhoodList}, so availability varies a lot by location. Tesla&apos;s own advice is to check multiple centers and take whatever opens first — SlotWatch watches all of them at once so you don&apos;t have to.</>
          )}
          {siblingMetros.length > 0 && (
            <>
              {' '}If you&apos;re also near{' '}
              {siblingMetros.map((c, i) => (
                <span key={c.slug}>
                  {i > 0 && (i === siblingMetros.length - 1 ? (siblingMetros.length > 2 ? ', or ' : ' or ') : ', ')}
                  <Link href={`/${c.slug}/`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{c.city}</Link>
                </span>
              ))}
              , we watch those Tesla service centers too.
            </>
          )}{' '}
          For the bigger picture on why Tesla service books out nationally, see our{' '}
          <Link href="/guides/tesla-service-wait-times/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            breakdown of Tesla service wait times
          </Link>{' '}
          — or for concrete tactics that can move your date up (not just watching {data.city}), read our guide on{' '}
          <Link href="/guides/how-to-get-an-earlier-tesla-service-appointment/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            how to get an earlier Tesla service appointment
          </Link>. And if you&apos;re wondering whether an early or after-hours drop-off gets you seen sooner in {data.city}, it doesn&apos;t —{' '}
          <Link href="/guides/can-i-drop-off-my-tesla-early-for-service/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            here&apos;s why, and what actually works instead
          </Link>. Curious exactly why a {data.city} slot frees up in the first place?{' '}
          <Link href="/guides/tesla-service-cancellation-slots/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            Here&apos;s how cancellation slots actually open up
          </Link>{' '}
          — and how fast they tend to get grabbed. Already have a {data.city} appointment booked?{' '}
          <Link href="/guides/tesla-earlier-appointment-notification-vs-slotwatch/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            See how earlier-appointment notifications work and what SlotWatch adds
          </Link>{' '}
          {n > 1 ? `— including watching up to 3 of the ${n} ${data.city}-area centers at once` : '— including watching up to 3 centers at once'}.
        </p>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px 72px' }}>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '36px' }}>
          How it works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2px', background: 'var(--line)', borderRadius: '12px', overflow: 'hidden' }}>
          {[
            { label: 'Sign up in 30 seconds', body: 'Just your email — no card, no Tesla login, nothing to connect.' },
            { label: `Pick your ${data.city} centers`, body: `Choose up to 3 of the area's Tesla service centers and tell us your current appointment date.` },
            { label: 'Get an email, then book', body: 'An earlier slot opens. We email you the center and the exact date and time — reschedule in the Tesla app before it fills.' },
          ].map((step) => (
            <div key={step.label} style={{ background: 'var(--surface)', padding: '32px 28px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '10px', letterSpacing: '-0.01em' }}>{step.label}</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--muted)' }}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Local FAQ */}
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px 72px' }}>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '36px' }}>
          Frequently asked — {data.city}
        </h2>
        <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--line)', borderRadius: '10px', overflow: 'hidden' }}>
          {localFaqs.map((faq) => (
            <div key={faq.q} style={{ background: 'var(--surface)', padding: '24px' }}>
              <p style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '8px', fontSize: '0.9375rem' }}>{faq.q}</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.65, margin: 0 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <div style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '64px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
              Stop waiting for a {data.city} Tesla appointment.
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.9375rem' }}>Free — no card · if it works, pay what it was worth</p>
          </div>
          <Link href={`/start/?city=${encodeURIComponent(`${data.city}, ${data.stateAbbr}`)}`} className="sw-btn sw-btn-primary sw-btn-lg">
            Start watching {data.city}
          </Link>
        </div>
      </div>

      {/* Other areas */}
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '48px 24px 64px', borderTop: '1px solid var(--line)' }}>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '24px' }}>
          SlotWatch in other areas
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {otherAreas.map((c) => (
            <Link key={c.slug} href={`/${c.slug}/`} style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--muted)', textDecoration: 'none', fontSize: '0.8125rem', padding: '6px 13px', borderRadius: '6px' }}>
              {c.city}, {c.stateAbbr}
            </Link>
          ))}
          <Link href="/cities/" style={{ background: 'var(--surface)', border: '1px solid var(--line-strong)', color: 'var(--ink)', fontWeight: 600, textDecoration: 'none', fontSize: '0.8125rem', padding: '6px 13px', borderRadius: '6px' }}>
            All cities →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
