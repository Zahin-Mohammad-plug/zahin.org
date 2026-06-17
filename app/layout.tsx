import type React from "react"
import type { Metadata } from "next"
import { Inter, Inter_Tight } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight" })

// This app is served under a base path (/v2); the metadata icon/manifest URLs
// are not auto-prefixed by Next, so resolve them against the base path manually.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export const metadata: Metadata = {
  title: "Zahin - Portfolio",
  description: "Personal portfolio showcasing projects, passions, and technical stack",
  icons: {
    icon: [
      {
        url: `${BASE}/favicon.ico`,
      },
      {
        url: `${BASE}/icon.svg`,
        type: "image/svg+xml",
      },
    ],
    apple: `${BASE}/apple-icon.png`,
  },
  manifest: `${BASE}/manifest.json`,
  other: {
    "apple-mobile-web-app-title": "Zahin.org",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${interTight.variable} ${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
