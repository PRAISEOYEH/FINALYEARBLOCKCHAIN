# Wallet Connection Test Scenarios

## Test Environment Setup

### Prerequisites

1. **Browser Extensions**
   - MetaMask extension installed and configured
   - Coinbase Wallet extension installed (optional)
   - Browser console access for debugging

2. **Base Sepolia Testnet Configuration**
   - Network Name: Base Sepolia
   - RPC URL: `https://sepolia.base.org`
   - Chain ID: 84532
   - Currency Symbol: ETH
   - Block Explorer: `https://sepolia.basescan.org`

3. **Test Account Setup**
   - Test account with Base Sepolia ETH
   - Multiple test accounts for switching scenarios
   - Account with insufficient balance for error testing

4. **Development Server**
   - Application running on `http://localhost:3000`
   - Hot reload enabled for testing
   - Browser developer tools open

### Setup Commands

```bash
# Start development server
npm run dev

# Verify Base Sepolia configuration
npm run hh:compile

# Check wallet integration
node scripts/verify-wallet-integration.js
```

## Component-Specific Test Cases

### App Page Integration Tests

#### TC001: Verify `app/page.tsx` correctly reads wallet connection state from `useMultiWallet`

**Preconditions**:
- Application loaded in browser
- `useMultiWallet` hook properly imported
- Wallet connection state available

**Test Steps**:
1. Open browser developer console
2. Load application homepage
3. Check console for wallet connection state logs
4. Verify `isConnected`, `account`, and `chainId` are properly read
5. Test with wallet connected and disconnected

**Expected Results**:
- ✅ Wallet connection state properly read from hook
- ✅ State updates when wallet connects/disconnects
- ✅ No console errors related to hook usage
- ✅ UI reflects current wallet state

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC002: Test that `needsNetworkSwitch` properly affects UI rendering

**Preconditions**:
- Wallet connected to wrong network (e.g., Ethereum Mainnet)
- `needsNetworkSwitch` logic implemented

**Test Steps**:
1. Connect wallet to Ethereum Mainnet
2. Load application homepage
3. Verify network switch prompt appears
4. Switch wallet to Base Sepolia
5. Verify prompt disappears
6. Test with wallet disconnected

**Expected Results**:
- ✅ Network switch prompt appears on wrong network
- ✅ Prompt disappears on correct network
- ✅ UI updates immediately after network switch
- ✅ No prompt when wallet disconnected

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC003: Validate authentication flow integration with wallet state

**Preconditions**:
- Authentication system implemented
- Wallet connection working

**Test Steps**:
1. Connect wallet without authentication
2. Attempt to access protected routes
3. Complete authentication flow
4. Verify wallet state maintained during auth
5. Test logout clears both states

**Expected Results**:
- ✅ Protected routes require both auth and wallet
- ✅ Wallet state preserved during authentication
- ✅ Logout clears both authentication and wallet
- ✅ UI reflects combined state correctly

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC004: Test page behavior when wallet is connected but user not authenticated

**Preconditions**:
- Wallet connection working
- Authentication system implemented

**Test Steps**:
1. Connect wallet to application
2. Verify wallet state shows as connected
3. Attempt to access authenticated features
4. Check authentication prompts appear
5. Verify wallet connection maintained

**Expected Results**:
- ✅ Wallet shows as connected
- ✅ Authentication prompts appear for protected features
- ✅ Wallet connection not lost during auth flow
- ✅ Clear indication of missing authentication

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC005: Verify page behavior when user is authenticated but wallet not connected

**Preconditions**:
- Authentication system working
- User can authenticate without wallet

**Test Steps**:
1. Authenticate user without wallet connection
2. Attempt to access wallet-dependent features
3. Verify wallet connection prompts appear
4. Connect wallet and verify functionality
5. Test wallet disconnection during authenticated session

**Expected Results**:
- ✅ Authentication works without wallet
- ✅ Wallet prompts appear for wallet-dependent features
- ✅ Features work after wallet connection
- ✅ Clear indication when wallet required

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

### Multi-Wallet Connection Component Tests

#### TC006: Test wallet connection UI displays correctly when not connected

**Preconditions**:
- Application loaded
- No wallet connected

**Test Steps**:
1. Load application with no wallet connected
2. Verify wallet connection UI is visible
3. Check all three wallet options are displayed
4. Verify button states and styling
5. Test responsive design on different screen sizes

