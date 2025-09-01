"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Clock, Users, CheckCircle, Vote, Shield, Fingerprint, Eye, AlertTriangle } from "lucide-react"
import { useBlockchainVoting } from "@/hooks/use-blockchain-voting"
import {
  getOnchainElectionId,
  getOnchainPositionId,
  getOnchainCandidateId,
} from "@/lib/contracts/id-map"
import { useUniversityVoting } from "@/hooks/use-university-voting"

/**
 * VotingInterface
 *
 * - Uses the UniversityVoting context as the canonical source for UI elections (replaces /api/elections).
 * - Keeps using the blockchain voting service for low-level transaction submission, while leveraging
 *   the ID mapping helpers for robust onchain id resolution.
 * - Adds improved error handling, transaction tracking with explorer links, mapping fallbacks,
 *   wallet validation, and nicer UX for voting flow.
 */

const EXPLORER_BASE_URL_BY_CHAIN: Record<number, string> = {
  // Base Sepolia (chain id 84532) - explorer domain may vary; adjust if you host a different explorer
  84532: "https://sepolia.basescan.org/tx/",
}

function getExplorerTxUrl(chainId: number, hash?: string | null): string | null {
  if (!hash) return null
  const base = EXPLORER_BASE_URL_BY_CHAIN[chainId]
  if (!base) return null
  return `${base}${hash}`
}

function friendlyBlockchainError(err: any) {
  const msg = String(err?.message ?? err ?? "Unknown error")
  const low = msg.toLowerCase()
  if (low.includes("insufficient") && low.includes("fund")) return "Insufficient funds to cover gas fees."
  if (low.includes("gas") && low.includes("limit")) return "Gas estimation failed or gas limit too low."
  if (low.includes("network") || low.includes("chain")) return "Network mismatch. Please ensure your wallet is connected to Base Sepolia."
  if (low.includes("user rejected") || low.includes("signature")) return "Transaction was rejected by your wallet."
  if (low.includes("nonce")) return "Transaction nonce error. Try again after a short while."
  // generic fallback
  return msg
}

