'use client'

import Link from 'next/link'
import { useState, useRef, FormEvent } from 'react'
import { Logo, LogoMark } from '../components/Logo'

// ── Icons (inline SVG, no external deps) ──────────────────────────────────────

function IconKey() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="M21 8.5l-4.5 4.5M21 8.5L19 6.5M16.5 11.5L15 10" />
      <path d="M12 12l-1 1" />
    </svg>
  )
}

function IconTarget() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
    </svg>
  )
}

function IconBell() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function IconGithub() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

// ── Accordion ─────────────────────────────────────────────────────────────────

type FAQItem = { q: string; a: string }

function Accordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#1e1e1e', borderRadius: '10px', overflow: 'hidden' }}>
      {items.map((item, i) => (
        <div key={i} style={{ background: '#0d0d0d' }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#f0f0f0',
              fontSize: '1rem',
              fontWeight: 500,
              textAlign: 'left',
              gap: '16px',
            }}
          >
            <span>{item.q}</span>
            <span style={{ flexShrink: 0, color: '#6b6b6b' }}>
              <IconChevron open={open === i} />
            </span>
          </button>
          <div
            style={{
              maxHeight: open === i ? '400px' : '0',
              overflow: 'hidden',
              transition: 'max-height 0.3s ease',
            }}
          >
            <p style={{
              padding: '0 24px 20px',
              color: '#8a8a8a',
              lineHeight: 1.7,
              margin: 0,
              fontSize: '0.9375rem',
            }}>
              {item.a}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Email Capture ─────────────────────────────────────────────────────────────

function EmailCapture() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email.trim()) return
    // Carry the email into the real signup + checkout flow
    window.location.href = '/start?email=' + encodeURIComponent(email.trim())
  }

  if (status === 'success') {
    return (
      <p style={{
        color: '#22c55e',
        fontWeight: 600,
        fontSize: '1rem',
        padding: '14px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span aria-hidden="true">✓</span> We&apos;ll be in touch at {email}
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-start' }}>
      <div style={{ position: 'relative', flex: '1 1 260px' }}>
        <input
          ref={inputRef}
          type="email"
          required
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
          placeholder="Your email address"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: '#111',
            border: '1px solid #2a2a2a',
            borderRadius: '8px',
            color: '#f0f0f0',
            fontSize: '1rem',
            padding: '14px 18px',
            outline: 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#e31937'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(227,25,55,0.18)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#2a2a2a'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: status === 'loading' ? '#b5142c' : '#e31937',
            color: '#fff',
            border: 'none',
            cursor: status === 'loading' ? 'wait' : 'pointer',
            fontWeight: 700,
            fontSize: '1rem',
            padding: '14px 24px',
            borderRadius: '8px',
            letterSpacing: '-0.01em',
            transition: 'background 0.15s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => { if (status !== 'loading') e.currentTarget.style.background = '#c4152f' }}
          onMouseLeave={(e) => { if (status !== 'loading') e.currentTarget.style.background = '#e31937' }}
        >
          {status === 'loading' ? 'Sending…' : 'Get started →'}
        </button>
        {status === 'error' && (
          <p style={{ color: '#ef4444', fontSize: '0.8125rem', margin: 0 }}>
            Something went wrong — try again
          </p>
        )}
      </div>
    </form>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const faqs: FAQItem[] = [
  {
    q: 'Do I need to connect my Tesla account?',
    a: 'No. You never connect your Tesla account, and we never ask for your login or password. You just tell us which service center to watch and where to email you. When an earlier opening appears, you reschedule it yourself in the Tesla app.',
  },
  {
    q: 'What happens if I want to cancel?',
    a: 'Cancel anytime. No annual contracts, no cancellation fees. Your subscription ends at the close of the current billing period.',
  },
  {
    q: 'Which service centers does SlotWatch watch?',
    a: 'Any Tesla Service Center in the US. You pick your location by city or ZIP code when you sign up, and you can watch more than one.',
  },
  {
    q: 'How quickly will I be alerted?',
    a: 'SlotWatch checks your service center every 30 minutes. When an earlier opening appears, we email you right away so you can jump into the Tesla app and grab it.',
  },
]

const steps = [
  {
    icon: <IconTarget />,
    label: 'Pick your service center',
    body: 'Enter your email and choose your Tesla service center by city or ZIP. No Tesla login required.',
  },
  {
    icon: <IconKey />,
    label: 'Set your window',
    body: 'Tell us the date range you\'d take an earlier appointment in — we\'ll only email you about openings that fit.',
  },
  {
    icon: <IconBell />,
    label: 'Get an email, then book',
    body: 'The moment an earlier opening appears at your center, we email you. Open the Tesla app to reschedule before it\'s gone.',
  },
]

const freeFeatures = [
  'Open source on GitHub',
  'Docker Compose setup',
  'Self-managed server',
  'Full source access',
]

const proFeatures = [
  'No Tesla login required',
  'Instant email alerts',
  'Checks every 30 minutes',
  'Watch multiple centers',
  'Cancel anytime',
]

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>

      {/* ── Nav ── */}
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
          <Logo size={28} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link href="/#pricing" style={{ color: '#8a8a8a', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.15s' }}>
              Pricing
            </Link>
            <a href="https://github.com/manymotes/slotwatch" style={{ color: '#8a8a8a', textDecoration: 'none', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.15s' }}>
              <IconGithub />
              <span style={{ display: 'none' }}>GitHub</span>
            </a>
            <a href="/start" style={{
              background: '#e31937',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '0.8125rem',
              fontWeight: 600,
              padding: '7px 14px',
              borderRadius: '6px',
              letterSpacing: '0.01em',
              transition: 'opacity 0.15s',
            }}>
              Get started
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '96px 24px 80px' }}>
        <div style={{ maxWidth: '680px' }}>
          <p style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            color: '#e31937',
            textTransform: 'uppercase',
            marginBottom: '24px',
          }}>
            Service appointment alerts
          </p>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: '#f0f0f0',
            textWrap: 'balance' as never,
            marginBottom: '24px',
          }}>
            Get the service appointment you{' '}
            <em style={{ color: '#e31937', fontStyle: 'normal' }}>actually</em>{' '}
            want.
          </h1>
          <p style={{
            fontSize: '1.125rem',
            lineHeight: 1.65,
            color: '#8a8a8a',
            maxWidth: '560px',
            marginBottom: '40px',
          }}>
            SlotWatch watches your Tesla service center and emails you the moment an earlier appointment opens up — so you can jump into the Tesla app and grab it. No Tesla login required.
          </p>
          <div id="hero-form">
            <EmailCapture />
          </div>
          <div style={{ marginTop: '16px' }}>
            <a href="https://github.com/manymotes/slotwatch" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#8a8a8a',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.9375rem',
              padding: '4px 0',
              transition: 'color 0.15s',
            }}>
              <IconGithub />
              Self-host for free
            </a>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ height: '1px', background: '#1a1a1a' }} />
      </div>

      {/* ── How it works ── */}
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: '#3a3a3a',
          textTransform: 'uppercase',
          marginBottom: '48px',
        }}>
          How it works
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2px',
          background: '#1a1a1a',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              background: '#0d0d0d',
              padding: '36px 32px',
            }}>
              <div style={{
                color: '#e31937',
                marginBottom: '20px',
              }}>
                {step.icon}
              </div>
              <p style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#3a3a3a',
                marginBottom: '10px',
              }}>
                Step {i + 1}
              </p>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#f0f0f0',
                marginBottom: '12px',
                letterSpacing: '-0.01em',
              }}>
                {step.label}
              </h3>
              <p style={{
                fontSize: '0.9375rem',
                lineHeight: 1.6,
                color: '#6b6b6b',
              }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: '#3a3a3a',
          textTransform: 'uppercase',
          marginBottom: '48px',
        }}>
          Pricing
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2px',
          background: '#1a1a1a',
          borderRadius: '12px',
          overflow: 'hidden',
          maxWidth: '720px',
        }}>
          {/* Free */}
          <div style={{ background: '#0d0d0d', padding: '40px 36px' }}>
            <p style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#3a3a3a',
              marginBottom: '16px',
            }}>
              Free
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
              <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#f0f0f0', letterSpacing: '-0.03em' }}>$0</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#6b6b6b', marginBottom: '32px' }}>
              Run it yourself
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {freeFeatures.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#8a8a8a', fontSize: '0.9375rem' }}>
                  <span style={{ color: '#3a3a3a', flexShrink: 0 }}><IconCheck /></span>
                  {f}
                </li>
              ))}
            </ul>
            <a href="https://github.com/manymotes/slotwatch" style={{
              display: 'block',
              textAlign: 'center',
              border: '1px solid #2a2a2a',
              color: '#6b6b6b',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              padding: '11px 20px',
              borderRadius: '7px',
              transition: 'border-color 0.15s, color 0.15s',
            }}>
              View on GitHub
            </a>
          </div>

          {/* Pro */}
          <div style={{ background: '#0d0d0d', padding: '40px 36px', position: 'relative' }}>
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: '#e31937',
              color: '#fff',
              fontSize: '0.625rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '4px 8px',
              borderRadius: '4px',
            }}>
              Recommended
            </div>
            <p style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#e31937',
              marginBottom: '16px',
            }}>
              Pro
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
              <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#f0f0f0', letterSpacing: '-0.03em' }}>$9.99</span>
              <span style={{ fontSize: '0.875rem', color: '#6b6b6b' }}>/month</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#6b6b6b', marginBottom: '32px' }}>
              We run it for you
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {proFeatures.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#c8c8c8', fontSize: '0.9375rem' }}>
                  <span style={{ color: '#e31937', flexShrink: 0 }}><IconCheck /></span>
                  {f}
                </li>
              ))}
            </ul>
            <a href="/start" style={{
              display: 'block',
              textAlign: 'center',
              background: '#e31937',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.9375rem',
              padding: '12px 20px',
              borderRadius: '7px',
              transition: 'opacity 0.15s',
            }}>
              Get started
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: '#3a3a3a',
          textTransform: 'uppercase',
          marginBottom: '48px',
        }}>
          Questions
        </h2>
        <div style={{ maxWidth: '680px' }}>
          <Accordion items={faqs} />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid #1a1a1a',
        maxWidth: '1120px',
        margin: '0 auto',
        padding: '32px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LogoMark size={22} />
          <span style={{ color: '#3a3a3a', fontSize: '0.8125rem' }}>SlotWatch</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <a href="https://github.com/manymotes/slotwatch" style={{
            color: '#3a3a3a',
            textDecoration: 'none',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <IconGithub />
            GitHub
          </a>
          <span style={{ color: '#2a2a2a', fontSize: '0.8125rem' }}>
            Not affiliated with Tesla, Inc.
          </span>
        </div>
      </footer>
    </div>
  )
}
