"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type {
  Student,
  UniversityElection,
  Candidate,
  UniversityPosition,
  Faculty,
  UniversityConfig,
} from "@/types/university"

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
  hasVoted: (electionId: string, positionId: string) => boolean
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
  const [elections, setElections] = useState<UniversityElection[]>([]) // EMPTY - No elections initially
  const [faculties] = useState<Faculty[]>(mockUniversity.faculties)
  const [positions] = useState<UniversityPosition[]>(availablePositions)
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<"student" | "admin" | "faculty" | "election_officer">("student")
  const [votingHistory, setVotingHistory] = useState<Record<string, string[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingCandidates, setPendingCandidates] = useState<Candidate[]>([]) // EMPTY - No candidates initially

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

  const castVote = async (electionId: string, positionId: string, candidateId: string): Promise<string> => {
    if (!currentStudent?.isEligibleToVote) {
      throw new Error("Student not eligible to vote")
    }

    const voteKey = `${electionId}_${positionId}`
    if (votingHistory[voteKey]) {
      throw new Error("Already voted for this position")
    }

    await new Promise((resolve) => setTimeout(resolve, 3000))

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

    setVotingHistory((prev) => ({
      ...prev,
      [voteKey]: [candidateId],
    }))

    return `0x${Math.random().toString(16).substr(2, 64)}`
  }

  const hasVoted = (electionId: string, positionId: string) => {
    const voteKey = `${electionId}_${positionId}`
    return !!votingHistory[voteKey]
  }

  const createElection = async (electionData: Partial<UniversityElection>): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 4000))

    const newElection: UniversityElection = {
      id: `election_${Date.now()}`,
      title: electionData.title || "",
      description: electionData.description || "",
      academicYear: electionData.academicYear || "",
      semester: electionData.semester || "fall",
      positions: electionData.positions || [],
      candidates: [], // Start with no candidates
      startTime: electionData.startTime || "",
      endTime: electionData.endTime || "",
      campaignStartTime: electionData.campaignStartTime || "",
      campaignEndTime: electionData.campaignEndTime || "",
      status: "upcoming",
      eligibleVoters: {
        totalCount: university.studentBodySize,
        byFaculty: faculties.reduce(
          (acc, faculty) => ({
            ...acc,
            [faculty.id]: faculty.studentCount,
          }),
          {} as Record<string, number>,
        ),
        byYear: { 1: 5000, 2: 5000, 3: 5000, 4: 5000 },
      },
      totalVotes: 0,
      turnoutRate: 0,
      contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      createdBy: user?.id || "",
      electionRules: electionData.electionRules || {
        maxCandidatesPerPosition: 5,
        campaignSpendingLimit: 3000,
        votingMethod: "single",
        requiresDeposit: true,
        depositAmount: 100,
      },
    }

    setElections((prev) => [...prev, newElection])
    return newElection.contractAddress
  }

  const getElectionResults = async (electionId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const election = elections.find((e) => e.id === electionId)
    if (!election) throw new Error("Election not found")

    const resultsByPosition = positions.map((position) => {
      const positionCandidates = election.candidates
        .filter((c) => c.position.id === position.id)
        .sort((a, b) => b.votes - a.votes)

      const totalVotes = positionCandidates.reduce((sum, c) => sum + c.votes, 0)

      return {
        position,
        candidates: positionCandidates.map((candidate) => ({
          ...candidate,
          percentage: totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0,
        })),
        totalVotes,
        winner: positionCandidates[0] || null,
      }
    })

    return resultsByPosition
  }

  const verifyStudentEligibility = async (matricNumber: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return matricNumber.startsWith("TU") && matricNumber.length >= 10
  }

  const getCampaignInfo = async (candidateId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const candidate =
      elections.flatMap((e) => e.candidates).find((c) => c.id === candidateId) ||
      pendingCandidates.find((c) => c.id === candidateId)

    if (!candidate) throw new Error("Candidate not found")

    return {
      ...candidate,
      campaignEvents: [],
      endorsements: candidate.endorsements,
      campaignFinances: {
        raised: candidate.campaignBudget || 0,
        spent: (candidate.campaignBudget || 0) * 0.7,
        remaining: (candidate.campaignBudget || 0) * 0.3,
      },
    }
  }

  const verifyCandidate = async (candidateId: string): Promise<void> => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setPendingCandidates((prev) =>
        prev.map((candidate) =>
          candidate.id === candidateId
            ? { ...candidate, verified: true, student: { ...candidate.student, verificationStatus: "verified" } }
            : candidate,
        ),
      )

      // Move to active elections if there are any
      const verifiedCandidate = pendingCandidates.find((c) => c.id === candidateId)
      if (verifiedCandidate && elections.length > 0) {
        setElections((prev) =>
          prev.map((election) => ({
            ...election,
            candidates: [...election.candidates, { ...verifiedCandidate, verified: true }],
          })),
        )

        setPendingCandidates((prev) => prev.filter((c) => c.id !== candidateId))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const rejectCandidate = async (candidateId: string, reason: string): Promise<void> => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setPendingCandidates((prev) =>
        prev.map((candidate) =>
          candidate.id === candidateId
            ? { ...candidate, student: { ...candidate.student, verificationStatus: "rejected" } }
            : candidate,
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }

  const getAllCandidates = (): Candidate[] => {
    const activeCandidates = elections.flatMap((e) => e.candidates)
    return [...pendingCandidates, ...activeCandidates]
  }

  return (
    <UniversityVotingContext.Provider
      value={{
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
      }}
    >
      {children}
    </UniversityVotingContext.Provider>
  )
}

export function useUniversityVoting() {
  const context = useContext(UniversityVotingContext)
  if (context === undefined) {
    throw new Error("useUniversityVoting must be used within a UniversityVotingProvider")
  }
  return context
}
