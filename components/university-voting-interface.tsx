"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Vote, Clock, Users, CheckCircle, Trophy, GraduationCap, DollarSign, Calendar } from "lucide-react"
import { useUniversityVoting } from "@/hooks/use-university-voting"
import type { UniversityElection } from "@/types"

export default function UniversityVotingInterface() {
  const { elections, currentStudent, castVote, hasVoted, positions } = useUniversityVoting()

  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({})
  const [isVoting, setIsVoting] = useState(false)
  const [votingPosition, setVotingPosition] = useState<string | null>(null)

  const activeElections = elections.filter((e) => e.status === "active")

  const handleVote = async (electionId: string, positionId: string, candidateId: string) => {
    if (!currentStudent?.isEligibleToVote) {
      alert("You are not eligible to vote")
      return
    }

    setIsVoting(true)
    setVotingPosition(positionId)

    try {
      const txHash = await castVote(electionId, positionId, candidateId)
      alert(`Vote cast successfully! Transaction: ${txHash.slice(0, 10)}...`)

      // Clear selection after successful vote
      setSelectedVotes((prev) => {
        const newVotes = { ...prev }
        delete newVotes[`${electionId}_${positionId}`]
        return newVotes
      })
    } catch (error: any) {
      alert(`Voting failed: ${error.message}`)
    } finally {
      setIsVoting(false)
      setVotingPosition(null)
    }
  }

  const getTimeRemaining = (endTime: string) => {
    const now = new Date()
    const end = new Date(endTime)
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return "Voting ended"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h ${minutes}m remaining`
    if (hours > 0) return `${hours}h ${minutes}m remaining`
    return `${minutes}m remaining`
  }

  const getCandidatesForPosition = (election: UniversityElection, positionId: string) => {
    return election.candidates.filter((c) => c.position.id === positionId)
  }

  const getTurnoutForPosition = (election: UniversityElection, positionId: string) => {
    const candidates = getCandidatesForPosition(election, positionId)
    const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0)
    return {
      votes: totalVotes,
      percentage: election.eligibleVoters.totalCount > 0 ? (totalVotes / election.eligibleVoters.totalCount) * 100 : 0,
    }
  }

  if (activeElections.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Vote className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Elections</h3>
          <p className="text-gray-600">There are currently no student union elections available for voting.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Union Elections</h2>
          <p className="text-gray-600">Cast your vote for student union positions</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {activeElections.length} Active Election{activeElections.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {activeElections.map((election) => (
        <Card key={election.id} className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  {election.title}
                </CardTitle>
                <CardDescription className="mt-1">{election.description}</CardDescription>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {election.academicYear}
                  </span>
                  <span className="capitalize">{election.semester} Semester</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <Clock className="h-4 w-4 mr-1" />
                  {getTimeRemaining(election.endTime)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-1" />
                  {election.totalVotes.toLocaleString()} votes cast
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="space-y-8">
              {positions.map((position) => {
                const candidates = getCandidatesForPosition(election, position.id)
                const turnout = getTurnoutForPosition(election, position.id)
                const voteKey = `${election.id}_${position.id}`
                const hasVotedForPosition = hasVoted(election.id, position.id)

                if (candidates.length === 0) return null

                return (
                  <div key={position.id} className="border rounded-lg p-6 bg-white">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                          {position.title}
                        </h3>
                        <p className="text-gray-600 mt-1">{position.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                          <div>
                            <span className="text-gray-500">Term:</span>
                            <p className="font-medium">{position.term}</p>
                          </div>
                          {position.salary && (
                            <div>
                              <span className="text-gray-500">Annual Salary:</span>
                              <p className="font-medium flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {position.salary.toLocaleString()}
                              </p>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500">Candidates:</span>
                            <p className="font-medium">{candidates.length}</p>
                          </div>
                        </div>

                        {/* Requirements */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements</h4>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>• Minimum GPA: {position.requirements.minGPA}</div>
                            <div>
                              • Academic Year: {position.requirements.minAcademicYear}-
                              {position.requirements.maxAcademicYear}
                            </div>
                            {position.requirements.requiredFaculties && (
                              <div>• Required Faculties: {position.requirements.requiredFaculties.join(", ")}</div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="ml-6 text-right">
                        <div className="text-sm text-gray-600 mb-2">Turnout</div>
                        <div className="text-2xl font-bold text-gray-900">{turnout.votes}</div>
                        <div className="text-sm text-gray-600">{turnout.percentage.toFixed(1)}%</div>
                        <Progress value={turnout.percentage} className="w-24 mt-2" />
                      </div>
                    </div>

                    {hasVotedForPosition ? (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          ✅ You have successfully voted for {position.title}. Your vote is recorded on the blockchain.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Select your candidate:</h4>
                        <RadioGroup
                          value={selectedVotes[voteKey] || ""}
                          onValueChange={(value) => setSelectedVotes((prev) => ({ ...prev, [voteKey]: value }))}
                        >
                          {candidates.map((candidate) => (
                            <div
                              key={candidate.id}
                              className="flex items-start space-x-4 p-4 rounded-lg border-2 hover:bg-gray-50 hover:border-blue-200 transition-colors"
                            >
                              <RadioGroupItem value={candidate.id} id={candidate.id} className="mt-1" />
                              <Label htmlFor={candidate.id} className="flex-1 cursor-pointer">
                                <div className="space-y-3">
                                  {/* Candidate Header */}
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h5 className="font-semibold text-gray-900 flex items-center">
                                        {candidate.student.fullName}
                                        {candidate.verified && <CheckCircle className="h-4 w-4 text-green-600 ml-2" />}
                                      </h5>
                                      <p className="text-sm text-gray-600">
                                        {candidate.student.program} • Year {candidate.student.academicYear} • GPA:{" "}
                                        {candidate.student.gpa}
                                      </p>
                                      <p className="text-xs text-gray-500">{candidate.student.studentId}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-lg font-bold text-gray-900">{candidate.votes}</p>
                                      <p className="text-xs text-gray-500">votes</p>
                                    </div>
                                  </div>

                                  {/* Platform */}
                                  <div>
                                    <h6 className="text-sm font-medium text-gray-900 mb-1">Platform</h6>
                                    <p className="text-sm text-gray-700">{candidate.platform}</p>
                                  </div>

                                  {/* Campaign Promises */}
                                  {candidate.campaignPromises.length > 0 && (
                                    <div>
                                      <h6 className="text-sm font-medium text-gray-900 mb-1">Key Promises</h6>
                                      <ul className="text-sm text-gray-700 space-y-1">
                                        {candidate.campaignPromises.slice(0, 3).map((promise, index) => (
                                          <li key={index} className="flex items-start">
                                            <span className="text-blue-600 mr-2">•</span>
                                            {promise}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Experience & Endorsements */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <h6 className="font-medium text-gray-900 mb-1">Experience</h6>
                                      <p className="text-gray-700">{candidate.experience}</p>
                                    </div>
                                    {candidate.endorsements.length > 0 && (
                                      <div>
                                        <h6 className="font-medium text-gray-900 mb-1">Endorsements</h6>
                                        <div className="flex flex-wrap gap-1">
                                          {candidate.endorsements.slice(0, 2).map((endorsement, index) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                              {endorsement}
                                            </Badge>
                                          ))}
                                          {candidate.endorsements.length > 2 && (
                                            <Badge variant="outline" className="text-xs">
                                              +{candidate.endorsements.length - 2} more
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Social Media */}
                                  {candidate.socialMedia && Object.keys(candidate.socialMedia).length > 0 && (
                                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                                      <span>Follow:</span>
                                      {candidate.socialMedia.instagram && (
                                        <span>📷 {candidate.socialMedia.instagram}</span>
                                      )}
                                      {candidate.socialMedia.twitter && <span>🐦 {candidate.socialMedia.twitter}</span>}
                                    </div>
                                  )}
                                </div>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>

                        {selectedVotes[voteKey] && (
                          <div className="pt-4 border-t">
                            <Button
                              onClick={() => handleVote(election.id, position.id, selectedVotes[voteKey])}
                              disabled={isVoting}
                              className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                              {isVoting && votingPosition === position.id
                                ? "Casting Vote on Blockchain..."
                                : `🗳️ Vote for ${position.title}`}
                            </Button>
                            <p className="text-xs text-gray-500 text-center mt-2">
                              🔒 Your vote will be encrypted and recorded immutably on the blockchain
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
