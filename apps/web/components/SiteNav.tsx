import Link from 'next/link'
import { Logo } from './Logo'

// Shared top bar. Keep it quiet: wordmark, three links, one action.
export default function SiteNav({ cta = 'Check my center', ctaHref = '/start/' }: { cta?: string; ctaHref?: string }) {
  return (
    <nav className="sw-nav">
      <div className="sw-container sw-nav-inner">
        <Logo size={26} />
        <div className="sw-nav-links">
          <Link href="/how-it-works/" className="sw-nav-hide">How it works</Link>
          <Link href="/guides/" className="sw-nav-hide">Guides</Link>
          <Link href="/cities/" className="sw-nav-hide">Cities</Link>
          <Link href="/login/">Log in</Link>
          <a href={ctaHref} className="sw-btn sw-btn-primary sw-btn-sm">{cta}</a>
        </div>
      </div>
    </nav>
  )
}
