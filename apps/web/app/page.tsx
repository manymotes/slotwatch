'use client'

import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'
import CheckEarliest from '../components/CheckEarliest'
import HeroCalendar from '../components/HeroCalendar'

const API = 'https://slotwatch.motesmass.workers.dev'

// ── Copy ──────────────────────────────────────────────────────────────────────

const faqs: { q: string; a: string }[] = [
  {
    q: 'Do I need to connect my Tesla account?',
    a: 'No. You never connect your Tesla account, and we never ask for your login or password. You just tell us which service center to watch and where to email you. When an earlier opening appears, you reschedule it yourself in the Tesla app.',
  },
  {
    q: 'What does it cost?',
    a: 'Nothing up front: no card, no fee. Every alert arrives in full with the center, the exact date and time. If an alert gets you an earlier appointment, we ask afterward whether you’d like to chip in what it was worth to you (suggested $19). If it didn’t help, you pay nothing. Keeping a watch running past your appointment date is an optional $6.99/mo.',
  },
  {
    q: 'Which service centers does SlotWatch watch?',
    a: 'Any Tesla Service Center in the US. You pick by city or ZIP when you sign up, and you can watch up to three at once — a second center nearby roughly doubles your odds.',
  },
  {
    q: 'How quickly will I be alerted?',
    a: 'We check your centers about every 5 minutes. A slot on an earlier day than anything we’ve told you about emails you right away. Extra times on days you already know about are batched into at most one email every few hours, so you’re never flooded.',
  },
  {
    q: 'What counts as an earlier slot?',
    a: 'Any opening at one of your watched centers on an earlier day than the appointment date you gave us. A same-day slot at an earlier time doesn’t count.',
  },
  {
    q: 'What if the slot is gone by the time I check?',
    a: 'Cancellations get grabbed fast, so open the Tesla app the moment an alert lands. If it was already taken you’ve lost nothing, and we keep watching.',
  },
  {
    q: 'What happens when my appointment date arrives?',
    a: 'Your watch ends automatically. You can start a new one for a future appointment, or opt into $6.99/mo to keep watching continuously.',
  },
]

const organizationSchemaJson = JSON.stringify({
  '@context': 'https://schema.org', '@type': 'Organization', name: 'SlotWatch', url: 'https://slotwatcher.app',
  logo: 'https://slotwatcher.app/apple-touch-icon.png',
  description: 'SlotWatch monitors Tesla service centers for earlier appointment openings and emails you the moment one appears.',
  sameAs: ['https://github.com/manymotes/slotwatch'],
})
const websiteSchemaJson = JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'SlotWatch', url: 'https://slotwatcher.app' })
const faqSchemaJson = JSON.stringify({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faqs.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
})
const softwareSchemaJson = JSON.stringify({
  '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'SlotWatch',
  applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Free — no card. If it works, pay what it was worth.' },
  description: 'SlotWatch monitors Tesla Service Center appointment availability across 40 US metros and emails you the moment a cancellation slot opens.',
  url: 'https://slotwatcher.app',
})

// ── Live numbers (real, from the worker; sections render nothing if unavailable) ──

type Stats = { ok: boolean; openingsTotal: number; centersWatched: number; alerts: number; avgEarlierDays: number | null; maxEarlierDays: number | null; ownersAlerted: number }
function useStats(): Stats | null {
  const [s, setS] = useState<Stats | null>(null)
  useEffect(() => {
    fetch(`${API}/api/stats/public`).then((r) => (r.ok ? r.json() : null)).then((d) => { if (d && d.ok) setS(d) }).catch(() => {})
  }, [])
  return s
}

// ── Hero form ─────────────────────────────────────────────────────────────────

function CityForm({ id, size = 'lg' }: { id: string; size?: 'lg' | 'md' }) {
  const [city, setCity] = useState('')
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!city.trim()) return
    window.location.href = '/start/?city=' + encodeURIComponent(city.trim())
  }
  return (
    <form onSubmit={submit} className="sw-cityform">
      <label htmlFor={id} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Your city or ZIP</label>
      <input id={id} name="city" type="text" required value={city} onChange={(e) => setCity(e.target.value)}
        placeholder="City or ZIP" autoComplete="postal-code" className="sw-input"
        style={{ flex: '1 1 auto', minWidth: 0, padding: size === 'lg' ? '15px 18px' : '13px 16px', fontSize: size === 'lg' ? '1rem' : '0.9375rem' }} />
      <button type="submit" className={`sw-btn sw-btn-primary${size === 'lg' ? ' sw-btn-lg' : ''}`}>See what&rsquo;s open now</button>
    </form>
  )
}

// ── The product, shown instead of described: a real-looking alert email ──────

