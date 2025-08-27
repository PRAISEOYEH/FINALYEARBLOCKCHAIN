"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Users, CheckCircle } from "lucide-react"
import { useBlockchain } from "@/hooks/use-blockchain"

export default function ElectionResults() {
  const { elections } = useBlockchain()

  const completedElections = elections.filter((e) => e.status === "completed")

  const getWinner = (election: any) => {
    return election.candidates.reduce((prev: any, current: any) => (prev.votes > current.votes ? prev : current))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Election Results</h2>
        <p className="text-gray-600">View transparent, immutable voting results</p>
      </div>

      {completedElections.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Elections</h3>
            <p className="text-gray-600">Results will appear here once elections are completed.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {completedElections.map((election) => {
            const winner = getWinner(election)
            const totalVotes = election.totalVotes

            return (
              <Card key={election.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        {election.title}
                        <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                      </CardTitle>
                      <CardDescription>{election.description}</CardDescription>
                    </div>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Winner Announcement */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <h4 className="font-medium text-green-900">Winner</h4>
                        <p className="text-green-800">
                          <span className="font-semibold">{winner.name}</span> ({winner.party}) - {winner.votes} votes (
                          {((winner.votes / totalVotes) * 100).toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Results */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Detailed Results</h4>
                    <div className="space-y-4">
                      {election.candidates
                        .sort((a: any, b: any) => b.votes - a.votes)
                        .map((candidate: any, index: number) => {
                          const percentage = totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0

                          return (
                            <div key={candidate.id} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                      index === 0
                                        ? "bg-yellow-500"
                                        : index === 1
                                          ? "bg-gray-400"
                                          : index === 2
                                            ? "bg-orange-600"
                                            : "bg-gray-300"
                                    }`}
                                  >
                                    {index + 1}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{candidate.name}</p>
                                    <p className="text-sm text-gray-600">{candidate.party}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-gray-900">{candidate.votes} votes</p>
                                  <p className="text-sm text-gray-600">{percentage.toFixed(1)}%</p>
                                </div>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          )
                        })}
                    </div>
                  </div>

                  {/* Election Statistics */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-4 w-4 text-gray-600 mr-1" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{totalVotes}</p>
                      <p className="text-sm text-gray-600">Total Votes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{election.candidates.length}</p>
                      <p className="text-sm text-gray-600">Candidates</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {totalVotes > 0 ? ((winner.votes / totalVotes) * 100).toFixed(1) : 0}%
                      </p>
                      <p className="text-sm text-gray-600">Winning Margin</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
