"use client"

import { useUniversityVoting } from "@/hooks/use-university-voting"
import { useMultiWallet } from "@/hooks/use-multi-wallet"
import UniversityLogin from "@/components/university-login"
import CandidateDashboard from "@/components/candidate-dashboard"
import UniversityDashboard from "@/components/university-dashboard"
import AdminDashboard from "@/components/admin-dashboard"

export default function HomePage() {
  const { user, isAuthenticated } = useUniversityVoting()
  const { isConnected, needsNetworkSwitch } = useMultiWallet()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/50 to-slate-900"></div>
      <div className="relative z-10">
        {!isAuthenticated ? (
          <UniversityLogin />
        ) : user?.role === "admin" ? (
          <AdminDashboard />
        ) : user?.role === "candidate" ? (
          <CandidateDashboard />
        ) : (
          <UniversityDashboard />
        )}
      </div>
    </div>
  )
}
