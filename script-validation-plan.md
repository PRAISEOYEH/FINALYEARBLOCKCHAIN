# Script Validation and Testing Plan

## Overview
This document outlines the comprehensive testing plan for validating all updated scripts and ensuring the university voting blockchain system works correctly with the fixed dependencies.

## Phase 1: Script Testing Sequence

### 1.1 Test fix-hardhat-version.bat
**Objective**: Verify dependency installation works correctly
**Commands**:
```bash
# Run the fix script
fix-hardhat-version.bat

# Verify Hardhat installation
npx hardhat --version
# Expected: Hardhat 2.26.3

# Check ethers version
npm list ethers
# Expected: ethers@5.8.0
```

**Validation Criteria**:
- ✅ Hardhat 2.26.3 installed locally
- ✅ ethers v5.8.0 installed and compatible
- ✅ No dependency conflicts
- ✅ All Hardhat plugins available

### 1.2 Test Contract Compilation
**Objective**: Verify contracts compile successfully
**Commands**:
```bash
# Test compilation
npm run hh:compile

# Verify artifacts generated
ls artifacts/contracts/
# Expected: UniversityVoting.sol and Voting.sol artifacts
```

**Validation Criteria**:
- ✅ UniversityVoting.sol compiles without errors
- ✅ Voting.sol compiles without errors
- ✅ ABI files generated in artifacts/
- ✅ Bytecode files generated
- ✅ No compilation warnings

### 1.3 Test ABI Generation
**Objective**: Verify TypeScript ABI files are generated
**Commands**:
```bash
# Generate ABI files
npm run generate:abi

# Verify TypeScript files created
ls lib/abi/
# Expected: UniversityVoting.ts and Voting.ts
```

**Validation Criteria**:
- ✅ TypeScript ABI files generated
- ✅ Correct contract addresses included
- ✅ Type definitions match contract interfaces
- ✅ No TypeScript compilation errors

### 1.4 Test Development Server
**Objective**: Verify Next.js development server starts
**Commands**:
```bash
# Start development server
npm run dev

# Check server response
curl http://localhost:3000
# Expected: 200 OK response
```

**Validation Criteria**:
- ✅ Development server starts without errors
- ✅ No port conflicts
- ✅ Hot reloading works
- ✅ Build process completes successfully

### 1.5 Test Deployment Scripts
**Objective**: Verify deployment to Base Sepolia works
**Commands**:
```bash
# Test deployment (dry run)
npm run hh:deploy:baseSepolia --dry-run

# Verify deployment configuration
cat hardhat.config.js | grep baseSepolia
# Expected: Base Sepolia network configuration
```

**Validation Criteria**:
- ✅ Deployment script executes without errors
- ✅ Correct network configuration
- ✅ Gas estimation works
- ✅ Contract addresses generated

## Phase 2: Dependency Verification

### 2.1 Hardhat Version Verification
**Test**: Verify Hardhat 2.26.3 installation
```bash
npx hardhat --version
# Expected: 2.26.3
```

### 2.2 Ethers Compatibility
**Test**: Verify ethers v5.8.0 compatibility
```bash
npm list ethers
# Expected: ethers@5.8.0

# Test ethers import
node -e "const { ethers } = require('ethers'); console.log('Ethers loaded successfully')"
```

### 2.3 Hardhat Plugin Verification
**Test**: Verify all required plugins are available
```bash
# Check hardhat.config.js for plugins
grep -E "require|import" hardhat.config.js
# Expected: @nomicfoundation/hardhat-toolbox, @nomicfoundation/hardhat-verify
```

### 2.4 Wagmi and Viem Integration
**Test**: Verify frontend blockchain integration
```bash
# Check wagmi configuration
cat lib/wagmi.ts
# Expected: Proper wagmi configuration with Base Sepolia

# Test viem imports
node -e "const { createPublicClient, http } = require('viem'); console.log('Viem loaded successfully')"
```

## Phase 3: Contract Compilation Testing

### 3.1 UniversityVoting.sol Compilation
**Test**: Verify main contract compilation
```bash
npx hardhat compile --force
# Check for UniversityVoting.sol artifacts
ls artifacts/contracts/UniversityVoting.sol/
# Expected: UniversityVoting.json with ABI and bytecode
```

### 3.2 ABI Generation Validation
**Test**: Verify ABI generation creates correct TypeScript files
```bash
npm run generate:abi
# Check generated files
cat lib/abi/UniversityVoting.ts
# Expected: Proper TypeScript interface with contract methods
```

