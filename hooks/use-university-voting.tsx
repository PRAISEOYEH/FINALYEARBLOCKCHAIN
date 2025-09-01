"use client"

import { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from "react"
import type {
  Student,
  UniversityElection,
  Candidate,
  UniversityPosition,
  Faculty,
  UniversityConfig,
} from "@/types/university"
import { useMultiWallet } from "./use-multi-wallet"
import { useBlockchainVoting } from "./use-blockchain-voting"
import {
  getOnchainElectionId,
  getOnchainPositionId,
  getOnchainCandidateId,
  getAllElectionMappings,
  getAllCandidateMappings,
  addElectionMapping,
  addPositionMapping,
  addCandidateMapping,
} from "@/lib/contracts/id-map"
import { useQuery, useQueryClient } from "@tanstack/react-query"

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
  studentId?: string // For backend compatibility
  department: string
  year: string
  program?: string
  phone?: string
  gpa?: string
  // Candidate-specific fields
  contestingPosition?: string
  platform?: string
  experience?: string
  campaignPromises?: string[]
}

interface UniversityVotingContextType {
  // University Data
  university: UniversityConfig
  currentStudent: Student | null
  elections: UniversityElection[]
  faculties: Faculty[]
  positions: UniversityPosition[]

  // Authentication
  user: User | null
  isAuthenticated: boolean
  userRole: "student" | "admin" | "faculty" | "election_officer"
  isLoading: boolean
  error: string | null

  // Voting State
  hasVoted: (electionId: string, positionId: string) => Promise<boolean>
  votingHistory: Record<string, string[]>

  // Functions
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

  // Candidate management
  pendingCandidates: Candidate[]
  verifyCandidate: (candidateId: string) => Promise<void>
  rejectCandidate: (candidateId: string, reason: string) => Promise<void>
  getAllCandidates: () => Candidate[]

  // Wallet State and Actions
  walletState: {
    isConnected: boolean
    account: string | undefined
    needsNetworkSwitch: boolean
    isOnSupportedNetwork: boolean
  }
  walletActions: {
    connectWallet: (type: 'metamask' | 'walletconnect' | 'coinbase') => Promise<void>
    switchToSupportedNetwork: () => Promise<void>
    disconnectWallet: () => void
  }
  walletError: string | null

  // Expose refetch method for components
  refetchElections: () => void
}

const UniversityVotingContext = createContext<UniversityVotingContextType | undefined>(undefined)

