"use client"

import React, { createContext, useContext, useState, useMemo, type ReactNode } from "react"
import type {
  Student,
  UniversityElection,
  Candidate,
  UniversityPosition,
  Faculty,
  UniversityConfig,
} from "@/types/university"
import { useMultiWallet } from "./use-multi-wallet"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "candidate" | "voter"
  matricNumber?: string
  department?: string
  position?: string
  party?: string
  year?: string
  gpa?: number
  permissions?: string[]
  isEmailVerified?: boolean
}

interface SignupData {
  email: string
  password: string
  userType: "voter" | "candidate" | "admin"
  fullName: string
  matricNumber: string
  studentId?: string
  department: string
  year: string
  program?: string
  phone?: string
  gpa?: string
  contestingPosition?: string
  platform?: string
  experience?: string
  campaignPromises?: string[]
}

interface UniversityVotingContextType {
  university: UniversityConfig
  currentStudent: Student | null
  elections: UniversityElection[]
  faculties: Faculty[]
  positions: UniversityPosition[]
  user: User | null
  isAuthenticated: boolean
  userRole: "student" | "admin" | "faculty" | "election_officer"
  isLoading: boolean
  error: string | null
  hasVoted: (electionId: string, positionId: string) => Promise<boolean>
  votingHistory: Record<string, string[]>
  login: (email: string, password: string, accessCode?: string) => Promise<boolean>
  signup: (data: SignupData) => Promise<void>
  verifyEmail: (email: string, code: string) => Promise<void>
  resendVerification: (email: string) => Promise<void>
  logout: () => void
  authenticateStudent: (matricNumber: string, password: string) => Promise<void>
  registerStudent: (studentData: Partial<Student>) => Promise<void>
  submitCandidacy: (positionId: string, candidateData: any) => Promise<void>
  castVote: (electionId: string, positionId: string, candidateId: string) => Promise<string>
  createElection: (electionData: Partial<UniversityElection>) => Promise<string>
  getElectionResults: (electionId: string) => Promise<any>
  verifyStudentEligibility: (matricNumber: string) => Promise<boolean>
  getCampaignInfo: (candidateId: string) => Promise<any>
  pendingCandidates: Candidate[]
  verifyCandidate: (candidateId: string) => Promise<void>
  rejectCandidate: (candidateId: string, reason: string) => Promise<void>
  getAllCandidates: () => Candidate[]
  walletState: {
    isConnected: boolean
    account: string | undefined
    needsNetworkSwitch: boolean
    isOnSupportedNetwork: boolean
  }
  walletActions: {
    connectWallet: (type: 'metamask' | 'coinbase') => Promise<void>
    switchToSupportedNetwork: () => Promise<void>
    disconnectWallet: () => void
  }
  walletError: string | null
  refetchElections: () => void
}

const UniversityVotingContext = createContext<UniversityVotingContextType | undefined>(undefined)

// Mock university configuration
const mockUniversity: UniversityConfig = {
  name: "Tech University",
  address: "123 University Ave, Tech City, TC 12345",
  website: "https://techuniversity.edu",
  studentBodySize: 25000,
  faculties: [
    {
      id: "engineering",
      name: "Faculty of Engineering",
      departments: ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering"],
      dean: "Dr. Sarah Johnson",
      studentCount: 8500,
    },
    {
      id: "business",
      name: "School of Business",
      departments: ["Finance", "Marketing", "Management", "Accounting"],
      dean: "Dr. Michael Chen",
      studentCount: 6200,
    },
  ],
  academicCalendar: {
    fallStart: "2024-09-01",
    fallEnd: "2024-12-15",
    springStart: "2025-01-15",
    springEnd: "2025-05-15",
    summerStart: "2025-06-01",
    summerEnd: "2025-08-15",
  },
  electionRules: {
    minGPAToVote: 2.0,
    minGPAToRun: 2.5,
    minAcademicYearToRun: 2,
    maxTermsPerPosition: 2,
  },
}

