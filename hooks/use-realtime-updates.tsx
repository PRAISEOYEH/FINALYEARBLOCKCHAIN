"use client"

import { useState, useEffect } from "react"

export function useRealTimeUpdates() {
  const [isOnline, setIsOnline] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString())
  const [connectionQuality, setConnectionQuality] = useState<"excellent" | "good" | "poor">("excellent")

  useEffect(() => {
    // Simulate WebSocket connection for real-time updates
    const updateInterval = setInterval(() => {
      setLastUpdate(new Date().toLocaleTimeString())

      // Simulate occasional connection issues
      const random = Math.random()
      if (random > 0.95) {
        setIsOnline(false)
        setConnectionQuality("poor")
        setTimeout(() => {
          setIsOnline(true)
          setConnectionQuality("excellent")
        }, 3000)
      } else if (random > 0.9) {
        setConnectionQuality("good")
      } else {
        setConnectionQuality("excellent")
      }
    }, 5000)

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      clearInterval(updateInterval)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return {
    isOnline,
    lastUpdate,
    connectionQuality,
  }
}
