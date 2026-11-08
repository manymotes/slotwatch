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
  /** 'solid' = ink mark with a red arrowhead on the page; 'tile' = white mark on a red rounded square (favicons, app icons). */
  variant?: 'solid' | 'tile' | 'dark';
}) {
  // The rewind clock: a clock ring running backwards — the appointment moved earlier.
  const tile = variant !== 'solid';
  const ring = tile ? '#ffffff' : 'currentColor';
  const arrow = variant === 'tile' ? '#ffffff' : '#d2182e';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0, color: 'var(--ink)', borderRadius: tile ? size * 0.25 : 0 }}
      aria-hidden="true"
    >
      {tile && <rect width="32" height="32" rx="8" fill={variant === 'tile' ? '#d2182e' : '#16140f'} />}
      <path d="M6.6 12.6 A10 10 0 1 0 12.6 6.6" stroke={ring} strokeWidth="3" strokeLinecap="round" />
      <polygon points="9.4,7.9 13.8,9.4 11.9,4.1" fill={arrow} />
      <path d="M16 16 L16 9.6" stroke={ring} strokeWidth="3" strokeLinecap="round" />
      <path d="M16 16 L20.4 18.4" stroke={ring} strokeWidth="3" strokeLinecap="round" />
      <circle cx="16" cy="16" r="1.9" fill={ring} />
    </svg>
  );
}

/** Mark + "SlotWatch" wordmark, linked to home. Used in nav/footer. */
export function Logo({
  size = 28,
  color = 'var(--ink)',
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
      <span style={{ color, fontWeight: 700, fontSize, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>SlotWatch</span>
    </Link>
  );
}
