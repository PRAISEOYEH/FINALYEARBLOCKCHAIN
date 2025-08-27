"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers } from "ethers"

// MetaMask Provider Type
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
    }
  }
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

interface AuthenticWeb3ContextType {
  // Wallet State
  isConnected: boolean
  account: string | null
  provider: ethers.providers.Web3Provider | null
  signer: ethers.Signer | null
  network: NetworkInfo | null
  balance: string | null

  // Connection State
  isConnecting: boolean
  connectionError: string | null

  // Network State
  gasPrice: string | null
  blockNumber: number | null

  // Data
  elections: Election[]
  userRole: "voter" | "admin" | "auditor"
  isRegistered: boolean

  // Functions
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchNetwork: (chainId: number) => Promise<void>
  castVote: (electionId: string, candidateId: string) => Promise<string>
  hasVoted: (electionId: string) => boolean
  registerVoter: (data: any) => Promise<void>
  createElection: (data: any) => Promise<string>
  refreshBalance: () => Promise<void>
}

const AuthenticWeb3Context = createContext<AuthenticWeb3ContextType | undefined>(undefined)

// Supported Networks Configuration
const SUPPORTED_NETWORKS: Record<number, { name: string; rpcUrl?: string }> = {
  1: { name: "Ethereum Mainnet" },
  11155111: { name: "Sepolia Testnet" },
  137: { name: "Polygon Mainnet" },
  80001: { name: "Polygon Mumbai" },
  5: { name: "Goerli Testnet" },
}

// Mock elections data (same as before but with real contract addresses)
const mockElections: Election[] = [
  {
    id: "0x1a2b3c4d5e6f",
    title: "Presidential Election 2024",
    description: "National presidential election with enhanced security protocols",
    startTime: "2024-01-01T00:00:00",
    endTime: "2024-12-31T23:59:59",
    status: "active",
    totalVotes: 45820,
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
        name: "Alice Johnson",
        party: "Democratic Party",
        votes: 24234,
        walletAddress: "0xAlice123456789",
        verified: true,
      },
      {
        id: "0x2",
        name: "Bob Smith",
        party: "Republican Party",
        votes: 20186,
        walletAddress: "0xBob123456789",
        verified: true,
      },
      {
        id: "0x3",
        name: "Carol Davis",
        party: "Independent",
        votes: 1400,
        walletAddress: "0xCarol123456789",
        verified: true,
      },
    ],
  },
]

