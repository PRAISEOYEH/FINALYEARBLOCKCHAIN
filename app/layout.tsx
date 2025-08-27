import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MultiWalletProvider } from "@/hooks/use-multi-wallet"
import { UniversityVotingProvider } from "@/hooks/use-university-voting"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "University Blockchain Voting System",
  description: "Secure, transparent, and decentralized voting system for university elections",
    generator: 'v0.app'
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
          <MultiWalletProvider>
            <UniversityVotingProvider>{children}</UniversityVotingProvider>
          </MultiWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
