"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

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

interface Web3ContextType {
  isConnected: boolean
  account: string | null
  userRole: "voter" | "admin" | "auditor"
  elections: Election[]
  isRegistered: boolean
  networkStatus: string
  gasPrice: number
  blockNumber: number
  connectWallet: () => Promise<void>
  castVote: (electionId: string, candidateId: string, signature: string) => Promise<string>
  hasVoted: (electionId: string) => boolean
  registerVoter: (data: any, biometricHash: string) => Promise<void>
  createElection: (data: any) => Promise<string>
  verifyVoter: (address: string) => Promise<boolean>
  getTransactionHistory: () => Promise<any[]>
  validateElectionIntegrity: (electionId: string) => Promise<boolean>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

// Enhanced mock data with production features
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
  {
    id: "0x2b3c4d5e6f7g",
    title: "Senate Election 2024",
    description: "State senate election with blockchain verification",
    startTime: "2024-01-01T00:00:00",
    endTime: "2024-11-30T23:59:59",
    status: "active",
    totalVotes: 28500,
    contractAddress: "0x742d35Cc6634C0532925a3b8D4C0C8b3C2e1e1e2",
    createdBy: "0xAdmin123456789",
    voterRequirements: {
      minAge: 18,
      citizenship: true,
      kycVerified: true,
    },
    encryptionKey: "0xEncryptionKey456",
    candidates: [
      {
        id: "0x4",
        name: "David Wilson",
        party: "Progressive Party",
        votes: 15500,
        walletAddress: "0xDavid123456789",
        verified: true,
      },
      {
        id: "0x5",
        name: "Emma Brown",
        party: "Conservative Party",
        votes: 13000,
        walletAddress: "0xEmma123456789",
        verified: true,
      },
    ],
  },
]

export function Web3Provider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<"voter" | "admin" | "auditor">("voter")
  const [elections, setElections] = useState<Election[]>(mockElections)
  const [isRegistered, setIsRegistered] = useState(false)
  const [votedElections, setVotedElections] = useState<Set<string>>(new Set())
  const [networkStatus, setNetworkStatus] = useState("Ethereum Mainnet")
  const [gasPrice, setGasPrice] = useState(25)
  const [blockNumber, setBlockNumber] = useState(18500000)

  // Simulate real-time blockchain updates
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        setBlockNumber((prev) => prev + 1)
        setGasPrice((prev) => prev + Math.floor(Math.random() * 10) - 5)
      }, 15000) // New block every 15 seconds

      return () => clearInterval(interval)
    }
  }, [isConnected])

  const connectWallet = async () => {
    try {
      // Simulate MetaMask connection
      if (typeof window !== "undefined" && (window as any).ethereum) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setIsConnected(true)
        setAccount("0x742d35Cc6634C0532925a3b8D4C0C8b3C2e1e1e1")
        setIsRegistered(true)

        // Assign role based on address (for demo)
        const randomRole = Math.random()
        if (randomRole > 0.8) setUserRole("admin")
        else if (randomRole > 0.9) setUserRole("auditor")
        else setUserRole("voter")

        setNetworkStatus("Connected to Ethereum")
      } else {
        throw new Error("MetaMask not detected")
      }
    } catch (error) {
      console.error("Wallet connection failed:", error)
      setNetworkStatus("Connection failed")
    }
  }

  const castVote = async (electionId: string, candidateId: string, signature: string) => {
    // Simulate blockchain transaction with gas estimation
    const estimatedGas = 150000
    const transactionCost = (gasPrice * estimatedGas) / 1e9

    await new Promise((resolve) => setTimeout(resolve, 3000)) // Simulate network delay

    // Update vote counts
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

    // Return transaction hash
    return `0x${Math.random().toString(16).substr(2, 64)}`
  }

  const hasVoted = (electionId: string) => {
    return votedElections.has(electionId)
  }

  const registerVoter = async (data: any, biometricHash: string) => {
    // Simulate KYC verification and biometric registration
    await new Promise((resolve) => setTimeout(resolve, 2500))

    // Simulate blockchain registration transaction
    const registrationTx = `0x${Math.random().toString(16).substr(2, 64)}`

    setIsRegistered(true)
    return registrationTx
  }

  const createElection = async (data: any) => {
    // Simulate smart contract deployment
    await new Promise((resolve) => setTimeout(resolve, 4000))

    const contractAddress = `0x${Math.random().toString(16).substr(2, 40)}`
    const newElection: Election = {
      id: `0x${Math.random().toString(16).substr(2, 12)}`,
      title: data.title,
      description: data.description,
      startTime: data.startTime,
      endTime: data.endTime,
      status: "upcoming",
      totalVotes: 0,
      contractAddress,
      createdBy: account || "",
      voterRequirements: data.voterRequirements || {
        minAge: 18,
        citizenship: true,
        kycVerified: true,
      },
      encryptionKey: `0x${Math.random().toString(16).substr(2, 64)}`,
      candidates: data.candidates.map((candidate: any, index: number) => ({
        id: `0x${Math.random().toString(16).substr(2, 8)}`,
        name: candidate.name,
        party: candidate.party,
        votes: 0,
        walletAddress: candidate.walletAddress || `0x${Math.random().toString(16).substr(2, 40)}`,
        verified: false,
      })),
    }

    setElections((prev) => [...prev, newElection])
    return contractAddress
  }

  const verifyVoter = async (address: string) => {
    // Simulate KYC verification check
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return Math.random() > 0.1 // 90% verification rate
  }

  const getTransactionHistory = async () => {
    // Simulate fetching transaction history from blockchain
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return [
      {
        hash: "0x1234567890abcdef",
        type: "vote",
        timestamp: new Date().toISOString(),
        gasUsed: 150000,
        status: "confirmed",
      },
      {
        hash: "0xabcdef1234567890",
        type: "registration",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        gasUsed: 200000,
        status: "confirmed",
      },
    ]
  }

  const validateElectionIntegrity = async (electionId: string) => {
    // Simulate blockchain integrity validation
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return Math.random() > 0.05 // 95% integrity rate
  }

  return (
    <Web3Context.Provider
      value={{
        isConnected,
        account,
        userRole,
        elections,
        isRegistered,
        networkStatus,
        gasPrice,
        blockNumber,
        connectWallet,
        castVote,
        hasVoted,
        registerVoter,
        createElection,
        verifyVoter,
        getTransactionHistory,
        validateElectionIntegrity,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}
