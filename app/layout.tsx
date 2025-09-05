import { Inter } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import GoogleAnalytics from "@/components/GoogleAnalytics"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#18181b' }
  ],
}

export const metadata: Metadata = {
  title: '雨轩博客',
  description: '书写，思考，生活',
  keywords: ['blog', 'technology', 'personal blog', 'next.js'],
  authors: [{ name: 'Sir丶雨轩' }],
  creator: 'Sir丶雨轩',
  publisher: 'Sir丶雨轩',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://blog.oofo.cc'),
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://blog.oofo.cc',
    title: '雨轩博客',
    description: '书写，思考，生活',
    siteName: '雨轩博客',
    images: [
      {
        url: 'https://oofo.cc/og-image.png',
        width: 1200,
        height: 630,
        alt: '雨轩博客',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '雨轩博客',
    description: '书写，思考，生活',
    images: ['https://blog.oofo.cc/og-image.png'],
  },
  icons: {
    icon: '/favorite.png',
    apple: '/favorite.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.className} bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 antialiased`}>
        <ThemeProvider>
          {children}
          {process.env.NEXT_PUBLIC_GA_ID && (
            <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_ID} />
          )}
        </ThemeProvider>
      </body>
    </html>
  )
}

import './globals.css'