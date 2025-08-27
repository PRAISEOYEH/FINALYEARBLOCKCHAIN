"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Trophy,
  TrendingUp,
  Users,
  CheckCircle,
  BarChart3,
  Download,
  Calendar,
  GraduationCap,
  Award,
  Target,
} from "lucide-react"
import { useUniversityVoting } from "@/hooks/use-university-voting"
import type { UniversityElection } from "@/types/university"

export default function UniversityElectionResults() {
  const { elections, getElectionResults, university, faculties } = useUniversityVoting()
  const [selectedElection, setSelectedElection] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const completedElections = elections.filter((e) => e.status === "completed")
  const activeElections = elections.filter((e) => e.status === "active")

  useEffect(() => {
    if (completedElections.length > 0 && !selectedElection) {
      setSelectedElection(completedElections[0].id)
    }
  }, [completedElections, selectedElection])

  useEffect(() => {
    if (selectedElection) {
      loadResults(selectedElection)
    }
  }, [selectedElection])

  const loadResults = async (electionId: string) => {
    setIsLoading(true)
    try {
      const electionResults = await getElectionResults(electionId)
      setResults(electionResults)
    } catch (error) {
      console.error("Failed to load results:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getElectionById = (id: string): UniversityElection | undefined => {
    return elections.find((e) => e.id === id)
  }

  const exportResults = () => {
    const election = getElectionById(selectedElection)
    if (!election || !results) return

    const csvContent = [
      ["Position", "Candidate", "Matric Number", "Program", "Votes", "Percentage", "Status"],
      ...results.flatMap((result) =>
        result.candidates.map((candidate: any) => [
          result.position.title,
          candidate.student.fullName,
          candidate.student.studentId,
          candidate.student.program,
          candidate.votes,
          `${candidate.percentage.toFixed(2)}%`,
          candidate === result.winner ? "Winner" : "Candidate",
        ]),
      ),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${election.title.replace(/\s+/g, "_")}_results.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (completedElections.length === 0 && activeElections.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Election Results</h3>
          <p className="text-gray-600">Results will appear here once elections are completed.</p>
        </CardContent>
      </Card>
    )
  }

  const currentElection = getElectionById(selectedElection)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Election Results</h2>
          <p className="text-gray-600">View transparent, immutable voting results</p>
        </div>
        <div className="flex items-center space-x-3">
          {completedElections.length > 1 && (
            <select
              value={selectedElection}
              onChange={(e) => setSelectedElection(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {completedElections.map((election) => (
                <option key={election.id} value={election.id}>
                  {election.title}
                </option>
              ))}
            </select>
          )}
          {results.length > 0 && (
            <Button onClick={exportResults} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          )}
        </div>
      </div>

      {/* Live Results for Active Elections */}
      {activeElections.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <TrendingUp className="h-5 w-5 mr-2" />
              Live Results - {activeElections[0].title}
            </CardTitle>
            <CardDescription className="text-blue-700">
              Real-time voting results (updates every 30 seconds)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">{activeElections[0].totalVotes}</div>
                <div className="text-sm text-blue-700">Total Votes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">{activeElections[0].turnoutRate.toFixed(1)}%</div>
                <div className="text-sm text-blue-700">Turnout Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">
                  {activeElections[0].eligibleVoters.totalCount.toLocaleString()}
                </div>
                <div className="text-sm text-blue-700">Eligible Voters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">
                  {Object.keys(activeElections[0].eligibleVoters.byFaculty).length}
                </div>
                <div className="text-sm text-blue-700">Faculties</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Election Results */}
      {currentElection && (
        <Card>
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl flex items-center text-green-900">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  {currentElection.title}
                  <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                </CardTitle>
                <CardDescription className="text-green-700 mt-1">{currentElection.description}</CardDescription>
                <div className="flex items-center space-x-4 mt-2 text-sm text-green-700">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {currentElection.academicYear}
                  </span>
                  <span className="capitalize">{currentElection.semester} Semester</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    Completed
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading results...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Election Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-5 w-5 text-gray-600 mr-1" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{currentElection.totalVotes.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Votes Cast</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Target className="h-5 w-5 text-gray-600 mr-1" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{currentElection.turnoutRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Voter Turnout</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{results.length}</p>
                    <p className="text-sm text-gray-600">Positions Filled</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {results.reduce((total, result) => total + result.candidates.length, 0)}
                    </p>
                    <p className="text-sm text-gray-600">Total Candidates</p>
                  </div>
                </div>

                {/* Position Results */}
                {results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-6 bg-white">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                          <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                          {result.position.title}
                        </h3>
                        <p className="text-gray-600 mt-1">{result.position.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{result.totalVotes}</p>
                        <p className="text-sm text-gray-600">votes cast</p>
                      </div>
                    </div>

                    {/* Winner Announcement */}
                    {result.winner && (
                      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg border border-yellow-200 mb-6">
                        <div className="flex items-center">
                          <Award className="h-6 w-6 text-yellow-600 mr-3" />
                          <div>
                            <h4 className="font-semibold text-yellow-900">🎉 Winner</h4>
                            <p className="text-yellow-800">
                              <span className="font-semibold">{result.winner.student.fullName}</span> (
                              {result.winner.student.program}, Year {result.winner.student.academicYear}) -{" "}
                              {result.winner.votes} votes ({result.winner.percentage.toFixed(1)}%)
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Detailed Results */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Detailed Results</h4>
                      <div className="space-y-4">
                        {result.candidates
                          .sort((a: any, b: any) => b.votes - a.votes)
                          .map((candidate: any, candidateIndex: number) => (
                            <div key={candidate.id} className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                                      candidateIndex === 0
                                        ? "bg-yellow-500"
                                        : candidateIndex === 1
                                          ? "bg-gray-400"
                                          : candidateIndex === 2
                                            ? "bg-orange-600"
                                            : "bg-gray-300"
                                    }`}
                                  >
                                    {candidateIndex + 1}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">{candidate.student.fullName}</p>
                                    <p className="text-sm text-gray-600">
                                      {candidate.student.program} • Year {candidate.student.academicYear} •{" "}
                                      {candidate.student.faculty}
                                    </p>
                                    <p className="text-xs text-gray-500">{candidate.student.studentId}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xl font-bold text-gray-900">{candidate.votes}</p>
                                  <p className="text-sm text-gray-600">{candidate.percentage.toFixed(1)}%</p>
                                </div>
                              </div>

                              <Progress value={candidate.percentage} className="h-3" />

                              {/* Candidate Platform Summary */}
                              <div className="ml-11 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700 font-medium mb-1">Platform:</p>
                                <p className="text-sm text-gray-600">{candidate.platform}</p>
                                {candidate.endorsements.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-500 mb-1">Endorsed by:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {candidate.endorsements.slice(0, 3).map((endorsement: string, i: number) => (
                                        <Badge key={i} variant="outline" className="text-xs">
                                          {endorsement}
                                        </Badge>
                                      ))}
                                      {candidate.endorsements.length > 3 && (
                                        <Badge variant="outline" className="text-xs">
                                          +{candidate.endorsements.length - 3} more
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Turnout by Faculty */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Turnout by Faculty
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(currentElection.eligibleVoters.byFaculty).map(([facultyId, eligibleCount]) => {
                        const faculty = faculties.find((f) => f.id === facultyId)
                        const actualVotes = Math.floor((eligibleCount as number) * (currentElection.turnoutRate / 100))
                        const turnoutRate = (actualVotes / (eligibleCount as number)) * 100

                        return (
                          <div key={facultyId} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">{faculty?.name || facultyId}</span>
                              <span className="text-sm text-gray-600">
                                {actualVotes} / {eligibleCount} ({turnoutRate.toFixed(1)}%)
                              </span>
                            </div>
                            <Progress value={turnoutRate} className="h-2" />
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
