'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  useAccount, 
  useConnect, 
  useDisconnect, 
  useSwitchChain, 
  useBalance,
  useChainId,
  type Connector
} from 'wagmi';
import type { Address } from 'viem';
import { MetaMaskConnector, WalletConnectConnector, CoinbaseWalletConnector } from '@wagmi/connectors';
import { baseSepoliaWithRpc } from '@/lib/wagmi';

// Wallet type definitions
export type WalletType = 'metamask' | 'walletconnect' | 'coinbase';
export type WalletKey = WalletType;

// Wallet metadata interface
export interface WalletInfo {
  key: WalletType;
  name: string;
  downloadUrl: string;
  isInstalled: boolean;
  icon: string;
}

// Hook return type interface
export interface UseMultiWallet {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  isSwitchingNetwork: boolean;
  
  // Account information
  account: Address | undefined;
  formattedAddress: string;
  balance: {
    formatted: string;
    symbol: string;
    decimals: number;
    value: bigint;
    nativeBalanceFormatted: string;
  };
  
  // Network information
  network: {
    chainId: number;
    isSupported: boolean;
    needsSwitch: boolean;
    supportedChain: typeof baseSepoliaWithRpc;
  };
  networkName: string;
  supportedChain: typeof baseSepoliaWithRpc;
  explorerBaseUrl: string | undefined;
  
  // Wallet information
  walletType: WalletType | null;
  connectedWallet: WalletType | null;
  
  // Connection methods
  connectWallet: (type: WalletType) => Promise<void>;
  disconnectWallet: () => void;
  
  // Network switching
  switchToSupportedNetwork: () => Promise<void>;
  
  // Modal state
  showWalletModal: boolean;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  
  // Available wallets
  availableWallets: WalletInfo[];
  detectedWallets: WalletInfo[];
  
  // Error handling
  error: string | null;
  connectionError: string | null;
  
  // Network validation
  needsNetworkSwitch: boolean;
  isOnSupportedNetwork: boolean;
  
  // Auto-prompt for network switching
  shouldPromptNetworkSwitch: boolean;
}

// Wallet metadata configuration
const WALLET_METADATA: WalletInfo[] = [
  {
    key: 'metamask',
    name: 'MetaMask',
    downloadUrl: 'https://metamask.io/download/',
    isInstalled: false, // Will be computed dynamically
    icon: '🦊'
  },
  {
    key: 'walletconnect',
    name: 'WalletConnect',
    downloadUrl: 'https://walletconnect.com/',
    isInstalled: true, // WalletConnect is always available
    icon: '🔗'
  },
  {
    key: 'coinbase',
    name: 'Coinbase Wallet',
    downloadUrl: 'https://www.coinbase.com/wallet',
    isInstalled: false, // Will be computed dynamically
    icon: '🪙'
  }
];