**Expected Results**:
- ✅ Wallet connection UI visible and accessible
- ✅ All three wallet options (MetaMask, WalletConnect, Coinbase) displayed
- ✅ Buttons properly styled and clickable
- ✅ Responsive design works on mobile and desktop

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC007: Verify all three wallet options (MetaMask, WalletConnect, Coinbase) are available

**Preconditions**:
- Application loaded
- All wallet connectors configured

**Test Steps**:
1. Check wallet connection component
2. Verify MetaMask option is present
3. Verify WalletConnect option is present
4. Verify Coinbase Wallet option is present
5. Test each option is clickable

**Expected Results**:
- ✅ MetaMask option available and clickable
- ✅ WalletConnect option available and clickable
- ✅ Coinbase Wallet option available and clickable
- ✅ All options have proper labels and icons

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC008: Test successful connection flow for each wallet type

**Preconditions**:
- All wallet types available for testing
- Test accounts configured

**Test Steps**:
1. Test MetaMask connection flow
   - Click MetaMask button
   - Approve connection in MetaMask
   - Verify connection success
2. Test WalletConnect connection flow
   - Click WalletConnect button
   - Scan QR code with mobile wallet
   - Approve connection
   - Verify connection success
3. Test Coinbase Wallet connection flow
   - Click Coinbase Wallet button
   - Approve connection in Coinbase Wallet
   - Verify connection success

**Expected Results**:
- ✅ MetaMask connects successfully
- ✅ WalletConnect connects successfully
- ✅ Coinbase Wallet connects successfully
- ✅ Account information displays after connection
- ✅ Connection state updates properly

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC009: Verify connected state displays account info, balance, and network status

**Preconditions**:
- Wallet connected successfully
- Account has testnet ETH

**Test Steps**:
1. Connect wallet to application
2. Verify account address is displayed
3. Check account balance is shown
4. Verify network status is correct
5. Test address truncation and formatting

**Expected Results**:
- ✅ Account address displayed (truncated if needed)
- ✅ Account balance shown in ETH
- ✅ Network status shows "Base Sepolia"
- ✅ Address formatting is user-friendly
- ✅ Balance updates when changed

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC010: Test network switch prompt appears when on wrong network

**Preconditions**:
- Wallet connected to wrong network (e.g., Ethereum Mainnet)
- Network switching functionality implemented

**Test Steps**:
1. Connect wallet to Ethereum Mainnet
2. Load application
3. Verify network switch prompt appears
4. Check prompt includes correct network info
5. Test prompt styling and messaging

**Expected Results**:
- ✅ Network switch prompt appears immediately
- ✅ Prompt shows "Switch to Base Sepolia"
- ✅ Prompt includes network information
- ✅ Prompt is clearly visible and actionable

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC011: Verify disconnect functionality works properly

**Preconditions**:
- Wallet connected to application

**Test Steps**:
1. Connect wallet to application
2. Verify wallet is connected
3. Click disconnect button
4. Verify wallet disconnects
5. Check UI returns to disconnected state

**Expected Results**:
- ✅ Disconnect button is visible and clickable
- ✅ Wallet disconnects immediately
- ✅ UI returns to disconnected state
- ✅ Account information is cleared
- ✅ No wallet state remains

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC012: Test error handling for connection failures

**Preconditions**:
- Wallet extensions installed
- Network connectivity available

**Test Steps**:
1. Test connection rejection
   - Click connect button
   - Reject connection in wallet
   - Verify error handling
2. Test connection timeout
   - Simulate slow network
   - Test connection timeout
   - Verify error message
3. Test wallet not installed
   - Remove wallet extension
   - Test connection attempt
   - Verify install prompt

**Expected Results**:
- ✅ Connection rejection handled gracefully
- ✅ Timeout errors show appropriate message
- ✅ Install prompts appear for missing wallets
- ✅ Error messages are clear and helpful
- ✅ Retry options available

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

### Candidate Dashboard Tests

#### TC013: Verify wallet address is displayed in dashboard header

**Preconditions**:
- User authenticated as candidate
- Wallet connected to application

**Test Steps**:
1. Authenticate as candidate
2. Connect wallet to application
3. Navigate to candidate dashboard
4. Verify wallet address in header
5. Test address truncation and formatting

