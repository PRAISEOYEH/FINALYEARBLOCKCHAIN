"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Shield, AlertTriangle, CheckCircle, Lock, Key, Eye, Activity, Zap, Globe } from "lucide-react"
import { useSecurityMonitor } from "@/hooks/use-security-monitor"
import { useWeb3 } from "@/hooks/use-web3"

export default function SecurityDashboard() {
  const { securityScore, threats, securityEvents } = useSecurityMonitor()
  const { account, networkStatus, gasPrice } = useWeb3()
  const [encryptionStatus, setEncryptionStatus] = useState("Active")
  const [lastAudit, setLastAudit] = useState(new Date().toLocaleDateString())

  const securityMetrics = [
    {
      title: "Encryption Status",
      value: "AES-256",
      status: "active",
      icon: Lock,
      description: "End-to-end encryption active",
    },
    {
      title: "Key Management",
      value: "HSM Protected",
      status: "secure",
      icon: Key,
      description: "Hardware security module",
    },
    {
      title: "Network Security",
      value: networkStatus,
      status: "connected",
      icon: Globe,
      description: "Blockchain network status",
    },
    {
      title: "Gas Optimization",
      value: `${gasPrice} gwei`,
      status: gasPrice < 30 ? "optimal" : "high",
      icon: Zap,
      description: "Transaction cost efficiency",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "secure":
      case "connected":
      case "optimal":
        return "text-green-600 bg-green-50 border-green-200"
      case "high":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      default:
        return "text-red-600 bg-red-50 border-red-200"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Security Dashboard</h2>
          <p className="text-gray-600">Monitor system security and threat detection</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge
            variant="outline"
            className={
              securityScore >= 95
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-yellow-50 text-yellow-700 border-yellow-200"
            }
          >
            Security Score: {securityScore}%
          </Badge>
          {threats > 0 && <Badge variant="destructive">{threats} Active Threats</Badge>}
        </div>
      </div>

      {/* Security Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Overall Security Status
          </CardTitle>
          <CardDescription>Real-time security monitoring and threat assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Security Score</span>
                <span className="text-sm text-gray-600">{securityScore}%</span>
              </div>
              <Progress value={securityScore} className="h-3" />
            </div>

            {securityScore < 90 && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Security score below optimal threshold. Review security events and take corrective action.
                </AlertDescription>
              </Alert>
            )}

            {threats > 0 && (
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {threats} active security threat{threats > 1 ? "s" : ""} detected. Immediate attention required.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {securityMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <metric.icon className="h-8 w-8 text-blue-600" />
                <Badge className={getStatusColor(metric.status)}>{metric.status}</Badge>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">{metric.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
              <p className="text-sm text-gray-600">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Recent Security Events
          </CardTitle>
          <CardDescription>Latest security monitoring alerts and system events</CardDescription>
        </CardHeader>
        <CardContent>
          {securityEvents.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <p className="text-gray-600">No security events detected</p>
              <p className="text-sm text-gray-500">All systems operating normally</p>
            </div>
          ) : (
            <div className="space-y-3">
              {securityEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-gray-900">{event.description}</p>
                      <p className="text-sm text-gray-600">
                        {event.type} • {event.severity} severity
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{new Date(event.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Security Actions
          </CardTitle>
          <CardDescription>Perform security checks and system maintenance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Shield className="h-6 w-6" />
              <span>Run Security Scan</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Key className="h-6 w-6" />
              <span>Rotate Keys</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Activity className="h-6 w-6" />
              <span>Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Status */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance & Audit</CardTitle>
          <CardDescription>Regulatory compliance and audit trail information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Last Security Audit</h4>
              <p className="text-2xl font-bold text-gray-900">{lastAudit}</p>
              <p className="text-sm text-gray-600">Passed with 98% score</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Compliance Status</h4>
              <p className="text-2xl font-bold text-green-600">Compliant</p>
              <p className="text-sm text-gray-600">SOC 2 Type II, ISO 27001</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Data Retention</h4>
              <p className="text-2xl font-bold text-gray-900">7 Years</p>
              <p className="text-sm text-gray-600">Blockchain immutable storage</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
