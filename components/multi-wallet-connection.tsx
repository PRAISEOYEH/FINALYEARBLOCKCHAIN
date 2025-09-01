"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, CheckCircle, AlertTriangle, ExternalLink, Copy, RefreshCw, Shield, Zap, Globe } from "lucide-react"
import { useMultiWallet } from "@/hooks/use-multi-wallet"

export default function MultiWalletConnection() {
  const {
    isConnected,
    account,
    balance,
    networkName,
    explorerBaseUrl,
    walletType,
    connectWallet,
    disconnectWallet,
    switchToSupportedNetwork,
    isConnecting,
    error,
    needsNetworkSwitch,
  } = useMultiWallet()

  const [copiedAddress, setCopiedAddress] = useState(false)

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>Connect your blockchain wallet to participate in secure voting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-3">
            <Button
              onClick={() => connectWallet("metamask")}
              disabled={isConnecting}
              className="w-full justify-start bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isConnecting ? (
                <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
              ) : (
                <div className="w-5 h-5 mr-3 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-orange-500 font-bold text-xs">M</span>
                </div>
              )}
              MetaMask
            </Button>

            <Button
              onClick={() => connectWallet("walletconnect")}
              disabled={isConnecting}
              className="w-full justify-start bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isConnecting ? <RefreshCw className="h-5 w-5 mr-3 animate-spin" /> : <Globe className="h-5 w-5 mr-3" />}
              WalletConnect
            </Button>

            <Button
              onClick={() => connectWallet("coinbase")}
              disabled={isConnecting}
              className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isConnecting ? (
                <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
              ) : (
                <div className="w-5 h-5 mr-3 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xs">C</span>
                </div>
              )}
              Coinbase Wallet
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>Secure • Decentralized • Transparent</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="bg-gradient-to-r from-green-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          Wallet Connected
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {walletType}
          </Badge>
        </CardTitle>
        <CardDescription>Your wallet is securely connected to the voting system</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {needsNetworkSwitch && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="flex items-center justify-between">
                <span>Please switch to Base Sepolia</span>
                <Button size="sm" onClick={switchToSupportedNetwork} className="ml-2">
                  Switch Network
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Address</p>
              <p className="text-sm text-gray-600">{account ? formatAddress(account) : ""}</p>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={copyAddress} 
              disabled={!account}
              className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              {copiedAddress ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Balance</p>
              <p className="text-sm text-gray-600">{balance.nativeBalanceFormatted}</p>
            </div>
            <Zap className="h-4 w-4 text-yellow-500" />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Network</p>
              <p className="text-sm text-gray-600">{networkName}</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${needsNetworkSwitch ? "bg-yellow-500" : "bg-green-500"}`} />
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`${explorerBaseUrl}/address/${account}`, "_blank")}
            disabled={!account}
            className="flex-1 disabled:opacity-50"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Explorer
          </Button>
          <Button variant="outline" size="sm" onClick={disconnectWallet} className="flex-1 bg-transparent">
            Disconnect
          </Button>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <Shield className="h-3 w-3 mr-1" />
              Secure
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </div>
            <div className="flex items-center">
              <Zap className="h-3 w-3 mr-1" />
              Fast
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
