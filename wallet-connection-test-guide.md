# Wallet Connection Testing Guide

This guide provides comprehensive step-by-step instructions for testing the `components/wallet-connection.tsx` component to ensure proper wallet connectivity, network switching, and blockchain integration functionality.

## Prerequisites

1. **MetaMask Extension**: Ensure MetaMask is installed in your browser
2. **Development Server**: The Next.js application should be running on `http://localhost:3000`
3. **Test Wallet**: Have a test wallet with some Base Sepolia ETH for testing
4. **Base Sepolia Network**: Ensure Base Sepolia network is configured in MetaMask

## Test Environment Setup

### 1. Start Development Server
```bash
npm run dev
```
Verify the server starts successfully and the predev hooks compile contracts without errors.

### 2. Navigate to Wallet Connection Interface
- Open browser and go to `http://localhost:3000`
- Locate the wallet connection component (should be visible on the main page or accessible via navigation)
- Verify the component renders without console errors

## Testing Scenarios

### Scenario 1: Initial State (Wallet Not Connected)

#### Expected Behavior
- Component displays "Connect Your Wallet" card
- Shows MetaMask connection button
- Displays security features list with checkmarks
- Shows "Don't have MetaMask?" link

#### Test Steps
1. **Verify Initial UI Elements**:
   - [ ] Blue wallet icon is displayed
   - [ ] "Connect Your Wallet" title is visible
   - [ ] "Connect with MetaMask to access the blockchain voting system" description appears
   - [ ] Three security features are listed with green checkmarks:
     - Secure blockchain authentication
     - Encrypted vote storage
     - Transparent and immutable
   - [ ] "Connect MetaMask" button is enabled and visible
   - [ ] "Don't have MetaMask? Install it here" link is present

2. **Test External Link**:
   - [ ] Click "Don't have MetaMask? Install it here" link
   - [ ] Verify it opens `https://metamask.io/download/` in new tab

### Scenario 2: MetaMask Connection Testing

#### Test Steps
1. **Test Connection Process**:
   - [ ] Click "Connect MetaMask" button
   - [ ] Verify button shows loading state with spinning icon and "Connecting..." text
   - [ ] MetaMask popup should appear requesting connection approval
   - [ ] Approve the connection in MetaMask

2. **Verify Successful Connection**:
   - [ ] Component transitions to connected state
   - [ ] Green wallet icon appears in header
   - [ ] "Wallet Connected" title is displayed
   - [ ] Wallet address is shown in truncated format (first 6 + last 4 characters)
   - [ ] "Disconnect" button appears in top-right corner

3. **Test Address Truncation**:
   - [ ] Verify address format: `0x1234...abcd` (6 chars + ... + 4 chars)
   - [ ] Confirm full address is properly truncated regardless of actual address length

### Scenario 3: Network Detection and Switching

#### Test Wrong Network Detection
1. **Connect to Non-Base Sepolia Network**:
   - [ ] Ensure MetaMask is connected to a different network (e.g., Ethereum Mainnet, Polygon)
   - [ ] Connect wallet and verify component detects wrong network
   - [ ] Check that network badge shows red background with warning colors
   - [ ] Verify "Switch to Base Sepolia" button appears next to network status

2. **Verify Warning Alert**:
   - [ ] Yellow warning alert should appear stating:
     - "Wrong Network: Please switch to Base Sepolia (chain 84532) to use the voting system"
   - [ ] Alert should include instruction to use the switch button

#### Test Network Switching
1. **Test Switch Functionality**:
   - [ ] Click "Switch to Base Sepolia" button
   - [ ] MetaMask should prompt to add/switch to Base Sepolia network
   - [ ] Approve the network switch in MetaMask

2. **Verify Successful Switch**:
   - [ ] Network badge changes to green background
   - [ ] Network name shows "Base Sepolia" or similar
   - [ ] Chain ID displays as 84532
   - [ ] Warning alert disappears
   - [ ] "Switch to Base Sepolia" button is no longer visible

### Scenario 4: Balance Display and Refresh Testing

#### Test Balance Display
1. **Verify Balance Information**:
   - [ ] Balance badge shows current ETH balance
   - [ ] Format displays as "X.XXXX ETH" with 4 decimal places
   - [ ] Balance shows "Loading..." initially if still fetching
   - [ ] Refresh button (circular arrow icon) appears next to balance

2. **Test Balance Refresh**:
   - [ ] Click the refresh button next to balance
   - [ ] Verify button shows spinning animation during refresh
   - [ ] Balance updates after refresh completes
   - [ ] No errors appear in console during refresh

### Scenario 5: Network Information Display

#### Verify Network Info Panel
1. **Check Network Details Grid**:
   - [ ] Gray background panel displays three columns:
     - Chain ID: Shows "84532" for Base Sepolia
     - Gas Price: Shows "N/A" (as per implementation)
     - Block Number: Shows current block with "#" prefix

2. **Test Real-time Updates**:
   - [ ] Block number updates automatically (watch for changes)
   - [ ] Values remain consistent with network state

### Scenario 6: Contract Accessibility Probe Testing

#### Test Contract Probe Functionality
1. **Verify Automatic Probe**:
   - [ ] When connected to Base Sepolia, component automatically runs contract probe
   - [ ] Blue loading alert appears: "Checking contract connectivity..."
   - [ ] Probe calls `getElection(1)` from voting service