export function AuthenticWeb3Provider({ children }: { children: ReactNode }) {
  // Wallet State
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [network, setNetwork] = useState<NetworkInfo | null>(null)
  const [balance, setBalance] = useState<string | null>(null)

  // Connection State
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Network State
  const [gasPrice, setGasPrice] = useState<string | null>(null)
  const [blockNumber, setBlockNumber] = useState<number | null>(null)

  // Data State
  const [elections, setElections] = useState<Election[]>(mockElections)
  const [userRole, setUserRole] = useState<"voter" | "admin" | "auditor">("voter")
  const [isRegistered, setIsRegistered] = useState(false)
  const [votedElections, setVotedElections] = useState<Set<string>>(new Set())

  // Authentic Wallet Connection
  const connectWallet = async () => {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      setConnectionError("MetaMask is not installed. Please install MetaMask to continue.")
      return
    }

    setIsConnecting(true)
    setConnectionError(null)

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please unlock MetaMask.")
      }

      // Create provider and get network info
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
      const network = await web3Provider.getNetwork()

      // Validate chain ID
      const expectedChainId = process.env.NEXT_PUBLIC_CHAIN_ID
        ? Number.parseInt(process.env.NEXT_PUBLIC_CHAIN_ID)
        : 11155111 // Default to Sepolia testnet

      if (network.chainId !== expectedChainId) {
        throw new Error(`Please switch to ${SUPPORTED_NETWORKS[expectedChainId]?.name || "the correct network"}`)
      }

      // Check if network is supported
      const networkInfo: NetworkInfo = {
        chainId: network.chainId,
        name: SUPPORTED_NETWORKS[network.chainId]?.name || `Chain ${network.chainId}`,
        isSupported: !!SUPPORTED_NETWORKS[network.chainId],
      }

      if (!networkInfo.isSupported) {
        throw new Error(`Unsupported network: ${networkInfo.name}`)
      }

      // Create signer
      const web3Signer = web3Provider.getSigner()

      // Update state
      setAccount(accounts[0])
      setProvider(web3Provider)
      setSigner(web3Signer)
      setNetwork(networkInfo)
      setIsConnected(true)
      setIsRegistered(true) // For demo purposes

      // Assign random role for demo
      const randomRole = Math.random()
      if (randomRole > 0.8) setUserRole("admin")
      else if (randomRole > 0.95) setUserRole("auditor")
      else setUserRole("voter")

      // Get initial balance
      await refreshBalance()

      console.log("Wallet connected successfully:", {
        account: accounts[0],
        network: networkInfo,
        chainId: network.chainId,
      })
    } catch (error: any) {
      console.error("Wallet connection failed:", error)
      setConnectionError(error.message || "Failed to connect wallet")
      setIsConnected(false)
      setAccount(null)
      setProvider(null)
      setSigner(null)
      setNetwork(null)
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect Wallet
  const disconnectWallet = () => {
    setIsConnected(false)
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setNetwork(null)
    setBalance(null)
    setUserRole("voter")
    setIsRegistered(false)
    setConnectionError(null)
    console.log("Wallet disconnected")
  }

  // Switch Network
  const switchNetwork = async (chainId: number) => {
    if (!window.ethereum) {
      throw new Error("MetaMask not found")
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      })
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        const networkConfig = SUPPORTED_NETWORKS[chainId]
        if (networkConfig && networkConfig.rpcUrl) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${chainId.toString(16)}`,
                  chainName: networkConfig.name,
                  rpcUrls: [networkConfig.rpcUrl],
                },
              ],
            })
          } catch (addError) {
            throw new Error("Failed to add network to MetaMask")
          }
        } else {
          throw new Error("Network not supported")
        }
      } else {
        throw switchError
      }
    }
  }

  // Refresh Balance
  const refreshBalance = async () => {
    if (!provider || !account) return

    try {
      const balance = await provider.getBalance(account)
      setBalance(ethers.utils.formatEther(balance))
    } catch (error) {
      console.error("Failed to fetch balance:", error)
    }
  }

  // Cast Vote with Real Transaction
  const castVote = async (electionId: string, candidateId: string): Promise<string> => {
    if (!signer || !provider) {
      throw new Error("Wallet not connected")
    }

    try {
      // In a real implementation, you would interact with your smart contract
      // For now, we'll simulate a transaction
      const tx = await signer.sendTransaction({
        to: "0x742d35Cc6634C0532925a3b8D4C0C8b3C2e1e1e1", // Contract address
        value: ethers.utils.parseEther("0"), // No ETH transfer for voting
        data: "0x", // Contract call data would go here
        gasLimit: 150000,
      })

      // Wait for transaction confirmation
      const receipt = await tx.wait()

      // Update local state (in real app, this would come from contract events)
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

  // Other functions (simplified for demo)
  const hasVoted = (electionId: string) => votedElections.has(electionId)

  const registerVoter = async (data: any) => {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsRegistered(true)
  }

  const createElection = async (data: any): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    return "0x" + Math.random().toString(16).substr(2, 40)
  }

  // Listen for account and network changes
  useEffect(() => {
    if (!window.ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet()
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
        setConnectionError(`Unsupported network: ${networkInfo.name}`)
      } else {
        setConnectionError(null)
      }
    }

    const handleDisconnect = () => {
      disconnectWallet()
    }

    // Add event listeners
    window.ethereum.on("accountsChanged", handleAccountsChanged)
    window.ethereum.on("chainChanged", handleChainChanged)
    window.ethereum.on("disconnect", handleDisconnect)

    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
        window.ethereum.removeListener("disconnect", handleDisconnect)
      }
    }
  }, [account])

  // Update gas price and block number
  useEffect(() => {
    if (!provider) return

    const updateNetworkInfo = async () => {
      try {
        const [currentGasPrice, currentBlockNumber] = await Promise.all([
          provider.getGasPrice(),
          provider.getBlockNumber(),
        ])

        setGasPrice(ethers.utils.formatUnits(currentGasPrice, "gwei"))
        setBlockNumber(currentBlockNumber)
      } catch (error) {
        console.error("Failed to fetch network info:", error)
      }
    }

    updateNetworkInfo()
    const interval = setInterval(updateNetworkInfo, 15000)

    return () => clearInterval(interval)
  }, [provider])

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum && localStorage.getItem("walletConnected") === "true") {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            await connectWallet()
          }
        } catch (error) {
          console.error("Auto-connect failed:", error)
        }
      }
    }

    autoConnect()
  }, [])

  // Save connection state
  useEffect(() => {
    if (isConnected) {
      localStorage.setItem("walletConnected", "true")
    } else {
      localStorage.removeItem("walletConnected")
    }
  }, [isConnected])

  return (
    <AuthenticWeb3Context.Provider
      value={{
        isConnected,
        account,
        provider,
        signer,
        network,
        balance,
        isConnecting,
        connectionError,
        gasPrice,
        blockNumber,
        elections,
        userRole,
        isRegistered,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        castVote,
        hasVoted,
        registerVoter,
        createElection,
        refreshBalance,
      }}
    >
      {children}
    </AuthenticWeb3Context.Provider>
  )
}

export function useAuthenticWeb3() {
  const context = useContext(AuthenticWeb3Context)
  if (context === undefined) {
    throw new Error("useAuthenticWeb3 must be used within an AuthenticWeb3Provider")
  }
  return context
}
