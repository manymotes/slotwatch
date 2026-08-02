import { marked } from 'marked'

// Internal links in our markdown are written without trailing slashes
// (e.g. [SlotWatch](/start)). The site uses `trailingSlash: true`, so those
// URLs 308-redirect to the slashed version — which Google reports as
// "Page with redirect" and refuses to index. Normalize every internal,
// absolute-path link to its slashed form so crawlers hit a 200 directly.
export function addTrailingSlashes(html: string): string {
  return html.replace(/href="(\/[^"]*)"/g, (match, href: string) => {
    const splitAt = href.search(/[#?]/)
    const path = splitAt === -1 ? href : href.slice(0, splitAt)
    const rest = splitAt === -1 ? '' : href.slice(splitAt)
    if (path === '/' || path.endsWith('/')) return match
    // Leave file-like paths alone (e.g. /og-image.png, /sitemap.xml)
    const lastSegment = path.split('/').pop() || ''
    if (lastSegment.includes('.')) return match
    return `href="${path}/${rest}"`
  })
}

// Server component: renders trusted (our own) markdown to styled HTML at build time.
export default function Markdown({ md }: { md: string }) {
  const html = addTrailingSlashes(marked.parse(md, { async: false }) as string)
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
}
