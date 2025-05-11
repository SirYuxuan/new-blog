import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { preloadData } from "@/app/lib/cache"
import { Analytics } from '@vercel/analytics/react'
import GoogleAnalytics from "@/components/GoogleAnalytics"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Jimmy's Blog",
  description: "关于设计与简约的思考集",
  generator: 'v0.dev',
  icons: {
    icon: '/logo5.png'
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await preloadData()

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Analytics />
          {process.env.NEXT_PUBLIC_GA_ID && (
            <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_ID} />
          )}
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'