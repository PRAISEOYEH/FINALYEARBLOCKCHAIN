# Development Server Testing Checklist

This checklist provides comprehensive steps to start, validate, and troubleshoot the Next.js blockchain voting application development server.

## Prerequisites

- [ ] Node.js (v18 or higher) installed
- [ ] npm or yarn package manager
- [ ] Git repository cloned
- [ ] MetaMask or compatible Web3 wallet installed

## 1. Initial Setup Verification

### 1.1 Dependencies Check
- [ ] Run `npm install` to ensure all dependencies are installed
- [ ] Verify no dependency conflicts or vulnerabilities
- [ ] Check that all required packages are present:
  - [ ] `wagmi` (v2.16.8+)
  - [ ] `viem` (v2.36.0+)
  - [ ] `@tanstack/react-query` (v5.85.5+)
  - [ ] `hardhat` (v2.26.3+)
  - [ ] `ethers` (v6.15.0+)

### 1.2 Environment Variables Setup
- [ ] Create `.env.local` file in project root if not exists
- [ ] Set required environment variables:
  ```
  NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
  ```
- [ ] Verify environment variables are accessible in browser (check Network tab)

## 2. Contract Compilation (Predev Hook)

### 2.1 Manual Contract Compilation Test
- [ ] Run `npm run compile:contracts` manually
- [ ] Verify successful compilation output:
  - [ ] No compilation errors in terminal
  - [ ] `artifacts/` directory created/updated
  - [ ] ABI files generated in `lib/abi/`
- [ ] Check for generated files:
  - [ ] `lib/abi/UniversityVoting.ts` exists
  - [ ] `lib/contracts/deployed-addresses.json` exists

### 2.2 Predev Hook Verification
- [ ] Ensure `predev` script in `package.json` points to `npm run compile:contracts`
- [ ] Verify hook executes before development server starts

## 3. Development Server Startup

### 3.1 Start Development Server
- [ ] Run `npm run dev` command
- [ ] Wait for predev hook to complete contract compilation
- [ ] Verify server starts successfully:
  - [ ] No compilation errors displayed
  - [ ] Server listening message appears
  - [ ] Default port 3000 is used (or alternative if specified)

### 3.2 Server Accessibility
- [ ] Open browser and navigate to `http://localhost:3000`
- [ ] Verify page loads without errors
- [ ] Check browser console for JavaScript errors
- [ ] Confirm page renders with expected layout

## 4. Provider Initialization Validation

### 4.1 WagmiProvider Verification
- [ ] Open browser developer tools
- [ ] Check console for wagmi initialization messages
- [ ] Verify no wagmi configuration errors
- [ ] Confirm Base Sepolia network (Chain ID: 84532) is configured

### 4.2 MultiWalletProvider Verification
- [ ] Check that wallet connection components render
- [ ] Verify no provider context errors in console
- [ ] Confirm wallet detection functionality is available

### 4.3 UniversityVotingProvider Verification
- [ ] Check for voting context initialization
- [ ] Verify no contract connection errors
- [ ] Confirm provider wraps application correctly

## 5. Network Configuration Validation

### 5.1 Base Sepolia Configuration
- [ ] Verify wagmi config uses `baseSepolia` from `wagmi/chains`
- [ ] Check RPC URL configuration:
  - [ ] Environment variable `NEXT_PUBLIC_RPC_URL` is read
  - [ ] Fallback to `https://sepolia.base.org` works
- [ ] Confirm chain ID 84532 is properly configured

### 5.2 Transport Configuration
- [ ] Verify HTTP transport is configured for Base Sepolia
- [ ] Check RPC endpoint connectivity
- [ ] Confirm no network timeout errors

## 6. Application Loading Verification

### 6.1 Page Rendering
- [ ] Home page loads completely
- [ ] All components render without errors
- [ ] CSS styles are applied correctly
- [ ] Theme provider works (light/dark mode toggle)

### 6.2 Console Error Check
- [ ] No React hydration errors
- [ ] No provider initialization errors
- [ ] No network configuration warnings
- [ ] No missing dependency errors

## 7. Hot Reload Testing

### 7.1 File Change Detection
- [ ] Make a small change to a React component
- [ ] Verify hot reload triggers automatically
- [ ] Confirm changes appear without full page refresh
- [ ] Check no errors during hot reload process

## Troubleshooting Guide

### Common Issues and Solutions

#### Port Conflicts
**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`
**Solutions**:
- [ ] Kill process using port 3000: `npx kill-port 3000`
- [ ] Use alternative port: `npm run dev -- -p 3001`
- [ ] Check for other Next.js instances running

#### Contract Compilation Errors
**Problem**: Hardhat compilation fails during predev
**Solutions**:
- [ ] Check Hardhat configuration exists
- [ ] Verify Solidity contracts syntax
- [ ] Run `npm run hh:compile` separately to isolate issue
- [ ] Clear Hardhat cache: `npx hardhat clean`

#### Missing Dependencies
**Problem**: Module not found errors
**Solutions**:
- [ ] Delete `node_modules` and `package-lock.json`
- [ ] Run `npm install` again
- [ ] Check for peer dependency warnings
- [ ] Verify Node.js version compatibility

#### Provider Initialization Failures
**Problem**: React context errors or provider not found
**Solutions**:
- [ ] Check provider hierarchy in `app/layout.tsx`
- [ ] Verify all providers are properly imported
- [ ] Ensure wagmi config is correctly exported
- [ ] Check for circular dependencies

#### Environment Variable Issues
**Problem**: Environment variables not accessible
**Solutions**:
- [ ] Ensure variables start with `NEXT_PUBLIC_` for client-side access
- [ ] Restart development server after adding variables
- [ ] Check `.env.local` file location (project root)
- [ ] Verify no syntax errors in environment file

#### Network Configuration Problems
**Problem**: Cannot connect to Base Sepolia
**Solutions**:
- [ ] Verify RPC URL is accessible: `curl https://sepolia.base.org`
- [ ] Check firewall/proxy settings
- [ ] Try alternative RPC endpoints
- [ ] Confirm Base Sepolia network is operational

#### React Hydration Errors
**Problem**: Hydration mismatch warnings
**Solutions**:
- [ ] Check for client-only code in server components
- [ ] Use `suppressHydrationWarning` sparingly
- [ ] Verify consistent rendering between server and client
- [ ] Check for dynamic imports that might cause mismatches

## Success Criteria

✅ **Development server is ready when**:
- [ ] `npm run dev` completes without errors
- [ ] Server accessible at `http://localhost:3000`
- [ ] Contract compilation successful
- [ ] All providers initialized correctly
- [ ] No console errors in browser
- [ ] Base Sepolia network configured properly
- [ ] Hot reload functioning
- [ ] Environment variables accessible

## Next Steps

After successful development server validation:
1. Proceed to wallet connection testing
2. Validate blockchain integration
3. Test contract interactions
4. Verify admin dashboard functionality

---

**Note**: Keep this checklist updated as the project evolves and new dependencies or configurations are added.