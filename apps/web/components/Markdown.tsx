import { marked } from 'marked'

// Server component: renders trusted (our own) markdown to styled HTML at build time.
export default function Markdown({ md }: { md: string }) {
  const html = marked.parse(md, { async: false }) as string
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
}
