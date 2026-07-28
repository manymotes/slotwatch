import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connect your account — SlotWatch',
  robots: { index: false },
  alternates: {
    canonical: 'https://slotwatcher.app/oauth',
  },
}

export default function OAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
