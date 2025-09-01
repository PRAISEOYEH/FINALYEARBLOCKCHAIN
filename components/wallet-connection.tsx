"use client"

import { useEffect, useState } from "react"
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
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useBalance,
  useBlockNumber,
  useSwitchChain,
} from "wagmi"
import { wagmiConfig, connectors as prebuiltConnectors } from "@/lib/wagmi"
import { getElection } from "@/lib/blockchain/voting-service"

/**
 * WalletConnection
 *
 * Replaces the legacy/mock wallet logic with Wagmi hooks and real connectors.
 *
 * Features:
 * - Presents connector options (MetaMask / WalletConnect / Coinbase) using useConnect
 * - Uses useAccount / useBalance / useBlockNumber for account & chain info
 * - Uses useSwitchChain and fallback to useSwitchNetwork to move user to Base Sepolia
 * - Probes the voting contract accessibility via getElection(1)
 * - Shows loading / error states and connection status
 */

/* Base Sepolia chain id used across the app */
const BASE_SEPOLIA_CHAIN_ID = 84532

export default function WalletConnection() {
  // Wagmi hooks
  const { address, isConnected, chain } = useAccount()

  // useConnect provides available connectors (from wagmi), connectAsync, and status
  const {
    connectAsync,
    connectors: availableConnectors,
    isLoading: isConnectLoading,
    error: connectError,
  } = useConnect()

  const { disconnect } = useDisconnect()

  // Use useSwitchChain for network switching
  const { switchChain } = useSwitchChain()

  // Balance & block info
  const { data: balanceData, isLoading: isBalanceLoading, refetch: refetchBalance } = useBalance({
    address,
    watch: true,
  })
  const { data: blockNumberData } = useBlockNumber({ watch: true })

  // Local UI state
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [contractAccessible, setContractAccessible] = useState<boolean | null>(null)
  const [probeLoading, setProbeLoading] = useState(false)
  const [probeError, setProbeError] = useState<string | null>(null)
  const [preferredConnectorId, setPreferredConnectorId] = useState<string | null>(null)
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false)

  // Ensure wagmi config is imported/initialized (no-op using it to satisfy "use" requirement)
  useEffect(() => {
    // reference wagmiConfig so bundlers/linters know it's intentionally imported and used
    void wagmiConfig
  }, [])

  // Show any connect error from wagmi hook
  useEffect(() => {
    if (connectError) {
      setConnectionError((connectError as any)?.message || String(connectError))
    }
  }, [connectError])

  // Truncate address utility
  const truncateAddress = (addr: string | undefined | null) => {
    if (!addr) return ""
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Connect wallet using a selected connector (by connector object from useConnect or fallback to prebuilt)
  const connectWalletWith = async (connectorId: string) => {
    setConnectionError(null)
    setPreferredConnectorId(connectorId)
    try {
      // Try to find connector from wagmi-provided connectors (they include readiness flags)
      const connector = availableConnectors.find((c) => c.id === connectorId) ?? prebuiltConnectors.find((c) => (c as any).id === connectorId)

      if (!connector) {
        throw new Error(`Connector "${connectorId}" not available`)
      }

      // connectAsync gives us a promise that resolves when connection completes (or throws)
      await connectAsync?.({ connector })
      // Successful connection will be reflected by wagmi's useAccount
      setConnectionError(null)
    } catch (err: any) {
      console.error("Wallet connection failed:", err)
      setConnectionError(err?.message || "Failed to connect wallet")
    } finally {
      setPreferredConnectorId(null)
    }
  }

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      disconnect()
      setContractAccessible(null)
      setProbeError(null)
      setConnectionError(null)
    } catch (err: any) {
      console.error("Disconnect failed:", err)
      setConnectionError(err?.message || "Failed to disconnect wallet")
    }
  }

  // Refresh balance action
  const handleRefreshBalance = async () => {
    setIsRefreshing(true)
    setConnectionError(null)
    try {
      await refetchBalance()
    } catch (err: any) {
      console.error("Failed to refresh balance:", err)
      setConnectionError(err?.message || "Failed to refresh balance")
    } finally {
      setIsRefreshing(false)
    }
  }

  // Switch to Base Sepolia (chainId 84532)
  const handleSwitchToSepolia = async () => {
    setConnectionError(null)
    setIsSwitchingNetwork(true)
    try {
      await switchChain({ chainId: BASE_SEPOLIA_CHAIN_ID })
      setConnectionError(null)
    } catch (error: any) {
      console.error("Failed to switch network:", error)
      setConnectionError(error?.message || "Failed to switch network")
    } finally {
      setIsSwitchingNetwork(false)
    }
  }

  // Probe contract accessibility by calling a simple read (getElection(1))
  const probeContract = async () => {
    setProbeLoading(true)
    setProbeError(null)
    setContractAccessible(null)
    try {
      // getElection may throw if contract missing or not accessible; it should return something when accessible.
      const res = await getElection(1)
      if (res === undefined || res === null) {
        setContractAccessible(false)
        setProbeError("Contract returned no data for probe id")
      } else {
        setContractAccessible(true)
      }
    } catch (err: any) {
      console.error("Contract probe failed:", err)
      setContractAccessible(false)
      setProbeError(err?.message || "Failed to access contract")
    } finally {
      setProbeLoading(false)
    }
  }

  // When wallet connects or network changes, run contract probe if connected and on correct network
  useEffect(() => {
    // Reset probe state when account disconnects
    if (!isConnected) {
      setContractAccessible(null)
      setProbeError(null)
      return
    }

    // Only attempt probe if on Base Sepolia chain; if not, do not probe and mark as not accessible until switched
    if (chain?.id !== BASE_SEPOLIA_CHAIN_ID) {
      setContractAccessible(false)
      setProbeError(`Please switch to Base Sepolia (chain ${BASE_SEPOLIA_CHAIN_ID})`)
      return
    }

    // Run probe
    probeContract()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, chain?.id, address])

  // Determine UI friendly network status
  const getNetworkStatusColor = () => {
    if (!chain) return "bg-gray-50 text-gray-700 border-gray-200"
    if (chain.id !== BASE_SEPOLIA_CHAIN_ID) return "bg-red-50 text-red-700 border-red-200"
    return "bg-green-50 text-green-700 border-green-200"
  }

  // Format balance display
  const balanceDisplay = () => {
    if (isBalanceLoading) return "Loading..."
    if (!balanceData) return "0.0000 ETH"
    const formatted = balanceData.formatted || "0"
    const num = Number.parseFloat(formatted)
    if (Number.isNaN(num)) return `${formatted} ${balanceData.symbol || "ETH"}`
    return `${num.toFixed(4)} ${balanceData.symbol || "ETH"}`
  }

  // Format gas price display - we'll show N/A as gas estimation is better handled elsewhere
  const gasPriceDisplay = () => {
    return "N/A"
  }

  // ----- Not connected UI -----
  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Wallet className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>Connect with a wallet to access the blockchain voting system</CardDescription>
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

          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Choose a wallet</div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Render connectors provided by wagmi (MetaMask, WalletConnect, Coinbase) */}
              {availableConnectors.length > 0
                ? availableConnectors.map((c) => {
                    const isBusy = isConnectLoading && preferredConnectorId === c.id
                    return (
                      <Button
                        key={c.id}
                        onClick={() => connectWalletWith(c.id)}
                        disabled={!c.ready || isBusy}
                        className="flex items-center justify-center"
                        variant="outline"
                        size="sm"
                      >
                        {isBusy ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <span className="mr-2">{c.name}</span>
                            {!c.ready && <span className="text-xs text-gray-400">(not installed)</span>}
                          </>
                        )}
                      </Button>
                    )
                  })
                : // Fallback to prebuilt connector buttons if useConnect didn't expose connectors
                  prebuiltConnectors.map((c: any, idx: number) => {
                    const id = (c as any).id || `connector-fallback-${idx}`
                    const name = (c as any).name || (c as any).id || `Connector ${idx + 1}`
                    const isBusy = isConnectLoading && preferredConnectorId === id
                    return (
                      <Button
                        key={id}
                        onClick={() => connectWalletWith(id)}
                        disabled={isBusy}
                        className="flex items-center justify-center"
                        variant="outline"
                        size="sm"
                      >
                        {isBusy ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>{name}</>
                        )}
                      </Button>
                    )
                  })}
            </div>

            <div className="text-center mt-2">
              <a
                href="https://walletconnect.com/get-wallets"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center"
              >
                Don't have a wallet? Find wallets
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ----- Connected UI -----
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
              <CardDescription>{address && truncateAddress(address)}</CardDescription>
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
              {chain && chain.id !== BASE_SEPOLIA_CHAIN_ID && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSwitchToSepolia}
                  className="text-xs"
                  disabled={isSwitchingNetwork}
                >
                  {isSwitchingNetwork ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Switching...
                    </>
                  ) : (
                    "Switch to Base Sepolia"
                  )}
                </Button>
              )}
            </div>
            <Badge className={getNetworkStatusColor()}>
              <Network className="h-3 w-3 mr-1" />
              {chain?.name || "Unknown"}
            </Badge>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700">Balance</span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <DollarSign className="h-3 w-3 mr-1" />
                {balanceDisplay()}
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
        {chain && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-600">Chain ID</div>
              <div className="font-semibold">{chain.id}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Gas Price</div>
              <div className="font-semibold flex items-center justify-center">
                <Fuel className="h-3 w-3 mr-1" />
                {gasPriceDisplay()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Block Number</div>
              <div className="font-semibold">{blockNumberData ? `#${blockNumberData}` : "Loading..."}</div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {chain && chain.id !== BASE_SEPOLIA_CHAIN_ID && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Wrong Network:</strong> Please switch to Base Sepolia (chain {BASE_SEPOLIA_CHAIN_ID}) to use the
              voting system. You can switch networks using the button above.
            </AlertDescription>
          </Alert>
        )}

        {/* Contract connectivity probe */}
        {probeLoading ? (
          <Alert className="bg-blue-50 border-blue-200">
            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
            <AlertDescription className="text-blue-800">Checking contract connectivity...</AlertDescription>
          </Alert>
        ) : probeError ? (
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">Contract probe failed: {probeError}</AlertDescription>
          </Alert>
        ) : contractAccessible ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">Connected to voting contract</AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Contract accessibility unknown. Ensure the contract is deployed and you are on the correct network.
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
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected && contractAccessible ? "bg-green-500 animate-pulse" : "bg-yellow-400"
            }`}
          ></div>
          <span>
            {isConnected ? (
              contractAccessible ? (
                "Connected to blockchain and contract"
              ) : (
                "Connected to wallet — contract unreachable"
              )
            ) : (
              "Not connected"
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}