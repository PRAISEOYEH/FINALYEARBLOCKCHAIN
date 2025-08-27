"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Activity, Zap, Users } from "lucide-react"
import { useRealWeb3 } from "@/hooks/use-real-web3"
import { apiClient } from "@/lib/api-client"
import { BlockchainMonitor } from "@/lib/blockchain-monitor"
import { ethers } from "ethers"

export default function RealTimeDashboard() {
  const { liveVoteCounts, networkStats, blockNumber, gasPrice } = useRealWeb3()
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeVoters: 0,
    votesPerMinute: 0,
    networkLatency: 0,
    systemLoad: 0,
  })

  // Initialize blockchain monitoring
  useEffect(() => {
    const monitor = new BlockchainMonitor(process.env.NEXT_PUBLIC_WS_PROVIDER_URL!)

    // Monitor vote events in real-time
    monitor.monitorVoteEvents((voteEvent) => {
      console.log("New vote detected:", voteEvent)
      // Update real-time metrics
      setRealTimeMetrics((prev) => ({
        ...prev,
        votesPerMinute: prev.votesPerMinute + 1,
      }))
    })

    // Update network stats every 30 seconds
    const statsInterval = setInterval(async () => {
      try {
        const stats = await monitor.getNetworkStats()
        // Update network statistics
      } catch (error) {
        console.error("Failed to fetch network stats:", error)
      }
    }, 30000)

    return () => {
      clearInterval(statsInterval)
    }
  }, [])

  // Real-time metrics from API
  useEffect(() => {
    const fetchRealTimeMetrics = async () => {
      try {
        const metrics = await apiClient.getSecurityMetrics()
        setRealTimeMetrics((prev) => ({
          ...prev,
          activeVoters: metrics.activeVoters,
          networkLatency: metrics.networkLatency,
          systemLoad: metrics.systemLoad,
        }))
      } catch (error) {
        console.error("Failed to fetch real-time metrics:", error)
      }
    }

    // Fetch immediately and then every 10 seconds
    fetchRealTimeMetrics()
    const interval = setInterval(fetchRealTimeMetrics, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Real-time Vote Count */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Live Votes</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Object.values(liveVoteCounts)
              .reduce((total, election) => total + Object.values(election).reduce((sum, count) => sum + count, 0), 0)
              .toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">+{realTimeMetrics.votesPerMinute} in the last minute</p>
        </CardContent>
      </Card>

      {/* Network Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Network</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Block #{blockNumber?.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Gas: {gasPrice ? Number.parseFloat(ethers.utils.formatUnits(gasPrice, "gwei")).toFixed(1) : 0} gwei
          </p>
        </CardContent>
      </Card>

      {/* Active Voters */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Voters</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{realTimeMetrics.activeVoters.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Currently online</p>
        </CardContent>
      </Card>

      {/* System Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Performance</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{realTimeMetrics.networkLatency}ms</div>
          <Progress value={100 - realTimeMetrics.systemLoad} className="mt-2" />
          <p className="text-xs text-muted-foreground">System load: {realTimeMetrics.systemLoad}%</p>
        </CardContent>
      </Card>
    </div>
  )
}
