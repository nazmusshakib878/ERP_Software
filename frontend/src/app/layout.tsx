/* oxlint-disable react/only-export-components -- Next.js metadata must be exported alongside the root layout. */
import type { Metadata } from 'next'
import '../index.css'

export const metadata: Metadata = {
  title: 'NS ERP · Enterprise Operations Suite',
  description: 'Enterprise operations, simplified.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