**Expected Results**:
- ✅ Wallet address displayed in dashboard header
- ✅ Address properly truncated (e.g., "0x1234...5678")
- ✅ Address is clickable (opens explorer)
- ✅ Address formatting is consistent

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC014: Test logout functionality disconnects both auth and wallet

**Preconditions**:
- User authenticated and wallet connected
- Logout functionality implemented

**Test Steps**:
1. Authenticate user and connect wallet
2. Navigate to candidate dashboard
3. Click logout button
4. Verify both authentication and wallet disconnect
5. Check user returns to login page

**Expected Results**:
- ✅ Logout button is visible and clickable
- ✅ Authentication state is cleared
- ✅ Wallet connection is disconnected
- ✅ User redirected to login page
- ✅ No wallet state remains

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC015: Validate wallet connection status affects dashboard functionality

**Preconditions**:
- Candidate dashboard implemented
- Wallet-dependent features available

**Test Steps**:
1. Authenticate as candidate without wallet
2. Navigate to dashboard
3. Verify wallet-dependent features are disabled
4. Connect wallet
5. Verify features become enabled

**Expected Results**:
- ✅ Wallet-dependent features disabled without wallet
- ✅ Clear indication of wallet requirement
- ✅ Features enabled after wallet connection
- ✅ UI updates immediately after connection

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC016: Test wallet address truncation and display formatting

**Preconditions**:
- Wallet connected with long address
- Dashboard displays wallet address

**Test Steps**:
1. Connect wallet with address: `0x1234567890123456789012345678901234567890`
2. Navigate to dashboard
3. Verify address is properly truncated
4. Test on different screen sizes
5. Verify address is still readable

**Expected Results**:
- ✅ Address truncated to format like "0x1234...7890"
- ✅ Truncation works on all screen sizes
- ✅ Address remains clickable and readable
- ✅ Full address available on hover/click

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

### Wallet Selector Modal Tests

#### TC017: Verify modal opens and closes correctly

**Preconditions**:
- Wallet selector modal implemented
- Modal trigger button available

**Test Steps**:
1. Click modal trigger button
2. Verify modal opens
3. Test modal backdrop click to close
4. Test escape key to close
5. Test close button functionality

**Expected Results**:
- ✅ Modal opens when trigger clicked
- ✅ Modal closes on backdrop click
- ✅ Modal closes on escape key
- ✅ Modal closes on close button
- ✅ Modal state properly managed

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC018: Test wallet detection for installed vs not installed wallets

**Preconditions**:
- Wallet detection logic implemented
- Some wallets installed, others not

**Test Steps**:
1. Open wallet selector modal
2. Verify installed wallets show as available
3. Verify non-installed wallets show install prompts
4. Test with different wallet combinations
5. Verify detection accuracy

**Expected Results**:
- ✅ Installed wallets show as "Connect"
- ✅ Non-installed wallets show "Install"
- ✅ Detection is accurate and reliable
- ✅ UI updates when wallet status changes

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC019: Verify connection flow for each detected wallet

**Preconditions**:
- Wallet selector modal open
- Wallets detected and available

**Test Steps**:
1. Open wallet selector modal
2. Test connection for each available wallet
3. Verify connection flow works correctly
4. Test modal closes after successful connection
5. Verify connection state updates

**Expected Results**:
- ✅ Each wallet connection flow works
- ✅ Modal closes after successful connection
- ✅ Connection state updates properly
- ✅ No errors during connection process

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC020: Test install links for non-installed wallets

**Preconditions**:
- Wallet selector modal open
- Some wallets not installed

**Test Steps**:
1. Open wallet selector modal
2. Click install link for non-installed wallet
3. Verify correct install page opens
4. Test all install links work
5. Verify links open in new tab

**Expected Results**:
- ✅ Install links open correct pages
- ✅ Links open in new tab
- ✅ All wallet install links work
- ✅ Links are properly formatted

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC021: Validate error display in modal

**Preconditions**:
- Wallet selector modal open
- Error handling implemented

**Test Steps**:
1. Open wallet selector modal
2. Trigger connection error (e.g., rejection)
3. Verify error message displays in modal
4. Test error message styling
5. Verify error can be dismissed

