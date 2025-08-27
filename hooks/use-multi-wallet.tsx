"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers } from "ethers"

// Wallet Provider Types
interface WalletProvider {
  isMetaMask?: boolean
  isCoinbaseWallet?: boolean
  isPhantom?: boolean
  request: (args: { method: string; params?: any[] }) => Promise<any>
  on: (event: string, callback: (...args: any[]) => void) => void
  removeListener: (event: string, callback: (...args: any[]) => void) => void
}

declare global {
  interface Window {
    ethereum?: WalletProvider & {
      providers?: WalletProvider[]
    }
    phantom?: {
      ethereum?: WalletProvider
    }
  }
}

export type WalletType = "MetaMask" | "Coinbase" | "Phantom" | "WalletConnect" | "Other"

interface WalletInfo {
  name: WalletType
  icon: string
  provider: WalletProvider
  isInstalled: boolean
  downloadUrl: string
}

interface Candidate {
  id: string
  name: string
  party: string
  votes: number
  walletAddress: string
  verified: boolean
}

interface Election {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  status: "upcoming" | "active" | "completed"
  candidates: Candidate[]
  totalVotes: number
  contractAddress: string
  createdBy: string
  voterRequirements: {
    minAge: number
    citizenship: boolean
    kycVerified: boolean
  }
  encryptionKey: string
}

interface NetworkInfo {
  chainId: number
  name: string
  isSupported: boolean
}

interface MultiWalletContextType {
  isConnected: boolean
  account: string
  balance: string
  network: string
  walletType: string
  isConnecting: boolean
  error: string | null
  needsNetworkSwitch: boolean
  connectWallet: (type: "metamask" | "walletconnect" | "coinbase") => Promise<void>
  disconnect: () => void
  switchNetwork: (networkId: string) => Promise<void>
  switchToSupportedNetwork: () => Promise<void>
  elections: Election[]
  userRole: "voter" | "admin" | "auditor"
  isRegistered: boolean
}

const MultiWalletContext = createContext<MultiWalletContextType | undefined>(undefined)

// Supported Networks Configuration
const SUPPORTED_NETWORKS: Record<number, { name: string; rpcUrl?: string }> = {
  1: { name: "Ethereum Mainnet" },
  11155111: { name: "Sepolia Testnet", rpcUrl: "https://sepolia.infura.io/v3/" },
  137: { name: "Polygon Mainnet" },
  80001: { name: "Polygon Mumbai", rpcUrl: "https://rpc-mumbai.maticvigil.com/" },
  5: { name: "Goerli Testnet" },
  1337: { name: "Localhost", rpcUrl: "http://localhost:8545" },
}

// Default to Sepolia for development
const DEFAULT_CHAIN_ID = 11155111

// Mock elections data
const mockElections: Election[] = [
  {
    id: "0x1a2b3c4d5e6f",
    title: "Student Union Presidential Election 2024",
    description: "Annual presidential election for the university student union",
    startTime: "2024-01-01T00:00:00",
    endTime: "2024-12-31T23:59:59",
    status: "active",
    totalVotes: 1247,
    contractAddress: "0x742d35Cc6634C0532925a3b8D4C0C8b3C2e1e1e1",
    createdBy: "0xAdmin123456789",
    voterRequirements: {
      minAge: 18,
      citizenship: true,
      kycVerified: true,
    },
    encryptionKey: "0xEncryptionKey123",
    candidates: [
      {
        id: "0x1",
        name: "Sarah Johnson",
        party: "Progressive Student Alliance",
        votes: 542,
        walletAddress: "0xSarah123456789",
        verified: true,
      },
      {
        id: "0x2",
        name: "Michael Chen",
        party: "Student Unity Coalition",
        votes: 489,
        walletAddress: "0xMichael123456789",
        verified: true,
      },
      {
        id: "0x3",
        name: "Emma Rodriguez",
        party: "Independent Students",
        votes: 216,
        walletAddress: "0xEmma123456789",
        verified: true,
      },
    ],
  },
]

