"use client"

import React, { createContext, useContext, useState, type ReactNode } from "react"

interface Candidate {
  id: string
  name: string
  party: string
  votes: number
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
}

interface BlockchainContextType {
  isConnected: boolean
  account: string | null
  userRole: "voter" | "admin"
  elections: Election[]
  isRegistered: boolean
  connectWallet: () => Promise<void>
  castVote: (electionId: string, candidateId: string) => Promise<void>
  hasVoted: (electionId: string) => boolean
  registerVoter: (data: any) => Promise<void>
  createElection: (data: any) => Promise<void>
  addCandidate: (electionId: string, candidate: any) => Promise<void>
  verifyVoter: (address: string) => Promise<boolean>
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined)

// Mock data for demonstration
const mockElections: Election[] = [
  {
    id: "1",
    title: "Presidential Election 2024",
    description: "National presidential election for the next term",
    startTime: "2024-01-01T00:00:00",
    endTime: "2024-12-31T23:59:59",
    status: "active",
    totalVotes: 15420,
    candidates: [
      { id: "1", name: "Alice Johnson", party: "Democratic Party", votes: 8234 },
      { id: "2", name: "Bob Smith", party: "Republican Party", votes: 6186 },
      { id: "3", name: "Carol Davis", party: "Independent", votes: 1000 },
    ],
  },
  {
    id: "2",
    title: "Local Mayor Election",
    description: "City mayor election for the upcoming term",
    startTime: "2024-01-01T00:00:00",
    endTime: "2024-06-30T23:59:59",
    status: "completed",
    totalVotes: 8500,
    candidates: [
      { id: "4", name: "David Wilson", party: "Progressive Party", votes: 4500 },
      { id: "5", name: "Emma Brown", party: "Conservative Party", votes: 4000 },
    ],
  },
]

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<"voter" | "admin">("voter")
  const [elections, setElections] = useState<Election[]>(mockElections)
  const [isRegistered, setIsRegistered] = useState(false)
  const [votedElections, setVotedElections] = useState<Set<string>>(new Set())

  const connectWallet = async () => {
    // Simulate wallet connection
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsConnected(true)
    setAccount("0x1234567890abcdef1234567890abcdef12345678")
    setIsRegistered(true)
    // Randomly assign admin role for demo
    setUserRole(Math.random() > 0.7 ? "admin" : "voter")
  }

  const castVote = async (electionId: string, candidateId: string) => {
    // Simulate blockchain transaction
    await new Promise((resolve) => setTimeout(resolve, 2000))

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
  }

  const hasVoted = (electionId: string) => {
    return votedElections.has(electionId)
  }

  const registerVoter = async (data: any) => {
    // Simulate voter registration
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsRegistered(true)
  }

  const createElection = async (data: any) => {
    // Simulate election creation
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newElection: Election = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      startTime: data.startTime,
      endTime: data.endTime,
      status: "upcoming",
      totalVotes: 0,
      candidates: data.candidates.map((candidate: any, index: number) => ({
        id: `${Date.now()}-${index}`,
        name: candidate.name,
        party: candidate.party,
        votes: 0,
      })),
    }

    setElections((prev) => [...prev, newElection])
  }

  const addCandidate = async (electionId: string, candidate: any) => {
    // Simulate adding candidate
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  const verifyVoter = async (address: string) => {
    // Simulate voter verification
    await new Promise((resolve) => setTimeout(resolve, 500))
    return true
  }

  return (
    <BlockchainContext.Provider
      value={{
        isConnected,
        account,
        userRole,
        elections,
        isRegistered,
        connectWallet,
        castVote,
        hasVoted,
        registerVoter,
        createElection,
        addCandidate,
        verifyVoter,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  )
}

export function useBlockchain() {
  const context = useContext(BlockchainContext)
  if (context === undefined) {
    throw new Error("useBlockchain must be used within a BlockchainProvider")
  }
  return context
}
