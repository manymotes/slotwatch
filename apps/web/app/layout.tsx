import type { Metadata, Viewport } from 'next'
import './globals.css'
import Analytics from '../components/Analytics'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f7f5f0',
}

export const metadata: Metadata = {
  title: 'SlotWatch — Tesla Service Appointment Alerts',
  description:
    'SlotWatch monitors Tesla service centers for earlier appointment openings and emails you the moment one appears. No Tesla login required.',
  metadataBase: new URL('https://slotwatcher.app'),
  alternates: {
    canonical: 'https://slotwatcher.app/',
  },
  openGraph: {
    title: 'SlotWatch — Tesla Service Appointment Alerts',
    description:
      'Stop refreshing the scheduling page. SlotWatch watches your service center and emails you the moment an earlier slot opens.',
    url: 'https://slotwatcher.app',
    siteName: 'SlotWatch',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://slotwatcher.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SlotWatch — Tesla Service Appointment Alerts',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SlotWatch — Tesla Service Appointment Alerts',
    description:
      'Stop refreshing the scheduling page. SlotWatch watches your service center and emails you the moment an earlier slot opens.',
    images: ['https://slotwatcher.app/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/png" href="/favicon-32.png" sizes="32x32" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>{children}<Analytics /></body>
    </html>
  )
}