export default function VotingInterface() {
  // Low-level blockchain hook (reads, writes, tx state)
  const voting = useBlockchainVoting()

  // University voting context - canonical UI elections and helpers
  const uni = useUniversityVoting()
  const elections = uni?.elections ?? []
  const loadingElections = uni?.isLoading ?? false
  const fetchError = uni?.error ?? null

  // Get wallet state from university voting context
  const { walletState, walletActions, walletError } = uni
  const { isConnected, account, needsNetworkSwitch, isOnSupportedNetwork } = walletState

  // Local UI state
  const [selectedCandidate, setSelectedCandidate] = useState("")
  const [selectedElection, setSelectedElection] = useState("")
  const [isVoting, setIsVoting] = useState(false)
  const [biometricVerified, setBiometricVerified] = useState(false)
  const [pin, setPin] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [txFeedback, setTxFeedback] = useState<{ status: string; hash?: string; error?: string; explorer?: string | null } | null>(null)

  // Track per-election whether the current account has voted (cache)
  const [votedMap, setVotedMap] = useState<Record<string, boolean>>({})

  // Re-check voted status when account or elections change
  useEffect(() => {
    if (!account) {
      setVotedMap({})
      return
    }

    let mounted = true

    const checkAll = async () => {
      const newMap: Record<string, boolean> = {}
      for (const el of elections) {
        try {
          // Resolve onchain election id with robust fallbacks
          let onchainElectionId = getOnchainElectionId(el.id)
          if (!onchainElectionId) {
            // try if UI election id is numeric string
            const parsed = Number.parseInt(el.id)
            if (!Number.isNaN(parsed)) onchainElectionId = BigInt(parsed)
          }
          if (!onchainElectionId) {
            // try to see if election object contains an onchain id field
            if (typeof el.onchainId === "bigint") onchainElectionId = el.onchainId
            else if (typeof el.onchainId === "string" && /^\d+$/.test(el.onchainId)) onchainElectionId = BigInt(el.onchainId)
          }
          if (!onchainElectionId) {
            // cannot query without mapping
            newMap[el.id] = false
            continue
          }

          // Try to determine reasonable position id for the check
          let onchainPositionId: bigint | null = null
          // First try election-level mapping
          onchainPositionId = getOnchainPositionId(el.id)
          if (!onchainPositionId) {
            // try candidate-level mapping from first candidate
            const firstCandidateUiId = el.candidates?.[0]?.id
            if (firstCandidateUiId) onchainPositionId = getOnchainPositionId(firstCandidateUiId)
          }
          if (!onchainPositionId) {
            // try position property on election if present
            if (typeof el.positionIndex === "number") onchainPositionId = BigInt(el.positionIndex)
          }
          if (!onchainPositionId) onchainPositionId = BigInt(0) // fallback

          // Query chain (use low-level voting hook; it is expected to be ready)
          try {
            const res = await voting.hasVoted(account as `0x${string}`, onchainElectionId, onchainPositionId)
            newMap[el.id] = Boolean(res)
          } catch (err) {
            console.warn("hasVoted query failed for", el.id, err)
            newMap[el.id] = false
          }
        } catch (err) {
          console.warn("Error while determining voted status for election", el?.id, err)
          newMap[el.id] = false
        }
      }

      if (mounted) setVotedMap((prev) => ({ ...prev, ...newMap }))
    }

    void checkAll()

    return () => {
      mounted = false
    }
  }, [account, elections, voting])

  const activeElections = elections.filter((e) => e.status === "active")

  const handleBiometricVerification = async () => {
    // Simulate biometric verification delay and animation
    await new Promise((resolve) => setTimeout(resolve, 900))
    setBiometricVerified(true)
  }

  const openConfirmation = () => setShowConfirmation(true)

  const resetForm = () => {
    setSelectedCandidate("")
    setSelectedElection("")
    setBiometricVerified(false)
    setPin("")
    setShowConfirmation(false)
  }

  // Robust on-chain ID resolution used right before submitting a tx
  const resolveOnchainIds = (electionUiId: string, candidateUiId: string) => {
    // Attempt multiple fallback strategies for each id
    // Election
    let onchainElectionId = getOnchainElectionId(electionUiId)
    if (!onchainElectionId) {
      // UI election might embed onchain id
      const election = elections.find((e: any) => e.id === electionUiId)
      if (election?.onchainId) {
        try {
          onchainElectionId = typeof election.onchainId === "bigint" ? election.onchainId : BigInt(String(election.onchainId))
        } catch {}
      }
    }
    if (!onchainElectionId) {
      const parsed = Number.parseInt(electionUiId)
      if (!Number.isNaN(parsed)) onchainElectionId = BigInt(parsed)
    }

    // Candidate
    let onchainCandidateId = getOnchainCandidateId(candidateUiId)
    if (!onchainCandidateId) {
      const candidate = elections.flatMap((e: any) => e.candidates ?? []).find((c: any) => c.id === candidateUiId)
      if (candidate?.onchainId) {
        try {
          onchainCandidateId = typeof candidate.onchainId === "bigint" ? candidate.onchainId : BigInt(String(candidate.onchainId))
        } catch {}
      }
    }
    if (!onchainCandidateId) {
      const parsed = Number.parseInt(candidateUiId)
      if (!Number.isNaN(parsed)) onchainCandidateId = BigInt(parsed)
    }

    // Position: try to infer from candidate first, then from election
    let onchainPositionId = getOnchainPositionId(candidateUiId) ?? getOnchainPositionId(electionUiId) ?? null
    if (!onchainPositionId) {
      // try candidate object
      const candidate = elections.flatMap((e: any) => e.candidates ?? []).find((c: any) => c.id === candidateUiId)
      if (candidate?.positionOnchainId) {
        try {
          onchainPositionId = typeof candidate.positionOnchainId === "bigint" ? candidate.positionOnchainId : BigInt(String(candidate.positionOnchainId))
        } catch {}
      }
    }
    if (!onchainPositionId) {
      // fallback to position index if available on election and candidate pairing
      const election = elections.find((e: any) => e.id === electionUiId)
      if (election) {
        // try to find index of candidate in election.candidates
        const idx = (election.candidates || []).findIndex((c: any) => c.id === candidateUiId)
        if (idx >= 0) onchainPositionId = BigInt(idx)
      }
    }
    if (!onchainPositionId) onchainPositionId = BigInt(0) // last resort fallback

    return { onchainElectionId, onchainPositionId, onchainCandidateId }
  }

  const handleVote = async () => {
    // Basic validations and helpful messages
    if (!selectedElection || !selectedCandidate) {
      alert("Please select an election and a candidate before voting.")
      return
    }
    if (!biometricVerified) {
      alert("Please complete biometric verification to proceed.")
      return
    }
    if (pin !== "1234") {
      alert("Invalid PIN. (Demo PIN is 1234)")
      return
    }
    if (!isConnected || !account) {
      alert("Wallet not connected. Please connect your wallet to cast a vote.")
      return
    }
    if (!isOnSupportedNetwork) {
      alert("Please switch to Base Sepolia network to cast a vote.")
      return
    }
    if (!voting.isReady) {
      alert("Blockchain client is not ready. Ensure your wallet is connected to the Base Sepolia network.")
      return
    }
    // Prevent double-vote if our votedMap shows the user already voted
    if (votedMap[selectedElection]) {
      alert("Our records indicate you have already voted in this election.")
      return
    }

    // Resolve on-chain ids
    const { onchainElectionId, onchainPositionId, onchainCandidateId } = resolveOnchainIds(selectedElection, selectedCandidate)

    if (!onchainElectionId || !onchainCandidateId) {
      const missing = !onchainElectionId ? "election" : !onchainCandidateId ? "candidate" : "ids"
      alert(`Missing on-chain ${missing} ID mapping. Contact an administrator to register ID mappings for this UI entity.`)
      return
    }

    setIsVoting(true)
    setTxFeedback({ status: "pending" })

    try {
      // Submit transaction via low-level voting service which handles gas estimation and wallet prompts
      const result = await voting.castVote(onchainElectionId, onchainPositionId, onchainCandidateId)
      // The blockchain hook returns { hash, receipt } format
      const hash = result?.hash ?? undefined
      const receipt = result?.receipt ?? undefined

      const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 0)
      const explorer = hash ? getExplorerTxUrl(chainId, hash) ?? undefined : undefined

      if (hash && !receipt) {
        // pending on chain (wallet broadcasted tx)
        setTxFeedback({ status: "pending", hash, explorer })
        // optimistic poll for receipt - lightweight
        const pollReceipt = async () => {
          try {
            // if voting hook exposes a waitForReceipt use it; otherwise basic polling via provided result.wait?.()
            if (typeof (result as any)?.wait === "function") {
              const r = await (result as any).wait()
              return r
            }
            // fallback: try to use voting.waitForTx if available
            if (typeof (voting as any).waitForTransaction === "function") {
              const r = await (voting as any).waitForTransaction(hash)
              return r
            }
            // otherwise no reliable way to wait; return undefined
            return undefined
          } catch {
            return undefined
          }
        }
        const maybeReceipt = await pollReceipt()
        if (maybeReceipt) {
          setTxFeedback({ status: "confirmed", hash, explorer })
        } else {
          // keep pending but notify user
          setTxFeedback({ status: "pending", hash, explorer })
        }
      } else if (receipt) {
        // immediate confirmation
        setTxFeedback({ status: "confirmed", hash, explorer })
      } else {
        // unknown: consider success if no error thrown
        setTxFeedback({ status: "confirmed", hash, explorer })
      }

      // Invalidate and refresh election data via university context (it should be backed by react-query)
      try {
        // If uni context exposes a query invalidation mechanism, call it; otherwise rely on its internal refreshing interval
        if (typeof (uni as any).refetch === "function") {
          await (uni as any).refetch()
        }
      } catch {
        // ignore refetch errors
      }

      // update local votedMap optimistically
      setVotedMap((prev) => ({ ...prev, [selectedElection]: true }))

      // UX: success toast or animation
      if (hash) {
        alert(`Vote submitted. Transaction hash: ${hash}. You can view it on the explorer.`)
      } else {
        alert("Vote submitted successfully.")
      }

      // Reset sensitive UI state
      resetForm()
    } catch (err: any) {
      console.error("Voting failed:", err)
      const friendly = friendlyBlockchainError(err)
      setTxFeedback({ status: "failed", error: friendly })
      // Offer retry courtesy prompt
      const wantRetry = confirm(`Voting failed: ${friendly}\n\nWould you like to try again?`)
      if (!wantRetry) {
        // clear sensitive fields if user doesn't want to retry
        setPin("")
        setBiometricVerified(false)
        setShowConfirmation(false)
      }
    } finally {
      setIsVoting(false)
      setShowConfirmation(false)
    }
  }

  const getTimeRemaining = (endTime: string) => {
    try {
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
    } catch {
      return "Unknown"
    }
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

      {/* Wallet Connection Status */}
      {!isConnected && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Wallet not connected. Please connect your wallet to vote.
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={() => walletActions.connectWallet('metamask')}
            >
              Connect Wallet
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {needsNetworkSwitch && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Please switch to Base Sepolia network to vote.
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={() => walletActions.switchToSupportedNetwork()}
            >
              Switch Network
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {walletError && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">Wallet error: {walletError}</AlertDescription>
        </Alert>
      )}

      {loadingElections ? (
        <Card>
          <CardContent className="text-center py-12">
            <Vote className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Elections</h3>
            <p className="text-gray-600">Fetching available elections... please wait.</p>
          </CardContent>
        </Card>
      ) : fetchError ? (
        <Card>
          <CardContent className="text-center py-12">
            <Vote className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load elections</h3>
            <p className="text-gray-600">{fetchError}</p>
            <div className="mt-4">
              <Button
                onClick={() => {
                  // try to trigger uni-level refetch if available, otherwise reload page
                  if (typeof (uni as any).refetch === "function") (uni as any).refetch()
                  else window.location.reload()
                }}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : activeElections.length === 0 ? (
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
                      <span>
                        Contract:{" "}
                        {election.contractAddress ? String(election.contractAddress).slice(0, 10) + "..." : "Not provided"}
                      </span>
                      <span>KYC Required: {election.voterRequirements?.kycVerified ? "Yes" : "No"}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Clock className="h-4 w-4 mr-1" />
                      {getTimeRemaining(election.endTime)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      {Number(election.totalVotes || 0).toLocaleString()} votes cast
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {votedMap[election.id] ? (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      ✅ You have successfully voted in this election. Your vote is recorded immutably on the blockchain.
                      <br />
                      <span className="text-xs">Transaction verified and encrypted with your digital signature.</span>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-6">
                    <h4 className="font-medium text-gray-900">Select your candidate:</h4>
                    <RadioGroup
                      value={selectedElection === election.id ? selectedCandidate : ""}
                      onValueChange={(value: string) => {
                        setSelectedCandidate(value)
                        setSelectedElection(election.id)
                        setTxFeedback(null)
                      }}
                    >
                      {Array.isArray(election.candidates) && election.candidates.length > 0 ? (
                        election.candidates.map((candidate: any) => (
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
                                    Wallet: {candidate.walletAddress?.slice?.(0, 10) ?? "N/A"}...
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-900">
                                    {Number(candidate.votes || 0).toLocaleString()} votes
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {Number(((candidate.votes || 0) / (election.totalVotes || 1)) * 100 || 0).toFixed(2)}%
                                  </p>
                                </div>
                              </div>
                            </Label>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">No candidates listed for this election.</div>
                      )}
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
                              <strong>{election.candidates.find((c: any) => c.id === selectedCandidate)?.name}</strong>
                              in <strong>{election.title}</strong>
                            </p>
                            <p className="text-xs text-blue-700 mb-4">
                              ⚠️ This action cannot be undone. Your vote will be permanently recorded on the blockchain.
                            </p>

                            {/* Show wallet & readiness */}
                            <div className="mb-3 text-xs text-gray-600">
                              <div>Wallet: {account ?? "Not connected"}</div>
                              <div>
                                Blockchain ready: {voting.isReady ? "Yes" : "No"}{" "}
                                {!voting.isReady && account ? "(Ensure wallet is connected & on the correct network)" : null}
                              </div>
                              <div>
                                Already voted (local): {votedMap[election.id] ? "Yes" : "No"}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Button
                                onClick={openConfirmation}
                                disabled={isVoting || !voting.isReady || !account || votedMap[election.id]}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                              >
                                {isVoting ? "Casting Vote on Blockchain..." : "🗳️ Cast My Vote"}
                              </Button>

                              {/* Confirmation mini-dialog */}
                              {showConfirmation && (
                                <div className="mt-2 p-3 bg-white border rounded-md">
                                  <p className="text-sm mb-2">Confirm sending transaction to the blockchain.</p>
                                  <p className="text-xs text-gray-600 mb-2">
                                    Estimated gas and final confirmation will be shown by your wallet at submission time.
                                  </p>
                                  <div className="flex space-x-2">
                                    <Button
                                      onClick={() => {
                                        void handleVote()
                                      }}
                                      disabled={isVoting}
                                    >
                                      Confirm & Send
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setShowConfirmation(false)
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Transaction feedback */}
                            {txFeedback && (
                              <div className="mt-3 text-xs">
                                {txFeedback.status === "pending" && (
                                  <div className="flex items-center space-x-2">
                                    <div className="animate-pulse text-yellow-600">⏳ Transaction pending...</div>
                                    {txFeedback.hash && txFeedback.explorer && (
                                      <a href={txFeedback.explorer} target="_blank" rel="noreferrer" className="text-blue-600 underline ml-2">
                                        View on explorer
                                      </a>
                                    )}
                                  </div>
                                )}
                                {txFeedback.status === "confirmed" && (
                                  <div className="flex items-center space-x-2 text-green-700">
                                    <div className="font-semibold">✅ Transaction confirmed</div>
                                    {txFeedback.hash && txFeedback.explorer && (
                                      <a href={txFeedback.explorer} target="_blank" rel="noreferrer" className="text-blue-600 underline ml-2">
                                        View on explorer
                                      </a>
                                    )}
                                  </div>
                                )}
                                {txFeedback.status === "failed" && (
                                  <div className="text-red-600">
                                    ❌ Transaction failed: {txFeedback.error ?? "Unknown error"}
                                  </div>
                                )}
                              </div>
                            )}
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