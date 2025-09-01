# Blockchain Integration Validation Guide

This document provides comprehensive validation steps to ensure the `lib/blockchain/voting-service.ts` properly connects to the deployed UniversityVoting contract on Base Sepolia network.

## Prerequisites

- Next.js development server running (`npm run dev`)
- MetaMask or compatible wallet installed
- Base Sepolia network configured in wallet
- Test ETH on Base Sepolia for transaction testing

## 1. Contract Address Validation

### 1.1 Verify Deployed Address Configuration

**Test Steps:**
1. Open browser developer console
2. Navigate to the application
3. Execute the following validation:

```javascript
// Test getAddressForNetwork function
import { baseSepolia } from 'wagmi/chains';

// Verify Base Sepolia chain ID
console.log('Base Sepolia Chain ID:', baseSepolia.id); // Should be 84532

// Test address retrieval
const addresses = require('./lib/contracts/deployed-addresses.json');
console.log('Deployed addresses:', addresses);

// Verify Base Sepolia address
const baseSepoliaAddress = addresses.baseSepolia?.UniversityVoting;
console.log('Base Sepolia Contract Address:', baseSepoliaAddress);
```

**Expected Results:**
- Base Sepolia chain ID: `84532`
- Contract address: `0x1234567890abcdef1234567890abcdef12345678`
- Deployment timestamp should be present

### 1.2 Test getAddressForNetwork Function

**Test Steps:**
1. In browser console, test the address resolution:

```javascript
// Import the function (adjust path as needed)
import { getAddressForNetwork } from './lib/blockchain/voting-service';

// Test Base Sepolia address retrieval
try {
  const address = getAddressForNetwork(84532);
  console.log('Retrieved address:', address);
  console.log('Address matches expected:', address === '0x1234567890abcdef1234567890abcdef12345678');
} catch (error) {
  console.error('Address retrieval failed:', error);
}

// Test localhost fallback
try {
  const localhostAddress = getAddressForNetwork(31337);
  console.log('Localhost address:', localhostAddress);
} catch (error) {
  console.error('Localhost address error:', error);
}
```

**Expected Results:**
- Base Sepolia address should return: `0x1234567890abcdef1234567890abcdef12345678`
- Function should handle different chain IDs correctly
- Error should be thrown for unsupported networks

## 2. Contract Initialization Validation

### 2.1 Verify UniversityVotingContract Function

**Test Steps:**
1. Test contract initialization:

```javascript
import { UniversityVotingContract } from './lib/blockchain/voting-service';
import { baseSepolia } from 'wagmi/chains';

// Test contract initialization
const contract = UniversityVotingContract(baseSepolia.id);
console.log('Contract configuration:', contract);

// Verify address and ABI
console.log('Contract address:', contract.address);
console.log('ABI length:', contract.abi.length);
console.log('ABI functions:', contract.abi.filter(item => item.type === 'function').map(f => f.name));
```

**Expected Results:**
- Contract address: `0x1234567890abcdef1234567890abcdef12345678`
- ABI should contain all expected functions: `createElection`, `addCandidate`, `verifyCandidate`, `castVote`, `getElection`, `getCandidate`, `hasVoted`, etc.
- ABI should include events: `ElectionCreated`, `CandidateAdded`, `VoteCast`, etc.

### 2.2 Validate ABI Compatibility

**Test Steps:**
1. Check ABI structure:

```javascript
import { UniversityVotingABI } from './lib/abi/UniversityVoting';

// Verify key functions exist
const requiredFunctions = [
  'createElection',
  'addCandidate', 
  'verifyCandidate',
  'castVote',
  'getElection',
  'getCandidate',
  'hasVoted',
  'whitelistVoter'
];

const availableFunctions = UniversityVotingABI
  .filter(item => item.type === 'function')
  .map(f => f.name);

console.log('Available functions:', availableFunctions);
console.log('Missing functions:', requiredFunctions.filter(f => !availableFunctions.includes(f)));

// Verify events
const requiredEvents = ['ElectionCreated', 'CandidateAdded', 'VoteCast', 'CandidateVerified'];
const availableEvents = UniversityVotingABI
  .filter(item => item.type === 'event')
  .map(e => e.name);

console.log('Available events:', availableEvents);
console.log('Missing events:', requiredEvents.filter(e => !availableEvents.includes(e)));
```

**Expected Results:**
- All required functions should be present
- All required events should be present
- No missing functions or events

## 3. Read Operations Validation

### 3.1 Test getElection Function

**Test Steps:**
1. Test election data retrieval:

```javascript
import { getElection } from './lib/blockchain/voting-service';
import { baseSepolia } from 'wagmi/chains';

// Test getting election data
async function testGetElection() {
  try {
    // Test with election ID 1 (adjust based on your test data)
    const election = await getElection(baseSepolia.id, 1n);
    console.log('Election data:', election);
    
    // Verify structure
    console.log('Title:', election[0]);
    console.log('Description:', election[1]);
    console.log('Start Time:', election[2]);
    console.log('End Time:', election[3]);
    console.log('Position IDs:', election[4]);
    console.log('Candidate IDs:', election[5]);
  } catch (error) {
    console.error('getElection failed:', error);
    
    // Check if it's a "call revert" error (election doesn't exist)
    if (error.message.includes('call revert')) {
      console.log('Election ID 1 does not exist - this is expected if no elections created yet');
    }
  }
}

testGetElection();
```

