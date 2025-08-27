"use client"

import { useState, useEffect } from "react"

export function useSecurityMonitor() {
  const [securityScore, setSecurityScore] = useState(98)
  const [threats, setThreats] = useState(0)
  const [lastSecurityCheck, setLastSecurityCheck] = useState(new Date().toLocaleTimeString())
  const [securityEvents, setSecurityEvents] = useState<any[]>([])

  useEffect(() => {
    // Simulate security monitoring
    const securityInterval = setInterval(() => {
      setLastSecurityCheck(new Date().toLocaleTimeString())

      // Simulate security score fluctuation
      const random = Math.random()
      if (random > 0.95) {
        setThreats((prev) => prev + 1)
        setSecurityScore((prev) => Math.max(prev - 5, 75))
        setSecurityEvents((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "threat_detected",
            severity: "medium",
            timestamp: new Date().toISOString(),
            description: "Unusual voting pattern detected",
          },
        ])
      } else if (random > 0.98) {
        setThreats(0)
        setSecurityScore((prev) => Math.min(prev + 2, 100))
      }
    }, 10000)

    return () => clearInterval(securityInterval)
  }, [])

  return {
    securityScore,
    threats,
    lastSecurityCheck,
    securityEvents,
  }
}
