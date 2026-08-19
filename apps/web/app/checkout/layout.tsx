import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout — SlotWatch',
  robots: { index: false },
  alternates: {
    canonical: 'https://slotwatcher.app/checkout/',
  },
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
