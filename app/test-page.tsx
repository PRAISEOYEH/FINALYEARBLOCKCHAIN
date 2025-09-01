"use client"

import React from 'react'

export const dynamic = 'force-dynamic'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/50 to-slate-900"></div>
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">University Blockchain Voting System</h1>
          <p className="text-lg mb-6">Test Page - Provider Bypass</p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md">
            <h2 className="text-xl mb-4">Admin Login Test</h2>
            <div className="space-y-2 text-sm">
              <p>Email: admin@techuni.edu</p>
              <p>Password: admin2024!</p>
              <p>Access Code: ADM-7892-XYZ</p>
            </div>
            <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
              This bypasses all providers
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
