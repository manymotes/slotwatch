import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://slotwatcher.app/checkout',
  },
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