// University Configuration - Basic structure only
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
    {
      id: "arts",
      name: "Faculty of Arts & Sciences",
      departments: ["Psychology", "Biology", "Chemistry", "English", "History"],
      dean: "Dr. Emily Rodriguez",
      studentCount: 7800,
    },
    {
      id: "medicine",
      name: "School of Medicine",
      departments: ["Medicine", "Nursing", "Pharmacy", "Dentistry"],
      dean: "Dr. Robert Kim",
      studentCount: 2500,
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

// Available positions - these exist as templates but no elections are created yet
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
      "Advocate for student rights and interests",
    ],
    term: "1 Academic Year",
    salary: 15000,
  },
  {
    id: "vp_academic",
    title: "Vice President Academic",
    description: "Focus on academic affairs and student academic experience",
    requirements: {
      minGPA: 3.2,
      minAcademicYear: 2,
      maxAcademicYear: 4,
    },
    responsibilities: [
      "Advocate for academic policy improvements",
      "Coordinate with faculty on curriculum matters",
      "Organize academic support programs",
      "Handle academic grievances",
    ],
    term: "1 Academic Year",
    salary: 12000,
  },
  {
    id: "vp_student_life",
    title: "Vice President Student Life",
    description: "Enhance campus life and student experience",
    requirements: {
      minGPA: 2.8,
      minAcademicYear: 2,
      maxAcademicYear: 4,
    },
    responsibilities: [
      "Organize campus events and activities",
      "Manage student clubs and societies",
      "Improve campus facilities",
      "Promote student wellness programs",
    ],
    term: "1 Academic Year",
    salary: 12000,
  },
  {
    id: "general_secretary",
    title: "General Secretary",
    description: "Maintain official records and coordinate administrative activities",
    requirements: {
      minGPA: 3.2,
      minAcademicYear: 2,
      maxAcademicYear: 4,
    },
    responsibilities: [
      "Maintain official student union records and documentation",
      "Coordinate meetings and prepare agendas",
      "Handle official correspondence and communications",
      "Manage student union archives and historical records",
      "Assist with administrative tasks and event coordination",
    ],
    term: "1 Academic Year",
    salary: 10000,
  },
  {
    id: "financial_secretary",
    title: "Financial Secretary",
    description: "Assist treasurer with financial record-keeping and budget tracking",
    requirements: {
      minGPA: 3.4,
      minAcademicYear: 2,
      maxAcademicYear: 4,
    },
    responsibilities: [
      "Assist in maintaining accurate financial records",
      "Support budget preparation and monitoring",
      "Help prepare financial reports and statements",
      "Assist with expense tracking and reimbursements",
      "Support financial audits and compliance activities",
    ],
    term: "1 Academic Year",
    salary: 11000,
  },
  {
    id: "senate_president",
    title: "Senate President",
    description: "Lead student senate and represent students in university governance",
    requirements: {
      minGPA: 3.5,
      minAcademicYear: 3,
      maxAcademicYear: 4,
    },
    responsibilities: [
      "Preside over student senate meetings and sessions",
      "Facilitate legislative processes and policy discussions",
      "Represent student body in university governance committees",
      "Coordinate with faculty and administration on student issues",
      "Oversee student government legislative initiatives",
    ],
    term: "1 Academic Year",
    salary: 14000,
  },
  {
    id: "treasurer",
    title: "Treasurer",
    description: "Manage student union finances and ensure fiscal responsibility",
    requirements: {
      minGPA: 3.6,
      minAcademicYear: 2,
      maxAcademicYear: 4,
    },
    responsibilities: [
      "Manage student union budget and financial planning",
      "Oversee all financial transactions and expenditures",
      "Prepare comprehensive financial reports and statements",
      "Ensure compliance with financial regulations and policies",
      "Coordinate with university finance office on funding matters",
    ],
    term: "1 Academic Year",
    salary: 13000,
  },
]

// EMPTY INITIAL STATE - Only admin account exists
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

