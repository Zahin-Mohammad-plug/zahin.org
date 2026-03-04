import type React from "react"
import type { Metadata } from "next"
import { Inter, Inter_Tight } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight" })

export const metadata: Metadata = {
  title: "Zahin - Portfolio",
  description: "Personal portfolio showcasing projects, passions, and technical stack",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
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
