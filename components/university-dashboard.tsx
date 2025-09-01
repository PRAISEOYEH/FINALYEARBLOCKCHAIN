"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, Vote, Users, TrendingUp, Calendar, Shield, LogOut, Bell, Settings } from "lucide-react"
import { useUniversityVoting } from "@/hooks/use-university-voting"
import { useBlockchainVoting } from "@/hooks/use-blockchain-voting"
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain, type Chain } from "wagmi"

const TARGET_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 0)

export default function UniversityDashboard() {
  // University voting context (blockchain-backed)
  const uni = useUniversityVoting()
  const voting = useBlockchainVoting()

  // Wagmi hooks for wallet & network
  const { address } = useAccount()
  const { connect, connectors, error: connectError, isLoading: connectLoading, pendingConnector } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain, chains: availableChains, error: switchError } = useSwitchChain()

  // Local UI state
  const [activeTab, setActiveTab] = useState("overview")
  const [hasVotedMap, setHasVotedMap] = useState<Record<string, boolean>>({})
  const [txHistory, setTxHistory] = useState<
    { electionId: string; positionId?: string; candidateId?: string; hash?: string; timestamp: number; explorer?: string }[]
  >([])
  const [localError, setLocalError] = useState<string | null>(null)

  // Data from uni context
  const elections = uni?.elections ?? []
  const isLoading = uni?.isLoading ?? false
  const uniError = uni?.error ?? null
  const universityInfo = uni?.university

  useEffect(() => {
    // Load tx history for current account from localStorage
    if (!address) {
      setTxHistory([])
      return
    }
    try {
      const raw = localStorage.getItem(`txHistory:${address.toLowerCase()}`)
      if (!raw) {
        setTxHistory([])
        return
      }
      const parsed = JSON.parse(raw)
      setTxHistory(Array.isArray(parsed) ? parsed : [])
    } catch (err) {
      setTxHistory([])
    }
  }, [address])

  // Utility: persist tx history (merge new entries)
  const pushTxToHistory = (entry: {
    electionId: string
    positionId?: string
    candidateId?: string
    hash?: string
    explorer?: string
  }) => {
    if (!address) return
    try {
      const key = `txHistory:${address.toLowerCase()}`
      const existingRaw = localStorage.getItem(key)
      const existing = existingRaw ? JSON.parse(existingRaw) : []
      const newEntry = { ...entry, timestamp: Date.now() }
      const updated = [newEntry, ...(Array.isArray(existing) ? existing : [])].slice(0, 50)
      localStorage.setItem(key, JSON.stringify(updated))
      setTxHistory(updated)
    } catch {
      // ignore
    }
  }

  // Truncate address-friendly
  const truncateAddress = (addr?: string) => {
    if (!addr) return ""
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Derived stats
  const activeElections = useMemo(() => elections.filter((e) => e.status === "active"), [elections])
  const totalVoters = universityInfo?.studentBodySize ?? "—"
  const participationRate = useMemo(() => {
    if (!elections || elections.length === 0) return "—"
    const vals = elections.map((e) => Number(e.turnoutRate || 0))
    const avg = vals.reduce((s, v) => s + v, 0) / (vals.length || 1)
    return `${Math.round(avg)}%`
  }, [elections])

  const daysLeft = useMemo(() => {
    try {
      const futureEnds = elections
        .map((e) => {
          const t = e.endTime
          // try to parse multiple possible formats
          if (!t) return null
          if (typeof t === "string" || t instanceof String) {
            const parsed = Date.parse(String(t))
            if (!Number.isNaN(parsed)) return parsed
          }
          if (typeof t === "number") return t * 1000
          // bigint or other
          if (typeof t === "bigint") return Number(t) * 1000
          return null
        })
        .filter((v): v is number => v !== null)
      if (futureEnds.length === 0) return "—"
      const earliest = Math.min(...futureEnds)
      const diff = earliest - Date.now()
      if (diff <= 0) return "Ended"
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
      return `${days}`
    } catch {
      return "—"
    }
  }, [elections])

  // Determine whether wallet is connected to the target chain
  const isOnTargetChain = chainId ? Number(chainId) === TARGET_CHAIN_ID : false

  // Attempt to compute per-election voted state for current account (uses uni.hasVoted)
  useEffect(() => {
    let mounted = true
    const compute = async () => {
      if (!address) {
        setHasVotedMap({})
        return
      }
      const map: Record<string, boolean> = {}
      for (const e of elections) {
        try {
          // For hasVoted we need an electionId and a positionId: try to infer a reasonable position id
          const electionId = e.id
          // try position id from election.positions if available
          let positionId = e.positions && e.positions.length > 0 ? (e.positions[0].id ?? String(0)) : String(0)
          // call uni.hasVoted - it expects UI ids as implemented in context
          try {
            const res = await uni.hasVoted(electionId, positionId)
            map[electionId] = Boolean(res)
          } catch {
            map[electionId] = false
          }
        } catch {
          map[e.id] = false
        }
      }
      if (mounted) setHasVotedMap(map)
    }
    void compute()
    return () => {
      mounted = false
    }
  }, [address, elections, uni])

  // Error aggregation
  useEffect(() => {
    if (uniError) setLocalError(uniError)
    else if (connectError) setLocalError(String(connectError?.message ?? connectError))
    else if (switchError) setLocalError(String((switchError as any)?.message ?? switchError))
    else setLocalError(null)
  }, [uniError, connectError, switchError])

  // Connect helper: pick a reasonable connector (MetaMask / Injected / WalletConnect)
  const handleConnect = async () => {
    try {
      setLocalError(null)
      // prefer MetaMask or Injected
      let preferred = connectors.find((c) => /MetaMask/i.test(c.name)) ?? connectors.find((c) => /Injected/i.test(c.name))
      // fallback to WalletConnect if available
      if (!preferred) preferred = connectors.find((c) => /WalletConnect/i.test(c.name) || /WalletConnect/i.test(c.id))
      // fallback to first connector
      if (!preferred) preferred = connectors[0]
      if (!preferred) throw new Error("No wallet connectors available")
      await connect({ connector: preferred })
    } catch (err: any) {
      setLocalError(err?.message ?? String(err))
    }
  }

  const handleDisconnect = () => {
    try {
      disconnect()
    } catch {
      // ignore
    }
  }

  // Small helper to display explorer link if available for a hash
  const explorerBase = (chainId?: number | null) => {
    if (!chainId) return null
    if (chainId === 84532) return "https://sepolia.basescan.org/tx/"
    // fallback etherscan-like
    if (chainId === 1) return "https://etherscan.io/tx/"
    if (chainId === 5) return "https://goerli.etherscan.io/tx/"
    return null
  }

  // When user casts vote via other UI, they may have pushed tx to history; provide ability to clear
  const clearHistory = () => {
    if (!address) return
    try {
      localStorage.removeItem(`txHistory:${address.toLowerCase()}`)
      setTxHistory([])
    } catch {
      // ignore
    }
  }

  // Render helpers
  const ConnectionBlock = () => {
    return (
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-600">
          {address ? (
            <>
              <div>
                <strong>Wallet:</strong> {truncateAddress(address)}
              </div>
              <div>
                <strong>Network:</strong> {chainId ? `Chain ${chainId}` : "Unknown"} {isOnTargetChain ? "" : "(Wrong Network)"}
              </div>
            </>
          ) : (
            <div>
              <strong>Wallet:</strong> Not connected
            </div>
          )}
        </div>

        {!address ? (
          <Button onClick={handleConnect} disabled={connectLoading}>
            Connect Wallet
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            {!isOnTargetChain && TARGET_CHAIN_ID ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (switchChain && TARGET_CHAIN_ID) {
                    try {
                      switchChain({ chainId: TARGET_CHAIN_ID })
                    } catch (err) {
                      setLocalError("Unable to switch network from the UI. Please switch manually in your wallet.")
                    }
                  } else {
                    setLocalError("Network switch is not available. Ensure your wallet supports automatic switching.")
                  }
                }}
              >
                Switch to Target Network
              </Button>
            ) : null}
            <Button variant="outline" size="sm" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">TechUniversity Elections</h1>
                <p className="text-sm text-gray-600">Student Union Elections 2024</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="outline" className={`bg-${isOnTargetChain ? "green" : "yellow"}-50 text-${isOnTargetChain ? "green" : "yellow"}-700 border-${isOnTargetChain ? "green" : "yellow"}-200`}>
                <Shield className="h-3 w-3 mr-1" />
                {isOnTargetChain ? "Base Sepolia" : "Wrong Network"}
              </Badge>

              <div className="text-sm text-gray-700">
                {address ? <span>{truncateAddress(address)}</span> : <span>Wallet not connected</span>}
              </div>

              <ConnectionBlock />

              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => {}}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Show errors */}
        {localError && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded">
            <strong>Error:</strong> {localError}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <Vote className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Elections</p>
                  <p className="text-2xl font-bold text-gray-900">{activeElections.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Voters</p>
                  <p className="text-2xl font-bold text-gray-900">{totalVoters}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Participation</p>
                  <p className="text-2xl font-bold text-gray-900">{participationRate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Days Left (earliest)</p>
                  <p className="text-2xl font-bold text-gray-900">{daysLeft}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vote">Vote</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Elections</CardTitle>
                  <CardDescription>Active voting periods (sourced from chain)</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">Loading elections from chain...</div>
                  ) : elections.length === 0 ? (
                    <div className="text-center py-8">No elections found.</div>
                  ) : (
                    <div className="space-y-4">
                      {elections.map((el) => (
                        <div key={el.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                          <div>
                            <h3 className="font-semibold">{el.title || `Election ${el.id}`}</h3>
                            <p className="text-sm text-gray-600">{el.description || "No description provided"}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Contract: {el.contractAddress ? String(el.contractAddress) : "Not provided"}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={`bg-${el.status === "active" ? "green" : "gray"}-100 text-${el.status === "active" ? "green" : "gray"}-800`}>
                              {el.status}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-2">{Number(el.totalVotes || 0).toLocaleString()} votes</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Voting Status</CardTitle>
                  <CardDescription>Track your participation (querying chain)</CardDescription>
                </CardHeader>
                <CardContent>
                  {address ? (
                    isLoading ? (
                      <div className="text-center py-8">Checking your voting status...</div>
                    ) : elections.length === 0 ? (
                      <div className="text-center py-8">No elections to check.</div>
                    ) : (
                      <div className="space-y-4">
                        {elections.map((el) => {
                          const voted = !!hasVotedMap[el.id]
                          return (
                            <div key={el.id} className="flex items-center justify-between">
                              <span className="text-sm font-medium">{el.title || `Election ${el.id}`}</span>
                              <Badge variant="outline" className={`bg-${voted ? "green" : "yellow"}-50 text-${voted ? "green" : "yellow"}-700 border-${voted ? "green" : "yellow"}-200`}>
                                {voted ? "Voted" : "Not Voted"}
                              </Badge>
                            </div>
                          )
                        })}

                        <Button className="w-full mt-4" onClick={() => setActiveTab("vote")}>
                          <Vote className="h-4 w-4 mr-2" />
                          Start Voting
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8">
                      <p className="mb-4">Connect your wallet to view and participate in elections.</p>
                      <Button onClick={() => (connect ? handleConnect() : null)}>Connect Wallet</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vote" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cast Your Vote</CardTitle>
                <CardDescription>Select your preferred candidates for each position</CardDescription>
              </CardHeader>
              <CardContent>
                {!address ? (
                  <div className="text-center py-12">
                    <Vote className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Wallet Required</h3>
                    <p className="text-gray-600 mb-4">Please connect your wallet to cast votes on-chain.</p>
                    <Button onClick={handleConnect}>Connect Wallet</Button>
                  </div>
                ) : !isOnTargetChain ? (
                  <div className="text-center py-12">
                    <Vote className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Wrong Network</h3>
                    <p className="text-gray-600 mb-4">Switch to the Base Sepolia network to proceed.</p>
                    <Button
                      onClick={() => {
                        if (switchChain && TARGET_CHAIN_ID) {
                          try {
                            switchChain({ chainId: TARGET_CHAIN_ID })
                          } catch {
                            setLocalError("Automatic network switch failed. Please switch manually in your wallet.")
                          }
                        } else {
                          setLocalError("Network switching is not available in this environment.")
                        }
                      }}
                    >
                      Switch Network
                    </Button>
                  </div>
                ) : activeElections.length === 0 ? (
                  <div className="text-center py-12">
                    <Vote className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Elections</h3>
                    <p className="text-gray-600 mb-4">There are currently no active elections to vote in.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activeElections.map((el) => (
                      <Card key={el.id}>
                        <CardHeader>
                          <CardTitle>{el.title || `Election ${el.id}`}</CardTitle>
                          <CardDescription>{el.description || "No description"}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-sm text-gray-600">Ends: {String(el.endTime ?? "Unknown")}</div>
                            <div className="text-sm text-gray-600">Votes: {Number(el.totalVotes ?? 0).toLocaleString()}</div>
                          </div>

                          <div className="grid gap-3">
                            {(el.candidates ?? []).length === 0 ? (
                              <div className="text-sm text-gray-500">No candidates available.</div>
                            ) : (
                              (el.candidates ?? []).map((c: any) => (
                                <div key={c.id ?? c.studentId ?? JSON.stringify(c)} className="flex items-center justify-between p-3 border rounded">
                                  <div>
                                    <div className="font-medium">{c.name ?? c.student?.fullName ?? "Candidate"}</div>
                                    <div className="text-xs text-gray-500">{c.party ?? ""}</div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="text-sm text-gray-700">{Number(c.votes ?? 0).toLocaleString()} votes</div>
                                    <Button
                                      size="sm"
                                      onClick={async () => {
                                        try {
                                          // Attempt to cast a vote via uni.castVote - it will validate mapping & wallet
                                          // For UI safety, require confirmation
                                          if (!confirm(`Confirm vote for ${c.name ?? "candidate"} in ${el.title}?`)) return
                                          const hash = await uni.castVote(el.id, (el.positions && el.positions[0]?.id) ?? "0", c.id ?? String(0))
                                          // Save to tx history for transparency (frontend-only)
                                          const explorer = explorerBase(Number(chainId ?? 0))
                                          pushTxToHistory({ electionId: el.id, positionId: el.positions?.[0]?.id, candidateId: c.id, hash, explorer: hash && explorer ? `${explorer}${hash}` : undefined })
                                          alert(`Vote submitted. Tx: ${hash ?? "unknown"}`)
                                        } catch (err: any) {
                                          setLocalError(err?.message ?? String(err))
                                        }
                                      }}
                                      disabled={!voting?.isReady || !isOnTargetChain}
                                    >
                                      Vote
                                    </Button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="candidates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Candidates</CardTitle>
                <CardDescription>Meet the candidates running for student union positions</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-12">Loading candidates...</div>
                ) : elections.length === 0 ? (
                  <div className="text-center py-12">No candidate data available.</div>
                ) : (
                  <div className="grid gap-4">
                    {elections.flatMap((e) => (e.candidates ?? []).map((c: any) => ({ ...c, electionTitle: e.title || e.id }))).map((c: any, idx: number) => (
                      <div key={c.id ?? idx} className="p-4 border rounded bg-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{c.name ?? c.student?.fullName ?? "Candidate"}</div>
                            <div className="text-xs text-gray-500">Running for: {c.position?.title ?? c.position ?? "Position"}</div>
                            <div className="text-xs text-gray-400 mt-1">Election: {c.electionTitle}</div>
                          </div>
                          <div className="text-sm text-gray-600">{Number(c.votes ?? 0).toLocaleString()} votes</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Election Results</CardTitle>
                <CardDescription>Real-time voting results and analytics (updated from chain)</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-12">Fetching results...</div>
                ) : elections.length === 0 ? (
                  <div className="text-center py-12">No results available.</div>
                ) : (
                  <div className="grid gap-4">
                    {elections.map((e) => (
                      <div key={e.id} className="p-4 border rounded bg-white">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">{e.title || `Election ${e.id}`}</div>
                            <div className="text-xs text-gray-500">{e.description}</div>
                            <div className="text-xs text-gray-400 mt-1">Contract: {e.contractAddress ?? "N/A"}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-700">Total Votes: {Number(e.totalVotes ?? 0).toLocaleString()}</div>
                            <div className="text-xs text-gray-500 mt-1">Status: {e.status}</div>
                          </div>
                        </div>

                        {/* Simple per-position results */}
                        <div className="mt-4 grid gap-2">
                          {(e.positions ?? []).map((p: any, idx: number) => (
                            <div key={p.id ?? idx} className="p-3 border rounded">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{p.title ?? `Position ${idx}`}</div>
                                  <div className="text-xs text-gray-500">{p.description ?? ""}</div>
                                </div>
                                <div className="text-sm text-gray-700">Candidates: {(e.candidates ?? []).filter((c) => c.positionIndex === idx).length}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Profile</CardTitle>
                <CardDescription>Your university and voting information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">University Information</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Student ID:</strong> TU2022123
                        </div>
                        <div>
                          <strong>Name:</strong> Sarah Johnson
                        </div>
                        <div>
                          <strong>Program:</strong> Computer Science
                        </div>
                        <div>
                          <strong>Year:</strong> 3rd Year
                        </div>
                        <div>
                          <strong>Faculty:</strong> Engineering & Technology
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Blockchain Information</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Wallet:</strong> {address ? truncateAddress(address) : "Not connected"}
                        </div>
                        <div>
                          <strong>Network:</strong> {chainId ? `Chain ${chainId}` : "Unknown"}
                        </div>
                        <div>
                          <strong>Connected:</strong>{" "}
                          {address ? <Badge className="bg-green-100 text-green-800">Yes</Badge> : <Badge className="bg-yellow-100 text-yellow-800">No</Badge>}
                        </div>
                        <div>
                          <strong>Primary Contract:</strong>{" "}
                          {elections[0]?.contractAddress ? String(elections[0].contractAddress).slice(0, 12) + "..." : "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Transaction History</CardTitle>
                      <CardDescription>Your recent on-chain votes (local history)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {txHistory.length === 0 ? (
                        <div className="text-sm text-gray-500">No recorded transactions for this wallet in local history.</div>
                      ) : (
                        <div className="space-y-2">
                          {txHistory.map((t, i) => (
                            <div key={i} className="flex items-center justify-between p-2 border rounded">
                              <div className="text-xs">
                                <div>
                                  <strong>Election:</strong> {t.electionId}
                                </div>
                                <div>
                                  <strong>Candidate:</strong> {t.candidateId ?? "N/A"}
                                </div>
                                <div className="text-gray-500">Time: {new Date(t.timestamp).toLocaleString()}</div>
                              </div>
                              <div className="text-right">
                                {t.hash ? (
                                  <>
                                    <a href={t.explorer ?? "#"} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">
                                      View Tx
                                    </a>
                                  </>
                                ) : (
                                  <div className="text-sm text-gray-500">No tx hash</div>
                                )}
                              </div>
                            </div>
                          ))}
                          <div className="pt-2">
                            <Button variant="outline" size="sm" onClick={clearHistory}>
                              Clear History
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}