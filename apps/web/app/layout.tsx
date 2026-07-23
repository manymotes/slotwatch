import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SlotWatch — Tesla Service Appointment Alerts',
  description:
    'SlotWatch monitors Tesla service centers for earlier appointment openings and emails you the moment one appears. No Tesla login required.',
  metadataBase: new URL('https://slotwatcher.app'),
  openGraph: {
    title: 'SlotWatch — Tesla Service Appointment Alerts',
    description:
      'Stop refreshing the scheduling page. SlotWatch watches your service center and emails you the moment an earlier slot opens.',
    url: 'https://slotwatcher.app',
    siteName: 'SlotWatch',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SlotWatch — Tesla Service Appointment Alerts',
    description:
      'Stop refreshing the scheduling page. SlotWatch watches your service center and emails you the moment an earlier slot opens.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#080808" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='9' fill='%23e31937'/><circle cx='15' cy='17' r='7.5' fill='none' stroke='white' stroke-width='2'/><path d='M15 17 L15 12.2' stroke='white' stroke-width='2' stroke-linecap='round'/><path d='M15 17 L18.6 18.9' stroke='white' stroke-width='2' stroke-linecap='round'/><circle cx='15' cy='17' r='1.4' fill='white'/><circle cx='24.5' cy='8.5' r='4' fill='%23e31937'/><circle cx='24.5' cy='8.5' r='2.6' fill='white'/></svg>" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body>{children}</body>
    </html>
  )
}
