/**
 * DevFlow Dashboard - Root Layout
 * Author: Nayan Das <nayanchandradas@hotmail.com>
 * Repository: https://github.com/nayandas69/devflow-dashboard
 * License: MIT
 */

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DevFlow - Project Management Dashboard",
  description: "Modern project management dashboard for developers, freelancers, and open-source maintainers",
  keywords: ["project management", "dashboard", "developers", "freelancers", "open source"],
  authors: [{ name: "Nayan Das", url: "https://github.com/nayandas69" }],
  creator: "Nayan Das",
  openGraph: {
    title: "DevFlow - Project Management Dashboard",
    description: "Modern project management dashboard for developers, freelancers, and open-source maintainers",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
