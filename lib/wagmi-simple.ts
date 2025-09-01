import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { metaMask, coinbaseWallet } from "wagmi/connectors";
import { QueryClient } from "@tanstack/react-query";

// Simple configuration without complex serialization issues
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org";
const appName = process.env.NEXT_PUBLIC_APP_NAME || "University Voting DApp";

// Only include essential connectors - no WalletConnect to avoid 403 errors
export const connectors = [
  metaMask(),
  coinbaseWallet({
    appName,
    appLogoUrl: 'https://votingonchain.vercel.app/favicon.ico',
  }),
];

// Simplified chain config
export const chains = [baseSepolia];

// Simple query client with proper configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
      // Fix for SSR compatibility - use gcTime for TanStack Query v5
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
    mutations: {
      retry: 1,
    },
  },
});

// Simple wagmi config
export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors,
  transports: {
    [baseSepolia.id]: http(rpcUrl),
  },
});
