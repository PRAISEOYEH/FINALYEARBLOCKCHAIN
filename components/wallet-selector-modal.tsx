"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, Download, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import { useMultiWallet, type WalletType } from "@/hooks/use-multi-wallet"

export default function WalletSelectorModal() {
  const {
    showWalletModal,
    closeWalletModal,
    availableWallets,
    detectedWallets,
    connectWallet,
    isConnecting,
    connectionError,
  } = useMultiWallet()

  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null)

  const handleWalletSelect = async (walletType: WalletType) => {
    setSelectedWallet(walletType)
    try {
      await connectWallet(walletType)
    } catch (error) {
      console.error("Wallet connection failed:", error)
    } finally {
      setSelectedWallet(null)
    }
  }

  const getWalletIcon = (walletName: WalletType) => {
    const wallet = availableWallets.find((w) => w.name === walletName)
    return wallet?.icon || "🔗"
  }

  const getWalletDescription = (walletName: WalletType) => {
    switch (walletName) {
      case "MetaMask":
        return "Most popular Ethereum wallet with browser extension"
      case "Coinbase":
        return "User-friendly wallet by Coinbase exchange"
      case "Phantom":
        return "Multi-chain wallet supporting Ethereum and Solana"
      case "WalletConnect":
        return "Connect with 300+ wallets via QR code"
      default:
        return "Secure blockchain wallet"
    }
  }

  return (
    <Dialog open={showWalletModal} onOpenChange={closeWalletModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <span className="text-2xl mr-2">🔗</span>
            Connect Wallet
          </DialogTitle>
          <DialogDescription>Choose your preferred wallet to connect to BlockVote Pro</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {connectionError && (
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{connectionError}</AlertDescription>
            </Alert>
          )}

          {/* Detected Wallets */}
          {detectedWallets.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Detected Wallets</h4>
              {detectedWallets.map((wallet) => (
                <Button
                  key={wallet.name}
                  variant="outline"
                  className="w-full h-auto p-4 justify-start hover:bg-blue-50 hover:border-blue-200"
                  onClick={() => handleWalletSelect(wallet.name)}
                  disabled={isConnecting || !wallet.isInstalled}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="text-2xl">{wallet.icon}</div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{wallet.name}</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Installed
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{getWalletDescription(wallet.name)}</p>
                    </div>
                    {isConnecting && selectedWallet === wallet.name && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                </Button>
              ))}
            </div>
          )}

          {/* Not Installed Wallets */}
          {availableWallets.filter((w) => !w.isInstalled).length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Available Wallets</h4>
              {availableWallets
                .filter((wallet) => !wallet.isInstalled)
                .map((wallet) => (
                  <div
                    key={wallet.name}
                    className="w-full p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="text-2xl opacity-50">{wallet.icon}</div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-700">{wallet.name}</span>
                          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300">
                            <Download className="h-3 w-3 mr-1" />
                            Not Installed
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{getWalletDescription(wallet.name)}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(wallet.downloadUrl, "_blank")}
                        className="shrink-0"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Install
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* No Wallets Detected */}
          {detectedWallets.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Wallets Detected</h3>
              <p className="text-gray-600 mb-4">Install a wallet to connect to BlockVote Pro</p>
              <div className="space-y-2">
                {availableWallets.slice(0, 3).map((wallet) => (
                  <Button
                    key={wallet.name}
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(wallet.downloadUrl, "_blank")}
                    className="w-full"
                  >
                    <span className="mr-2">{wallet.icon}</span>
                    Install {wallet.name}
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Secure Connection</p>
                <p>Your wallet connection is encrypted and secure. We never store your private keys.</p>
              </div>
            </div>
          </div>

          {/* Cancel Button */}
          <Button variant="outline" onClick={closeWalletModal} className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
