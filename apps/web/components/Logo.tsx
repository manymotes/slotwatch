import Link from 'next/link';

/**
 * SlotWatch logo mark — a rounded-square "app icon" holding a minimalist watch
 * face (ring + hands at 10:08) with a red pulse dot in the notch. The ring/lens
 * reads as "watching"; the pulse dot is the earlier slot we caught.
 *
 * Two palettes:
 *  - variant="solid" (default): red square, white glyph — for use on dark/light UI.
 *  - variant="dark": near-black square, white glyph, red pulse dot — for favicons/OG.
 */
export function LogoMark({
  size = 28,
  variant = 'solid',
}: {
  size?: number;
  variant?: 'solid' | 'dark';
}) {
  const square = variant === 'dark' ? '#0b0b0c' : '#e31937';
  const glyph = '#ffffff';
  const pulse = variant === 'dark' ? '#e31937' : '#ffffff';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', borderRadius: size * 0.28, flexShrink: 0 }}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9" fill={square} />
      {/* watch face ring */}
      <circle cx="15" cy="17" r="7.5" stroke={glyph} strokeWidth="2" />
      {/* hour + minute hands at ~10:08 */}
      <path d="M15 17 L15 12.2" stroke={glyph} strokeWidth="2" strokeLinecap="round" />
      <path d="M15 17 L18.6 18.9" stroke={glyph} strokeWidth="2" strokeLinecap="round" />
      <circle cx="15" cy="17" r="1.4" fill={glyph} />
      {/* pulse dot — the caught opening, top-right notch */}
      <circle cx="24.5" cy="8.5" r="4" fill={square} />
      <circle cx="24.5" cy="8.5" r="2.6" fill={pulse} />
    </svg>
  );
}

/** Mark + "SlotWatch" wordmark, linked to home. Used in nav/footer. */
export function Logo({
  size = 28,
  color = '#f0f0f0',
  fontSize = '0.9375rem',
  href = '/',
}: {
  size?: number;
  color?: string;
  fontSize?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
    >
      <LogoMark size={size} />
      <span style={{ color, fontWeight: 600, fontSize, letterSpacing: '-0.01em' }}>SlotWatch</span>
    </Link>
  );
}