export function UniversityVotingProvider({ children }: { children: ReactNode }) {
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
  const [pendingCandidates, setPendingCandidates] = useState<Candidate[]>([]) // keep local pending list for UI-only pending state

  const chain = useBlockchainVoting()
  const wallet = useMultiWallet()
  const qc = useQueryClient()

  // Destructure wallet state and actions
  const { 
    isConnected, 
    account, 
    isOnSupportedNetwork, 
    needsNetworkSwitch, 
    switchToSupportedNetwork, 
    connectWallet, 
    disconnectWallet,
    error: walletError 
  } = wallet

  // Centralized wallet validation for blockchain operations
  const validateWalletForBlockchainOp = () => {
    if (!isConnected) {
      throw new Error('WALLET_NOT_CONNECTED')
    }
    if (!isOnSupportedNetwork) {
      throw new Error('WRONG_NETWORK')
    }
    if (!account) {
      throw new Error('NO_ACCOUNT_ADDRESS')
    }
  }

  // Helper: robust parsing of onchain ids from a transaction receipt (best-effort)
  const parseOnchainIdFromReceipt = (receipt: any): bigint | null => {
    try {
      if (!receipt) return null
      const logs = receipt.logs ?? receipt?.events ?? []
      for (const log of logs) {
        // Try topics (hex) -> parse to bigint
        if (log?.topics && Array.isArray(log.topics) && log.topics.length >= 2) {
          // topics[1] often holds indexed parameter
          const t = log.topics[1]
          if (typeof t === "string" && t.startsWith("0x")) {
            try {
              // remove hex prefix and parse
              const num = BigInt(t)
              if (num >= 0n) return num
            } catch {
              // ignore
            }
          }
        }

        // Try data field if it is hex number-like
        const data = log?.data
        if (typeof data === "string" && data.startsWith("0x")) {
          try {
            // Some logs pack multiple values; attempt to parse as single bigint if short
            if (data.length <= 66) {
              const num = BigInt(data)
              if (num >= 0n) return num
            } else {
              // if long, try to take last 66 chars
              const tail = "0x" + data.slice(-64)
              const num = BigInt(tail)
              if (num >= 0n) return num
            }
          } catch {
            // ignore
          }
        }
      }
    } catch (err) {
      // swallow
    }
    return null
  }

  // Build elections list from stored mappings and on-chain reads (cached via react-query)
  const electionsQuery = useQuery(
    ["elections"],
    async () => {
      const mappings = getAllElectionMappings()
      if (!mappings || mappings.length === 0) return [] as UniversityElection[]

      const results = await Promise.all(
        mappings.map(async (m) => {
          try {
            const onchain = await chain.getElection(m.onchainElectionId)
            // Normalize minimally to UniversityElection shape expected by UI
            const normalized: UniversityElection = {
              id: m.uiElectionId,
              title: (onchain && (onchain.title ?? onchain[0] ?? "")) as string,
              description: (onchain && (onchain.description ?? onchain[1] ?? "")) as string,
              academicYear: "",
              semester: "fall",
              positions: (onchain && (onchain.positions ?? [])) as any[],
              candidates: (onchain && (onchain.candidates ?? [])) as any[],
              startTime: (onchain && (onchain.startTime ?? "")) as any,
              endTime: (onchain && (onchain.endTime ?? "")) as any,
              campaignStartTime: "",
              campaignEndTime: "",
              status: "ongoing",
              eligibleVoters: {
                totalCount: university.studentBodySize,
                byFaculty: faculties.reduce(
                  (acc, faculty) => ({ ...acc, [faculty.id]: faculty.studentCount }),
                  {} as Record<string, number>,
                ),
                byYear: { 1: 5000, 2: 5000, 3: 5000, 4: 5000 },
              },
              totalVotes: 0,
              turnoutRate: 0,
              contractAddress: "", // optional
              createdBy: "",
              electionRules: electionDefaultRules(),
            }
            return normalized
          } catch (err) {
            return null
          }
        }),
      )
      return results.filter((r): r is UniversityElection => r !== null)
    },
    {
      // keep data fresh when chain events invalidate queries
      staleTime: 1000 * 30,
      retry: 1,
    },
  )

  // Expose elections from query
  const elections = electionsQuery.data ?? []

  // Utility default election rules
  function electionDefaultRules() {
    return {
      maxCandidatesPerPosition: 5,
      campaignSpendingLimit: 3000,
      votingMethod: "single",
      requiresDeposit: true,
      depositAmount: 100,
    }
  }

  // Login/signup/etc remain as simple mock flows (they are orthogonal to chain ops)
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

      // Admin requires access code
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

  const signup = async (data: SignupData): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Check if email already exists
      if (mockUserDatabase[data.email]) {
        throw new Error("Email already registered")
      }

      // Generate verification code - for demo, always use 123456
      const verificationCode = "123456"

      // Create new user
      const newUser: User & { password: string; verificationCode: string } = {
        id: `${data.userType}-${Date.now()}`,
        email: data.email,
        password: data.password,
        name: data.fullName,
        role: data.userType === "voter" ? "voter" : data.userType === "candidate" ? "candidate" : "admin",
        matricNumber: data.matricNumber,
        department: data.department,
        year: data.year,
        gpa: data.gpa ? Number.parseFloat(data.gpa) : undefined,
        isEmailVerified: false,
        verificationCode,
      }

      // Add to mock database
      mockUserDatabase[data.email] = newUser

      // If candidate, create candidate entry (but only after verification)
      if (data.userType === "candidate" && data.contestingPosition) {
        const position = positions.find((p) => p.id === data.contestingPosition)
        if (position) {
          // Store candidate data for later processing after email verification
          newUser.position = data.contestingPosition
        }
      }

      // Log verification code to console for demo
      console.log(`🔐 Verification code for ${data.email}: ${verificationCode}`)
      console.log(`📧 In a real application, this would be sent via email.`)
    } catch (err: any) {
      setError(err.message || "Signup failed")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const verifyEmail = async (email: string, code: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const userData = mockUserDatabase[email]
      if (!userData) {
        throw new Error("User not found")
      }

      // Accept both the generated code and demo code 123456
      if (userData.verificationCode !== code && code !== "123456") {
        throw new Error("Invalid verification code")
      }

      // Mark email as verified
      userData.isEmailVerified = true
      delete userData.verificationCode

      // If this was a candidate registration, create the candidate entry now
      if (userData.role === "candidate" && userData.position) {
        const position = positions.find((p) => p.id === userData.position)
        if (position) {
          const newCandidate: Candidate = {
            id: `cand_${Date.now()}`,
            studentId: userData.matricNumber || "",
            student: {
              id: userData.id,
              studentId: userData.matricNumber || "",
              email: userData.email,
              fullName: userData.name,
              program: "", // Will be filled from signup data
              academicYear: Number.parseInt(userData.year || "1"),
              faculty: userData.department || "",
              department: userData.department || "",
              enrollmentStatus: "active",
              gpa: userData.gpa || 0,
              isEligibleToVote: true,
              isEligibleToRun: true,
              verificationStatus: "pending",
            },
            position,
            platform: "", // Will be filled from signup data
            experience: "",
            endorsements: [],
            campaignPromises: [],
            votes: 0,
            verified: false,
            campaignBudget: 0,
            socialMedia: {},
          }

          setPendingCandidates((prev) => [...prev, newCandidate])
        }
      }
    } catch (err: any) {
      setError(err.message || "Verification failed")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const resendVerification = async (email: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const userData = mockUserDatabase[email]
      if (!userData) {
        throw new Error("User not found")
      }

      if (userData.isEmailVerified) {
        throw new Error("Email already verified")
      }

      // Generate new verification code - for demo, always use 123456
      const verificationCode = "123456"
      userData.verificationCode = verificationCode

      // Log verification code to console for demo
      console.log(`🔐 New verification code for ${email}: ${verificationCode}`)
      console.log(`📧 In a real application, this would be sent via email.`)
    } catch (err: any) {
      setError(err.message || "Failed to resend verification")
      throw err
    } finally {
      setIsLoading(false)
    }
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
      if (matricNumber.includes("ADMIN")) setUserRole("admin")
      else if (matricNumber.includes("FACULTY")) setUserRole("faculty")
      else if (matricNumber.includes("OFFICER")) setUserRole("election_officer")
      else setUserRole("student")
    } else {
      throw new Error("Invalid student credentials")
    }
  }

  const registerStudent = async (studentData: Partial<Student>) => {
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  const submitCandidacy = async (positionId: string, candidateData: any) => {
    await new Promise((resolve) => setTimeout(resolve, 2500))

    if (!currentStudent?.isEligibleToRun) {
      throw new Error("Student not eligible to run for office")
    }

    const position = positions.find((p) => p.id === positionId)
    if (!position) {
      throw new Error("Position not found")
    }

    if (currentStudent.gpa < position.requirements.minGPA) {
      throw new Error(`Minimum GPA of ${position.requirements.minGPA} required`)
    }

    if (currentStudent.academicYear < position.requirements.minAcademicYear) {
      throw new Error(`Minimum academic year ${position.requirements.minAcademicYear} required`)
    }

    const newCandidate: Candidate = {
      id: `cand_${Date.now()}`,
      studentId: currentStudent.studentId,
      student: currentStudent,
      position,
      platform: candidateData.platform,
      experience: candidateData.experience,
      endorsements: candidateData.endorsements || [],
      campaignPromises: candidateData.campaignPromises || [],
      votes: 0,
      verified: false,
      campaignBudget: candidateData.campaignBudget || 0,
      socialMedia: candidateData.socialMedia || {},
    }

    // Add to pending candidates for admin approval
    setPendingCandidates((prev) => [...prev, newCandidate])
  }

  // CAST VOTE - blockchain-only path (no mock fallback)
  const castVote = async (electionId: string, positionId: string, candidateId: string): Promise<string> => {
    setIsLoading(true)
    setError(null)
    try {
      // Validate wallet state before proceeding
      validateWalletForBlockchainOp()

      // Map UI ids to onchain ids
      let onchainElectionId = getOnchainElectionId(electionId)
      let onchainPositionId = getOnchainPositionId(positionId)
      let onchainCandidateId = getOnchainCandidateId(candidateId)

      if (onchainElectionId == null) {
        const parsed = Number.parseInt(electionId)
        if (!Number.isNaN(parsed)) onchainElectionId = BigInt(parsed)
        else throw new Error(`Invalid election id mapping for UI id: ${electionId}`)
      }
      if (onchainPositionId == null) {
        const parsed = Number.parseInt(positionId)
        if (!Number.isNaN(parsed)) onchainPositionId = BigInt(parsed)
        else throw new Error(`Invalid position id mapping for UI id: ${positionId}`)
      }
      if (onchainCandidateId == null) {
        const parsed = Number.parseInt(candidateId)
        if (!Number.isNaN(parsed)) onchainCandidateId = BigInt(parsed)
        else throw new Error(`Invalid candidate id mapping for UI id: ${candidateId}`)
      }

      const res = await chain.castVote(onchainElectionId, onchainPositionId, onchainCandidateId)
      // res is expected to return { hash, receipt }
      const hash = (res as any)?.hash || ""
      // Invalidate queries so UI refreshes
      qc.invalidateQueries()
      return hash
    } catch (err: any) {
      // Handle specific wallet error types
      if (err.message === 'WALLET_NOT_CONNECTED') {
        setError('Please connect your wallet to vote')
      } else if (err.message === 'WRONG_NETWORK') {
        setError('Please switch to Base Sepolia network to vote')
      } else if (err.message === 'NO_ACCOUNT_ADDRESS') {
        setError('Wallet account not available')
      } else {
        setError(err?.message || String(err))
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // hasVoted - blockchain-backed
  const hasVoted = async (electionId: string, positionId: string): Promise<boolean> => {
    setError(null)
    try {
      // Validate wallet state before proceeding
      validateWalletForBlockchainOp()

      let onchainElectionId = getOnchainElectionId(electionId)
      let onchainPositionId = getOnchainPositionId(positionId)

      if (onchainElectionId == null) {
        const parsed = Number.parseInt(electionId)
        if (!Number.isNaN(parsed)) onchainElectionId = BigInt(parsed)
        else throw new Error(`Invalid election id mapping for UI id: ${electionId}`)
      }
      if (onchainPositionId == null) {
        const parsed = Number.parseInt(positionId)
        if (!Number.isNaN(parsed)) onchainPositionId = BigInt(parsed)
        else throw new Error(`Invalid position id mapping for UI id: ${positionId}`)
      }

      const res = await chain.hasVoted(account as `0x${string}`, onchainElectionId, onchainPositionId)
      return Boolean(res)
    } catch (err: any) {
      // Handle specific wallet error types
      if (err.message === 'WALLET_NOT_CONNECTED') {
        setError('Please connect your wallet to check voting status')
      } else if (err.message === 'WRONG_NETWORK') {
        setError('Please switch to Base Sepolia network')
      } else if (err.message === 'NO_ACCOUNT_ADDRESS') {
        setError('Wallet account not available')
      } else {
        setError(err?.message || String(err))
      }
      throw err
    }
  }

  // createElection - blockchain-backed and integrates ID mapping
  const createElection = async (electionData: Partial<UniversityElection>): Promise<string> => {
    setIsLoading(true)
    setError(null)
    try {
      // Validate wallet state before proceeding
      validateWalletForBlockchainOp()

      // Prepare a UI id for mapping
      const uiId = electionData.id || `election_${Date.now()}`

      // Prepare times as bigints: use provided or defaults
      const now = Math.floor(Date.now() / 1000)
      const startTime = typeof electionData.startTime === "bigint" ? (electionData.startTime as any) : BigInt(Math.floor(now + 60))
      const endTime =
        typeof electionData.endTime === "bigint"
          ? (electionData.endTime as any)
          : BigInt(Math.floor(now + (7 * 24 * 60 * 60))) // 1 week default

      // Positions: adapt to the shape expected by on-chain createElection function
      const positionsForChain =
        (electionData.positions || []).map((p: any) => {
          return { title: p.title || p.id || "Position", requirements: p.requirements ?? "" }
        }) ?? []

      const res = await chain.createElection(
        electionData.title || "",
        electionData.description || "",
        startTime,
        endTime,
        positionsForChain,
      )

      const hash = (res as any)?.hash || ""
      const receipt = (res as any)?.receipt

      // Try to parse onchain election id from receipt and add mapping
      const parsedOnchainId = parseOnchainIdFromReceipt(receipt)
      if (parsedOnchainId !== null) {
        try {
          addElectionMapping(uiId, parsedOnchainId)
          // If positions were returned with onchain ids in logs, attempt to map them as well (best-effort)
          // We do not have exact per-position ids reliably here; skip unless parsed differently.
        } catch (err) {
          // ignore mapping errors
        }
      }

      // Invalidate elections list so UI refetches
      qc.invalidateQueries(["elections"])
      return hash
    } catch (err: any) {
      // Handle specific wallet error types
      if (err.message === 'WALLET_NOT_CONNECTED') {
        setError('Please connect your wallet to create an election')
      } else if (err.message === 'WRONG_NETWORK') {
        setError('Please switch to Base Sepolia network to create an election')
      } else if (err.message === 'NO_ACCOUNT_ADDRESS') {
        setError('Wallet account not available')
      } else {
        setError(err?.message || String(err))
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // getElectionResults - fetch election on-chain and compute simple results
  const getElectionResults = async (electionId: string) => {
    setError(null)
    try {
      let onchainElectionId = getOnchainElectionId(electionId)
      if (onchainElectionId == null) {
        const parsed = Number.parseInt(electionId)
        if (!Number.isNaN(parsed)) onchainElectionId = BigInt(parsed)
        else throw new Error(`Invalid election id mapping for UI id: ${electionId}`)
      }

      const onchainElection = await chain.getElection(onchainElectionId)
      // Normalize structure and compute results
      const positionsOnchain = (onchainElection?.positions ?? []) as any[]
      const candidatesOnchain = (onchainElection?.candidates ?? []) as any[]

      const resultsByPosition = (positionsOnchain || []).map((pos: any, idx: number) => {
        // filter candidates for this position by comparing position index or position id if available
        const positionCandidates = (candidatesOnchain || []).filter((c: any) => {
          try {
            // candidate may include position index or id
            if (c.position && (c.position === pos || c.position.id === pos.id || c.positionIndex === idx)) return true
            // fallback to including all if unclear
            return true
          } catch {
            return true
          }
        })

        const computed = positionCandidates.map((candidate: any) => ({
          ...candidate,
          votes: candidate.votes ?? 0,
        }))

        const totalVotes = computed.reduce((sum: number, c: any) => sum + (Number(c.votes) || 0), 0)

        return {
          position: pos,
          candidates: computed.map((candidate: any) => ({
            ...candidate,
            percentage: totalVotes > 0 ? ((Number(candidate.votes) || 0) / totalVotes) * 100 : 0,
          })),
          totalVotes,
          winner: computed.sort((a: any, b: any) => (Number(b.votes) || 0) - (Number(a.votes) || 0))[0] || null,
        }
      })

      return resultsByPosition
    } catch (err: any) {
      setError(err?.message || String(err))
      throw err
    }
  }

  const verifyStudentEligibility = async (matricNumber: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return matricNumber.startsWith("TU") && matricNumber.length >= 10
  }

  const getCampaignInfo = async (candidateId: string) => {
    setError(null)
    try {
      // Try to get candidate from on-chain mappings first
      const onchainCandidateId = getOnchainCandidateId(candidateId)
      // We don't have a direct mapping to election here; fallback to local pendingCandidates or empty
      const localCandidate =
        pendingCandidates.find((c) => c.id === candidateId) ||
        (await Promise.resolve(null))

      if (!localCandidate && onchainCandidateId == null) {
        throw new Error("Candidate not found")
      }

      const candidate = localCandidate || { id: candidateId, platform: "", experience: "", endorsements: [], campaignPromises: [], campaignBudget: 0 }

      return {
        ...candidate,
        campaignEvents: [],
        endorsements: candidate.endorsements || [],
        campaignFinances: {
          raised: candidate.campaignBudget || 0,
          spent: (candidate.campaignBudget || 0) * 0.7,
          remaining: (candidate.campaignBudget || 0) * 0.3,
        },
      }
    } catch (err: any) {
      setError(err?.message || String(err))
      throw err
    }
  }

  // verifyCandidate - admin action via chain; expects candidate UI id
  const verifyCandidate = async (candidateId: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      // Validate wallet state before proceeding
      validateWalletForBlockchainOp()

      const onchainCandidateId = getOnchainCandidateId(candidateId)
      if (onchainCandidateId == null) {
        throw new Error("Candidate mapping not found on-chain")
      }

      // We need an onchain election id - attempt to pick first mapped election as best-effort
      const electionMappings = getAllElectionMappings()
      if (!electionMappings || electionMappings.length === 0) {
        throw new Error("No on-chain election mapping available to verify candidate")
      }
      const onchainElectionId = electionMappings[0].onchainElectionId

      const res = await chain.verifyCandidate(onchainElectionId, onchainCandidateId)
      // Optionally parse for new candidate id mapping or other events
      const receipt = (res as any)?.receipt
      const parsed = parseOnchainIdFromReceipt(receipt)
      if (parsed !== null) {
        try {
          // if a mapping wasn't present, map it
          if (!getOnchainCandidateId(candidateId)) addCandidateMapping(candidateId, parsed)
        } catch {
          // ignore
        }
      }

      // Update local pendingCandidates if present
      setPendingCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, verified: true, student: { ...c.student, verificationStatus: "verified" } } : c)),
      )

      qc.invalidateQueries()
    } catch (err: any) {
      // Handle specific wallet error types
      if (err.message === 'WALLET_NOT_CONNECTED') {
        setError('Please connect your wallet to verify candidates')
      } else if (err.message === 'WRONG_NETWORK') {
        setError('Please switch to Base Sepolia network to verify candidates')
      } else if (err.message === 'NO_ACCOUNT_ADDRESS') {
        setError('Wallet account not available')
      } else {
        setError(err?.message || String(err))
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const rejectCandidate = async (candidateId: string, reason: string): Promise<void> => {
    setIsLoading(true)
    try {
      // simple local update - actual chain rejection would be an admin tx
      setPendingCandidates((prev) =>
        prev.map((candidate) =>
          candidate.id === candidateId ? { ...candidate, student: { ...candidate.student, verificationStatus: "rejected" } } : candidate,
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }

  const getAllCandidates = (): Candidate[] => {
    // Combine local pending candidates with any minimal on-chain candidate metadata we can surface via mappings
    const candidateMappings = getAllCandidateMappings()
    const onchainCandidatesMinimal: Candidate[] = candidateMappings.map((m) => ({
      id: m.uiCandidateId,
      studentId: "",
      student: {
        id: "",
        studentId: "",
        email: "",
        fullName: "",
        program: "",
        academicYear: 1,
        faculty: "",
        department: "",
        enrollmentStatus: "active",
        gpa: 0,
        isEligibleToVote: true,
        isEligibleToRun: true,
        verificationStatus: "verified",
      },
      position: availablePositions[0],
      platform: "",
      experience: "",
      endorsements: [],
      campaignPromises: [],
      votes: 0,
      verified: true,
      campaignBudget: 0,
      socialMedia: {},
    }))

    return [...pendingCandidates, ...onchainCandidatesMinimal]
  }

  // Keep pendingCandidates synced with any external triggers (this is best-effort; real flows should update mappings via events)
  useEffect(() => {
    // when elections change, clear stale pendingCandidates if necessary
    // (this is intentionally simple; real implementations would reconcile via on-chain events)
    if (elections.length > 0 && pendingCandidates.length > 0) {
      // move any pending that are marked verified to active (best-effort)
      const verified = pendingCandidates.filter((c) => c.verified)
      if (verified.length > 0) {
        setPendingCandidates((prev) => prev.filter((c) => !c.verified))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [electionsQuery.data])

  // Real-time updates: rely on chain hook invalidations; ensure our elections query is invalidated when txs change
  useEffect(() => {
    const interval = setInterval(() => {
      qc.invalidateQueries(["elections"])
    }, 1000 * 20) // periodic refresh every 20s
    return () => clearInterval(interval)
  }, [qc])

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
      // Wallet state and actions
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
      // Expose refetch method for components
      refetchElections: electionsQuery.refetch,
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
      // Wallet dependencies
      isConnected,
      account,
      needsNetworkSwitch,
      isOnSupportedNetwork,
      connectWallet,
      switchToSupportedNetwork,
      disconnectWallet,
      walletError,
      electionsQuery.refetch,
    ],
  )

  return <UniversityVotingContext.Provider value={contextValue}>{children}</UniversityVotingContext.Provider>
}

export function useUniversityVoting() {
  const context = useContext(UniversityVotingContext)
  if (context === undefined) {
    throw new Error("useUniversityVoting must be used within a UniversityVotingProvider")
  }
  return context
}