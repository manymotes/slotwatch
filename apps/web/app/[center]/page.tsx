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

  const title = `Skip the ${data.city} Tesla Service Wait | SlotWatch`
  const description = `Tesla owners in ${data.city} report waiting ${data.waitWeeks} weeks for service appointments. SlotWatch monitors every cancellation slot and alerts you the moment one opens — no refreshing, no missed openings.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://slotwatcher.app/${data.slug}`,
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

  const schemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SlotWatch',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '9.99',
      priceCurrency: 'USD',
    },
    description: `SlotWatch monitors Tesla Service Center appointment availability in ${data.city}, ${data.stateAbbr} and sends instant alerts when a cancellation slot opens.`,
    url: `https://slotwatcher.app/${data.slug}`,
    areaServed: {
      '@type': 'City',
      name: data.city,
      containedInPlace: {
        '@type': 'State',
        name: data.state,
      },
    },
  })

  const localFaqs = [
    {
      q: `How long is the typical wait in ${data.city}?`,
      a: `Tesla owners in ${data.landmark} currently report waits of ${data.waitWeeks} weeks for non-urgent service appointments. Cancellations open earlier slots every day — SlotWatch catches them within minutes so you don't have to check manually.`,
    },
    {
      q: `How many ${data.city} service centers does SlotWatch watch?`,
      a: `There ${data.centers === 1 ? 'is' : 'are'} ${data.centers} Tesla Service ${data.centers === 1 ? 'Center' : 'Centers'} in the ${data.landmark} area. SlotWatch monitors ${data.centers === 1 ? 'it around the clock' : 'all of them simultaneously'}, so you have the best possible chance of grabbing an earlier slot.`,
    },
    {
      q: 'How quickly will I get the alert?',
      a: 'SlotWatch checks availability every 30 minutes. When an earlier opening appears in your date range, we email you right away so you can reschedule in the Tesla app before it fills.',
    },
    {
      q: 'Do I need to connect my Tesla account?',
      a: `No — you never connect your Tesla account and we never see your login. Just tell us your ${data.city} service center and where to email you. When an earlier slot opens, you reschedule it yourself in the Tesla app.`,
    },
    {
      q: 'Is there a free option?',
      a: 'The self-hosted version on GitHub is completely free and open source. The managed Pro plan is $9.99/mo — no annual contract, cancel any time from your account dashboard.',
    },
  ]

  const alertTypes = [
    {
      label: 'Cancellation slots',
      detail: `When any ${data.landmark} Tesla owner cancels, that appointment window immediately becomes available — SlotWatch catches it before it's filled.`,
    },
    {
      label: 'Newly released dates',
      detail: `Tesla periodically releases new appointment windows and cancellations open earlier slots. SlotWatch re-checks every 30 minutes and emails you when a sooner opening shows up.`,
    },
    {
      label: 'Earlier-than-booked openings',
      detail: `Already have an appointment? SlotWatch can alert you if a slot earlier than your current booking opens up, so you can reschedule to something sooner.`,
    },
    {
      label: 'Watch multiple centers',
      detail: `Cover every center within driving distance on one subscription, so you catch the first earlier opening across any of them.`,
    },
  ]

  // Show a capped list of "other cities" (nearby + random) for internal linking
  const otherCenters = SERVICE_CENTERS.filter((c) => c.slug !== data.slug)

  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>

      {/* Schema markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schemaJson }}
      />

      {/* Nav */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(8, 8, 8, 0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1a1a1a',
      }}>
        <div style={{
          maxWidth: '1120px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '56px',
        }}>
          <Logo size={28} />
          <Link href={`/start?city=${encodeURIComponent(`${data.city}, ${data.stateAbbr}`)}`} style={{
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
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            color: '#e31937',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}>
            Tesla Service — {data.city}, {data.stateAbbr}
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
            Earlier Tesla service appointments in {data.city}
          </h1>
          <p style={{
            fontSize: '1.0625rem',
            lineHeight: 1.65,
            color: '#8a8a8a',
            marginBottom: '12px',
            maxWidth: '520px',
          }}>
            Tesla owners in {data.city} report waiting {data.waitWeeks} weeks for service appointments. Earlier openings appear every day — SlotWatch catches them and emails you so you can grab one before it fills.
          </p>
          <p style={{
            fontSize: '0.9375rem',
            lineHeight: 1.6,
            color: '#5a5a5a',
            marginBottom: '36px',
            maxWidth: '520px',
          }}>
            No refreshing the Tesla app. No checking at odd hours. Just a text when a real slot opens at a {data.landmark} service center.
          </p>

          {/* Email CTA */}
          <div style={{
            background: '#0d0d0d',
            border: '1px solid #1e1e1e',
            borderRadius: '10px',
            padding: '24px',
            maxWidth: '480px',
            marginBottom: '20px',
          }}>
            <p style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#e8e8e8',
              marginBottom: '14px',
              letterSpacing: '-0.01em',
            }}>
              Get alerted when a {data.city} slot opens
            </p>
            <form
              action="/start"
              method="GET"
              style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
            >
              <input type="hidden" name="city" value={`${data.city}, ${data.stateAbbr}`} />
              <input
                type="email"
                name="email"
                required
                placeholder="your@email.com"
                style={{
                  flex: '1 1 200px',
                  background: '#161616',
                  border: '1px solid #2a2a2a',
                  borderRadius: '6px',
                  color: '#f0f0f0',
                  fontSize: '0.875rem',
                  padding: '10px 14px',
                  outline: 'none',
                  minWidth: 0,
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#e31937',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 18px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                Watch {data.city}
              </button>
            </form>
            <p style={{ fontSize: '0.75rem', color: '#3a3a3a', marginTop: '10px' }}>
              $9.99/mo after free trial — cancel anytime.
            </p>
          </div>

          <a href="https://github.com/slotwatch/slotwatch" style={{
            color: '#3a3a3a',
            textDecoration: 'none',
            fontSize: '0.8125rem',
          }}>
            Or self-host for free on GitHub →
          </a>
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
          overflowX: 'auto',
        }}>
          {[
            { label: 'Service centers watched', value: data.centers.toString() },
            { label: 'Typical wait time', value: `${data.waitWeeks} wks` },
            { label: 'Check interval', value: '30 min' },
            { label: 'Metro population', value: data.population },
          ].map((stat, i, arr) => (
            <div key={stat.label} style={{
              padding: '28px 40px 28px 0',
              marginRight: i < arr.length - 1 ? '40px' : 0,
              borderRight: i < arr.length - 1 ? '1px solid #1a1a1a' : 'none',
              flexShrink: 0,
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

      {/* What SlotWatch watches for */}
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '72px 24px' }}>
        <h2 style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: '#3a3a3a',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}>
          What SlotWatch watches for in {data.city}
        </h2>
        <p style={{
          fontSize: '1rem',
          color: '#5a5a5a',
          lineHeight: 1.6,
          marginBottom: '36px',
          maxWidth: '520px',
        }}>
          SlotWatch monitors the Tesla scheduling system across {data.landmark} and alerts you the moment any of these events occur:
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2px',
          background: '#1a1a1a',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {alertTypes.map((item) => (
            <div key={item.label} style={{ background: '#0d0d0d', padding: '28px 24px' }}>
              <div style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#e31937',
                marginBottom: '14px',
              }} />
              <h3 style={{
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: '#f0f0f0',
                marginBottom: '10px',
                letterSpacing: '-0.01em',
              }}>
                {item.label}
              </h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: '#5a5a5a' }}>
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px 72px' }}>
        <h2 style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: '#3a3a3a',
          textTransform: 'uppercase',
          marginBottom: '36px',
        }}>
          How it works
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
              label: 'Sign up in 30 seconds',
              body: `Just your email — no Tesla login, no password, nothing to connect.`,
            },
            {
              label: `Pick your ${data.city} centers`,
              body: `Select any or all ${data.centers} ${data.landmark} service ${data.centers === 1 ? 'location' : 'locations'} and set your earliest acceptable date.`,
            },
            {
              label: 'Get an email, then book',
              body: `An earlier slot opens. We email you within minutes — you reschedule in the Tesla app before it fills.`,
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
        <div style={{
          maxWidth: '640px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1px',
          background: '#1e1e1e',
          borderRadius: '10px',
          overflow: 'hidden',
        }}>
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
      <div style={{ borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{
          maxWidth: '1120px',
          margin: '0 auto',
          padding: '64px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
        }}>
          <div>
            <h2 style={{
              fontSize: '1.375rem',
              fontWeight: 800,
              color: '#f0f0f0',
              letterSpacing: '-0.02em',
              marginBottom: '6px',
            }}>
              Stop waiting for a {data.city} Tesla appointment.
            </h2>
            <p style={{ color: '#6b6b6b', fontSize: '0.9375rem' }}>
              $9.99/mo. No contracts. Cancel anytime.
            </p>
          </div>
          <Link href={`/start?city=${encodeURIComponent(`${data.city}, ${data.stateAbbr}`)}`} style={{
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
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '48px 24px 64px', borderTop: '1px solid #0f0f0f' }}>
        <h2 style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: '#3a3a3a',
          textTransform: 'uppercase',
          marginBottom: '24px',
        }}>
          SlotWatch in other cities
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {otherCenters.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              style={{
                background: '#0d0d0d',
                border: '1px solid #1e1e1e',
                color: '#6b6b6b',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                padding: '6px 13px',
                borderRadius: '6px',
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
          <LogoMark size={22} />
          <span style={{ color: '#3a3a3a', fontSize: '0.8125rem' }}>SlotWatch</span>
        </Link>
        <span style={{ color: '#2a2a2a', fontSize: '0.8125rem' }}>
          Not affiliated with Tesla, Inc.
        </span>
      </footer>
    </div>
  )
}
