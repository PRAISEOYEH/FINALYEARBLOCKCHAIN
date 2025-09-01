// Global type declarations for Ethereum providers

interface EthereumProvider {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
  selectedAddress?: string;
  chainId?: string;
  isConnected?: () => boolean;
}

interface Window {
  ethereum?: EthereumProvider & {
    providers?: EthereumProvider[];
    isMetaMask?: boolean;
    isCoinbaseWallet?: boolean;
    autoRefreshOnNetworkChange?: boolean;
    _state?: {
      accounts?: string[];
      isConnected?: boolean;
      isUnlocked?: boolean;
    };
  };
}

// Extend the global Window interface
declare global {
  interface Window {
    ethereum?: EthereumProvider & {
      providers?: EthereumProvider[];
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      autoRefreshOnNetworkChange?: boolean;
      _state?: {
        accounts?: string[];
        isConnected?: boolean;
        isUnlocked?: boolean;
      };
    };
  }
}

export {};
