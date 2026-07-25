import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo, LogoMark } from '@/components/Logo'
import { SERVICE_CENTERS } from '@/lib/service-centers'

const TITLE = 'How to Get an Earlier Tesla Service Appointment (2026 Guide)'
const DESCRIPTION =
  'Waiting weeks for a Tesla service appointment? Here are the methods that actually work — from calling nearby centers to automating the search for cancellation slots.'
const URL = 'https://slotwatcher.app/guides/how-to-get-earlier-tesla-service-appointment/'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    type: 'article',
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
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['https://slotwatcher.app/og-image.png'],
  },
}

const faqs = [
  {
    q: 'Why is it so hard to get an early Tesla service appointment?',
    a: 'Demand at most Tesla service centers outpaces same-week capacity, so the Tesla app usually only shows openings 3–10 weeks out depending on your city. The good news: cancellations, reschedules, and newly released dates open up earlier slots constantly — you just have to catch one before someone else does.',
  },
  {
    q: 'Does calling the service center actually help?',
    a: "Sometimes. Advisors can occasionally see openings or add you to an informal waitlist, but they can't monitor the schedule for you around the clock, and policies vary by location. It's worth one call, but it's not a substitute for checking regularly.",
  },
  {
    q: 'Should I book multiple service centers and cancel the extras?',
    a: "You can check appointment availability at any center within driving distance and book the earliest one you're willing to visit. Just cancel the ones you don't use with reasonable notice — that same courtesy is exactly what creates the cancellation openings this guide is about.",
  },
  {
    q: 'Is mobile service faster than a center appointment?',
    a: "For many repairs, yes — Tesla's mobile technicians handle a lot of common issues without a center visit at all, and mobile availability is sometimes separate from center backlogs. It's worth asking about when you book, especially for smaller issues.",
  },
  {
    q: 'How does SlotWatch get me in sooner without me checking constantly?',
    a: "SlotWatch checks your chosen Tesla service centers every 30 minutes and emails you the instant an earlier slot appears — from a cancellation, a reschedule, or a newly released date. You reschedule it yourself in the Tesla app; we never touch your Tesla account or log in for you.",
  },
]

const relatedCities = SERVICE_CENTERS.filter((c) =>
  ['los-angeles-tesla-service', 'new-york-tesla-service', 'san-francisco-tesla-service', 'chicago-tesla-service', 'seattle-tesla-service'].includes(c.slug)
)