2. **Test Successful Contract Access**:
   - [ ] Green success alert appears: "Connected to voting contract"
   - [ ] Connection status indicator shows green pulsing dot
   - [ ] Status text reads: "Connected to blockchain and contract"

3. **Test Contract Access Failure**:
   - [ ] If contract is not deployed or accessible, red error alert appears
   - [ ] Error message shows: "Contract probe failed: [error details]"
   - [ ] Connection status shows yellow dot
   - [ ] Status text reads: "Connected to wallet — contract unreachable"

### Scenario 7: Error Handling Testing

#### Test Connection Failures
1. **Test MetaMask Not Available**:
   - [ ] Disable MetaMask extension or use browser without MetaMask
   - [ ] Attempt to connect wallet
   - [ ] Verify appropriate error message appears in red alert
   - [ ] Connection button returns to normal state

2. **Test User Rejection**:
   - [ ] Click "Connect MetaMask" button
   - [ ] Reject the connection in MetaMask popup
   - [ ] Verify error alert appears with rejection message
   - [ ] Component remains in disconnected state

3. **Test Network Switch Failure**:
   - [ ] Attempt to switch networks and reject in MetaMask
   - [ ] Verify error message appears
   - [ ] Component handles failure gracefully

### Scenario 8: Disconnect Functionality

#### Test Wallet Disconnection
1. **Test Disconnect Process**:
   - [ ] Click "Disconnect" button in top-right corner
   - [ ] Wallet disconnects immediately
   - [ ] Component returns to initial "Connect Your Wallet" state
   - [ ] Contract accessibility state resets
   - [ ] All error states clear

### Scenario 9: Visual Status Indicators

#### Test Connection Status Indicators
1. **Verify Status Dot Colors**:
   - [ ] **Green pulsing**: Connected to wallet and contract accessible
   - [ ] **Yellow steady**: Connected to wallet but contract not accessible
   - [ ] **Gray/off**: Not connected

2. **Verify Status Text**:
   - [ ] "Connected to blockchain and contract" (green state)
   - [ ] "Connected to wallet — contract unreachable" (yellow state)
   - [ ] "Not connected" (disconnected state)

## Troubleshooting Common Issues

### MetaMask Not Installed
**Symptoms**: Connection fails immediately with "MetaMask not found" error
**Solutions**:
- Install MetaMask browser extension
- Refresh page after installation
- Ensure MetaMask is enabled and unlocked

### Network Switching Failures
**Symptoms**: "Switch to Base Sepolia" fails or shows error
**Solutions**:
- Manually add Base Sepolia network to MetaMask:
  - Network Name: Base Sepolia
  - RPC URL: https://sepolia.base.org
  - Chain ID: 84532
  - Currency Symbol: ETH
  - Block Explorer: https://sepolia.basescan.org
- Ensure MetaMask is unlocked
- Try switching networks manually in MetaMask first

### Contract Probe Errors
**Symptoms**: Red alert showing "Contract probe failed"
**Possible Causes & Solutions**:
- **Contract not deployed**: Verify contract is deployed to Base Sepolia
- **Wrong network**: Ensure connected to Base Sepolia (chain ID 84532)
- **RPC issues**: Check if Base Sepolia RPC is responding
- **Contract address mismatch**: Verify deployed address in `deployed-addresses.json`

### Balance Loading Issues
**Symptoms**: Balance shows "Loading..." indefinitely
**Solutions**:
- Check network connectivity
- Verify RPC endpoint is responding
- Try refreshing balance manually
- Check browser console for RPC errors

### Connection State Persistence
**Symptoms**: Wallet disconnects on page refresh
**Expected Behavior**: This is normal - wagmi handles reconnection automatically
**Solutions**:
- Wait for automatic reconnection
- Manually reconnect if needed

## Testing Checklist Summary

### Pre-Connection Tests
- [ ] Initial UI renders correctly
- [ ] All visual elements are present
- [ ] External links work properly

### Connection Tests
- [ ] MetaMask connection works
- [ ] Address truncation is correct
- [ ] Connection state updates properly

### Network Tests
- [ ] Wrong network detection works
- [ ] Network switching functions
- [ ] Network info displays correctly

### Balance Tests
- [ ] Balance displays properly
- [ ] Refresh functionality works
- [ ] Loading states are handled

### Contract Tests
- [ ] Automatic probe runs
- [ ] Success state displays correctly
- [ ] Error handling works properly

### Error Handling Tests
- [ ] Connection failures handled
- [ ] Network errors managed
- [ ] User rejections processed

### Disconnect Tests
- [ ] Disconnect button works
- [ ] State resets properly
- [ ] Clean transition to initial state

## Expected Test Results

After completing all tests, the wallet connection component should:
1. Successfully connect to MetaMask
2. Properly detect and switch to Base Sepolia network
3. Display accurate balance and network information
4. Successfully probe contract accessibility
5. Handle all error scenarios gracefully
6. Provide clear visual feedback for all states
7. Allow clean disconnection and reconnection

## Notes for Developers

- The component uses wagmi hooks for all blockchain interactions
- Contract probe specifically calls `getElection(1)` as a connectivity test
- Base Sepolia chain ID is hardcoded as 84532
- Address truncation follows the pattern: `${addr.slice(0, 6)}...${addr.slice(-4)}`
- All error states are properly managed and displayed to users
- The component is fully responsive and works across different screen sizes