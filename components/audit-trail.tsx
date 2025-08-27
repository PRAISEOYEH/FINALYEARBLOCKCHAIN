"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Search, Filter, CheckCircle, Clock, User, Vote, Settings, Shield } from "lucide-react"
import { useWeb3 } from "@/hooks/use-web3"

interface AuditEvent {
  id: string
  timestamp: string
  type: "vote" | "registration" | "election_created" | "admin_action" | "security_event"
  user: string
  action: string
  details: string
  transactionHash?: string
  gasUsed?: number
  status: "confirmed" | "pending" | "failed"
  ipAddress: string
  userAgent: string
}

export default function AuditTrail() {
  const { account, getTransactionHistory } = useWeb3()
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<AuditEvent[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  // Mock audit data - in production, this would come from blockchain and server logs
  useEffect(() => {
    const mockAuditEvents: AuditEvent[] = [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        type: "vote",
        user: "0x742d35Cc6634C0532925a3b8D4C0C8b3C2e1e1e1",
        action: "Cast Vote",
        details: "Voted for candidate Alice Johnson in Presidential Election 2024",
        transactionHash: "0x1234567890abcdef1234567890abcdef12345678",
        gasUsed: 150000,
        status: "confirmed",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: "registration",
        user: "0x742d35Cc6634C0532925a3b8D4C0C8b3C2e1e1e1",
        action: "Voter Registration",
        details: "Completed KYC verification and biometric registration",
        transactionHash: "0xabcdef1234567890abcdef1234567890abcdef12",
        gasUsed: 200000,
        status: "confirmed",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      {
        id: "3",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        type: "election_created",
        user: "0xAdmin123456789abcdef123456789abcdef12345678",
        action: "Election Created",
        details: "Created Presidential Election 2024 with 3 candidates",
        transactionHash: "0xfedcba0987654321fedcba0987654321fedcba09",
        gasUsed: 500000,
        status: "confirmed",
        ipAddress: "10.0.0.50",
        userAgent: "Mozilla/5.0 (macOS; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      {
        id: "4",
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        type: "security_event",
        user: "System",
        action: "Security Scan",
        details: "Automated security scan completed - no threats detected",
        status: "confirmed",
        ipAddress: "127.0.0.1",
        userAgent: "SecurityBot/1.0",
      },
      {
        id: "5",
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        type: "admin_action",
        user: "0xAdmin123456789abcdef123456789abcdef12345678",
        action: "Candidate Verification",
        details: "Verified candidate Bob Smith for Presidential Election 2024",
        status: "confirmed",
        ipAddress: "10.0.0.50",
        userAgent: "Mozilla/5.0 (macOS; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    ]

    setTimeout(() => {
      setAuditEvents(mockAuditEvents)
      setFilteredEvents(mockAuditEvents)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Filter events based on search and type
  useEffect(() => {
    let filtered = auditEvents

    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.user.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterType !== "all") {
      filtered = filtered.filter((event) => event.type === filterType)
    }

    setFilteredEvents(filtered)
  }, [searchTerm, filterType, auditEvents])

  const getEventIcon = (type: string) => {
    switch (type) {
      case "vote":
        return Vote
      case "registration":
        return User
      case "election_created":
        return Settings
      case "admin_action":
        return Shield
      case "security_event":
        return Shield
      default:
        return FileText
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "vote":
        return "text-blue-600 bg-blue-50"
      case "registration":
        return "text-green-600 bg-green-50"
      case "election_created":
        return "text-purple-600 bg-purple-50"
      case "admin_action":
        return "text-orange-600 bg-orange-50"
      case "security_event":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const exportAuditLog = () => {
    const csvContent = [
      ["Timestamp", "Type", "User", "Action", "Details", "Transaction Hash", "Status"],
      ...filteredEvents.map((event) => [
        event.timestamp,
        event.type,
        event.user,
        event.action,
        event.details,
        event.transactionHash || "",
        event.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-trail-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Trail</h2>
          <p className="text-gray-600">Complete immutable record of all system activities</p>
        </div>
        <Button onClick={exportAuditLog} className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Export Audit Log
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search audit events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="vote">Votes</SelectItem>
                <SelectItem value="registration">Registrations</SelectItem>
                <SelectItem value="election_created">Elections</SelectItem>
                <SelectItem value="admin_action">Admin Actions</SelectItem>
                <SelectItem value="security_event">Security Events</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Audit Events
          </CardTitle>
          <CardDescription>
            Showing {filteredEvents.length} of {auditEvents.length} events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading audit trail...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No audit events found</p>
              <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => {
                const EventIcon = getEventIcon(event.type)
                return (
                  <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getEventColor(event.type)}`}>
                          <EventIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">{event.action}</h4>
                            <Badge
                              variant={
                                event.status === "confirmed"
                                  ? "default"
                                  : event.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {event.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{event.details}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500">
                            <div>
                              User: {event.user.slice(0, 10)}...{event.user.slice(-8)}
                            </div>
                            <div>IP: {event.ipAddress}</div>
                            {event.transactionHash && (
                              <div>
                                Tx: {event.transactionHash.slice(0, 10)}...{event.transactionHash.slice(-8)}
                              </div>
                            )}
                            {event.gasUsed && <div>Gas: {event.gasUsed.toLocaleString()}</div>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(event.timestamp).toLocaleString()}
                        </div>
                        {event.status === "confirmed" && <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Vote className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{auditEvents.filter((e) => e.type === "vote").length}</p>
            <p className="text-sm text-gray-600">Total Votes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <User className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {auditEvents.filter((e) => e.type === "registration").length}
            </p>
            <p className="text-sm text-gray-600">Registrations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Settings className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {auditEvents.filter((e) => e.type === "election_created").length}
            </p>
            <p className="text-sm text-gray-600">Elections Created</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {auditEvents.filter((e) => e.type === "admin_action" || e.type === "security_event").length}
            </p>
            <p className="text-sm text-gray-600">Security Events</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
