import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// ── Static data ───────────────────────────────────────────────────────────────

export type CenterMeta = {
  slug: string
  city: string
  state: string
  stateAbbr: string
  waitWeeks: string
  centers: number
  population: string
  landmark: string
}

export const SERVICE_CENTERS: CenterMeta[] = [
  {
    slug: 'san-francisco-tesla-service',
    city: 'San Francisco',
    state: 'California',
    stateAbbr: 'CA',
    waitWeeks: '4–6',
    centers: 3,
    population: '870,000',
    landmark: 'Bay Area',
  },
  {
    slug: 'los-angeles-tesla-service',
    city: 'Los Angeles',
    state: 'California',
    stateAbbr: 'CA',
    waitWeeks: '5–8',
    centers: 5,
    population: '3.9M',
    landmark: 'Greater LA',
  },
  {
    slug: 'new-york-tesla-service',
    city: 'New York',
    state: 'New York',
    stateAbbr: 'NY',
    waitWeeks: '6–10',
    centers: 4,
    population: '8.3M',
    landmark: 'NYC metro',
  },
  {
    slug: 'chicago-tesla-service',
    city: 'Chicago',
    state: 'Illinois',
    stateAbbr: 'IL',
    waitWeeks: '3–5',
    centers: 2,
    population: '2.7M',
    landmark: 'Chicagoland',
  },
  {
    slug: 'seattle-tesla-service',
    city: 'Seattle',
    state: 'Washington',
    stateAbbr: 'WA',
    waitWeeks: '4–7',
    centers: 3,
    population: '750,000',
    landmark: 'Puget Sound',
  },
  {
    slug: 'austin-tesla-service',
    city: 'Austin',
    state: 'Texas',
    stateAbbr: 'TX',
    waitWeeks: '2–4',
    centers: 2,
    population: '980,000',
    landmark: 'Central Texas',
  },
  {
    slug: 'denver-tesla-service',
    city: 'Denver',
    state: 'Colorado',
    stateAbbr: 'CO',
    waitWeeks: '3–5',
    centers: 2,
    population: '730,000',
    landmark: 'Front Range',
  },
  {
    slug: 'atlanta-tesla-service',
    city: 'Atlanta',
    state: 'Georgia',
    stateAbbr: 'GA',
    waitWeeks: '4–6',
    centers: 2,
    population: '500,000',
    landmark: 'Metro Atlanta',
  },
  {
    slug: 'miami-tesla-service',
    city: 'Miami',
    state: 'Florida',
    stateAbbr: 'FL',
    waitWeeks: '3–6',
    centers: 3,
    population: '440,000',
    landmark: 'South Florida',
  },
  {
    slug: 'boston-tesla-service',
    city: 'Boston',
    state: 'Massachusetts',
    stateAbbr: 'MA',
    waitWeeks: '4–7',
    centers: 2,
    population: '680,000',
    landmark: 'Greater Boston',
  },
  {
    slug: 'washington-dc-tesla-service',
    city: 'Washington',
    state: 'DC',
    stateAbbr: 'DC',
    waitWeeks: '4–6',
    centers: 3,
    population: '700,000',
    landmark: 'DMV area',
  },
  {
    slug: 'phoenix-tesla-service',
    city: 'Phoenix',
    state: 'Arizona',
    stateAbbr: 'AZ',
    waitWeeks: '2–4',
    centers: 3,
    population: '1.6M',
    landmark: 'Valley of the Sun',
  },
  {
    slug: 'portland-tesla-service',
    city: 'Portland',
    state: 'Oregon',
    stateAbbr: 'OR',
    waitWeeks: '3–5',
    centers: 2,
    population: '650,000',
    landmark: 'Portland metro',
  },
  {
    slug: 'dallas-tesla-service',
    city: 'Dallas',
    state: 'Texas',
    stateAbbr: 'TX',
    waitWeeks: '3–5',
    centers: 3,
    population: '1.3M',
    landmark: 'DFW metro',
  },
  {
    slug: 'houston-tesla-service',
    city: 'Houston',
    state: 'Texas',
    stateAbbr: 'TX',
    waitWeeks: '3–5',
    centers: 3,
    population: '2.3M',
    landmark: 'Greater Houston',
  },
  {
    slug: 'san-diego-tesla-service',
    city: 'San Diego',
    state: 'California',
    stateAbbr: 'CA',
    waitWeeks: '3–5',
    centers: 2,
    population: '1.4M',
    landmark: 'San Diego County',
  },
  {
    slug: 'las-vegas-tesla-service',
    city: 'Las Vegas',
    state: 'Nevada',
    stateAbbr: 'NV',
    waitWeeks: '2–4',
    centers: 2,
    population: '640,000',
    landmark: 'Las Vegas Valley',
  },
  {
    slug: 'salt-lake-city-tesla-service',
    city: 'Salt Lake City',
    state: 'Utah',
    stateAbbr: 'UT',
    waitWeeks: '2–3',
    centers: 1,
    population: '210,000',
    landmark: 'Wasatch Front',
  },
  {
    slug: 'nashville-tesla-service',
    city: 'Nashville',
    state: 'Tennessee',
    stateAbbr: 'TN',
    waitWeeks: '3–5',
    centers: 1,
    population: '690,000',
    landmark: 'Middle Tennessee',
  },
  {
    slug: 'minneapolis-tesla-service',
    city: 'Minneapolis',
    state: 'Minnesota',
    stateAbbr: 'MN',
    waitWeeks: '3–5',
    centers: 2,
    population: '430,000',
    landmark: 'Twin Cities',
  },
  {
    slug: 'charlotte-tesla-service',
    city: 'Charlotte',
    state: 'North Carolina',
    stateAbbr: 'NC',
    waitWeeks: '3–6',
    centers: 1,
    population: '900,000',
    landmark: 'Greater Charlotte',
  },
  {
    slug: 'san-jose-tesla-service',
    city: 'San Jose',
    state: 'California',
    stateAbbr: 'CA',
    waitWeeks: '4–6',
    centers: 2,
    population: '1.0M',
    landmark: 'Silicon Valley',
  },
]

