import type { Metadata } from 'next'
import { DM_Sans, Geist_Mono, Sora } from 'next/font/google'
import './globals.css'

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  weight: ['500', '600', '700']
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'GIS Medical Dashboard',
  description: 'Real-time GIS medical resource monitoring for Syria'
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${dmSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
