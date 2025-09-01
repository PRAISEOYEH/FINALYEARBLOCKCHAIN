export interface Student {
  id: string
  studentId: string
  email: string
  fullName: string
  program: string
  academicYear: number
  faculty: string
  department: string
  enrollmentStatus: "active" | "inactive" | "graduated"
  gpa: number
  isEligibleToVote: boolean
  isEligibleToRun: boolean
  verificationStatus: "pending" | "verified" | "rejected"
}

export interface UniversityPosition {
  id: string
  title: string
  description: string
  requirements: {
    minGPA: number
    minAcademicYear: number
    maxAcademicYear: number
  }
  responsibilities: string[]
  term: string
  salary: number
}

export interface Candidate {
  id: string
  name: string
  studentId: string
  student: Student
  position: UniversityPosition
  platform: string
  party?: string
  experience: string
  endorsements: string[]
  campaignPromises: string[]
  votes: number
  verified: boolean
  campaignBudget: number
  walletAddress?: string
  socialMedia: {
    twitter?: string
    instagram?: string
    facebook?: string
  }
  // Blockchain integration properties
  onchainId?: string | bigint
  positionOnchainId?: string | bigint
}

export interface UniversityElection {
  id: string
  title: string
  description: string
  academicYear: string
  semester: "fall" | "spring" | "summer"
  positions: UniversityPosition[]
  candidates: Candidate[]
  startTime: string
  endTime: string
  campaignStartTime: string
  campaignEndTime: string
  status: "upcoming" | "campaign" | "active" | "completed"
  eligibleVoters: {
    totalCount: number
    byFaculty: Record<string, number>
    byYear: Record<number, number>
  }
  totalVotes: number
  turnoutRate: number
  contractAddress: string
  createdBy: string
  electionRules: {
    maxCandidatesPerPosition: number
    campaignSpendingLimit: number
    votingMethod: "single" | "ranked" | "approval"
    requiresDeposit: boolean
    depositAmount: number
  }
  // Blockchain integration properties
  onchainId?: string | bigint
  positionIndex?: number
  voterRequirements?: {
    kycVerified?: boolean
    minGPA?: number
    eligibleFaculties?: string[]
  }
}

export interface Faculty {
  id: string
  name: string
  departments: string[]
  dean: string
  studentCount: number
}

export interface UniversityConfig {
  name: string
  address: string
  website: string
  studentBodySize: number
  faculties: Faculty[]
  academicCalendar: {
    fallStart: string
    fallEnd: string
    springStart: string
    springEnd: string
    summerStart: string
    summerEnd: string
  }
  electionRules: {
    minGPAToVote: number
    minGPAToRun: number
    minAcademicYearToRun: number
    maxTermsPerPosition: number
  }
}
