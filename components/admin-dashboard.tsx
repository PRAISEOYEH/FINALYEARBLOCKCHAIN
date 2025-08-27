"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BarChart3,
  Shield,
  Settings,
  CheckCircle,
  AlertTriangle,
  Clock,
  UserCheck,
  Trophy,
  Calendar,
  GraduationCap,
} from "lucide-react"
import { useUniversityVoting } from "@/hooks/use-university-voting"

export default function AdminDashboard() {
  const {
    user,
    elections,
    pendingCandidates,
    getAllCandidates,
    verifyCandidate,
    rejectCandidate,
    university,
    faculties,
    positions,
  } = useUniversityVoting()

  const [isVerifying, setIsVerifying] = useState<string | null>(null)

  const handleVerifyCandidate = async (candidateId: string) => {
    setIsVerifying(candidateId)
    try {
      await verifyCandidate(candidateId)
    } catch (error) {
      console.error("Failed to verify candidate:", error)
    } finally {
      setIsVerifying(null)
    }
  }

  const handleRejectCandidate = async (candidateId: string) => {
    setIsVerifying(candidateId)
    try {
      await rejectCandidate(candidateId, "Did not meet eligibility requirements")
    } catch (error) {
      console.error("Failed to reject candidate:", error)
    } finally {
      setIsVerifying(null)
    }
  }

  const allCandidates = getAllCandidates()
  const verifiedCandidates = allCandidates.filter((c) => c.verified)
  const rejectedCandidates = allCandidates.filter((c) => c.student.verificationStatus === "rejected")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Shield className="h-4 w-4 mr-1" />
          Administrator
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Elections</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{elections.length}</div>
            <p className="text-xs text-muted-foreground">
              {elections.filter((e) => e.status === "active").length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Candidates</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCandidates.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Candidates</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedCandidates.length}</div>
            <p className="text-xs text-muted-foreground">Ready for elections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Positions</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.length}</div>
            <p className="text-xs text-muted-foreground">Available positions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="candidates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="elections">Elections</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="candidates">
          <div className="space-y-6">
            {/* Pending Candidates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-orange-600" />
                  Pending Candidate Verification
                </CardTitle>
                <CardDescription>Review and verify candidate applications for eligibility</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingCandidates.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Candidates</h3>
                    <p className="text-gray-600">All candidate applications have been processed.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingCandidates.map((candidate) => (
                      <div key={candidate.id} className="border rounded-lg p-4 bg-orange-50 border-orange-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{candidate.student.fullName}</h4>
                              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">
                                  <strong>Position:</strong> {candidate.position.title}
                                </p>
                                <p className="text-gray-600">
                                  <strong>Matric Number:</strong> {candidate.student.studentId}
                                </p>
                                <p className="text-gray-600">
                                  <strong>Department:</strong> {candidate.student.department}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">
                                  <strong>Academic Year:</strong> Year {candidate.student.academicYear}
                                </p>
                                <p className="text-gray-600">
                                  <strong>GPA:</strong> {candidate.student.gpa}
                                </p>
                                <p className="text-gray-600">
                                  <strong>Program:</strong> {candidate.student.program}
                                </p>
                              </div>
                            </div>
                            {candidate.platform && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-900">Platform:</p>
                                <p className="text-sm text-gray-600 mt-1">{candidate.platform}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button
                              size="sm"
                              onClick={() => handleVerifyCandidate(candidate.id)}
                              disabled={isVerifying === candidate.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {isVerifying === candidate.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                  Verifying...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Verify
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectCandidate(candidate.id)}
                              disabled={isVerifying === candidate.id}
                            >
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Verified Candidates */}
            {verifiedCandidates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Verified Candidates
                  </CardTitle>
                  <CardDescription>Candidates approved for participation in elections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {verifiedCandidates.map((candidate) => (
                      <div key={candidate.id} className="border rounded-lg p-4 bg-green-50 border-green-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{candidate.student.fullName}</h4>
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">
                                  <strong>Position:</strong> {candidate.position.title}
                                </p>
                                <p className="text-gray-600">
                                  <strong>Matric Number:</strong> {candidate.student.studentId}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">
                                  <strong>Department:</strong> {candidate.student.department}
                                </p>
                                <p className="text-gray-600">
                                  <strong>Votes:</strong> {candidate.votes}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="elections">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Election Management
              </CardTitle>
              <CardDescription>Overview of all elections in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {elections.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Elections Created</h3>
                  <p className="text-gray-600">Elections will appear here once they are created by administrators.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {elections.map((election) => (
                    <div key={election.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{election.title}</h4>
                            <Badge
                              variant={election.status === "active" ? "default" : "outline"}
                              className={
                                election.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : election.status === "upcoming"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                              }
                            >
                              {election.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{election.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">
                                <strong>Academic Year:</strong> {election.academicYear}
                              </p>
                              <p className="text-gray-600">
                                <strong>Semester:</strong> {election.semester}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">
                                <strong>Positions:</strong> {election.positions.length}
                              </p>
                              <p className="text-gray-600">
                                <strong>Candidates:</strong> {election.candidates.length}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">
                                <strong>Total Votes:</strong> {election.totalVotes}
                              </p>
                              <p className="text-gray-600">
                                <strong>Turnout:</strong> {election.turnoutRate.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                System Analytics
              </CardTitle>
              <CardDescription>Overview of system usage and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              {elections.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Available</h3>
                  <p className="text-gray-600">
                    Analytics will be available once elections are created and voting begins.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {elections.reduce((sum, e) => sum + e.totalVotes, 0)}
                    </p>
                    <p className="text-sm text-gray-600">Total Votes Cast</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {elections.length > 0
                        ? (elections.reduce((sum, e) => sum + e.turnoutRate, 0) / elections.length).toFixed(1)
                        : 0}
                      %
                    </p>
                    <p className="text-sm text-gray-600">Average Turnout</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">{allCandidates.length}</p>
                    <p className="text-sm text-gray-600">Total Candidates</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-600">{elections.length}</p>
                    <p className="text-sm text-gray-600">Elections Created</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                System Settings
              </CardTitle>
              <CardDescription>Configure system-wide settings and parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">University Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <p className="font-medium">{university.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Student Body Size:</span>
                      <p className="font-medium">{university.studentBodySize.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Number of Faculties:</span>
                      <p className="font-medium">{university.faculties.length}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Website:</span>
                      <p className="font-medium">{university.website}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Election Rules</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Min GPA to Vote:</span>
                      <p className="font-medium">{university.electionRules.minGPAToVote}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Min GPA to Run:</span>
                      <p className="font-medium">{university.electionRules.minGPAToRun}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Min Academic Year to Run:</span>
                      <p className="font-medium">Year {university.electionRules.minAcademicYearToRun}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Max Terms per Position:</span>
                      <p className="font-medium">{university.electionRules.maxTermsPerPosition}</p>
                    </div>
                  </div>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>System Status:</strong> All systems operational. Ready to manage elections and candidates.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