**Expected Results**:
- ✅ Error messages display in modal
- ✅ Error styling is clear and visible
- ✅ Errors can be dismissed
- ✅ Error messages are helpful

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

## Network Switching Test Cases

#### TC022: Test automatic detection of wrong network

**Preconditions**:
- Wallet connected to wrong network
- Network detection logic implemented

**Test Steps**:
1. Connect wallet to Ethereum Mainnet
2. Load application
3. Verify wrong network is detected
4. Test with other wrong networks
5. Verify detection is immediate

**Expected Results**:
- ✅ Wrong network detected automatically
- ✅ Detection works for multiple networks
- ✅ Detection is immediate and reliable
- ✅ UI updates to show network switch prompt

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC023: Verify network switch prompt appears correctly

**Preconditions**:
- Wrong network detected
- Network switch prompt implemented

**Test Steps**:
1. Connect wallet to wrong network
2. Verify network switch prompt appears
3. Check prompt includes correct network info
4. Test prompt styling and positioning
5. Verify prompt is clearly visible

**Expected Results**:
- ✅ Network switch prompt appears
- ✅ Prompt shows correct target network
- ✅ Prompt is clearly visible and styled
- ✅ Prompt includes helpful information

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC024: Test successful network switch to Base Sepolia

**Preconditions**:
- Wallet connected to wrong network
- Base Sepolia available in wallet

**Test Steps**:
1. Connect wallet to wrong network
2. Click "Switch to Base Sepolia" button
3. Approve network switch in wallet
4. Verify successful switch
5. Check UI updates after switch

**Expected Results**:
- ✅ Network switch request sent to wallet
- ✅ User can approve switch in wallet
- ✅ Switch completes successfully
- ✅ UI updates to show correct network
- ✅ Network switch prompt disappears

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC025: Test error handling for failed network switch

**Preconditions**:
- Wallet connected to wrong network
- Error handling implemented

**Test Steps**:
1. Connect wallet to wrong network
2. Attempt network switch
3. Reject switch in wallet
4. Verify error handling
5. Test other failure scenarios

**Expected Results**:
- ✅ Network switch rejection handled
- ✅ Error message displayed
- ✅ User can retry switch
- ✅ Error recovery works properly

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC026: Verify UI updates after successful network switch

**Preconditions**:
- Network switch completed successfully
- UI update logic implemented

**Test Steps**:
1. Complete successful network switch
2. Verify network status updates
3. Check balance updates
4. Test UI responsiveness
5. Verify no errors in console

**Expected Results**:
- ✅ Network status shows "Base Sepolia"
- ✅ Balance updates correctly
- ✅ UI is responsive and smooth
- ✅ No console errors
- ✅ All wallet-dependent features work

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

## Authentication Integration Test Cases

#### TC027: Test wallet connection persists through authentication flow

**Preconditions**:
- Wallet connection working
- Authentication system implemented

**Test Steps**:
1. Connect wallet to application
2. Start authentication flow
3. Complete authentication
4. Verify wallet connection maintained
5. Test wallet state after authentication

**Expected Results**:
- ✅ Wallet connection maintained during auth
- ✅ Authentication completes successfully
- ✅ Combined state works correctly
- ✅ No wallet disconnection during auth

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC028: Verify voting operations require both auth and wallet connection

**Preconditions**:
- Voting system implemented
- Authentication and wallet systems working

**Test Steps**:
1. Test voting with auth but no wallet
2. Test voting with wallet but no auth
3. Test voting with both auth and wallet
4. Verify proper error messages
5. Test voting success with both

**Expected Results**:
- ✅ Voting blocked without authentication
- ✅ Voting blocked without wallet
- ✅ Voting works with both auth and wallet
- ✅ Clear error messages for missing requirements

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC029: Test admin functions work with connected wallet

**Preconditions**:
- Admin functions implemented
- Wallet connection working

**Test Steps**:
1. Authenticate as admin
2. Connect wallet
3. Test admin functions (create election, verify candidate)
4. Verify wallet account used for transactions
5. Test admin functions without wallet

**Expected Results**:
- ✅ Admin functions work with connected wallet
- ✅ Wallet account used for transactions
- ✅ Admin functions blocked without wallet
- ✅ Clear indication of wallet requirement

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC030: Validate logout clears both authentication and wallet state

**Preconditions**:
- User authenticated and wallet connected
- Logout functionality implemented