export default function GuidePage() {
  const articleSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: '2026-07-25',
    dateModified: '2026-07-25',
    url: URL,
    image: 'https://slotwatcher.app/og-image.png',
    author: { '@type': 'Organization', name: 'SlotWatch' },
    publisher: { '@type': 'Organization', name: 'SlotWatch', logo: { '@type': 'ImageObject', url: 'https://slotwatcher.app/og-image.png' } },
    mainEntityOfPage: URL,
  })

  const faqSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  })

  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: articleSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(8, 8, 8, 0.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
          <Logo size={28} />
          <Link href="/start" style={{ background: '#e31937', color: '#fff', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600, padding: '7px 14px', borderRadius: '6px' }}>
            Start watching
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '760px', margin: '0 auto', padding: '64px 24px 32px' }}>
        <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.14em', color: '#e31937', textTransform: 'uppercase', marginBottom: '20px' }}>
          Tesla Service Guide
        </p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.03em', color: '#f0f0f0', marginBottom: '20px' }}>
          {TITLE}
        </h1>
        <p style={{ fontSize: '1.0625rem', lineHeight: 1.65, color: '#8a8a8a', marginBottom: '32px', maxWidth: '640px' }}>
          If the Tesla app is showing you a service date weeks out, you're not stuck with it. Earlier slots open up constantly from cancellations, reschedules, and newly released dates — here's how to actually catch one, manually or automatically.
        </p>

        {/* Email CTA */}
        <div style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '24px', maxWidth: '480px', marginBottom: '12px' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e8e8e8', marginBottom: '14px', letterSpacing: '-0.01em' }}>
            Skip the manual checking — get emailed the moment a slot opens
          </p>
          <form action="/start" method="GET" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="email"
              name="email"
              required
              placeholder="your@email.com"
              style={{ flex: '1 1 200px', background: '#161616', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#f0f0f0', fontSize: '0.875rem', padding: '10px 14px', outline: 'none', minWidth: 0 }}
            />
            <button type="submit" style={{ background: '#e31937', color: '#fff', fontWeight: 700, fontSize: '0.875rem', border: 'none', borderRadius: '6px', padding: '10px 18px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Watch my center
            </button>
          </form>
          <p style={{ fontSize: '0.75rem', color: '#3a3a3a', marginTop: '10px' }}>
            Email alerts only · no Tesla login · $24 one-time, 60-day watch
          </p>
        </div>
      </section>

      {/* Body */}
      <section style={{ maxWidth: '760px', margin: '0 auto', padding: '8px 24px 48px', color: '#c8c8c8', fontSize: '1rem', lineHeight: 1.75 }}>
        <h2 style={{ color: '#f0f0f0', fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '32px 0 14px' }}>
          Why Tesla service waits stretch so long
        </h2>
        <p style={{ marginBottom: '16px' }}>
          Most Tesla service centers book out further than same-week availability, and how far depends heavily on your metro — some owners see 3–4 weeks, others 8 or more. Tesla's own guidance and owner forums (Teslamotorsclub, Teslarati) generally boil down to the same advice: keep checking the app, and try more than one center if you have options nearby. That advice works, but only if you actually have time to check it repeatedly.
        </p>

        <h2 style={{ color: '#f0f0f0', fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '32px 0 14px' }}>
          5 ways to get in sooner
        </h2>
        <ol style={{ paddingLeft: '22px', margin: '0 0 16px' }}>
          <li style={{ marginBottom: '14px' }}>
            <strong style={{ color: '#f0f0f0' }}>Check the Tesla app several times a day.</strong> Cancellations and reschedules open earlier slots at random times, so the more often you look, the better your odds of catching one before someone else does.
          </li>
          <li style={{ marginBottom: '14px' }}>
            <strong style={{ color: '#f0f0f0' }}>Call or message every center within driving distance</strong> — not just the one the app defaults to. Availability differs center to center, and an advisor can sometimes see openings that aren't obvious in the app yet.
          </li>
          <li style={{ marginBottom: '14px' }}>
            <strong style={{ color: '#f0f0f0' }}>Ask about mobile service.</strong> A lot of common repairs don't need a center visit at all, and mobile technician availability is sometimes wide open even when centers are backed up.
          </li>
          <li style={{ marginBottom: '14px' }}>
            <strong style={{ color: '#f0f0f0' }}>Book the earliest slot you find, then keep watching for something sooner.</strong> Holding an appointment costs you nothing, and rebooking to an earlier one just frees your original slot for someone else — the same courtesy that creates openings for you.
          </li>
          <li style={{ marginBottom: '14px' }}>
            <strong style={{ color: '#f0f0f0' }}>Automate the watching.</strong> This is the part manual methods can't really solve — nobody can refresh a scheduling page every 30 minutes, all day, for weeks. That's the one job SlotWatch does.
          </li>
        </ol>

        <h2 style={{ color: '#f0f0f0', fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '32px 0 14px' }}>
          How SlotWatch automates step 5
        </h2>
        <p style={{ marginBottom: '12px' }}>
          Tell SlotWatch your email and up to 3 Tesla service centers to watch. We check availability every 30 minutes and email you the moment an earlier slot appears — a cancellation, a reschedule, or a newly released date. You reschedule it yourself in the Tesla app; we never ask for or touch your Tesla login.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', margin: '20px 0 8px' }}>
          <Link href="/start" style={{ display: 'inline-flex', alignItems: 'center', background: '#e31937', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.9375rem', padding: '13px 26px', borderRadius: '8px' }}>
            Start watching my center →
          </Link>
          <Link href="/how-it-works" style={{ display: 'inline-flex', alignItems: 'center', color: '#8a8a8a', textDecoration: 'none', fontSize: '0.9375rem', padding: '13px 10px' }}>
            See how it works
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px 64px' }}>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', color: '#3a3a3a', textTransform: 'uppercase', marginBottom: '20px' }}>
          Frequently asked questions
        </h2>
        {faqs.map((f) => (
          <div key={f.q} style={{ borderTop: '1px solid #1a1a1a', padding: '18px 0' }}>
            <h3 style={{ color: '#f0f0f0', fontSize: '1rem', fontWeight: 600, margin: '0 0 8px' }}>{f.q}</h3>
            <p style={{ color: '#9a9a9a', fontSize: '0.9375rem', lineHeight: 1.65, margin: 0 }}>{f.a}</p>
          </div>
        ))}
      </section>

      {/* CTA band */}
      <div style={{ borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '64px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#f0f0f0', letterSpacing: '-0.02em', marginBottom: '6px' }}>
              Stop refreshing the Tesla app.
            </h2>
            <p style={{ color: '#6b6b6b', fontSize: '0.9375rem' }}>$24 one-time · money-back guarantee · no subscription</p>
          </div>
          <Link href="/start" style={{ display: 'inline-flex', alignItems: 'center', background: '#e31937', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.9375rem', padding: '13px 26px', borderRadius: '8px', whiteSpace: 'nowrap' }}>
            Start watching
          </Link>
        </div>
      </div>

      {/* Related cities */}
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '48px 24px 64px', borderTop: '1px solid #0f0f0f' }}>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', color: '#3a3a3a', textTransform: 'uppercase', marginBottom: '24px' }}>
          Tesla service wait times by city
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {relatedCities.map((c) => (
            <Link key={c.slug} href={`/${c.slug}`} style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', color: '#6b6b6b', textDecoration: 'none', fontSize: '0.8125rem', padding: '6px 13px', borderRadius: '6px' }}>
              {c.city}, {c.stateAbbr}
            </Link>
          ))}
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
