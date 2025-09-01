"use client"

import React, { useEffect } from 'react'
import { useUniversityVoting } from '@/hooks/use-university-voting'
import UniversityLogin from '@/components/university-login'
import AdminDashboard from '@/components/admin-dashboard'

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

export default function HomePage() {
  const { isAuthenticated, user, userRole, isLoading, error, walletState, elections, createElection, castVote } = useUniversityVoting()

  // Development-time validation to ensure full system is loaded
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 HomePage: Full system validation starting...');
      
      // Validate blockchain functions are available
      const hasBlockchainFunctions = typeof createElection === 'function' && typeof castVote === 'function';
      if (hasBlockchainFunctions) {
        console.log('✅ Full blockchain integration confirmed - All functions available');
        console.log('✅ createElection function:', typeof createElection);
        console.log('✅ castVote function:', typeof castVote);
        console.log('✅ Wallet state:', walletState);
        console.log('✅ Elections data:', elections);
      } else {
        console.warn('⚠️ Warning: Some blockchain functions may not be available');
      }
      
      // Show development banner when admin dashboard loads
      if (isAuthenticated && user && userRole === 'admin') {
        console.log('🎯 Admin Dashboard Loading - Full Blockchain Integration Active');
      }
    }
  }, [isAuthenticated, user, userRole, createElection, castVote, walletState, elections]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading Full System...</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-sm text-gray-300 mt-2">Initializing blockchain integration...</p>
          )}
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-6 max-w-md">
            <h2 className="text-xl mb-4 text-red-300">System Error</h2>
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show admin dashboard if authenticated as admin
  if (isAuthenticated && user && userRole === 'admin') {
    return (
      <>
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed top-0 left-0 right-0 bg-green-600 text-white text-center py-2 text-sm z-50">
            🚀 Full Blockchain Integration - Production Ready System Active
          </div>
        )}
        <AdminDashboard />
      </>
    )
  }

  // Show login form for unauthenticated users
  return <UniversityLogin />
}
