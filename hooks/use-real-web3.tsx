"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers } from "ethers"
import { io, type Socket } from "socket.io-client"
import type { Election, NetworkStats } from "@/types" // Assuming these types are declared in a separate file

// Smart Contract ABI (simplified)
const VOTING_CONTRACT_ABI = [
  "function vote(uint256 electionId, uint256 candidateId) external",
  "function getElection(uint256 electionId) external view returns (tuple(string title, uint256 startTime, uint256 endTime, bool active))",
  "function getVoteCount(uint256 electionId, uint256 candidateId) external view returns (uint256)",
  "function hasVoted(uint256 electionId, address voter) external view returns (bool)",
  "event VoteCast(uint256 indexed electionId, uint256 indexed candidateId, address indexed voter)",
  "event ElectionCreated(uint256 indexed electionId, string title)",
]

interface RealWeb3ContextType {
  // Wallet Connection
  provider: ethers.providers.Web3Provider | null
  signer: ethers.Signer | null
  account: string | null
  chainId: number | null
  isConnected: boolean

  // Real-time Data
  elections: Election[]
  liveVoteCounts: Record<string, Record<string, number>>
  networkStats: NetworkStats
  gasPrice: ethers.BigNumber | null
  blockNumber: number | null

  // Functions
  connectWallet: () => Promise<void>
  castVote: (electionId: string, candidateId: string) => Promise<string>
  createElection: (electionData: any) => Promise<string>
  subscribeToElection: (electionId: string) => void
}

const RealWeb3Context = createContext<RealWeb3ContextType | undefined>(undefined)

export function RealWeb3Provider({ children }: { children: ReactNode }) {
  // Wallet State
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Real-time Data State
  const [elections, setElections] = useState<Election[]>([])
  const [liveVoteCounts, setLiveVoteCounts] = useState<Record<string, Record<string, number>>>({})
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    gasPrice: 0,
    blockNumber: 0,
    networkHealth: "unknown",
    tps: 0,
  })
  const [gasPrice, setGasPrice] = useState<ethers.BigNumber | null>(null)
  const [blockNumber, setBlockNumber] = useState<number | null>(null)

  // WebSocket for real-time updates
  const [socket, setSocket] = useState<Socket | null>(null)

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:3001", {
      transports: ["websocket"],
    })

    newSocket.on("connect", () => {
      console.log("Connected to real-time server")
    })

    newSocket.on("voteUpdate", (data: { electionId: string; candidateId: string; newCount: number }) => {
      setLiveVoteCounts((prev) => ({
        ...prev,
        [data.electionId]: {
          ...prev[data.electionId],
          [data.candidateId]: data.newCount,
        },
      }))
    })

    newSocket.on("networkUpdate", (stats: NetworkStats) => {
      setNetworkStats(stats)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  // Real Wallet Connection
  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      throw new Error("MetaMask not installed")
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      // Create provider and signer
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
      const web3Signer = web3Provider.getSigner()
      const network = await web3Provider.getNetwork()

      setProvider(web3Provider)
      setSigner(web3Signer)
      setAccount(accounts[0])
      setChainId(network.chainId)
      setIsConnected(true)

      // Subscribe to account changes
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          setIsConnected(false)
          setAccount(null)
        } else {
          setAccount(accounts[0])
        }
      })

      // Subscribe to chain changes
      window.ethereum.on("chainChanged", (chainId: string) => {
        setChainId(Number.parseInt(chainId, 16))
      })
    } catch (error) {
      console.error("Wallet connection failed:", error)
      throw error
    }
  }

  // Real Vote Casting
  const castVote = async (electionId: string, candidateId: string): Promise<string> => {
    if (!signer || !provider) {
      throw new Error("Wallet not connected")
    }

    try {
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS!,
        VOTING_CONTRACT_ABI,
        signer,
      )

      // Estimate gas
      const gasEstimate = await contract.estimateGas.vote(electionId, candidateId)

      // Send transaction
      const tx = await contract.vote(electionId, candidateId, {
        gasLimit: gasEstimate.mul(120).div(100), // 20% buffer
      })

      // Wait for confirmation
      const receipt = await tx.wait()

      // Emit to real-time server
      socket?.emit("voteCast", {
        electionId,
        candidateId,
        voter: account,
        transactionHash: receipt.transactionHash,
      })

      return receipt.transactionHash
    } catch (error) {
      console.error("Vote casting failed:", error)
      throw error
    }
  }

  // Real Election Creation
  const createElection = async (electionData: any): Promise<string> => {
    if (!signer) {
      throw new Error("Wallet not connected")
    }

    try {
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_ELECTION_FACTORY_ADDRESS!,
        VOTING_CONTRACT_ABI,
        signer,
      )

      const tx = await contract.createElection(
        electionData.title,
        electionData.description,
        electionData.startTime,
        electionData.endTime,
        electionData.candidates.map((c: any) => c.name),
      )

      const receipt = await tx.wait()
      return receipt.contractAddress
    } catch (error) {
      console.error("Election creation failed:", error)
      throw error
    }
  }

  // Real-time Network Monitoring
  useEffect(() => {
    if (!provider) return

    const updateNetworkStats = async () => {
      try {
        const [currentGasPrice, currentBlockNumber] = await Promise.all([
          provider.getGasPrice(),
          provider.getBlockNumber(),
        ])

        setGasPrice(currentGasPrice)
        setBlockNumber(currentBlockNumber)
      } catch (error) {
        console.error("Failed to fetch network stats:", error)
      }
    }

    // Update immediately
    updateNetworkStats()

    // Update every 15 seconds (average block time)
    const interval = setInterval(updateNetworkStats, 15000)

    // Listen for new blocks
    provider.on("block", (blockNumber) => {
      setBlockNumber(blockNumber)
    })

    return () => {
      clearInterval(interval)
      provider.removeAllListeners("block")
    }
  }, [provider])

  // Subscribe to specific election updates
  const subscribeToElection = (electionId: string) => {
    socket?.emit("subscribeToElection", electionId)
  }

  return (
    <RealWeb3Context.Provider
      value={{
        provider,
        signer,
        account,
        chainId,
        isConnected,
        elections,
        liveVoteCounts,
        networkStats,
        gasPrice,
        blockNumber,
        connectWallet,
        castVote,
        createElection,
        subscribeToElection,
      }}
    >
      {children}
    </RealWeb3Context.Provider>
  )
}

export function useRealWeb3() {
  const context = useContext(RealWeb3Context)
  if (context === undefined) {
    throw new Error("useRealWeb3 must be used within a RealWeb3Provider")
  }
  return context
}
