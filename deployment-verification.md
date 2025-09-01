# UniversityVoting Contract Deployment Verification Checklist

This document provides a comprehensive checklist for deploying and verifying the `UniversityVoting` smart contract to the Base Sepolia testnet.

## Pre-Deployment Requirements

### Environment Setup
- [ ] Node.js and npm installed
- [ ] Hardhat environment configured
- [ ] Base Sepolia testnet added to Hardhat config
- [ ] Private key configured in environment variables
- [ ] Sufficient Base Sepolia ETH in deployer wallet (minimum 0.01 ETH recommended)

### Contract Preparation
- [ ] `UniversityVoting.sol` contract compiled successfully
- [ ] No compilation errors or warnings
- [ ] Contract dependencies resolved
- [ ] ABI generation completed

## Deployment Process

### Step 1: Execute Deployment Command
```bash
npm run deploy:university
```

### Step 2: Monitor Deployment Output
- [ ] Deployment script starts without errors
- [ ] Deployer address is displayed correctly
- [ ] Contract deployment transaction is submitted
- [ ] Contract address is generated and displayed
- [ ] No error messages during deployment

### Expected Output Format:
```
Deploying with: 0x[DEPLOYER_ADDRESS]
UniversityVoting deployed: 0x[CONTRACT_ADDRESS]
Saved addresses to [PATH]/lib/contracts/deployed-addresses.json
```

### Step 3: Record Deployment Details
- [ ] **Contract Address**: `0x_____________________`
- [ ] **Transaction Hash**: `0x_____________________`
- [ ] **Deployer Address**: `0x_____________________`
- [ ] **Deployment Timestamp**: `____________________`
- [ ] **Gas Used**: `____________________`
- [ ] **Gas Price**: `____________________`
- [ ] **Block Number**: `____________________`

## Post-Deployment Verification

### Step 4: Verify Address File Update
Check `lib/contracts/deployed-addresses.json`:
- [ ] File exists and is readable
- [ ] `baseSepolia` network key is present
- [ ] `UniversityVoting` address is updated (not `0x0000000000000000000000000000000000000000`)
- [ ] `deployedAt` timestamp is current ISO format
- [ ] JSON structure is valid

Expected file structure:
```json
{
  "localhost": {
    "UniversityVoting": "0x0000000000000000000000000000000000000000",
    "deployedAt": ""
  },
  "baseSepolia": {
    "UniversityVoting": "0x[ACTUAL_CONTRACT_ADDRESS]",
    "deployedAt": "2024-XX-XXTXX:XX:XX.XXXZ"
  }
}
```

### Step 5: Block Explorer Verification
Visit Base Sepolia Block Explorer: `https://sepolia.basescan.org/`

- [ ] Search for contract address
- [ ] Contract page loads successfully
- [ ] Contract creation transaction is visible
- [ ] Contract bytecode is present
- [ ] Contract is marked as verified (if verification was included)

### Step 6: Contract State Verification
Using block explorer or Hardhat console:

- [ ] Contract owner is set to deployer address
- [ ] Contract is not paused (if applicable)
- [ ] Initial state variables are set correctly
- [ ] Contract responds to view function calls

### Step 7: Function Accessibility Test
Test key contract functions:

- [ ] `owner()` returns correct deployer address
- [ ] `addCandidate()` is accessible (owner only)
- [ ] `whitelistVoter()` is accessible (owner only)
- [ ] `getElectionInfo()` returns default values
- [ ] `getCandidates()` returns empty array initially

## Network Confirmation

### Step 8: Network Validation
- [ ] Deployment confirmed on Base Sepolia (Chain ID: 84532)
- [ ] Transaction has sufficient confirmations (minimum 3)
- [ ] Contract is accessible via RPC calls
- [ ] No revert or failure transactions

## Integration Readiness

### Step 9: Frontend Integration Check
- [ ] Contract address is accessible in frontend code
- [ ] ABI files are generated and up-to-date
- [ ] Network configuration matches deployment
- [ ] Contract instance can be created in frontend

## Troubleshooting Common Issues

### Insufficient Gas
**Symptoms**: Transaction fails with "out of gas" error
**Solutions**:
- [ ] Increase gas limit in Hardhat config
- [ ] Check current Base Sepolia gas prices
- [ ] Ensure sufficient ETH balance for gas fees

### Network Connectivity Problems
**Symptoms**: RPC connection errors, timeout issues
**Solutions**:
- [ ] Verify Base Sepolia RPC URL in `hardhat.config.js`
- [ ] Test network connectivity: `npx hardhat run scripts/deploy-university.js --network baseSepolia --dry-run`
- [ ] Try alternative RPC endpoints
- [ ] Check firewall/proxy settings

### Invalid Private Key
**Symptoms**: "Invalid private key" or authentication errors
**Solutions**:
- [ ] Verify private key format (64 characters, no 0x prefix in .env)
- [ ] Ensure private key corresponds to funded wallet
- [ ] Check environment variable loading
- [ ] Verify wallet has Base Sepolia ETH

### Contract Compilation Errors
**Symptoms**: Compilation fails before deployment
**Solutions**:
- [ ] Run `npm run compile:contracts` separately
- [ ] Check Solidity version compatibility
- [ ] Verify import paths in contract
- [ ] Clear Hardhat cache: `npx hardhat clean`

### Deployment Script Errors
**Symptoms**: Script execution fails
**Solutions**:
- [ ] Check Node.js version compatibility
- [ ] Verify all dependencies installed: `npm install`
- [ ] Ensure proper file permissions
- [ ] Check for syntax errors in deployment script

## Security Checklist

### Step 10: Security Verification
- [ ] Private keys are not exposed in logs
- [ ] Contract owner is correct address
- [ ] No admin functions are publicly accessible
- [ ] Contract follows expected access control patterns

## Documentation

### Step 11: Record Keeping
- [ ] Save deployment transaction hash
- [ ] Document contract address in project documentation
- [ ] Update README with deployment information
- [ ] Create deployment log entry

## Final Validation

### Step 12: End-to-End Test
- [ ] Frontend can connect to deployed contract
- [ ] Basic contract interactions work
- [ ] Error handling functions properly
- [ ] Contract is ready for production use

---

## Deployment Log Template

```
Deployment Date: _______________
Network: Base Sepolia
Deployer: 0x_____________________
Contract Address: 0x_____________________
Transaction Hash: 0x_____________________
Block Number: _______________
Gas Used: _______________
Deployment Cost: _______________ ETH
Status: ✅ Success / ❌ Failed
Notes: _______________
```

## Quick Reference Links

- **Base Sepolia Explorer**: https://sepolia.basescan.org/
- **Base Sepolia Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- **Base Sepolia RPC**: https://sepolia.base.org
- **Chain ID**: 84532

## Support

If deployment fails after following this checklist:
1. Check the troubleshooting section above
2. Verify all prerequisites are met
3. Review Hardhat and contract logs for specific error messages
4. Ensure Base Sepolia network is operational
5. Consider deploying to localhost first for testing

---

**Note**: This checklist should be completed in order. Each step builds upon the previous ones to ensure a successful and verified deployment.