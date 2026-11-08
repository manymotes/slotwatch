import Link from 'next/link'
import { Logo } from './Logo'

export default function SiteFooter() {
  return (
    <footer className="sw-footer">
      <div className="sw-container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px 28px' }}>
        <Logo size={22} fontSize="0.875rem" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
          <Link href="/how-it-works/">How it works</Link>
          <Link href="/guides/">Guides</Link>
          <Link href="/cities/">Cities</Link>
          <Link href="/about/">About</Link>
          <Link href="/contact/">Contact</Link>
          <Link href="/terms/">Terms</Link>
          <Link href="/privacy/">Privacy</Link>
          <a href="https://github.com/manymotes/slotwatch">GitHub</a>
        </div>
        <span>Independent. Not affiliated with Tesla, Inc.</span>
      </div>
    </footer>
  )
}
