'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/50 to-slate-900"></div>
          <div className="relative z-10 flex items-center justify-center min-h-screen">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
                  <span className="text-red-400 text-2xl">⚠️</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
                <p className="text-gray-300 mb-4">
                  The voting system encountered an unexpected error. This might be due to wallet connectivity or browser compatibility issues.
                </p>
                <div className="text-sm text-gray-400 mb-6">
                  Error: {error.message || 'Unknown error occurred'}
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={reset}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Reload Page
                </button>
              </div>
              <div className="mt-6 text-xs text-gray-500">
                <p>If this error persists, please:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Ensure you have a Web3 wallet installed (MetaMask recommended)</li>
                  <li>• Try refreshing your browser</li>
                  <li>• Check your internet connection</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