function AlertPreview() {
  return (
    <div aria-label="Example SlotWatch alert email" className="sw-card" style={{ padding: 0, overflow: 'hidden', fontSize: '0.9375rem' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent)', display: 'grid', placeItems: 'center', flexShrink: 0 }} aria-hidden="true">
          <span style={{ width: 13, height: 13, border: '2px solid #fff', borderRadius: '50%' }} />
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, color: 'var(--ink)' }}>SlotWatch <span className="sw-muted" style={{ fontWeight: 400 }}>&lt;hello@slotwatcher.app&gt;</span></div>
          <div className="sw-muted" style={{ fontSize: '0.8125rem' }}>to you · 7:02 AM</div>
        </div>
        <span className="sw-muted" style={{ marginLeft: 'auto', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>Example</span>
      </div>
      <div style={{ padding: '18px 18px 20px' }}>
        <div className="sw-display" style={{ fontWeight: 600, fontSize: '1.0625rem', marginBottom: '12px' }}>Earlier Tesla slot: Nov 10 at 7:00 AM</div>
        <p style={{ margin: '0 0 12px', color: 'var(--ink-2)' }}>An earlier Tesla service opening just appeared at the center you&rsquo;re watching:</p>
        <div style={{ background: '#fff', borderRadius: 6, padding: '12px 14px', marginBottom: '14px', lineHeight: 1.6 }}>
          <div style={{ fontWeight: 500 }}>Tesla Service Rockville-Rockville Pike</div>
          <div>• 11/10/2026 at 07:00 AM <span className="sw-muted">(35 days earlier)</span></div>
          <div>• 11/10/2026 at 07:15 AM <span className="sw-muted">(35 days earlier)</span></div>
          <div>• 11/13/2026 at 10:00 AM <span className="sw-muted">(32 days earlier)</span></div>
        </div>
        <p style={{ margin: 0, color: 'var(--ink-2)' }}>Open the Tesla app → Service → your appointment → Reschedule to grab one.</p>
      </div>
      <div style={{ padding: '12px 18px', borderTop: '1px solid var(--line)', background: 'var(--ok-soft)', color: 'var(--ok)', fontWeight: 600, fontSize: '0.875rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span aria-hidden="true">↳</span> You: Dec 15 → Nov 10. Five weeks sooner.
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const stats = useStats()
  const avg = stats?.avgEarlierDays && stats.avgEarlierDays >= 1 ? Math.round(stats.avgEarlierDays) : null
  const max = stats?.maxEarlierDays && stats.maxEarlierDays >= 1 ? stats.maxEarlierDays : null

  return (
    <div style={{ minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationSchemaJson }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: websiteSchemaJson }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchemaJson }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: softwareSchemaJson }} />

      <SiteNav />

      {/* ── Screen 1: one sentence, the promise animated, one action ── */}
      <section className="sw-container sw-screen" style={{ textAlign: 'center' }}>
        <h1 className="sw-h1 text-balance" style={{ marginBottom: '10px' }}>Service sooner.</h1>
        <p className="sw-lede" style={{ marginBottom: '32px', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto' }}>
          SlotWatch watches your Tesla service center and emails you the moment an earlier appointment opens.
        </p>
        <HeroCalendar />
        <div style={{ maxWidth: '560px', margin: '32px auto 0' }}><CityForm id="hero-city" /></div>
        <p className="sw-help" style={{ marginTop: '14px' }}>Free. No card, no Tesla login. If it gets you in sooner, pay what it was worth.</p>
      </section>

      {/* ── Screen 2: the email you actually get ── */}
      <section className="sw-band">
        <div className="sw-container sw-screen" style={{ textAlign: 'center' }}>
          <h2 className="sw-h2" style={{ marginBottom: '10px' }}>One email. Then you rebook in the Tesla app.</h2>
          <p className="sw-lede" style={{ maxWidth: '560px', margin: '0 auto 32px' }}>
            The center, the exact date and time, and how much sooner it is. Nothing else, nothing to log in to.
          </p>
          <div style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'left' }}><AlertPreview /></div>
        </div>
      </section>

      {/* ── Real numbers ── */}
      {stats && stats.alerts > 0 && (
        <section className="sw-container" style={{ padding: '96px 0 40px' }}>
          <h2 className="sw-h2" style={{ textAlign: 'center', marginBottom: '32px' }}>What it has found so far</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', textAlign: 'center' }}>
            {[
              avg ? [`${avg} days`, 'sooner, on average, for the openings we’ve emailed owners about'] : null,
              max ? [`${max} days`, 'the biggest jump forward we’ve caught so far'] : null,
              [stats.openingsTotal.toLocaleString(), `appointment slots tracked across ${stats.centersWatched} service centers since July`],
              ['5 min', 'between checks, around the clock'],
            ].filter(Boolean).map((row, i) => (
              <div key={i} style={{ padding: '28px 16px', background: 'var(--surface)', borderRadius: 8 }}>
                <div className="sw-display" style={{ fontWeight: 500, fontSize: '2.25rem', letterSpacing: '-0.01em' }}>{(row as string[])[0]}</div>
                <div className="sw-muted" style={{ fontSize: '0.875rem', lineHeight: 1.45, marginTop: '4px' }}>{(row as string[])[1]}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── How it works: a plain numbered row, no icons ── */}
      <section id="how" className="sw-container" style={{ padding: '96px 0 72px' }}>
        <h2 className="sw-h2" style={{ marginBottom: '32px', textAlign: 'center' }}>Three minutes to set up. Then you stop checking.</h2>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '28px 40px' }}>
          {[
            ['Tell us where and when', 'Pick up to three service centers by city or ZIP and enter the appointment date Tesla gave you. Email only — no Tesla login, no card.'],
            ['We watch, every 5 minutes', 'SlotWatch checks what Tesla’s scheduler is showing at your centers around the clock. Most people never get around to checking that often.'],
            ['You get one email, then rebook', 'When a slot opens on an earlier day, you get the center, date and time. Open the Tesla app, Reschedule, done.'],
          ].map(([h, b], i) => (
            <li key={h} style={{ borderTop: '1px solid var(--line)', paddingTop: '18px' }}>
              <div className="sw-muted" style={{ fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>0{i + 1}</div>
              <h3 className="sw-h3" style={{ marginBottom: '8px' }}>{h}</h3>
              <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.6, fontSize: '0.9375rem' }}>{b}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Live check: the product, usable right here ── */}
      <section className="sw-band">
        <div className="sw-container sw-screen" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px 56px', alignItems: 'center' }}>
          <div>
            <h2 className="sw-h2" style={{ marginBottom: '14px' }}>See what&rsquo;s open at your center right now.</h2>
            <p className="sw-lede" style={{ marginBottom: '0' }}>
              This is the same lookup SlotWatch runs for you all day. Type a city or ZIP and we&rsquo;ll show the earliest appointment Tesla is offering at the nearest center this minute, no signup needed.
            </p>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 8 }}><CheckEarliest /></div>
        </div>
      </section>

      {/* ── Founder note: a real person, in plain words ── */}
      <section className="sw-container" style={{ padding: '96px 0 0' }}>
        <div className="sw-card" style={{ padding: '28px 28px 26px', maxWidth: '760px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '20px', alignItems: 'start' }}>
          <div aria-hidden="true" style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--ink)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontFamily: 'var(--font-display)' }}>K</div>
          <div>
            <p style={{ margin: '0 0 12px', color: 'var(--ink-2)', lineHeight: 1.65 }}>
              I drive a Tesla, and last time I needed service the app quoted me a date weeks out. A friend mentioned earlier slots open all the time when people cancel, so I started doing what you probably do too: open the app, refresh, close it, try again a few hours later. I caught one by luck and wondered how many I&rsquo;d missed.
            </p>
            <p style={{ margin: '0 0 14px', color: 'var(--ink-2)', lineHeight: 1.65 }}>
              That felt like something a computer should do instead of me. So I built SlotWatch. I hope it saves you some refreshing too.
            </p>
            <p style={{ margin: 0, fontSize: '0.875rem' }}><strong>Kendall</strong> <span className="sw-muted">· built and runs SlotWatch · <Link href="/about/" style={{ color: 'var(--ink-2)' }}>more</Link></span></p>
          </div>
        </div>
      </section>

      {/* ── Pricing: one honest paragraph ── */}
      <section id="pricing" className="sw-container" style={{ padding: '96px 0 72px', textAlign: 'center' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 className="sw-h2" style={{ marginBottom: '14px' }}>Free. If it works, pay what it was worth.</h2>
          <p className="sw-lede" style={{ marginBottom: '18px' }}>
            No card and no fee to start, and every alert arrives in full. After an alert we ask one question: did you get the earlier appointment?
            If yes, you can chip in what it was worth to you. If not, you pay nothing.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '26px', justifyContent: 'center' }}>
            {[['$9', 'Just an owner'], ['$19', 'Suggested'], ['$49', 'Rideshare, Turo or fleet'], ['Any amount', 'You decide']].map(([a, l]) => (
              <span key={a} style={{ borderRadius: 4, padding: '9px 14px', fontSize: '0.8125rem', background: 'var(--surface)' }}>
                <strong>{a}</strong> <span className="sw-muted">· {l}</span>
              </span>
            ))}
          </div>
          <a href="/start/" className="sw-btn sw-btn-primary sw-btn-lg">Start watching, free</a>
        </div>
      </section>

      {/* ── FAQ: plain, scannable ── */}
      <section className="sw-band">
        <div className="sw-container" style={{ padding: '72px 0' }}>
        <h2 className="sw-h2" style={{ marginBottom: '32px', textAlign: 'center' }}>Questions</h2>
        <dl style={{ margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '26px 48px', maxWidth: '1000px' }}>
          {faqs.map((f) => (
            <div key={f.q}>
              <dt className="sw-h3" style={{ fontSize: '1rem', marginBottom: '6px' }}>{f.q}</dt>
              <dd style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.6, fontSize: '0.9375rem' }}>{f.a}</dd>
            </div>
          ))}
        </dl>
        </div>
      </section>

      {/* ── Closing ── */}
      <section className="sw-container" style={{ padding: '96px 0 24px', textAlign: 'center' }}>
        <h2 className="sw-h2" style={{ marginBottom: '20px' }}>Stop refreshing. Start with your city.</h2>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}><CityForm id="footer-city" size="md" /></div>
      </section>

      <SiteFooter />
    </div>
  )
}