**Expected Results:**
- If election exists: Should return election data with proper structure
- If election doesn't exist: Should throw revert error (expected behavior)
- Function should handle BigInt parameters correctly

### 3.2 Test getCandidate Function

**Test Steps:**
1. Test candidate data retrieval:

```javascript
import { getCandidate } from './lib/blockchain/voting-service';
import { baseSepolia } from 'wagmi/chains';

async function testGetCandidate() {
  try {
    // Test with election ID 1, candidate ID 1
    const candidate = await getCandidate(baseSepolia.id, 1n, 1n);
    console.log('Candidate data:', candidate);
    
    // Verify structure
    console.log('ID:', candidate[0]);
    console.log('Student Wallet:', candidate[1]);
    console.log('Name:', candidate[2]);
    console.log('Position ID:', candidate[3]);
    console.log('Vote Count:', candidate[4]);
    console.log('Verified:', candidate[5]);
  } catch (error) {
    console.error('getCandidate failed:', error);
    
    if (error.message.includes('call revert')) {
      console.log('Candidate does not exist - expected if no candidates added yet');
    }
  }
}

testGetCandidate();
```

**Expected Results:**
- If candidate exists: Should return candidate data with proper structure
- If candidate doesn't exist: Should throw revert error
- Function should handle multiple BigInt parameters correctly

### 3.3 Test hasVoted Function

**Test Steps:**
1. Test voting status check:

```javascript
import { hasVoted } from './lib/blockchain/voting-service';
import { baseSepolia } from 'wagmi/chains';
import { useAccount } from 'wagmi';

async function testHasVoted() {
  // Get current wallet address
  const { address } = useAccount();
  
  if (!address) {
    console.error('Wallet not connected');
    return;
  }
  
  try {
    // Test voting status for current user
    const voted = await hasVoted(baseSepolia.id, address, 1n, 1n);
    console.log('Has voted:', voted);
    console.log('Return type:', typeof voted);
  } catch (error) {
    console.error('hasVoted failed:', error);
  }
}

testHasVoted();
```

**Expected Results:**
- Should return boolean value
- Should handle address parameter correctly
- Should work even if election/position doesn't exist (return false)

## 4. Wagmi Client Validation

### 4.1 Test getPublicClient Function

**Test Steps:**
1. Validate public client configuration:

```javascript
import { getPublicClient } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';

async function testPublicClient() {
  try {
    const publicClient = getPublicClient({ chainId: baseSepolia.id });
    console.log('Public client:', publicClient);
    
    // Test basic functionality
    const blockNumber = await publicClient.getBlockNumber();
    console.log('Current block number:', blockNumber);
    
    // Test chain ID
    const chainId = await publicClient.getChainId();
    console.log('Chain ID:', chainId);
    console.log('Matches Base Sepolia:', chainId === baseSepolia.id);
    
  } catch (error) {
    console.error('Public client test failed:', error);
  }
}

testPublicClient();
```

**Expected Results:**
- Public client should be created successfully
- Block number should be retrieved
- Chain ID should match Base Sepolia (84532)

### 4.2 Test getWalletClient Function

**Test Steps:**
1. Validate wallet client (requires connected wallet):

```javascript
import { getWalletClient } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';

async function testWalletClient() {
  try {
    const walletClient = await getWalletClient({ chainId: baseSepolia.id });
    console.log('Wallet client:', walletClient);
    
    if (walletClient) {
      console.log('Account:', walletClient.account);
      console.log('Chain ID:', walletClient.chain.id);
      console.log('Transport:', walletClient.transport);
    } else {
      console.log('No wallet client available - wallet may not be connected');
    }
    
  } catch (error) {
    console.error('Wallet client test failed:', error);
  }
}

testWalletClient();
```

**Expected Results:**
- If wallet connected: Should return wallet client with account info
- If wallet not connected: Should return null or undefined
- Chain ID should match Base Sepolia when connected

## 5. Event Watching Validation

### 5.1 Test onVoteCast Function

**Test Steps:**
1. Set up event watching:

```javascript
import { onVoteCast } from './lib/blockchain/voting-service';
import { baseSepolia } from 'wagmi/chains';

function testEventWatching() {
  try {
    console.log('Setting up VoteCast event watching...');
    
    const unwatch = onVoteCast(baseSepolia.id, (log) => {
      console.log('VoteCast event received:', log);
      console.log('Election ID:', log.args.electionId);
      console.log('Position ID:', log.args.positionId);
      console.log('Candidate ID:', log.args.candidateId);
      console.log('Voter:', log.args.voter);
    });
    
    console.log('Event watching started. Unwatch function:', typeof unwatch);
    
    // Stop watching after 30 seconds for testing
    setTimeout(() => {
      unwatch();
      console.log('Event watching stopped');
    }, 30000);
    
  } catch (error) {
    console.error('Event watching setup failed:', error);
  }
}

testEventWatching();
```

