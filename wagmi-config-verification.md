# Wagmi Configuration Verification Guide

This document provides comprehensive verification steps to ensure the wagmi configuration in `lib/wagmi.ts` is properly set up for Base Sepolia network integration.

## Overview

The wagmi configuration is the foundation of Web3 connectivity in this blockchain voting application. It must be properly configured to connect to Base Sepolia network (Chain ID: 84532) and support all required blockchain operations.

## Configuration Structure Verification

### 1. Base Configuration Check

**File:** `lib/wagmi.ts`

Verify the following configuration elements:

```typescript
// Expected configuration structure
import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org";

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(rpcUrl),
  },
});
```

**Verification Steps:**

1. **Chain Configuration**
   - ✅ Confirm `baseSepolia` is imported from `wagmi/chains`
   - ✅ Verify `chains` array contains only `[baseSepolia]`
   - ✅ Check that `baseSepolia.id` equals `84532`

2. **RPC URL Configuration**
   - ✅ Verify environment variable `NEXT_PUBLIC_RPC_URL` is read
   - ✅ Confirm fallback URL is `https://sepolia.base.org`
   - ✅ Ensure RPC URL is properly passed to `http()` transport

3. **Transport Configuration**
   - ✅ Verify transport uses `http(rpcUrl)` for Base Sepolia
   - ✅ Confirm transport key matches `baseSepolia.id` (84532)

## Environment Variable Verification

### 1. RPC URL Environment Setup

**Check `.env.local` or environment variables:**

```bash
# Verify this variable exists (optional but recommended)
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
```

**Verification Commands:**

```bash
# Check if environment variable is set
echo $NEXT_PUBLIC_RPC_URL

# Or in Node.js console
console.log(process.env.NEXT_PUBLIC_RPC_URL)
```

**Expected Behavior:**
- If `NEXT_PUBLIC_RPC_URL` is set: Use custom RPC endpoint
- If not set: Fall back to `https://sepolia.base.org`

### 2. RPC Endpoint Validation

**Test RPC connectivity:**

```bash
# Test RPC endpoint response
curl -X POST https://sepolia.base.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Expected response should include chainId: "0x14a3a" (84532 in hex)
```

## Provider Integration Verification

### 1. Layout.tsx Integration Check

**File:** `app/layout.tsx`

Verify proper provider setup:

```typescript
// Expected provider hierarchy
<WagmiProvider config={wagmiConfig}>
  <MultiWalletProvider>
    <UniversityVotingProvider>
      {children}
    </UniversityVotingProvider>
  </MultiWalletProvider>
</WagmiProvider>
```

**Verification Steps:**

1. ✅ Confirm `wagmiConfig` is imported from `@/lib/wagmi`
2. ✅ Verify `WagmiProvider` wraps all other providers
3. ✅ Check that `config={wagmiConfig}` prop is passed correctly
4. ✅ Ensure provider hierarchy is maintained

### 2. Provider Initialization Test

**Browser Console Verification:**

```javascript
// Open browser dev tools and check
console.log('Wagmi Config:', window.__WAGMI_CONFIG__);

// Check if providers are initialized
console.log('React Context:', React.useContext);
```

## Wagmi Hooks Compatibility Verification

### 1. Required Hooks Testing

The configuration must support these hooks used in `components/wallet-connection.tsx`:

**Account Management Hooks:**
- `useAccount()` - Get connected wallet address
- `useConnect()` - Connect wallet functionality
- `useDisconnect()` - Disconnect wallet functionality

**Network Management Hooks:**
- `useNetwork()` - Get current network information
- `useSwitchNetwork()` - Switch between networks

**Blockchain Data Hooks:**
- `useBalance()` - Get wallet balance
- `useBlockNumber()` - Get current block number

### 2. Hook Functionality Tests

**Test in Browser Console:**

```javascript
// Test useAccount hook
const { address, isConnected } = useAccount();
console.log('Address:', address, 'Connected:', isConnected);

// Test useNetwork hook
const { chain } = useNetwork();
console.log('Current Chain:', chain?.id, 'Name:', chain?.name);

// Test useBalance hook
const { data: balance } = useBalance({ address });
console.log('Balance:', balance?.formatted, balance?.symbol);
```

### 3. Network Switching Verification

**Test Base Sepolia Network Switch:**

```javascript
// Test network switching to Base Sepolia (84532)
const { switchNetwork } = useSwitchNetwork();
switchNetwork?.(84532);

// Verify chain ID after switch
const { chain } = useNetwork();
console.log('Chain ID after switch:', chain?.id); // Should be 84532
```

## Contract Integration Verification

### 1. Contract Address Resolution

**Verify contract accessibility through wagmi:**

```javascript
// Test contract connection
import { getElection } from '@/lib/blockchain/voting-service';

// This should work if wagmi config is correct
getElection(1).then(result => {
  console.log('Contract accessible:', !!result);
}).catch(error => {
  console.error('Contract access failed:', error);
});
```

### 2. Read Operations Test

**Test contract read operations:**

```javascript
// Test various read operations
const testContractReads = async () => {
  try {
    // Test basic contract read
    const election = await getElection(1);
    console.log('✅ getElection works:', !!election);
    
    // Test other read operations if available
    const candidate = await getCandidate(1, 1);
    console.log('✅ getCandidate works:', !!candidate);
    
    const hasVoted = await hasVoted(1, address);
    console.log('✅ hasVoted works:', typeof hasVoted === 'boolean');
    
  } catch (error) {
    console.error('❌ Contract read failed:', error);
  }
};
```

