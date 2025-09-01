import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { UniversityVotingProvider } from "@/hooks/use-university-voting"
import { WagmiProvider } from "wagmi"
import { wagmiConfig, queryClient } from "@/lib/wagmi"
import { QueryClientProvider } from "@tanstack/react-query"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "University Blockchain Voting System",
  description: "Secure, transparent, and decentralized voting system for university elections",
  generator: "v0.app",
}

/**
 * Simple Error Boundary to catch and display Web3 / provider related errors.
 * Implemented as a React class component so it can be used inside a server component tree.
 */
class Web3ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: any) {
    // In a real app you might log this to an external monitoring service
    // For now, just keep it local
    // eslint-disable-next-line no-console
    console.error("Web3 boundary caught an error:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "1rem",
            background: "#2b2b2b",
            color: "#fff",
            borderRadius: 8,
            margin: 16,
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Connection error</h2>
          <p style={{ marginTop: "0.5rem" }}>
            There was a problem initializing the Web3 connection or interacting with the configured provider.
            Please ensure you are connected to the correct network (Base Sepolia) and that your wallet is available.
          </p>
          {this.state.error ? (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                background: "#111",
                padding: "0.75rem",
                borderRadius: 6,
                marginTop: "0.75rem",
                color: "#ffdcdc",
                fontSize: "0.85rem",
              }}
            >
              {String(this.state.error?.message || this.state.error)}
            </pre>
          ) : null}
        </div>
      )
    }
    return this.props.children
  }
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
          {/* TanStack Query provider for caching RPC reads/mutations */}
          <QueryClientProvider client={queryClient}>
            {/* Wagmi provider (wrapped as WagmiConfig) to provide web3 context across the app */}
            <WagmiProvider config={wagmiConfig}>
              {/* Error boundary around Web3/provider dependent subtree */}
              <Web3ErrorBoundary>
                {/* Global connection status placeholder - dynamic client component can hydrate this area */}
                <ConnectionStatusPlaceholder />
                {/* University voting provider (relies on Wagmi + Query clients being available) */}
                <UniversityVotingProvider>{children}</UniversityVotingProvider>
              </Web3ErrorBoundary>
            </WagmiProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}