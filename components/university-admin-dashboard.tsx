"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Users,
  BarChart3,
  Shield,
  Settings,
  CheckCircle,
  GraduationCap,
  Calendar,
  DollarSign,
  FileText,
  UserCheck,
  Clock,
  XCircle,
} from "lucide-react"
import { useUniversityVoting } from "@/hooks/use-university-voting"

export default function UniversityAdminDashboard() {
  const {
    elections,
    positions,
    faculties,
    university,
    currentStudent,
    createElection,
    userRole,
    pendingCandidates,
    verifyCandidate,
    rejectCandidate,
    getAllCandidates,
  } = useUniversityVoting()

  const [newElection, setNewElection] = useState({
    title: "",
    description: "",
    academicYear: "2024-2025",
    semester: "fall" as "fall" | "spring" | "summer",
    startTime: "",
    endTime: "",
    campaignStartTime: "",
    campaignEndTime: "",
    positions: [] as string[],
    electionRules: {
      maxCandidatesPerPosition: 5,
      campaignSpendingLimit: 3000,
      votingMethod: "single" as "single" | "ranked" | "approval",
      requiresDeposit: true,
      depositAmount: 100,
    },
  })
  const [isCreating, setIsCreating] = useState(false)
  const [contractAddress, setContractAddress] = useState("")

  const handleCreateElection = async () => {
    setIsCreating(true)
    try {
      const selectedPositions = positions.filter((p) => newElection.positions.includes(p.id))
      const electionData = {
        ...newElection,
        positions: selectedPositions,
      }

      const address = await createElection(electionData as any)
      setContractAddress(address)

      // Reset form
      setNewElection({
        title: "",
        description: "",
        academicYear: "2024-2025",
        semester: "fall",
        startTime: "",
        endTime: "",
        campaignStartTime: "",
        campaignEndTime: "",
        positions: [],
        electionRules: {
          maxCandidatesPerPosition: 5,
          campaignSpendingLimit: 3000,
          votingMethod: "single",
          requiresDeposit: true,
          depositAmount: 100,
        },
      })
    } catch (error) {
      console.error("Failed to create election:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const togglePosition = (positionId: string) => {
    setNewElection((prev) => ({
      ...prev,
      positions: prev.positions.includes(positionId)
        ? prev.positions.filter((id) => id !== positionId)
        : [...prev.positions, positionId],
    }))
  }

  const updateElectionRules = (field: string, value: any) => {
    setNewElection((prev) => ({
      ...prev,
      electionRules: { ...prev.electionRules, [field]: value },
    }))
  }

  const handleVerifyCandidate = async (candidateId: string) => {
    try {
      await verifyCandidate(candidateId)
    } catch (error) {
      console.error("Failed to verify candidate:", error)
    }
  }

  const handleRejectCandidate = async (candidateId: string) => {
    try {
      await rejectCandidate(candidateId, "Did not meet requirements")
    } catch (error) {
      console.error("Failed to reject candidate:", error)
    }
  }

  // Check if user has admin privileges
  if (userRole !== "admin" && userRole !== "election_officer") {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">You need administrator privileges to access this dashboard.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">University Election Administration</h2>
          <p className="text-gray-600">Manage student union elections and candidates</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Election
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Student Union Election</DialogTitle>
              <DialogDescription>
                Set up a new election for student union positions with blockchain security.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Election Title *</Label>
                  <Input
                    id="title"
                    value={newElection.title}
                    onChange={(e) => setNewElection((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Student Union Elections Fall 2024"
                  />
                </div>
                <div>
                  <Label htmlFor="academicYear">Academic Year *</Label>
                  <Select
                    value={newElection.academicYear}
                    onValueChange={(value) => setNewElection((prev) => ({ ...prev, academicYear: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-2025">2024-2025</SelectItem>
                      <SelectItem value="2025-2026">2025-2026</SelectItem>
                      <SelectItem value="2026-2027">2026-2027</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="semester">Semester *</Label>
                  <Select
                    value={newElection.semester}
                    onValueChange={(value: "fall" | "spring" | "summer") =>
                      setNewElection((prev) => ({ ...prev, semester: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fall">Fall</SelectItem>
                      <SelectItem value="spring">Spring</SelectItem>
                      <SelectItem value="summer">Summer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newElection.description}
                    onChange={(e) => setNewElection((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Annual student union elections for leadership positions..."
                    className="h-20"
                  />
                </div>
              </div>

              {/* Campaign Period */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Campaign Period</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="campaignStart">Campaign Start *</Label>
                    <Input
                      id="campaignStart"
                      type="datetime-local"
                      value={newElection.campaignStartTime}
                      onChange={(e) => setNewElection((prev) => ({ ...prev, campaignStartTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="campaignEnd">Campaign End *</Label>
                    <Input
                      id="campaignEnd"
                      type="datetime-local"
                      value={newElection.campaignEndTime}
                      onChange={(e) => setNewElection((prev) => ({ ...prev, campaignEndTime: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Voting Period */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Voting Period</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="votingStart">Voting Start *</Label>
                    <Input
                      id="votingStart"
                      type="datetime-local"
                      value={newElection.startTime}
                      onChange={(e) => setNewElection((prev) => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="votingEnd">Voting End *</Label>
                    <Input
                      id="votingEnd"
                      type="datetime-local"
                      value={newElection.endTime}
                      onChange={(e) => setNewElection((prev) => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Position Selection */}
              <div>
                <Label className="text-base font-semibold">Positions Available for Election</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {positions.map((position) => (
                    <div
                      key={position.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        newElection.positions.includes(position.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => togglePosition(position.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{position.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{position.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Min GPA: {position.requirements.minGPA}</span>
                            <span>
                              Year: {position.requirements.minAcademicYear}-{position.requirements.maxAcademicYear}
                            </span>
                            {position.salary && (
                              <span className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {position.salary.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            newElection.positions.includes(position.id)
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {newElection.positions.includes(position.id) && (
                            <CheckCircle className="h-3 w-3 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Election Rules */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Election Rules</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="maxCandidates">Max Candidates per Position</Label>
                    <Input
                      id="maxCandidates"
                      type="number"
                      value={newElection.electionRules.maxCandidatesPerPosition}
                      onChange={(e) => updateElectionRules("maxCandidatesPerPosition", Number(e.target.value))}
                      min="1"
                      max="10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="spendingLimit">Campaign Spending Limit ($)</Label>
                    <Input
                      id="spendingLimit"
                      type="number"
                      value={newElection.electionRules.campaignSpendingLimit}
                      onChange={(e) => updateElectionRules("campaignSpendingLimit", Number(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="votingMethod">Voting Method</Label>
                    <Select
                      value={newElection.electionRules.votingMethod}
                      onValueChange={(value) => updateElectionRules("votingMethod", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Choice</SelectItem>
                        <SelectItem value="ranked">Ranked Choice</SelectItem>
                        <SelectItem value="approval">Approval Voting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="depositAmount">Candidacy Deposit ($)</Label>
                    <Input
                      id="depositAmount"
                      type="number"
                      value={newElection.electionRules.depositAmount}
                      onChange={(e) => updateElectionRules("depositAmount", Number(e.target.value))}
                      min="0"
                      disabled={!newElection.electionRules.requiresDeposit}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requiresDeposit">Require Candidacy Deposit</Label>
                      <Switch
                        id="requiresDeposit"
                        checked={newElection.electionRules.requiresDeposit}
                        onCheckedChange={(checked) => updateElectionRules("requiresDeposit", checked)}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Refundable deposit to ensure serious candidacies</p>
                  </div>
                </div>
              </div>

              {/* University Information */}
              <Alert className="bg-blue-50 border-blue-200">
                <GraduationCap className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>University Context:</strong> This election will be conducted for {university.name} with{" "}
                  {university.studentBodySize.toLocaleString()} eligible students across {university.faculties.length}{" "}
                  faculties.
                </AlertDescription>
              </Alert>

              {contractAddress && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Election Created Successfully!</strong>
                    <br />
                    Smart Contract Address: {contractAddress}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleCreateElection}
                disabled={
                  isCreating ||
                  !newElection.title ||
                  !newElection.startTime ||
                  !newElection.endTime ||
                  newElection.positions.length === 0
                }
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isCreating ? "Creating Election..." : "🗳️ Create Student Union Election"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="elections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="elections">Elections</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="elections">
          <div className="grid gap-4">
            {elections.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Elections Created</h3>
                  <p className="text-gray-600 mb-4">Get started by creating your first student union election.</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Election
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              elections.map((election) => (
                <Card key={election.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <Calendar className="h-5 w-5 mr-2" />
                          {election.title}
                        </CardTitle>
                        <CardDescription>{election.description}</CardDescription>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span>{election.academicYear}</span>
                          <span className="capitalize">{election.semester} Semester</span>
                          <span>Contract: {election.contractAddress.slice(0, 10)}...</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge
                          variant={
                            election.status === "active"
                              ? "default"
                              : election.status === "completed"
                                ? "secondary"
                                : election.status === "campaign"
                                  ? "outline"
                                  : "outline"
                          }
                          className={
                            election.status === "active"
                              ? "bg-green-100 text-green-800"
                              : election.status === "campaign"
                                ? "bg-blue-100 text-blue-800"
                                : ""
                          }
                        >
                          {election.status}
                        </Badge>
                        {election.status === "active" && (
                          <div className="flex items-center text-xs text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                            Live Voting
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">Total Votes</p>
                        <p className="text-gray-600">{election.totalVotes.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Turnout Rate</p>
                        <p className="text-gray-600">{election.turnoutRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Positions</p>
                        <p className="text-gray-600">{election.positions.length}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Candidates</p>
                        <p className="text-gray-600">{election.candidates.length}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Eligible Voters</p>
                        <p className="text-gray-600">{election.eligibleVoters.totalCount.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="candidates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="h-5 w-5 mr-2" />
                Candidate Management
              </CardTitle>
              <CardDescription>Review and verify candidate applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingCandidates.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Candidates</h3>
                    <p className="text-gray-600">
                      Candidate applications will appear here for review and verification.
                    </p>
                  </div>
                ) : (
                  pendingCandidates.map((candidate) => (
                    <div key={candidate.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{candidate.student.fullName}</h4>
                          <p className="text-sm text-gray-600">Running for: {candidate.position.title}</p>
                          <p className="text-sm text-gray-600">
                            {candidate.student.program} • Year {candidate.student.academicYear} • GPA:{" "}
                            {candidate.student.gpa}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{candidate.platform}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              candidate.student.verificationStatus === "verified"
                                ? "default"
                                : candidate.student.verificationStatus === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className={
                              candidate.student.verificationStatus === "verified"
                                ? "bg-green-100 text-green-800"
                                : candidate.student.verificationStatus === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {candidate.student.verificationStatus === "verified" && (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            )}
                            {candidate.student.verificationStatus === "rejected" && (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {candidate.student.verificationStatus === "pending" && <Clock className="h-3 w-3 mr-1" />}
                            {candidate.student.verificationStatus || "Pending"}
                          </Badge>
                          {candidate.student.verificationStatus === "pending" && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleVerifyCandidate(candidate.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectCandidate(candidate.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Student Body Overview
              </CardTitle>
              <CardDescription>University student demographics and eligibility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <GraduationCap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{university.studentBodySize.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Students</p>
                </div>

                {faculties.map((faculty) => (
                  <div key={faculty.id} className="text-center p-4 bg-gray-50 rounded-lg">
                    <FileText className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{faculty.studentCount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{faculty.name}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-4">Eligibility Requirements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Voting Requirements:</span>
                    <ul className="mt-1 space-y-1 text-gray-600">
                      <li>• Minimum GPA: {university.electionRules.minGPAToVote}</li>
                      <li>• Active enrollment status</li>
                      <li>• Valid student ID</li>
                    </ul>
                  </div>
                  <div>
                    <span className="font-medium">Candidacy Requirements:</span>
                    <ul className="mt-1 space-y-1 text-gray-600">
                      <li>• Minimum GPA: {university.electionRules.minGPAToRun}</li>
                      <li>• Minimum academic year: {university.electionRules.minAcademicYearToRun}</li>
                      <li>• Good academic standing</li>
                      <li>• No disciplinary actions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Election Analytics
              </CardTitle>
              <CardDescription>Comprehensive election statistics and insights</CardDescription>
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
                      {elections.reduce((sum, e) => sum + e.totalVotes, 0).toLocaleString()}
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
                    <p className="text-3xl font-bold text-purple-600">
                      {elections.reduce((sum, e) => sum + e.candidates.length, 0)}
                    </p>
                    <p className="text-sm text-gray-600">Total Candidates</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-600">{elections.length}</p>
                    <p className="text-sm text-gray-600">Elections Held</p>
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
                University Settings
              </CardTitle>
              <CardDescription>Configure university-specific election parameters</CardDescription>
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
                  <h4 className="font-medium text-gray-900 mb-3">Academic Calendar</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Fall Semester:</span>
                      <p className="font-medium">
                        {new Date(university.academicCalendar.fallStart).toLocaleDateString()} -{" "}
                        {new Date(university.academicCalendar.fallEnd).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Spring Semester:</span>
                      <p className="font-medium">
                        {new Date(university.academicCalendar.springStart).toLocaleDateString()} -{" "}
                        {new Date(university.academicCalendar.springEnd).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Summer Semester:</span>
                      <p className="font-medium">
                        {new Date(university.academicCalendar.summerStart).toLocaleDateString()} -{" "}
                        {new Date(university.academicCalendar.summerEnd).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Default Election Rules</h4>
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