**Test Steps**:
1. Authenticate user and connect wallet
2. Verify both states are active
3. Click logout
4. Verify authentication cleared
5. Verify wallet disconnected

**Expected Results**:
- ✅ Logout clears authentication state
- ✅ Logout disconnects wallet
- ✅ User redirected to login page
- ✅ No wallet or auth state remains

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

## Error Handling Test Cases

#### TC031: Test user rejection of wallet connection

**Preconditions**:
- Wallet connection flow working
- Error handling implemented

**Test Steps**:
1. Initiate wallet connection
2. Reject connection in wallet
3. Verify error handling
4. Test retry functionality
5. Check error message clarity

**Expected Results**:
- ✅ Connection rejection handled gracefully
- ✅ Clear error message displayed
- ✅ User can retry connection
- ✅ No application crashes

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC032: Test wallet not installed scenarios

**Preconditions**:
- Wallet detection working
- Install prompts implemented

**Test Steps**:
1. Remove wallet extension
2. Attempt to connect wallet
3. Verify install prompt appears
4. Test install link functionality
5. Verify prompt styling

**Expected Results**:
- ✅ Install prompt appears for missing wallet
- ✅ Install link opens correct page
- ✅ Prompt is clear and helpful
- ✅ User can install wallet and retry

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC033: Test network connectivity issues

**Preconditions**:
- Network error handling implemented
- Offline simulation possible

**Test Steps**:
1. Simulate network connectivity issues
2. Attempt wallet connection
3. Verify error handling
4. Test reconnection logic
5. Check user feedback

**Expected Results**:
- ✅ Network errors handled gracefully
- ✅ Clear error messages displayed
- ✅ Reconnection options available
- ✅ User informed of network issues

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC034: Test account switching in wallet

**Preconditions**:
- Wallet connected with multiple accounts
- Account switching detection implemented

**Test Steps**:
1. Connect wallet with account A
2. Switch to account B in wallet
3. Verify application detects account change
4. Test UI updates
5. Verify functionality with new account

**Expected Results**:
- ✅ Account switching detected
- ✅ UI updates with new account
- ✅ Balance updates correctly
- ✅ Functionality works with new account

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

#### TC035: Test multiple wallet providers conflict resolution

**Preconditions**:
- Multiple wallet providers available
- Conflict resolution implemented

**Test Steps**:
1. Have multiple wallet providers installed
2. Attempt to connect wallet
3. Verify conflict resolution
4. Test switching between providers
5. Check state management

**Expected Results**:
- ✅ Multiple providers handled correctly
- ✅ User can choose provider
- ✅ State managed properly
- ✅ No conflicts between providers

**Actual Results**: [To be filled during testing]
**Status**: ⏳ Pending
**Notes**: 

## Test Execution Summary

### Test Results Summary

| Test Category | Total Tests | Passed | Failed | Pending |
|---------------|-------------|--------|--------|---------|
| App Page Integration | 5 | 0 | 0 | 5 |
| Multi-Wallet Connection | 7 | 0 | 0 | 7 |
| Candidate Dashboard | 4 | 0 | 0 | 4 |
| Wallet Selector Modal | 5 | 0 | 0 | 5 |
| Network Switching | 5 | 0 | 0 | 5 |
| Authentication Integration | 4 | 0 | 0 | 4 |
| Error Handling | 5 | 0 | 0 | 5 |
| **Total** | **35** | **0** | **0** | **35** |

### Critical Test Cases

The following test cases are considered critical and must pass for the wallet integration to be considered successful:

- TC001: App page wallet state integration
- TC008: Successful connection flow for each wallet type
- TC009: Connected state displays account info
- TC024: Successful network switch to Base Sepolia
- TC028: Voting operations require both auth and wallet
- TC031: User rejection handling

### Test Execution Notes

- All tests should be executed in a clean browser environment
- Test with multiple browsers (Chrome, Firefox, Safari)
- Test on both desktop and mobile devices
- Document any browser-specific issues
- Record actual results and notes for each test case
- Update test cases based on findings

### Next Steps After Testing

1. Review all test results and identify patterns
2. Fix any failed test cases
3. Update test cases based on actual behavior
4. Create automated tests for critical flows
5. Document any issues and their resolutions
6. Plan production deployment
