import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { BASE_URL } from '@/lib/config'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Strohballen Verwaltung',
  description: 'Verwaltungssystem für Gerstenstroh, Weizenstroh und Heuballen',
  generator: 'v0.app',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: 'Strohballen Verwaltung',
    description: 'Verwaltungssystem für Gerstenstroh, Weizenstroh und Heuballen',
    url: BASE_URL,
    siteName: 'Strohballen Verwaltung',
    locale: 'de_DE',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
