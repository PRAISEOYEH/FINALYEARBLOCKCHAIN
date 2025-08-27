"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Wallet,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Power,
  Network,
  Fuel,
  DollarSign,
} from "lucide-react"
import { useAuthenticWeb3 } from "@/hooks/use-authentic-web3"

export default function WalletConnection() {
  const {
    isConnected,
    account,
    network,
    balance,
    isConnecting,
    connectionError,
    gasPrice,
    blockNumber,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshBalance,
  } = useAuthenticWeb3()

  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshBalance = async () => {
    setIsRefreshing(true)
    try {
      await refreshBalance()
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleSwitchToSepolia = async () => {
    try {
      await switchNetwork(11155111) // Sepolia testnet
    } catch (error: any) {
      console.error("Failed to switch network:", error)
    }
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getNetworkStatusColor = () => {
    if (!network) return "bg-gray-50 text-gray-700 border-gray-200"
    if (!network.isSupported) return "bg-red-50 text-red-700 border-red-200"
    return "bg-green-50 text-green-700 border-green-200"
  }

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Wallet className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>Connect with MetaMask to access the blockchain voting system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectionError && (
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{connectionError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Secure blockchain authentication
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Encrypted vote storage
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Transparent and immutable
            </div>
          </div>

          <Button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4 mr-2" />
                Connect MetaMask
              </>
            )}
          </Button>

          <div className="text-center">
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center"
            >
              Don't have MetaMask? Install it here
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center">
              <Wallet className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Wallet Connected</CardTitle>
              <CardDescription>{account && truncateAddress(account)}</CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={disconnectWallet}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Power className="h-4 w-4 mr-1" />
            Disconnect
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Network Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Network</span>
              {network && !network.isSupported && (
                <Button variant="outline" size="sm" onClick={handleSwitchToSepolia} className="text-xs">
                  Switch to Sepolia
                </Button>
              )}
            </div>
            <Badge className={getNetworkStatusColor()}>
              <Network className="h-3 w-3 mr-1" />
              {network?.name || "Unknown"}
            </Badge>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700">Balance</span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <DollarSign className="h-3 w-3 mr-1" />
                {balance ? `${Number.parseFloat(balance).toFixed(4)} ETH` : "Loading..."}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshBalance}
                disabled={isRefreshing}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Network Info */}
        {network && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-600">Chain ID</div>
              <div className="font-semibold">{network.chainId}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Gas Price</div>
              <div className="font-semibold flex items-center justify-center">
                <Fuel className="h-3 w-3 mr-1" />
                {gasPrice ? `${Number.parseFloat(gasPrice).toFixed(1)} gwei` : "Loading..."}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Block Number</div>
              <div className="font-semibold">{blockNumber ? `#${blockNumber.toLocaleString()}` : "Loading..."}</div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {network && !network.isSupported && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Unsupported Network:</strong> Please switch to Ethereum Mainnet or Sepolia Testnet to use the
              voting system.
            </AlertDescription>
          </Alert>
        )}

        {connectionError && (
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{connectionError}</AlertDescription>
          </Alert>
        )}

        {/* Connection Status */}
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Connected to blockchain</span>
        </div>
      </CardContent>
    </Card>
  )
}