export function useMultiWallet(): UseMultiWallet {
  // Wagmi hooks
  const { address, isConnected, isConnecting, connector: activeConnector } = useAccount();
  const { connect, connectors, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, error: switchError } = useSwitchChain();
  // Always read balance from Base Sepolia since this is the only supported network for voting
  // Users must be on Base Sepolia to interact with the voting contracts
  const { data: balance } = useBalance({
    address,
    chainId: isConnected ? baseSepoliaWithRpc.id : undefined,
  });
  const chainId = useChainId();

  // Local state
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const [shouldPromptNetworkSwitch, setShouldPromptNetworkSwitch] = useState(false);

  // Check if connected to supported network
  const isOnSupportedNetwork = chainId === baseSepoliaWithRpc.id;
  const needsNetworkSwitch = isConnected && !isOnSupportedNetwork;

  // Enhanced wallet detection with multi-provider support
  const [walletAvailability, setWalletAvailability] = useState(() => {
    if (typeof window === 'undefined') return { hasMetaMask: false, hasCoinbase: false };
    
    const providers = window.ethereum?.providers || [window.ethereum];
    const hasMetaMask = providers.some(provider => provider?.isMetaMask);
    const hasCoinbase = providers.some(provider => provider?.isCoinbaseWallet);
    
    return { hasMetaMask, hasCoinbase };
  });

  const availableWallets = useMemo(() => {
    if (typeof window === 'undefined') return WALLET_METADATA;
    
    return WALLET_METADATA.map(wallet => ({
      ...wallet,
      isInstalled: wallet.key === 'metamask' 
        ? walletAvailability.hasMetaMask
        : wallet.key === 'coinbase'
        ? walletAvailability.hasCoinbase
        : wallet.isInstalled
    }));
  }, [walletAvailability]);

  // Detect installed wallets
  const detectedWallets = useMemo(() => 
    availableWallets.filter(wallet => wallet.isInstalled), 
    [availableWallets]
  );

  // Derive wallet type from active connector when connected
  const derivedWalletType = useMemo(() => {
    if (!isConnected || !activeConnector) return null;
    
    // Use connector.id for robust identification instead of instanceof
    switch (activeConnector.id) {
      case 'metaMask':
        return 'metamask';
      case 'walletConnect':
        return 'walletconnect';
      case 'coinbaseWallet':
        return 'coinbase';
      default:
        return null;
    }
  }, [isConnected, activeConnector]);

  // Connect to specific wallet
  const connectWallet = useCallback(async (type: WalletType) => {
    try {
      setConnectionError(null);
      setWalletType(type);
      
      const connector = connectors.find(c => {
        // Use connector.id for robust identification instead of instanceof
        switch (type) {
          case 'metamask':
            return c.id === 'metaMask';
          case 'walletconnect':
            return c.id === 'walletConnect';
          case 'coinbase':
            return c.id === 'coinbaseWallet';
          default:
            return false;
        }
      });

      if (!connector) {
        throw new Error(`${type} wallet not available`);
      }

      // Only enforce ready check for MetaMask
      if (type === 'metamask' && !connector.ready) {
        throw new Error(`${type} wallet not ready`);
      }

      await connect({ connector });
      setShowWalletModal(false);
      
      // Store wallet type in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('walletType', type);
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      setConnectionError(error instanceof Error ? error.message : 'Failed to connect wallet');
      setWalletType(null);
    }
  }, [connect, connectors, isConnected, isOnSupportedNetwork]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    disconnect();
    setWalletType(null);
    setConnectionError(null);
    setShouldPromptNetworkSwitch(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walletType');
    }
  }, [disconnect]);

  // Switch to supported network
  const switchToSupportedNetwork = useCallback(async () => {
    // Early return if already on supported network or not connected
    if (!isConnected || isOnSupportedNetwork) {
      return;
    }

    try {
      setIsSwitchingNetwork(true);
      setConnectionError(null);
      setShouldPromptNetworkSwitch(false);
      
      await switchChain({ chainId: baseSepoliaWithRpc.id });
    } catch (error) {
      console.error('Network switch error:', error);
      setConnectionError(error instanceof Error ? error.message : 'Failed to switch network');
    } finally {
      setIsSwitchingNetwork(false);
    }
  }, [switchChain, isConnected, isOnSupportedNetwork]);

  // Load persisted wallet type on mount
  useEffect(() => {
    if (isConnected && !walletType) {
      if (typeof window !== 'undefined') {
        const persistedWalletType = localStorage.getItem('walletType') as WalletType;
        if (persistedWalletType && WALLET_METADATA.some(w => w.key === persistedWalletType)) {
          setWalletType(persistedWalletType);
        }
      }
    }
  }, [isConnected, walletType]);

  // Use derived wallet type when no localStorage info is present
  useEffect(() => {
    if (isConnected && !walletType && derivedWalletType) {
      setWalletType(derivedWalletType);
    }
  }, [isConnected, walletType, derivedWalletType]);

  // Clear connection error when wallet type changes
  useEffect(() => {
    if (walletType) {
      setConnectionError(null);
    }
  }, [walletType]);

  // Auto-prompt for network switch when connected but on wrong network
  useEffect(() => {
    if (isConnected && !isOnSupportedNetwork) {
      setShouldPromptNetworkSwitch(true);
    } else {
      setShouldPromptNetworkSwitch(false);
    }
  }, [isConnected, isOnSupportedNetwork]);

  // Reactive wallet availability detection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateWalletAvailability = () => {
      const providers = window.ethereum?.providers || [window.ethereum];
      const hasMetaMask = providers.some(provider => provider?.isMetaMask);
      const hasCoinbase = providers.some(provider => provider?.isCoinbaseWallet);
      
      setWalletAvailability({ hasMetaMask, hasCoinbase });
    };

    // Update on visibility change (user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateWalletAvailability();
      }
    };

    // Update on interval while modal is open
    let intervalId: ReturnType<typeof setInterval> | undefined;
    if (showWalletModal) {
      intervalId = setInterval(updateWalletAvailability, 5000); // Check every 5 seconds
    }

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial check
    updateWalletAvailability();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [showWalletModal]);

  // Format account address
  const formattedAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  // Structured balance object with BigInt value
  const balanceInfo = {
    formatted: balance?.formatted || '0',
    symbol: balance?.symbol || 'ETH',
    decimals: balance?.decimals || 18,
    value: balance?.value ?? 0n,
    nativeBalanceFormatted: balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0.0000 ETH'
  };

  // Modal controls
  const openWalletModal = useCallback(() => {
    setShowWalletModal(true);
    setConnectionError(null);
  }, []);

  const closeWalletModal = useCallback(() => {
    setShowWalletModal(false);
    setConnectionError(null);
  }, []);

  // Simplified error composition
  const errObj = connectError || switchError;
  const error = connectionError ?? errObj?.message ?? null;

  return {
    // Connection state
    isConnected,
    isConnecting,
    isSwitchingNetwork,
    
    // Account information
    account: address,
    formattedAddress,
    balance: balanceInfo,
    
    // Network information
    network: {
      chainId,
      isSupported: isOnSupportedNetwork,
      needsSwitch: needsNetworkSwitch,
      supportedChain: baseSepoliaWithRpc,
    },
    networkName: baseSepoliaWithRpc.name,
    supportedChain: baseSepoliaWithRpc,
    explorerBaseUrl: baseSepoliaWithRpc.blockExplorers?.default.url,
    
    // Wallet information
    walletType,
    connectedWallet: walletType,
    
    // Connection methods
    connectWallet,
    disconnectWallet,
    
    // Network switching
    switchToSupportedNetwork,
    
    // Modal state
    showWalletModal,
    openWalletModal,
    closeWalletModal,
    
    // Available wallets
    availableWallets,
    detectedWallets,
    
    // Error handling
    error,
    connectionError,
    
    // Network validation
    needsNetworkSwitch,
    isOnSupportedNetwork,
    
    // Auto-prompt for network switching
    shouldPromptNetworkSwitch,
  };
}