### 3. Write Operations Preparation

**Verify write operation setup:**

```javascript
// Test wallet client availability for write operations
import { getWalletClient } from 'wagmi/actions';

const testWriteSetup = async () => {
  try {
    const walletClient = await getWalletClient();
    console.log('✅ Wallet client available:', !!walletClient);
    console.log('✅ Chain ID:', walletClient?.chain?.id);
  } catch (error) {
    console.error('❌ Wallet client setup failed:', error);
  }
};
```

## Troubleshooting Guide

### 1. RPC Connection Issues

**Problem:** Cannot connect to Base Sepolia RPC

**Solutions:**
```bash
# Test different RPC endpoints
NEXT_PUBLIC_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_RPC_URL=https://base-sepolia.infura.io/v3/YOUR_KEY
```

**Verification:**
```javascript
// Test RPC connectivity
fetch('https://sepolia.base.org', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'eth_chainId',
    params: [],
    id: 1
  })
}).then(res => res.json()).then(console.log);
```

### 2. Chain Configuration Problems

**Problem:** Wrong chain ID or network mismatch

**Solutions:**
1. Verify Base Sepolia chain ID is 84532
2. Check wagmi/chains import
3. Ensure transport configuration matches chain

**Debug Commands:**
```javascript
// Check chain configuration
import { baseSepolia } from 'wagmi/chains';
console.log('Base Sepolia Config:', {
  id: baseSepolia.id, // Should be 84532
  name: baseSepolia.name,
  rpcUrls: baseSepolia.rpcUrls
});
```

### 3. Provider Initialization Errors

**Problem:** Wagmi provider not initializing

**Solutions:**
1. Check provider hierarchy in layout.tsx
2. Verify wagmiConfig import path
3. Ensure all required dependencies are installed

**Debug Steps:**
```javascript
// Check if wagmi is properly initialized
console.log('Wagmi Config:', wagmiConfig);
console.log('Chains:', wagmiConfig.chains);
console.log('Transports:', wagmiConfig.transports);
```

### 4. Hook Execution Errors

**Problem:** Wagmi hooks throwing errors

**Common Issues:**
- Using hooks outside WagmiProvider
- Incorrect provider hierarchy
- Missing chain configuration

**Solutions:**
```typescript
// Ensure hooks are used within provider
function MyComponent() {
  // This will work
  const { address } = useAccount();
  
  return <div>{address}</div>;
}

// Wrap component properly
<WagmiProvider config={wagmiConfig}>
  <MyComponent />
</WagmiProvider>
```

### 5. Contract Connection Failures

**Problem:** Cannot connect to deployed contract

**Diagnostic Steps:**
1. Verify contract address in `deployed-addresses.json`
2. Check ABI compatibility
3. Confirm network matches deployment

**Debug Contract Access:**
```javascript
// Test contract accessibility
const testContract = async () => {
  try {
    // Check if contract exists at address
    const code = await getPublicClient().getBytecode({
      address: '0x1234567890abcdef1234567890abcdef12345678'
    });
    console.log('Contract exists:', !!code && code !== '0x');
  } catch (error) {
    console.error('Contract check failed:', error);
  }
};
```

## Verification Checklist

### Pre-Development Checks
- [ ] `lib/wagmi.ts` exists and exports `wagmiConfig`
- [ ] Base Sepolia chain is properly imported
- [ ] RPC URL configuration is correct
- [ ] Transport configuration matches chain ID 84532

### Runtime Checks
- [ ] WagmiProvider initializes without errors
- [ ] All required hooks are functional
- [ ] Network switching works to Base Sepolia
- [ ] Contract read operations succeed
- [ ] Wallet connection/disconnection works

### Integration Checks
- [ ] Provider hierarchy is correct in layout.tsx
- [ ] Environment variables are properly read
- [ ] Contract accessibility probe succeeds
- [ ] Balance and block number updates work

## Success Indicators

**Configuration is working correctly when:**

1. ✅ Wallet connects successfully to Base Sepolia
2. ✅ Network switching to chain ID 84532 works
3. ✅ Contract read operations return data
4. ✅ Balance displays correctly
5. ✅ Block number updates in real-time
6. ✅ No console errors related to wagmi
7. ✅ All provider contexts are available

**Final Verification Command:**

```javascript
// Run this in browser console for complete verification
const verifyWagmiConfig = async () => {
  console.log('🔍 Wagmi Configuration Verification');
  console.log('=====================================');
  
  // Check config
  console.log('✅ Config loaded:', !!wagmiConfig);
  console.log('✅ Chain ID:', wagmiConfig.chains[0]?.id);
  
  // Check hooks
  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();
  
  console.log('✅ Wallet connected:', isConnected);
  console.log('✅ Current chain:', chain?.id);
  console.log('✅ On Base Sepolia:', chain?.id === 84532);
  
  // Check contract
  try {
    const election = await getElection(1);
    console.log('✅ Contract accessible:', !!election);
  } catch (error) {
    console.log('❌ Contract error:', error.message);
  }
  
  console.log('=====================================');
  console.log('🎉 Verification complete!');
};

verifyWagmiConfig();
```

This verification ensures your wagmi configuration is properly set up for the blockchain voting application on Base Sepolia network.