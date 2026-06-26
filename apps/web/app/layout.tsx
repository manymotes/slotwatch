import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SlotWatch — Tesla Service Appointment Alerts',
  description:
    'SlotWatch monitors Tesla service centers for cancellations and available slots, then alerts you instantly by SMS and email. Skip the wait.',
  metadataBase: new URL('https://slotwatch.app'),
  openGraph: {
    title: 'SlotWatch — Tesla Service Appointment Alerts',
    description:
      'Stop refreshing the scheduling page. SlotWatch watches for open slots at your service center and texts you the moment one appears.',
    url: 'https://slotwatch.app',
    siteName: 'SlotWatch',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SlotWatch — Tesla Service Appointment Alerts',
    description:
      'Stop refreshing the scheduling page. SlotWatch watches for open slots and texts you instantly.',
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
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23e31937'/><text y='.9em' x='50%' text-anchor='middle' font-size='60' font-family='system-ui' fill='white'>S</text></svg>" />
      </head>
      <body>{children}</body>
    </html>
  )
}