**Expected Results:**
- Event watching should start without errors
- Should return unwatch function
- Should receive events when votes are cast (if any occur during test)

## 6. Write Operations Configuration Validation

### 6.1 Test Write Operation Setup (Without Execution)

**Test Steps:**
1. Validate write operation configuration:

```javascript
import { createElection, addCandidate, castVote } from './lib/blockchain/voting-service';
import { getWalletClient } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';

async function testWriteOperationSetup() {
  try {
    const walletClient = await getWalletClient({ chainId: baseSepolia.id });
    
    if (!walletClient) {
      console.log('Wallet not connected - cannot test write operations');
      return;
    }
    
    console.log('Wallet client available for write operations');
    console.log('Account:', walletClient.account.address);
    
    // Test function signatures (don't execute)
    console.log('createElection function:', typeof createElection);
    console.log('addCandidate function:', typeof addCandidate);
    console.log('castVote function:', typeof castVote);
    
    // Verify wallet client has writeContract method
    console.log('writeContract method available:', typeof walletClient.writeContract);
    
  } catch (error) {
    console.error('Write operation setup test failed:', error);
  }
}

testWriteOperationSetup();
```

**Expected Results:**
- All write functions should be available
- Wallet client should have writeContract method
- Account address should be available when connected

## 7. Troubleshooting Guide

### 7.1 Contract Connection Issues

**Problem:** Cannot connect to contract
**Solutions:**
1. Verify contract address in `deployed-addresses.json`
2. Check Base Sepolia network configuration
3. Ensure RPC URL is accessible
4. Verify contract is deployed at the specified address

**Diagnostic Commands:**
```javascript
// Check contract bytecode
const publicClient = getPublicClient({ chainId: baseSepolia.id });
const bytecode = await publicClient.getBytecode({ 
  address: '0x1234567890abcdef1234567890abcdef12345678' 
});
console.log('Contract bytecode exists:', bytecode !== '0x');
```

### 7.2 ABI Mismatch Issues

**Problem:** Function calls fail with "function not found" errors
**Solutions:**
1. Regenerate ABI using `npm run compile`
2. Verify ABI matches deployed contract
3. Check function names and parameter types

**Diagnostic Commands:**
```javascript
// Compare ABI functions with contract
import { UniversityVotingABI } from './lib/abi/UniversityVoting';
console.log('ABI functions:', UniversityVotingABI.filter(item => item.type === 'function').map(f => f.name));
```

### 7.3 Network Configuration Problems

**Problem:** Wrong network or RPC issues
**Solutions:**
1. Verify Base Sepolia chain ID (84532)
2. Check RPC URL in environment variables
3. Test RPC connectivity
4. Switch wallet to Base Sepolia network

**Diagnostic Commands:**
```javascript
// Test RPC connectivity
const publicClient = getPublicClient({ chainId: baseSepolia.id });
try {
  const blockNumber = await publicClient.getBlockNumber();
  console.log('RPC working, block number:', blockNumber);
} catch (error) {
  console.error('RPC connection failed:', error);
}
```

### 7.4 Transaction Failures

**Problem:** Write operations fail or revert
**Solutions:**
1. Check wallet has sufficient ETH for gas
2. Verify function parameters are correct
3. Ensure wallet is connected to Base Sepolia
4. Check contract state requirements

**Diagnostic Commands:**
```javascript
// Check wallet balance
import { useBalance } from 'wagmi';
const { data: balance } = useBalance();
console.log('Wallet balance:', balance);

// Check gas estimation
const publicClient = getPublicClient({ chainId: baseSepolia.id });
const gasEstimate = await publicClient.estimateContractGas({
  address: '0x1234567890abcdef1234567890abcdef12345678',
  abi: UniversityVotingABI,
  functionName: 'getElection',
  args: [1n]
});
console.log('Gas estimate:', gasEstimate);
```

## 8. Validation Checklist

- [ ] Contract address correctly configured for Base Sepolia
- [ ] `getAddressForNetwork` returns correct address
- [ ] `UniversityVotingContract` initializes with correct address and ABI
- [ ] `getElection` function works (returns data or expected revert)
- [ ] `getCandidate` function works (returns data or expected revert)
- [ ] `hasVoted` function returns boolean values
- [ ] `getPublicClient` connects to Base Sepolia successfully
- [ ] `getWalletClient` works when wallet is connected
- [ ] `onVoteCast` event watching can be set up
- [ ] Write operations are properly configured
- [ ] All troubleshooting steps documented and tested

## 9. Success Criteria

The blockchain integration is considered validated when:

1. All read operations work without connection errors
2. Contract address resolution works correctly
3. ABI functions match deployed contract
4. Wagmi clients connect to Base Sepolia successfully
5. Event watching can be established
6. Write operations are properly configured (even if not executed)
7. Error handling works as expected for non-existent data

This validation ensures the voting service is ready for full application testing and deployment.