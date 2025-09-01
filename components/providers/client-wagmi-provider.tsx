"use client"

import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig, queryClient } from "@/lib/wagmi";
import { ReactNode } from "react";

interface ClientWagmiProviderProps {
  children: ReactNode;
}

export function ClientWagmiProvider({ children }: ClientWagmiProviderProps) {

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        {children}
      </WagmiProvider>
    </QueryClientProvider>
  );
}