export function MultiWalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState("")
  const [balance, setBalance] = useState("0")
  const [network, setNetwork] = useState("")
  const [walletType, setWalletType] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsNetworkSwitch, setNeedsNetworkSwitch] = useState(false)
  const [elections, setElections] = useState<Election[]>(mockElections)
  const [userRole, setUserRole] = useState<"voter" | "admin" | "auditor">("voter")
  const [isRegistered, setIsRegistered] = useState(false)
  const [votedElections, setVotedElections] = useState<Set<string>>(new Set())
  const [currentWalletProvider, setCurrentWalletProvider] = useState<WalletProvider | null>(null)
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([])
  const [detectedWallets, setDetectedWallets] = useState<WalletInfo[]>([])
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [provider, setProvider] = useState<any | null>(null)
  const [signer, setSigner] = useState<any | null>(null)
  const [connectedWallet, setConnectedWallet] = useState<WalletType | null>(null)
  const [gasPrice, setGasPrice] = useState<string | null>(null)
  const [blockNumber, setBlockNumber] = useState<number | null>(null)

  const connectWallet = async (type: "metamask" | "walletconnect" | "coinbase") => {
    setIsConnecting(true)
    setError(null)

    try {
      // Simulate wallet connection
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock wallet data
      const mockAccount = "0x742d35Cc6634C0532925a3b8D4C0C8b3C2e1e1e1"
      const mockBalance = "1.2345"
      const mockNetwork = "Ethereum Mainnet"

      setAccount(mockAccount)
      setBalance(mockBalance)
      setNetwork(mockNetwork)
      setWalletType(type)
      setIsConnected(true)
      setNeedsNetworkSwitch(mockNetwork !== "Sepolia Testnet")
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setAccount("")
    setBalance("0")
    setNetwork("")
    setWalletType("")
    setError(null)
    setNeedsNetworkSwitch(false)
    setCurrentWalletProvider(null)
    localStorage.removeItem("connectedWallet")
    console.log("Wallet disconnected")
  }

  const switchNetwork = async (networkId: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setNetwork("Sepolia Testnet")
      setNeedsNetworkSwitch(false)
    } catch (err: any) {
      setError(err.message || "Failed to switch network")
    }
  }

  const switchToSupportedNetwork = async () => {
    try {
      await switchNetwork(DEFAULT_CHAIN_ID)
      setNeedsNetworkSwitch(false)
      setConnectionError(null)
    } catch (error: any) {
      console.error("Failed to switch network:", error)
      setConnectionError(error.message || "Failed to switch network")
    }
  }

  const getMetaMaskProvider = (): WalletProvider | null => {
    if (typeof window === "undefined") return null

    const providers = window.ethereum?.providers || []
    const metamaskProvider = providers.find((p) => p.isMetaMask) || window.ethereum

    return metamaskProvider?.isMetaMask ? metamaskProvider : null
  }

  const getCoinbaseProvider = (): WalletProvider | null => {
    if (typeof window === "undefined") return null

    const providers = window.ethereum?.providers || []
    const coinbaseProvider = providers.find((p) => p.isCoinbaseWallet) || window.ethereum

    return coinbaseProvider?.isCoinbaseWallet ? coinbaseProvider : null
  }

  const getPhantomProvider = (): WalletProvider | null => {
    if (typeof window === "undefined") return null

    return window.phantom?.ethereum || null
  }

  const openWalletModal = () => {
    setShowWalletModal(true)
    setConnectionError(null)
  }

  const closeWalletModal = () => {
    setShowWalletModal(false)
    setConnectionError(null)
  }

  const setupWalletEventListeners = (walletProvider: WalletProvider) => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else if (accounts[0] !== account) {
        setAccount(accounts[0])
        refreshBalance()
      }
    }

    const handleChainChanged = (chainId: string) => {
      const newChainId = Number.parseInt(chainId, 16)
      const networkInfo: NetworkInfo = {
        chainId: newChainId,
        name: SUPPORTED_NETWORKS[newChainId]?.name || `Chain ${newChainId}`,
        isSupported: !!SUPPORTED_NETWORKS[newChainId],
      }
      setNetwork(networkInfo)

      if (!networkInfo.isSupported) {
        setNeedsNetworkSwitch(true)
        setConnectionError(`Please switch to ${SUPPORTED_NETWORKS[DEFAULT_CHAIN_ID]?.name || "a supported network"}`)
      } else {
        setNeedsNetworkSwitch(false)
        setConnectionError(null)
      }
    }

    const handleDisconnect = () => {
      disconnect()
    }

    // Remove existing listeners first
    if (currentWalletProvider) {
      currentWalletProvider.removeListener("accountsChanged", handleAccountsChanged)
      currentWalletProvider.removeListener("chainChanged", handleChainChanged)
      currentWalletProvider.removeListener("disconnect", handleDisconnect)
    }

    // Add new event listeners
    walletProvider.on("accountsChanged", handleAccountsChanged)
    walletProvider.on("chainChanged", handleChainChanged)
    walletProvider.on("disconnect", handleDisconnect)
  }

  const refreshBalance = async () => {
    if (!provider || !account) return

    try {
      const balance = await provider.getBalance(account)
      setBalance(ethers.utils.formatEther(balance))
    } catch (error) {
      console.error("Failed to fetch balance:", error)
    }
  }

  const castVote = async (electionId: string, candidateId: string): Promise<string> => {
    if (!signer || !provider) {
      throw new Error("Wallet not connected")
    }

    if (needsNetworkSwitch) {
      throw new Error("Please switch to a supported network first")
    }

    try {
      const tx = await signer.sendTransaction({
        to: "0x742d35Cc6634C0532925a3b8D4C0C8b3C2e1e1e1",
        value: ethers.utils.parseEther("0"),
        data: "0x",
        gasLimit: 150000,
      })

      const receipt = await tx.wait()

      // Update local state
      setElections((prev) =>
        prev.map((election) => {
          if (election.id === electionId) {
            return {
              ...election,
              candidates: election.candidates.map((candidate) =>
                candidate.id === candidateId ? { ...candidate, votes: candidate.votes + 1 } : candidate,
              ),
              totalVotes: election.totalVotes + 1,
            }
          }
          return election
        }),
      )

      setVotedElections((prev) => new Set([...prev, electionId]))

      return receipt.transactionHash
    } catch (error: any) {
      console.error("Vote casting failed:", error)
      throw new Error(error.message || "Failed to cast vote")
    }
  }

  const hasVoted = (electionId: string) => votedElections.has(electionId)

  const registerVoter = async (data: any) => {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsRegistered(true)
  }

  const createElection = async (data: any): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    return "0x" + Math.random().toString(16).substr(2, 40)
  }

  useEffect(() => {
    const detectWallets = () => {
      const wallets: WalletInfo[] = [
        {
          name: "MetaMask",
          icon: "🦊",
          provider: getMetaMaskProvider(),
          isInstalled: !!getMetaMaskProvider(),
          downloadUrl: "https://metamask.io/download/",
        },
        {
          name: "Coinbase",
          icon: "🔵",
          provider: getCoinbaseProvider(),
          isInstalled: !!getCoinbaseProvider(),
          downloadUrl: "https://www.coinbase.com/wallet",
        },
        {
          name: "Phantom",
          icon: "👻",
          provider: getPhantomProvider(),
          isInstalled: !!getPhantomProvider(),
          downloadUrl: "https://phantom.app/",
        },
        {
          name: "WalletConnect",
          icon: "🔗",
          provider: null as any,
          isInstalled: true,
          downloadUrl: "https://walletconnect.com/",
        },
      ]

      setAvailableWallets(wallets)
      setDetectedWallets(wallets.filter((wallet) => wallet.isInstalled))
    }

    detectWallets()
  }, [])

  useEffect(() => {
    if (!provider || needsNetworkSwitch || !isConnected) return

    const updateNetworkInfo = async () => {
      try {
        // First verify the network is stable
        const currentNetwork = await provider.getNetwork()

        // Check if network matches our expected network
        if (!SUPPORTED_NETWORKS[currentNetwork.chainId]) {
          console.warn(`Unsupported network detected: ${currentNetwork.chainId}`)
          setNeedsNetworkSwitch(true)
          return
        }

        // Only fetch gas price and block number if network is stable
        const [currentGasPrice, currentBlockNumber] = await Promise.all([
          provider.getGasPrice().catch(() => null),
          provider.getBlockNumber().catch(() => null),
        ])

        if (currentGasPrice) {
          setGasPrice(ethers.utils.formatUnits(currentGasPrice, "gwei"))
        }

        if (currentBlockNumber) {
          setBlockNumber(currentBlockNumber)
        }
      } catch (error: any) {
        console.error("Failed to fetch network info:", error)

        // Handle specific network errors
        if (error.code === "NETWORK_ERROR" || error.code === "CALL_EXCEPTION") {
          console.warn("Network error detected, attempting to refresh connection...")

          // Try to refresh the network info
          try {
            const newNetwork = await provider.getNetwork()
            const networkInfo: NetworkInfo = {
              chainId: newNetwork.chainId,
              name: SUPPORTED_NETWORKS[newNetwork.chainId]?.name || `Chain ${newNetwork.chainId}`,
              isSupported: !!SUPPORTED_NETWORKS[newNetwork.chainId],
            }
            setNetwork(networkInfo)

            if (!networkInfo.isSupported) {
              setNeedsNetworkSwitch(true)
              setConnectionError(
                `Please switch to ${SUPPORTED_NETWORKS[DEFAULT_CHAIN_ID]?.name || "a supported network"}`,
              )
            }
          } catch (refreshError) {
            console.error("Failed to refresh network info:", refreshError)
            // Don't disconnect, just stop trying to fetch network info
          }
        }
      }
    }

    // Initial update with a small delay to let the network stabilize
    const initialTimeout = setTimeout(updateNetworkInfo, 1000)

    // Regular updates every 30 seconds (increased from 15 to reduce network calls)
    const interval = setInterval(updateNetworkInfo, 30000)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [provider, needsNetworkSwitch, isConnected])

  useEffect(() => {
    const autoConnect = async () => {
      const savedWallet = localStorage.getItem("connectedWallet") as WalletType
      if (savedWallet && detectedWallets.find((w) => w.name === savedWallet)) {
        try {
          await connectWallet(savedWallet)
        } catch (error) {
          console.error("Auto-connect failed:", error)
          localStorage.removeItem("connectedWallet")
        }
      }
    }

    if (detectedWallets.length > 0) {
      autoConnect()
    }
  }, [detectedWallets])

  useEffect(() => {
    if (isConnected && connectedWallet) {
      localStorage.setItem("connectedWallet", connectedWallet)
    } else {
      localStorage.removeItem("connectedWallet")
    }
  }, [isConnected, connectedWallet])

  return (
    <MultiWalletContext.Provider
      value={{
        isConnected,
        account,
        balance,
        network,
        walletType,
        isConnecting,
        error,
        needsNetworkSwitch,
        connectWallet,
        disconnect,
        switchNetwork,
        switchToSupportedNetwork,
        elections,
        userRole,
        isRegistered,
      }}
    >
      {children}
    </MultiWalletContext.Provider>
  )
}

export function useMultiWallet() {
  const context = useContext(MultiWalletContext)
  if (context === undefined) {
    throw new Error("useMultiWallet must be used within a MultiWalletProvider")
  }
  return context
}