// Available positions
const availablePositions: UniversityPosition[] = [
  {
    id: "president",
    title: "Student Union President",
    description: "Lead the student union and represent all students",
    requirements: {
      minGPA: 3.0,
      minAcademicYear: 3,
      maxAcademicYear: 4,
    },
    responsibilities: [
      "Represent student body to university administration",
      "Lead student union meetings",
      "Oversee student union budget",
    ],
    term: "1 Academic Year",
    salary: 15000,
  },
]

const mockUserDatabase: Record<string, User & { password: string; verificationCode?: string }> = {
  "admin@techuni.edu": {
    id: "admin-1",
    email: "admin@techuni.edu",
    password: "admin2024!",
    name: "Dr. Sarah Mitchell",
    role: "admin",
    department: "IT Administration",
    permissions: ["manage_elections", "manage_users", "view_analytics", "system_config"],
    isEmailVerified: true,
  },
}

export function UniversityVotingProviderSimple({ children }: { children: ReactNode }) {
  const [university] = useState<UniversityConfig>(mockUniversity)
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null)
  const [faculties] = useState<Faculty[]>(mockUniversity.faculties)
  const [positions] = useState<UniversityPosition[]>(availablePositions)
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<"student" | "admin" | "faculty" | "election_officer">("student")
  const [votingHistory, setVotingHistory] = useState<Record<string, string[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingCandidates, setPendingCandidates] = useState<Candidate[]>([])
  const [elections, setElections] = useState<UniversityElection[]>([])

  let wallet
  let isConnected = false
  let account: string | undefined = undefined
  let isOnSupportedNetwork = false
  let needsNetworkSwitch = false
  let switchToSupportedNetwork = () => Promise.resolve()
  let connectWallet = (type: 'metamask' | 'coinbase') => Promise.resolve()
  let disconnectWallet = () => {}
  let walletError: string | null = null
  
  try {
    wallet = useMultiWallet()
    isConnected = wallet.isConnected
    account = wallet.account
    isOnSupportedNetwork = wallet.isOnSupportedNetwork
    needsNetworkSwitch = wallet.needsNetworkSwitch
    switchToSupportedNetwork = wallet.switchToSupportedNetwork
    connectWallet = wallet.connectWallet
    disconnectWallet = wallet.disconnectWallet
    walletError = wallet.error
  } catch (error) {
    console.error('Wallet initialization error:', error)
    walletError = error instanceof Error ? error.message : 'Wallet connection failed'
  }

  const login = async (email: string, password: string, accessCode?: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const userData = mockUserDatabase[email]
      if (!userData) {
        throw new Error("Invalid email or password")
      }

      if (userData.password !== password) {
        throw new Error("Invalid email or password")
      }

      if (!userData.isEmailVerified) {
        throw new Error("EMAIL_NOT_VERIFIED")
      }

      if (userData.role === "admin" && accessCode !== "ADM-7892-XYZ") {
        throw new Error("Invalid access code")
      }

      const { password: _, verificationCode: __, ...userWithoutPassword } = userData
      setUser(userWithoutPassword)
      setIsAuthenticated(true)
      setUserRole(userData.role === "admin" ? "admin" : "student")
      return true
    } catch (err: any) {
      setError(err.message || "Login failed")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Simplified implementations for all other functions
  const signup = async (data: SignupData): Promise<void> => {
    setError(null)
    console.log("Signup:", data)
  }

  const verifyEmail = async (email: string, code: string): Promise<void> => {
    console.log("Verify email:", email, code)
  }

  const resendVerification = async (email: string): Promise<void> => {
    console.log("Resend verification:", email)
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    setUserRole("student")
    setCurrentStudent(null)
    setError(null)
  }

  const authenticateStudent = async (matricNumber: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    if (matricNumber.startsWith("TU")) {
      setIsAuthenticated(true)
      setUserRole("student")
    } else {
      throw new Error("Invalid student credentials")
    }
  }

  const registerStudent = async (studentData: Partial<Student>) => {
    console.log("Register student:", studentData)
  }

  const submitCandidacy = async (positionId: string, candidateData: any) => {
    console.log("Submit candidacy:", positionId, candidateData)
  }

  const castVote = async (electionId: string, positionId: string, candidateId: string): Promise<string> => {
    console.log("Cast vote:", electionId, positionId, candidateId)
    return "0x123456"
  }

  const hasVoted = async (electionId: string, positionId: string): Promise<boolean> => {
    return false
  }

  const createElection = async (electionData: Partial<UniversityElection>): Promise<string> => {
    console.log("Create election:", electionData)
    return "0x123456"
  }

  const getElectionResults = async (electionId: string) => {
    console.log("Get election results:", electionId)
    return []
  }

  const verifyStudentEligibility = async (matricNumber: string): Promise<boolean> => {
    return matricNumber.startsWith("TU") && matricNumber.length >= 10
  }

  const getCampaignInfo = async (candidateId: string) => {
    console.log("Get campaign info:", candidateId)
    return {}
  }

  const verifyCandidate = async (candidateId: string): Promise<void> => {
    console.log("Verify candidate:", candidateId)
  }

  const rejectCandidate = async (candidateId: string, reason: string): Promise<void> => {
    console.log("Reject candidate:", candidateId, reason)
  }

  const getAllCandidates = (): Candidate[] => {
    return pendingCandidates
  }

  const refetchElections = () => {
    console.log("Refetch elections")
  }

  const contextValue = useMemo(
    () => ({
      university,
      currentStudent,
      elections,
      faculties,
      positions,
      user,
      isAuthenticated,
      userRole,
      isLoading,
      error,
      hasVoted,
      votingHistory,
      login,
      signup,
      verifyEmail,
      resendVerification,
      logout,
      authenticateStudent,
      registerStudent,
      submitCandidacy,
      castVote,
      createElection,
      getElectionResults,
      verifyStudentEligibility,
      getCampaignInfo,
      pendingCandidates,
      verifyCandidate,
      rejectCandidate,
      getAllCandidates,
      walletState: {
        isConnected,
        account,
        needsNetworkSwitch,
        isOnSupportedNetwork,
      },
      walletActions: {
        connectWallet,
        switchToSupportedNetwork,
        disconnectWallet,
      },
      walletError,
      refetchElections,
    }),
    [
      university,
      currentStudent,
      elections,
      faculties,
      positions,
      user,
      isAuthenticated,
      userRole,
      isLoading,
      error,
      votingHistory,
      pendingCandidates,
      isConnected,
      account,
      needsNetworkSwitch,
      isOnSupportedNetwork,
      connectWallet,
      switchToSupportedNetwork,
      disconnectWallet,
      walletError,
    ],
  )

  return <UniversityVotingContext.Provider value={contextValue}>{children}</UniversityVotingContext.Provider>
}

