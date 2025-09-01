"use client"

import { useEffect, useMemo, useState } from "react"
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
import { useBlockchainVoting } from "@/hooks/use-blockchain-voting"
import { getPublicClient } from '@wagmi/core'
import { baseSepolia } from "wagmi/chains"
import { UniversityVotingContract } from "@/lib/blockchain/voting-service"
import { getOnchainCandidateId, getAllElectionMappings } from "@/lib/contracts/id-map"

const BASE_SEPOLIA_CHAIN_ID = baseSepolia.id

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
    isLoading: uniIsLoading,
    error: uniError,
    walletState,
    walletActions,
    walletError,
  } = useUniversityVoting()

  // Destructure wallet state from university voting context
  const { isConnected, account, needsNetworkSwitch, isOnSupportedNetwork } = walletState

  // Blockchain hook for transaction states & admin operations (read-only here; university hook performs high-level ops)
  const blockchain = useBlockchainVoting()

  const [isVerifying, setIsVerifying] = useState<string | null>(null)
  const [txList, setTxList] = useState<any[]>([])
  const [gasEstimates, setGasEstimates] = useState<Record<string, string | null>>({})
  const [estimateLoading, setEstimateLoading] = useState<Record<string, boolean>>({})
  const [opError, setOpError] = useState<string | null>(null)

  const adminWalletFromEnv = (process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS ||
    process.env.ADMIN_WALLET_ADDRESS ||
    "") as string
  const adminWalletNormalized = adminWalletFromEnv ? adminWalletFromEnv.toLowerCase() : null

  const isOnCorrectNetwork = isOnSupportedNetwork
  const isAdminWalletConnected =
    isConnected && account && adminWalletNormalized ? account.toLowerCase() === adminWalletNormalized : true
  // If no ADMIN_WALLET configured, we relax the check (useful for dev). If configured, require match.

  // Fetch transactions from blockchain hook for display and live updates
  useEffect(() => {
    const list = blockchain.listTransactions?.() ?? []
    setTxList(list)
    // keep list updated when blockchain.txs or hook flags change
    // using polling via interval ensures UI sees new txs pushed from hook
    const iv = setInterval(() => {
      setTxList(blockchain.listTransactions?.() ?? [])
    }, 2000)
    return () => clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockchain])

  // Utility: estimate gas for verifyCandidate per candidate (best-effort using public client)
  const estimateVerifyGas = async (candidateId: string) => {
    // Skip if missing mapping
    setOpError(null)
    setEstimateLoading((s) => ({ ...s, [candidateId]: true }))
    try {
      const onchainCandidateId = getOnchainCandidateId(candidateId)
      const electionMappings = getAllElectionMappings()
      if (!electionMappings || electionMappings.length === 0) {
        setGasEstimates((s) => ({ ...s, [candidateId]: "N/A (no election mapping)" }))
        return
      }
      const onchainElectionId = electionMappings[0].onchainElectionId

      if (onchainCandidateId == null) {
        setGasEstimates((s) => ({ ...s, [candidateId]: "N/A (candidate not mapped)" }))
        return
      }

      const publicClient = getPublicClient({ chainId: BASE_SEPOLIA_CHAIN_ID })
      const { address: contractAddress, abi } = UniversityVotingContract(BASE_SEPOLIA_CHAIN_ID)
      // best-effort estimate
      try {
        const gasBig = await (publicClient as any).estimateContractGas({
          address: contractAddress,
          abi,
          functionName: "verifyCandidate",
          args: [onchainElectionId, onchainCandidateId],
        })
        // gasBig may be bigint or number
        const gasNum = typeof gasBig === "bigint" ? Number(gasBig) : Number(gasBig ?? 0)
        if (!Number.isFinite(gasNum) || gasNum <= 0) {
          setGasEstimates((s) => ({ ...s, [candidateId]: "N/A" }))
        } else {
          setGasEstimates((s) => ({ ...s, [candidateId]: `${Math.round(gasNum).toLocaleString()} units` }))
        }
      } catch (err: any) {
        // estimation may fail; show N/A with message
        setGasEstimates((s) => ({ ...s, [candidateId]: `N/A (${(err && (err as any).message) || "estimation failed"})` }))
      }
    } catch (err: any) {
      setOpError((err && (err as any).message) || String(err))
      setGasEstimates((s) => ({ ...s, [candidateId]: "N/A" }))
    } finally {
      setEstimateLoading((s) => ({ ...s, [candidateId]: false }))
    }
  }

  // Pre-warm estimates for pending candidates (non-blocking)
  useEffect(() => {
    pendingCandidates.forEach((c) => {
      if (!gasEstimates[c.id]) {
        void estimateVerifyGas(c.id)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCandidates])

  const handleVerifyCandidate = async (candidateId: string) => {
    setOpError(null)
    // guard: ensure wallet connected
    if (!isConnected) {
      setOpError("Please connect your admin wallet before performing this action.")
      return
    }
    if (!isOnCorrectNetwork) {
      setOpError("Switch to Base Sepolia network before performing admin operations.")
      return
    }
    if (!isAdminWalletConnected) {
      setOpError("Connected wallet is not authorized as admin.")
      return
    }

    setIsVerifying(candidateId)
    try {
      // call the university-level verifyCandidate which handles mapping & id bookkeeping
      await verifyCandidate(candidateId)
      // After calling, blockchain hook should register transactions; we may surface them in the tx list automatically
      // Refresh tx list
      setTxList(blockchain.listTransactions?.() ?? [])
    } catch (error: any) {
      console.error("Failed to verify candidate:", error)
      setOpError((error && error.message) || String(error))
    } finally {
      setIsVerifying(null)
    }
  }

  const handleRejectCandidate = async (candidateId: string) => {
    setOpError(null)
    if (!isConnected) {
      setOpError("Please connect your admin wallet before performing this action.")
      return
    }
    if (!isAdminWalletConnected) {
      setOpError("Connected wallet is not authorized as admin.")
      return
    }
    setIsVerifying(candidateId)
    try {
      await rejectCandidate(candidateId, "Did not meet eligibility requirements")
    } catch (error: any) {
      console.error("Failed to reject candidate:", error)
      setOpError((error && error.message) || String(error))
    } finally {
      setIsVerifying(null)
    }
  }

  const allCandidates = getAllCandidates()
  const verifiedCandidates = allCandidates.filter((c) => c.verified)
  const rejectedCandidates = allCandidates.filter((c) => c.student.verificationStatus === "rejected")

  // Helpers for UI
  const renderTx = (tx: any) => {
    const status = tx.status ?? "pending"
    const hash = tx.hash ?? tx.id
    // attempt to form explorer link (best-effort using Base Sepolia explorer heuristic)
    const explorerBase = "https://sepolia.etherscan.io/tx" // fallback; may be different for Base Sepolia but is a reasonable default
    const link = hash && hash.startsWith("0x") ? `${explorerBase}/${hash}` : null
    return (
      <div key={tx.id} className="border rounded-md p-3 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">{status === "pending" ? "Pending Transaction" : "Transaction"}</div>
            <div className="text-xs text-gray-600">{hash ? hash : tx.id}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">{new Date(tx.updatedAt ?? tx.createdAt ?? Date.now()).toLocaleString()}</div>
            <div className="mt-2">
              {status === "confirmed" ? (
                <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
              ) : status === "failed" ? (
                <Badge className="bg-red-100 text-red-800">Failed</Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
              )}
            </div>
            {link && (
              <a href={link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 block mt-1">
                View on explorer
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }

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

      {/* Display global errors / warnings */}
      {!isConnected && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Wallet not connected. Connect your admin wallet to perform administrative actions.
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
            You are connected to the wrong network. Switch to Base Sepolia (chain {BASE_SEPOLIA_CHAIN_ID}).
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

      {isConnected && !isAdminWalletConnected && adminWalletNormalized && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">Connected wallet is not authorized as an admin. Connect the configured admin wallet to manage the system.</AlertDescription>
        </Alert>
      )}

      {uniError && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">University context error: {uniError}</AlertDescription>
        </Alert>
      )}

      {walletError && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">Wallet error: {walletError}</AlertDescription>
        </Alert>
      )}

      {opError && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">Operation error: {opError}</AlertDescription>
        </Alert>
      )}

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
                    {pendingCandidates.map((candidate) => {
                      const disabledReason = !isConnected
                        ? "Connect wallet"
                        : !isOnCorrectNetwork
                        ? "Wrong network"
                        : adminWalletNormalized && !isAdminWalletConnected
                        ? "Not authorized admin wallet"
                        : uniIsLoading
                        ? "Please wait"
                        : undefined
                      const isBusy = isVerifying === candidate.id || uniIsLoading || blockchain.isVerifyingCandidate
                      return (
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

                              <div className="mt-3 text-xs text-gray-600">
                                <div>
                                  <strong>Estimated Gas:</strong>{" "}
                                  {estimateLoading[candidate.id] ? (
                                    <span>Estimating...</span>
                                  ) : gasEstimates[candidate.id] ? (
                                    <span>{gasEstimates[candidate.id]}</span>
                                  ) : (
                                    <span>Unknown</span>
                                  )}
                                </div>
                                <div className="mt-1">
                                  <strong>Candidate Mapping:</strong>{" "}
                                  {getOnchainCandidateId(candidate.id) ? (
                                    <span className="text-green-700">Mapped</span>
                                  ) : (
                                    <span className="text-gray-600">Not mapped (will require mapping)</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end ml-4 space-y-2">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleVerifyCandidate(candidate.id)}
                                  disabled={Boolean(disabledReason) || isBusy}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {isBusy ? (
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
                                  disabled={Boolean(disabledReason) || isBusy}
                                >
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                              {/* show disabled reason if present */}
                              {disabledReason && <div className="text-xs text-gray-500">{disabledReason}</div>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

            {/* Transactions panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>Track administrative transactions and confirmations</CardDescription>
              </CardHeader>
              <CardContent>
                {txList.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-600">No recent transactions</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {txList.map((tx) => renderTx(tx))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Diagnostics / Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Diagnostics
                </CardTitle>
                <CardDescription>Quick checks and diagnostics for the blockchain connection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <strong>Wallet Connected:</strong> {isConnected ? account : "No"}
                  </div>
                  <div>
                    <strong>Network:</strong> {isOnSupportedNetwork ? "Base Sepolia" : "Wrong Network"} ({BASE_SEPOLIA_CHAIN_ID})
                  </div>
                  <div>
                    <strong>Admin Wallet Configured:</strong>{" "}
                    {adminWalletNormalized ? adminWalletNormalized : <span className="text-gray-500">Not configured</span>}
                  </div>
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // refresh tx list & estimates
                        setTxList(blockchain.listTransactions?.() ?? [])
                        pendingCandidates.forEach((c) => void estimateVerifyGas(c.id))
                      }}
                    >
                      Refresh Diagnostics
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}