import type { MetadataRoute } from 'next'
import { SERVICE_CENTERS } from '../lib/service-centers'
import { GUIDES } from '../lib/guides'

const BASE_URL = 'https://slotwatcher.app'

// Mirrors the releaseDate gate in app/[center]/page.tsx's generateStaticParams()
// so the sitemap never lists a city page before it actually exists in the export.
export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date().toISOString().split('T')[0]
  const liveCenters = SERVICE_CENTERS.filter((c) => c.releaseDate <= today)

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/cities/`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/start/`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/how-it-works/`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/guides/`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/contact/`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/about/`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/privacy/`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/terms/`, changeFrequency: 'monthly', priority: 0.3 },
  ]

  const cityPages: MetadataRoute.Sitemap = liveCenters.map((c) => ({
    url: `${BASE_URL}/${c.slug}/`,
    lastModified: c.releaseDate,
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  const guidePages: MetadataRoute.Sitemap = GUIDES.map((g) => ({
    url: `${BASE_URL}/guides/${g.slug}/`,
    lastModified: g.datePublished,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticPages, ...cityPages, ...guidePages]
}
