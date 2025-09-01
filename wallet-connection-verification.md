# Wallet Connection Verification Guide

## Overview

This document provides comprehensive verification procedures for the `useMultiWallet` hook integration across the university voting system. The verification ensures that wallet connection functionality works seamlessly with MetaMask, WalletConnect, and Coinbase Wallet on Base Sepolia network.

## Pre-verification Setup

### Environment Requirements

1. **Development Environment**
   - Node.js 18+ installed
   - npm/pnpm package manager
   - Modern browser (Chrome, Firefox, Safari, Edge)
   - Git repository cloned and dependencies installed

2. **Base Sepolia Configuration**
   - Base Sepolia RPC URL: `https://sepolia.base.org`
   - Chain ID: 84532
   - Testnet ETH for transaction testing
   - Environment variables configured in `.env`

3. **Test Wallets Setup**
   - MetaMask extension installed and configured
   - Coinbase Wallet extension installed (optional)
   - Mobile wallet with WalletConnect support
   - Test accounts with Base Sepolia ETH

### Setup Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Verify Base Sepolia configuration
npm run hh:compile
```

## Component Integration Tests

### 1. App Page Integration (`app/page.tsx`)

**Test Objective**: Verify wallet state integration with authentication flow

**Test Steps**:
1. Load the application homepage
2. Check that wallet connection state is properly read from `useMultiWallet`
3. Verify `needsNetworkSwitch` affects UI rendering correctly
4. Test authentication flow integration with wallet state
5. Validate page behavior for different wallet/auth combinations

**Expected Outcomes**:
- ✅ Wallet connection state properly integrated
- ✅ Network switch prompts appear when needed
- ✅ Authentication flow works with wallet connection
- ✅ UI updates correctly based on combined state

**Common Issues**:
- Wallet state not persisting across page refreshes
- Network switch prompts not appearing
- Authentication flow blocking wallet connection

### 2. Multi-Wallet Connection Component (`components/multi-wallet-connection.tsx`)

**Test Objective**: Verify comprehensive wallet connection functionality

**Test Steps**:
1. Test wallet connection UI display when not connected
2. Verify all three wallet options are available
3. Test successful connection flow for each wallet type
4. Verify connected state displays account info and balance
5. Test network switch prompt functionality
6. Verify disconnect functionality

**Expected Outcomes**:
- ✅ All wallet options displayed correctly
- ✅ Connection flows work for each wallet type
- ✅ Account information displayed properly
- ✅ Network switching works seamlessly
- ✅ Disconnect functionality clears state

**Common Issues**:
- Wallet options not appearing
- Connection failures for specific wallets
- Account information not updating
- Network switch not working

### 3. Candidate Dashboard (`components/candidate-dashboard.tsx`)

**Test Objective**: Verify wallet integration in candidate interface

**Test Steps**:
1. Verify wallet address display in dashboard header
2. Test logout functionality disconnects both auth and wallet
3. Validate wallet connection status affects dashboard functionality
4. Test wallet address truncation and formatting

**Expected Outcomes**:
- ✅ Wallet address displayed correctly
- ✅ Logout clears both authentication and wallet state
- ✅ Dashboard functionality depends on wallet connection
- ✅ Address formatting is user-friendly

**Common Issues**:
- Wallet address not displaying
- Logout not clearing wallet state
- Dashboard functionality not wallet-dependent

### 4. Wallet Selector Modal (`components/wallet-selector-modal.tsx`)

**Test Objective**: Verify wallet detection and connection modal

**Test Steps**:
1. Test modal open/close functionality
2. Verify wallet detection for installed vs non-installed wallets
3. Test connection flow for each detected wallet
4. Verify install links for non-installed wallets
5. Test error display in modal

**Expected Outcomes**:
- ✅ Modal opens and closes correctly
- ✅ Wallet detection works accurately
- ✅ Connection flows work for detected wallets
- ✅ Install links work for missing wallets
- ✅ Errors displayed properly

**Common Issues**:
- Modal not opening/closing
- Wallet detection inaccurate
- Connection flows failing
- Install links not working

## Wallet Connection Flow Tests

### MetaMask Connection

**Test Scenario**: Complete MetaMask connection flow

**Steps**:
1. Click "Connect MetaMask" button
2. Approve connection in MetaMask popup
3. Verify account information displays
4. Test account switching in MetaMask
5. Test connection rejection

**Expected Results**:
- ✅ Connection request appears in MetaMask
- ✅ Account information updates after approval
- ✅ Account switching updates UI
- ✅ Rejection handled gracefully

### WalletConnect Connection

**Test Scenario**: WalletConnect QR code flow

**Steps**:
1. Click "Connect WalletConnect" button
2. Scan QR code with mobile wallet
3. Approve connection on mobile device
4. Verify connection established
5. Test disconnection

**Expected Results**:
- ✅ QR code displays correctly
- ✅ Mobile wallet connects successfully
- ✅ Connection state updates properly
- ✅ Disconnection works correctly

### Coinbase Wallet Connection

**Test Scenario**: Coinbase Wallet connection flow

**Steps**:
1. Click "Connect Coinbase Wallet" button
2. Approve connection in Coinbase Wallet
3. Verify account information displays
4. Test deep linking functionality
5. Test connection rejection

**Expected Results**:
- ✅ Connection request appears in Coinbase Wallet
- ✅ Account information updates after approval
- ✅ Deep linking works for mobile
- ✅ Rejection handled gracefully

## Network Switching Verification

### Base Sepolia Network Validation

**Test Objective**: Verify network switching to Base Sepolia

**Test Scenarios**:

1. **Wrong Network Detection**
   - Connect wallet to Ethereum Mainnet
   - Verify network switch prompt appears
   - Test automatic network detection

2. **Network Switch Execution**
   - Click "Switch to Base Sepolia" button
   - Approve network switch in wallet
   - Verify successful switch
   - Test UI updates after switch

3. **Network Switch Errors**
   - Test rejection of network switch
   - Test failed network switch scenarios
   - Verify error handling and user feedback

**Expected Outcomes**:
- ✅ Wrong network detected automatically
- ✅ Network switch prompts appear correctly
- ✅ Network switching works seamlessly
- ✅ Error handling provides clear feedback

## Authentication Flow Integration

### Wallet + Authentication Integration

**Test Objective**: Verify wallet connection works with university voting authentication

**Test Scenarios**:

1. **Combined Authentication**
   - Test wallet connection with authentication
   - Verify both states work together
   - Test logout clears both states

2. **Admin Functions**
   - Test admin functions require both auth and wallet
   - Verify wallet account used for transactions
   - Test admin operations blocked without wallet

3. **Voting Operations**
   - Test voting requires both auth and wallet
   - Verify wallet account used for voting
   - Test voting blocked on wrong network

**Expected Outcomes**:
- ✅ Authentication and wallet work together
- ✅ Admin functions require both states
- ✅ Voting operations use connected wallet
- ✅ Network requirements enforced

## Error Handling and Edge Cases

### Connection Error Scenarios

**Test Cases**:

1. **Wallet Rejection**
   - Test user rejection of connection
   - Verify error message displayed
   - Test retry functionality

2. **Network Issues**
   - Test connection with poor network
   - Verify timeout handling
   - Test reconnection logic

3. **Wallet Not Installed**
   - Test connection to non-installed wallet
   - Verify install prompts
   - Test deep linking to app stores

4. **Multiple Wallets**
   - Test multiple wallet providers
   - Verify conflict resolution
   - Test switching between wallets

**Expected Outcomes**:
- ✅ Errors handled gracefully
- ✅ User feedback provided
- ✅ Recovery options available
- ✅ Install prompts work correctly

## Performance and UX Verification

### User Experience Validation

**Test Areas**:

1. **Loading States**
   - Verify loading indicators during connection
   - Test loading states for network switching
   - Validate loading feedback for operations

2. **Error Messages**
   - Test error message clarity
   - Verify error message accessibility
   - Test error message localization

3. **Responsive Design**
   - Test on desktop browsers
   - Test on mobile devices
   - Verify tablet compatibility

4. **Accessibility**
   - Test keyboard navigation
   - Verify screen reader compatibility
   - Test color contrast requirements

**Expected Outcomes**:
- ✅ Loading states provide feedback
- ✅ Error messages are clear and helpful
- ✅ Design works on all screen sizes
- ✅ Accessibility requirements met

## Troubleshooting Guide

### Common Issues and Solutions

1. **Wallet Connection Fails**
   - Check browser console for errors
   - Verify wallet extension is installed
   - Check network connectivity
   - Clear browser cache and retry

2. **Network Switch Not Working**
   - Verify Base Sepolia is added to wallet
   - Check RPC URL accessibility
   - Test with different wallet
   - Verify chain ID configuration

3. **Authentication Integration Issues**
   - Check wallet state persistence
   - Verify authentication state management
   - Test logout functionality
   - Check component state synchronization

4. **Performance Issues**
   - Check for memory leaks
   - Verify hook dependencies
   - Test with multiple wallet connections
   - Monitor network requests

## Verification Checklist

### Pre-verification
- [ ] Development environment set up
- [ ] Base Sepolia configuration verified
- [ ] Test wallets configured
- [ ] Dependencies installed

### Component Integration
- [ ] App page integration tested
- [ ] Multi-wallet connection component verified
- [ ] Candidate dashboard integration tested
- [ ] Wallet selector modal verified

### Wallet Connection Flows
- [ ] MetaMask connection tested
- [ ] WalletConnect connection tested
- [ ] Coinbase Wallet connection tested
- [ ] Connection persistence verified

### Network Switching
- [ ] Wrong network detection tested
- [ ] Network switch execution verified
- [ ] Error handling tested
- [ ] UI updates verified

### Authentication Integration
- [ ] Combined authentication tested
- [ ] Admin functions verified
- [ ] Voting operations tested
- [ ] Logout functionality verified

### Error Handling
- [ ] Connection errors tested
- [ ] Network errors handled
- [ ] Wallet not installed scenarios tested
- [ ] Multiple wallet conflicts resolved

### Performance and UX
- [ ] Loading states verified
- [ ] Error messages tested
- [ ] Responsive design validated
- [ ] Accessibility requirements met

## Success Criteria

The wallet connection integration is considered successful when:

1. ✅ All three wallet types connect successfully
2. ✅ Network switching works seamlessly
3. ✅ Authentication integration functions properly
4. ✅ Error handling provides clear user feedback
5. ✅ Performance meets acceptable standards
6. ✅ Accessibility requirements are satisfied
7. ✅ All test cases pass successfully
8. ✅ No critical bugs or issues remain

## Next Steps

After successful verification:

1. Document any issues found and their resolutions
2. Update test cases based on findings
3. Create automated tests for critical flows
4. Plan production deployment
5. Monitor performance in production environment
