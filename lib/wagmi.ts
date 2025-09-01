import { createConfig, http } from "wagmi";
import { createPublicClient } from "viem";
import { baseSepolia, type Chain } from "wagmi/chains";
import { metaMask, walletConnect, coinbaseWallet } from "wagmi/connectors";
import type { Connector } from "wagmi";
import { QueryClient } from "@tanstack/react-query";

/**
 * Wagmi + TanStack Query centralized configuration
 *
 * - Multiple connectors: MetaMask, WalletConnect, Coinbase Wallet
 * - Chain configuration: Base Sepolia with RPC override from env
 * - Public client: uses HTTP transport pointed at the RPC URL
 * - Query client: default cache and retry behavior for blockchain reads/writes
 * - SSR-friendly flag: createConfig receives an SSR hint for Next.js usage
 * - Basic connection retry helper for connectors
 *
 * Exported:
 * - wagmiConfig: the configured Wagmi config to pass to WagmiProvider
 * - queryClient: the TanStack Query client instance for QueryClientProvider
 * - chains: the chain list (with overridden RPC)
 * - connectors: pre-built connector instances (useful for UI)
 * - connectWithRetry: helper to attempt connector.connect() with retries
 * - baseSepoliaWithRpc: the configured chain instance for consistent usage
 */

/* Environment-driven settings */
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org";
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
const appName = process.env.NEXT_PUBLIC_APP_NAME || "University Voting DApp";

/* Build a chain object that ensures the RPC points to the configured URL */
export const baseSepoliaWithRpc: Chain = {
  ...baseSepolia,
  rpcUrls: {
    ...baseSepolia.rpcUrls,
    // Ensure both default and public point to the provided RPC URL so clients use it
    default: { http: [rpcUrl] },
    public: { http: [rpcUrl] },
  },
};

/* Exported chains for app-level usage */
export const chains = [baseSepoliaWithRpc];

/* Create a public client using the simple HTTP transport configured with our RPC */
export const publicClient = createPublicClient({
  transport: http(rpcUrl),
  chain: baseSepoliaWithRpc,
});

/* Create standard connectors */
export const connectors: Connector[] = [
  metaMask(),
  // Only include WalletConnect if projectId is configured
  ...(walletConnectProjectId ? [
    walletConnect({
      projectId: walletConnectProjectId,
      showQrModal: true,
    })
  ] : (() => {
    if (typeof window !== 'undefined') {
      console.warn('WalletConnect disabled: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID not configured');
    }
    return [];
  })()),
  coinbaseWallet({
    appName,
  }),
];

/* TanStack Query client for caching RPC reads and mutation states */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry common transient RPC/network issues twice before failing
      retry: 2,
      // Avoid aggressive refetching on focus by default (can be overridden per-query)
      refetchOnWindowFocus: false,
      // Keep results fresh for 30 seconds to reduce RPC calls
      staleTime: 30_000,
    },
    mutations: {
      // Mutations typically should be retried less aggressively
      retry: 1,
    },
  },
});

/* Helper to robustly attempt to connect a connector with simple retry/backoff logic */
export async function connectWithRetry(connector: Connector, maxAttempts = 3, baseDelayMs = 500) {
  let attempt = 0;
  // Some connectors expose connect() and others are used via wagmi hooks;
  // This helper attempts connector.connect if present. If not available, it will throw.
  while (attempt < maxAttempts) {
    try {
      attempt++;
      if (!connector || typeof (connector as any).connect !== "function") {
        throw new Error("Connector does not support programmatic connect()");
      }
      // call and return result (some connectors return a promise resolving to connection info)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (connector as any).connect();
      return res;
    } catch (err) {
      // If we've exhausted attempts, rethrow the error for the caller to handle/display
      if (attempt >= maxAttempts) {
        // attach attempt info for diagnostics
        const error = err instanceof Error ? err : new Error(String(err));
        (error as any).attempts = attempt;
        throw error;
      }
      // exponential backoff before next attempt
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  // Shouldn't reach here
  throw new Error("Failed to connect after retries");
}

/* Create the wagmi configuration used by WagmiProvider in the app layout.
 * - chains: supported chains for the application
 * - connectors: wallet connectors (MetaMask, WalletConnect, Coinbase)
 * - transports: RPC transport configuration for each chain
 */
export const wagmiConfig = createConfig({
  chains: [baseSepoliaWithRpc],
  connectors,
  transports: {
    [baseSepoliaWithRpc.id]: http(rpcUrl),
  },
});