### 3.3 Artifact Directory Structure
**Test**: Verify artifact generation structure
```bash
tree artifacts/contracts/
# Expected: Proper directory structure with JSON artifacts
```

### 3.4 Contract Deployment Addresses
**Test**: Verify deployed contract addresses
```bash
cat lib/contracts/deployed-addresses.json
# Expected: Valid contract addresses for Base Sepolia
```

## Phase 4: Development Server Testing

### 4.1 Next.js Server Startup
**Test**: Verify development server functionality
```bash
npm run dev
# Check server logs for errors
# Expected: No compilation errors, server starts on port 3000
```

### 4.2 Wallet Connection Testing
**Test**: Verify wallet integration in browser
```javascript
// In browser console
window.ethereum
// Expected: MetaMask provider available
```

### 4.3 Blockchain Integration Hooks
**Test**: Verify React hooks work correctly
```javascript
// Test useWeb3 hook
import { useWeb3 } from '../hooks/use-web3'
// Expected: Hook returns wallet connection state
```

### 4.4 Component Rendering
**Test**: Verify all components render without errors
```bash
# Check for React errors in console
# Expected: No component rendering errors
```

## Phase 5: Error Handling Validation

### 5.1 Missing Dependencies Test
**Test**: Verify script behavior with missing dependencies
```bash
# Remove node_modules
rm -rf node_modules
# Try to run scripts
npm run hh:compile
# Expected: Clear error message about missing dependencies
```

### 5.2 Clear Error Messages
**Test**: Verify error messages are actionable
```bash
# Test with invalid configuration
# Expected: Specific error messages with resolution steps
```

### 5.3 Recovery Mechanisms
**Test**: Verify recovery from common errors
```bash
# Test automatic dependency installation
# Expected: Scripts handle missing dependencies gracefully
```

### 5.4 Fallback Options
**Test**: Verify fallback mechanisms work
```bash
# Test with different Node.js versions
# Expected: Graceful degradation or clear version requirements
```

## Phase 6: Performance Testing

### 6.1 Script Execution Times
**Test**: Measure script performance
```bash
time npm run hh:compile
# Expected: Compilation completes within reasonable time (< 30 seconds)
```

### 6.2 Memory Usage
**Test**: Monitor memory usage during compilation
```bash
# Monitor memory usage
# Expected: Memory usage stays within reasonable limits
```

### 6.3 Development Server Startup Time
**Test**: Measure server startup performance
```bash
time npm run dev
# Expected: Server starts within 10 seconds
```

## Automated Testing Commands

### Quick Validation Script
```bash
#!/bin/bash
echo "=== Script Validation Test ==="

# Test 1: Hardhat version
echo "Testing Hardhat version..."
npx hardhat --version

# Test 2: Contract compilation
echo "Testing contract compilation..."
npm run hh:compile

# Test 3: ABI generation
echo "Testing ABI generation..."
npm run generate:abi

# Test 4: Development server
echo "Testing development server..."
npm run dev &
SERVER_PID=$!
sleep 10
curl -f http://localhost:3000 > /dev/null && echo "Server responding" || echo "Server not responding"
kill $SERVER_PID

echo "=== Validation Complete ==="
```

## Troubleshooting Steps

### Common Issues and Solutions

1. **Hardhat Version Mismatch**
   - Solution: Run `fix-hardhat-version.bat`
   - Verify: `npx hardhat --version`

2. **Ethers Compatibility Issues**
   - Solution: Ensure ethers v5.8.0 is installed
   - Verify: `npm list ethers`

3. **Compilation Errors**
   - Solution: Check Solidity version compatibility
   - Verify: Contract pragma statements

4. **Development Server Issues**
   - Solution: Clear Next.js cache
   - Command: `rm -rf .next && npm run dev`

5. **Wallet Connection Problems**
   - Solution: Check wagmi configuration
   - Verify: Base Sepolia network configuration

## Success Criteria

All tests must pass for the system to be considered validated:

- ✅ All scripts execute without errors
- ✅ Contracts compile successfully
- ✅ ABI files generated correctly
- ✅ Development server starts and responds
- ✅ Wallet integration works
- ✅ Error handling provides clear feedback
- ✅ Performance meets acceptable thresholds

## Next Steps After Validation

1. Generate package-lock.json for reproducible builds
2. Complete end-to-end integration testing
3. Update documentation with validation results
4. Prepare for production deployment

