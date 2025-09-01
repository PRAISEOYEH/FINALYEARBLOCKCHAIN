import React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ClientVotingProvider } from "@/components/providers/client-voting-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "University Blockchain Voting System",
  description: "Secure, transparent, and decentralized voting system for university elections",
  generator: "v0.app",
}

/**
 * Simple fallback component for Web3 errors.
 * Using a simple wrapper instead of error boundary to avoid class component issues.
 */
function Web3ErrorBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

/**
 * Global (server-rendered) connection status placeholder.
 * Note: Actual dynamic, interactive status (connect/disconnect) is provided by
 * client components elsewhere in the app (e.g. components/wallet-connection).
 * This placeholder ensures there's a consistent area in the layout reserved for status.
 */
function ConnectionStatusPlaceholder() {
  return (
    <div
      id="global-connection-status"
      aria-live="polite"
      style={{
        position: "fixed",
        right: 12,
        top: 12,
        zIndex: 9999,
        background: "rgba(255,255,255,0.9)",
        color: "#111",
        padding: "6px 10px",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        fontSize: "0.9rem",
      }}
    >
      Wallet: not connected
    </div>
  )
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
          <ClientVotingProvider>
            <Web3ErrorBoundary>
              <ConnectionStatusPlaceholder />
              {children}
            </Web3ErrorBoundary>
          </ClientVotingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
