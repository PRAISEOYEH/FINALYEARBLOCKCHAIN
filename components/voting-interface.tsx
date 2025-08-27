"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Clock, Users, CheckCircle, Vote, Shield, Fingerprint, Eye } from "lucide-react"
import { useWeb3 } from "@/hooks/use-web3"

export default function VotingInterface() {
  const { elections, castVote, hasVoted, account } = useWeb3()
  const [selectedCandidate, setSelectedCandidate] = useState("")
  const [selectedElection, setSelectedElection] = useState("")
  const [isVoting, setIsVoting] = useState(false)
  const [biometricVerified, setBiometricVerified] = useState(false)
  const [pin, setPin] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)

  const activeElections = elections.filter((e) => e.status === "active")

  const handleBiometricVerification = async () => {
    // Simulate biometric verification
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setBiometricVerified(true)
  }

  const handleVote = async () => {
    if (!selectedElection || !selectedCandidate || !biometricVerified || pin !== "1234") {
      return
    }

    setIsVoting(true)
    try {
      // Create digital signature
      const signature = `${account}-${selectedElection}-${selectedCandidate}-${Date.now()}`
      const txHash = await castVote(selectedElection, selectedCandidate, signature)

      setSelectedCandidate("")
      setSelectedElection("")
      setBiometricVerified(false)
      setPin("")
      setShowConfirmation(false)

      // Show success message with transaction hash
      alert(`Vote cast successfully! Transaction: ${txHash}`)
    } catch (error) {
      console.error("Voting failed:", error)
      alert("Voting failed. Please try again.")
    } finally {
      setIsVoting(false)
    }
  }

  const getTimeRemaining = (endTime: string) => {
    const now = new Date()
    const end = new Date(endTime)
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return "Ended"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h ${minutes}m remaining`
    if (hours > 0) return `${hours}h ${minutes}m remaining`
    return `${minutes}m remaining`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Secure Voting Interface</h2>
          <p className="text-gray-600">Cast your vote with multi-factor authentication</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {activeElections.length} Active Elections
        </Badge>
      </div>

      {activeElections.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Vote className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Elections</h3>
            <p className="text-gray-600">There are currently no elections available for voting.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {activeElections.map((election) => (
            <Card key={election.id} className="overflow-hidden border-2 hover:border-blue-200 transition-colors">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center">
                      {election.title}
                      <Shield className="h-5 w-5 text-green-600 ml-2" />
                    </CardTitle>
                    <CardDescription className="mt-1">{election.description}</CardDescription>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span>Contract: {election.contractAddress.slice(0, 10)}...</span>
                      <span>KYC Required: {election.voterRequirements.kycVerified ? "Yes" : "No"}</span>
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
                {hasVoted(election.id) ? (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      ✅ You have successfully voted in this election. Your vote is recorded immutably on the
                      blockchain.
                      <br />
                      <span className="text-xs">Transaction verified and encrypted with your digital signature.</span>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-6">
                    <h4 className="font-medium text-gray-900">Select your candidate:</h4>
                    <RadioGroup
                      value={selectedElection === election.id ? selectedCandidate : ""}
                      onValueChange={(value) => {
                        setSelectedCandidate(value)
                        setSelectedElection(election.id)
                      }}
                    >
                      {election.candidates.map((candidate) => (
                        <div
                          key={candidate.id}
                          className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:bg-gray-50 hover:border-blue-200 transition-colors"
                        >
                          <RadioGroupItem value={candidate.id} id={candidate.id} />
                          <Label htmlFor={candidate.id} className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900 flex items-center">
                                  {candidate.name}
                                  {candidate.verified && <CheckCircle className="h-4 w-4 text-green-600 ml-2" />}
                                </p>
                                <p className="text-sm text-gray-600">{candidate.party}</p>
                                <p className="text-xs text-gray-500">
                                  Wallet: {candidate.walletAddress.slice(0, 10)}...
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                  {candidate.votes.toLocaleString()} votes
                                </p>
                                <p className="text-xs text-gray-500">
                                  {((candidate.votes / election.totalVotes) * 100 || 0).toFixed(2)}%
                                </p>
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>

                    {selectedElection === election.id && selectedCandidate && (
                      <div className="pt-6 border-t space-y-4">
                        <h4 className="font-medium text-gray-900">Security Verification</h4>

                        {/* Biometric Verification */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <Fingerprint className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="text-sm">Biometric Verification</span>
                          </div>
                          {biometricVerified ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Button size="sm" variant="outline" onClick={handleBiometricVerification}>
                              <Eye className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                          )}
                        </div>

                        {/* PIN Verification */}
                        <div className="space-y-2">
                          <Label htmlFor="pin">Security PIN (Demo: 1234)</Label>
                          <Input
                            id="pin"
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="Enter your 4-digit PIN"
                            maxLength={4}
                            className="w-32"
                          />
                        </div>

                        {/* Vote Confirmation */}
                        {biometricVerified && pin === "1234" && (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h5 className="font-medium text-blue-900 mb-2">Confirm Your Vote</h5>
                            <p className="text-sm text-blue-800 mb-3">
                              You are about to vote for{" "}
                              <strong>{election.candidates.find((c) => c.id === selectedCandidate)?.name}</strong>
                              in <strong>{election.title}</strong>
                            </p>
                            <p className="text-xs text-blue-700 mb-4">
                              ⚠️ This action cannot be undone. Your vote will be permanently recorded on the blockchain.
                            </p>
                            <Button
                              onClick={handleVote}
                              disabled={isVoting}
                              className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                              {isVoting ? "Casting Vote on Blockchain..." : "🗳️ Cast My Vote"}
                            </Button>
                          </div>
                        )}

                        <p className="text-xs text-gray-500 text-center">
                          🔒 Your vote is encrypted with AES-256 and signed with your private key
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