export function useUniversityVotingSimple() {
  const context = useContext(UniversityVotingContext)
  if (context === undefined) {
    console.error("useUniversityVoting must be used within a UniversityVotingProvider")
    // Return a safe default context instead of throwing
    return {
      university: mockUniversity,
      currentStudent: null,
      elections: [],
      faculties: mockUniversity.faculties,
      positions: availablePositions,
      user: null,
      isAuthenticated: false,
      userRole: "student" as const,
      isLoading: false,
      error: "Provider not initialized",
      hasVoted: async () => false,
      votingHistory: {},
      login: async () => false,
      signup: async () => {},
      verifyEmail: async () => {},
      resendVerification: async () => {},
      logout: () => {},
      authenticateStudent: async () => {},
      registerStudent: async () => {},
      submitCandidacy: async () => {},
      castVote: async () => "0x000",
      createElection: async () => "0x000",
      getElectionResults: async () => [],
      verifyStudentEligibility: async () => false,
      getCampaignInfo: async () => ({}),
      pendingCandidates: [],
      verifyCandidate: async () => {},
      rejectCandidate: async () => {},
      getAllCandidates: () => [],
      walletState: {
        isConnected: false,
        account: undefined,
        needsNetworkSwitch: false,
        isOnSupportedNetwork: false,
      },
      walletActions: {
        connectWallet: async () => {},
        switchToSupportedNetwork: async () => {},
        disconnectWallet: () => {},
      },
      walletError: "Provider not initialized",
      refetchElections: () => {},
    }
  }
  return context
}