const centerBySlug = new Map(SERVICE_CENTERS.map((c) => [c.slug, c]))

// ── Static params ─────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return SERVICE_CENTERS.map((c) => ({ center: c.slug }))
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { center: string }
}): Promise<Metadata> {
  const data = centerBySlug.get(params.center)
  if (!data) return {}

  const title = `Tesla Service Appointment Alerts — ${data.city}, ${data.stateAbbr} | SlotWatch`
  const description = `Skip the ${data.waitWeeks}-week wait at ${data.city} service centers. SlotWatch monitors every available slot and texts you the moment a cancellation appears. No refreshing required.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://slotwatch.app/${data.slug}`,
    },
    alternates: {
      canonical: `https://slotwatch.app/${data.slug}`,
    },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CenterPage({ params }: { params: { center: string } }) {
  const data = centerBySlug.get(params.center)
  if (!data) notFound()

  const localFaqs = [
    {
      q: `How long is the typical wait in ${data.city}?`,
      a: `Wait times at ${data.landmark} service centers currently run ${data.waitWeeks} weeks for non-urgent appointments. Cancellations open earlier slots daily — SlotWatch catches them in minutes.`,
    },
    {
      q: `How many service centers does SlotWatch watch in ${data.city}?`,
      a: `There ${data.centers === 1 ? 'is' : 'are'} ${data.centers} Tesla Service ${data.centers === 1 ? 'Center' : 'Centers'} in the ${data.landmark} area. SlotWatch monitors ${data.centers === 1 ? 'it' : 'all of them'} simultaneously.`,
    },
    {
      q: 'How fast will I be alerted?',
      a: 'SlotWatch polls every 30 minutes. When a slot matching your criteria appears, SMS and email go out within seconds.',
    },
    {
      q: 'Is there a free trial?',
      a: 'The self-hosted version on GitHub is completely free. The managed Pro plan is $9.99/mo with no annual contract — cancel anytime.',
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(8, 8, 8, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1a1a1a',
      }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              background: '#e31937',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 800,
              color: '#fff',
            }}>S</span>
            <span style={{ color: '#f0f0f0', fontWeight: 600, fontSize: '0.9375rem' }}>SlotWatch</span>
          </Link>
          <Link href="/checkout" style={{
            background: '#e31937',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '0.8125rem',
            fontWeight: 600,
            padding: '7px 14px',
            borderRadius: '6px',
          }}>
            Start watching
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '80px 24px 64px' }}>
        <div style={{ maxWidth: '640px' }}>
          <p style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            color: '#e31937',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}>
            {data.city}, {data.stateAbbr}
          </p>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: '#f0f0f0',
            textWrap: 'balance' as never,
            marginBottom: '20px',
          }}>
            Skip the wait at Tesla Service {data.city}
          </h1>
          <p style={{
            fontSize: '1.0625rem',
            lineHeight: 1.65,
            color: '#8a8a8a',
            marginBottom: '36px',
            maxWidth: '520px',
          }}>
            {data.landmark} service centers are currently booking {data.waitWeeks} weeks out. Cancellations happen daily — SlotWatch catches them and texts you before anyone else sees them.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <Link href="/checkout" style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#e31937',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.9375rem',
              padding: '13px 26px',
              borderRadius: '8px',
            }}>
              Start watching {data.city} — $9.99/mo
            </Link>
            <a href="https://github.com/slotwatch/slotwatch" style={{
              color: '#6b6b6b',
              textDecoration: 'none',
              fontSize: '0.875rem',
              padding: '13px 4px',
            }}>
              Self-host for free
            </a>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{
          maxWidth: '1120px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0',
        }}>
          {[
            { label: 'Service centers watched', value: data.centers.toString() },
            { label: 'Current wait time', value: `${data.waitWeeks} weeks` },
            { label: 'Alert interval', value: '30 min' },
            { label: 'Metro population', value: data.population },
          ].map((stat, i, arr) => (
            <div key={stat.label} style={{
              padding: '28px 40px 28px 0',
              marginRight: i < arr.length - 1 ? '40px' : 0,
              borderRight: i < arr.length - 1 ? '1px solid #1a1a1a' : 'none',
            }}>
              <p style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#f0f0f0',
                letterSpacing: '-0.03em',
                fontVariantNumeric: 'tabular-nums',
                marginBottom: '4px',
              }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '0.8125rem', color: '#3a3a3a', letterSpacing: '0.01em' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '72px 24px' }}>
        <h2 style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: '#3a3a3a',
          textTransform: 'uppercase',
          marginBottom: '36px',
        }}>
          How SlotWatch works in {data.city}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2px',
          background: '#1a1a1a',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {[
            {
              label: 'Connect once',
              body: `Authorize SlotWatch via OAuth in under 60 seconds. No password stored, ever.`,
            },
            {
              label: `Choose ${data.city} centers`,
              body: `Select any or all ${data.centers} ${data.landmark} service ${data.centers === 1 ? 'location' : 'locations'} and your earliest acceptable date.`,
            },
            {
              label: 'Get the text',
              body: `A slot opens. SlotWatch texts you within minutes — before it disappears.`,
            },
          ].map((step) => (
            <div key={step.label} style={{ background: '#0d0d0d', padding: '32px 28px' }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#f0f0f0',
                marginBottom: '10px',
                letterSpacing: '-0.01em',
              }}>
                {step.label}
              </h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#6b6b6b' }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Local FAQ */}
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px 72px' }}>
        <h2 style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: '#3a3a3a',
          textTransform: 'uppercase',
          marginBottom: '36px',
        }}>
          Frequently asked — {data.city}
        </h2>
        <div style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '1px', background: '#1e1e1e', borderRadius: '10px', overflow: 'hidden' }}>
          {localFaqs.map((faq) => (
            <div key={faq.q} style={{ background: '#0d0d0d', padding: '24px' }}>
              <p style={{ fontWeight: 600, color: '#e8e8e8', marginBottom: '8px', fontSize: '0.9375rem' }}>
                {faq.q}
              </p>
              <p style={{ color: '#6b6b6b', fontSize: '0.9rem', lineHeight: 1.65, margin: 0 }}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <div style={{ borderTop: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '64px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#f0f0f0', letterSpacing: '-0.02em', marginBottom: '6px' }}>
              Ready to stop waiting?
            </h2>
            <p style={{ color: '#6b6b6b', fontSize: '0.9375rem' }}>
              $9.99/mo. No contracts. Cancel anytime.
            </p>
          </div>
          <Link href="/checkout" style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#e31937',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.9375rem',
            padding: '13px 26px',
            borderRadius: '8px',
            whiteSpace: 'nowrap',
          }}>
            Start watching {data.city}
          </Link>
        </div>
      </div>

      {/* Other cities */}
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '48px 24px 64px', borderTop: '1px solid #1a1a1a' }}>
        <h2 style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: '#3a3a3a',
          textTransform: 'uppercase',
          marginBottom: '24px',
        }}>
          Other cities
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {SERVICE_CENTERS.filter((c) => c.slug !== data.slug).map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              style={{
                background: '#0d0d0d',
                border: '1px solid #1e1e1e',
                color: '#8a8a8a',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                padding: '7px 14px',
                borderRadius: '6px',
                transition: 'border-color 0.15s, color 0.15s',
              }}
            >
              {c.city}, {c.stateAbbr}
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #1a1a1a',
        maxWidth: '1120px',
        margin: '0 auto',
        padding: '28px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '22px',
            height: '22px',
            background: '#e31937',
            borderRadius: '5px',
            fontSize: '11px',
            fontWeight: 800,
            color: '#fff',
          }}>S</span>
          <span style={{ color: '#3a3a3a', fontSize: '0.8125rem' }}>SlotWatch</span>
        </Link>
        <span style={{ color: '#2a2a2a', fontSize: '0.8125rem' }}>
          Not affiliated with Tesla, Inc.
        </span>
      </footer>
    </div>
  )
}
