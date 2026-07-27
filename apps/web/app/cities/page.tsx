import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '../../components/Logo'
import { SERVICE_CENTERS } from '../../lib/service-centers'

export const metadata: Metadata = {
  title: 'Tesla Service Wait Times by City — SlotWatch',
  description: 'Browse Tesla service appointment wait times and cancellation-slot alerts for every city SlotWatch covers, organized by state.',
  alternates: { canonical: 'https://slotwatcher.app/cities' },
  openGraph: {
    title: 'Tesla Service Wait Times by City — SlotWatch',
    description: 'Browse Tesla service appointment wait times and cancellation-slot alerts for every city SlotWatch covers, organized by state.',
    url: 'https://slotwatcher.app/cities',
  },
}

export default function CitiesIndex() {
  const today = new Date().toISOString().split('T')[0]
  const live = SERVICE_CENTERS.filter((c) => c.releaseDate <= today)

  const byState = new Map<string, typeof live>()
  for (const c of live) {
    const list = byState.get(c.state)
    if (list) list.push(c)
    else byState.set(c.state, [c])
  }
  const states = [...byState.keys()].sort((a, b) => a.localeCompare(b))
  for (const list of byState.values()) list.sort((a, b) => a.city.localeCompare(b.city))

  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      <nav style={{ borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
          <Logo size={28} />
          <Link href="/start" style={{ background: '#e31937', color: '#fff', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600, padding: '7px 14px', borderRadius: '6px' }}>Start watching</Link>
        </div>
      </nav>

      <section style={{ maxWidth: '960px', margin: '0 auto', padding: '72px 24px 96px' }}>
        <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.14em', color: '#e31937', textTransform: 'uppercase', marginBottom: '16px' }}>Cities</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f0f0', marginBottom: '16px' }}>
          Tesla service wait times by city
        </h1>
        <p style={{ color: '#8a8a8a', fontSize: '1.0625rem', lineHeight: 1.6, marginBottom: '48px', maxWidth: '640px' }}>
          SlotWatch tracks typical wait times and cancellation slots at {live.length} US Tesla service centers.
          Find your city below, or read{' '}
          <Link href="/guides/how-to-get-an-earlier-tesla-service-appointment" style={{ color: '#e31937', textDecoration: 'none' }}>
            how to get an earlier Tesla service appointment
          </Link>{' '}
          for strategies that work anywhere.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '32px' }}>
          {states.map((state) => (
            <div key={state}>
              <h2 style={{ color: '#f0f0f0', fontSize: '0.9375rem', fontWeight: 700, marginBottom: '10px' }}>{state}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {byState.get(state)!.map((c) => (
                  <Link key={c.slug} href={`/${c.slug}`} style={{ color: '#8a8a8a', textDecoration: 'none', fontSize: '0.875rem' }}>
                    {c.city}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
