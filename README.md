# University Voting - Blockchain Voting System

A complete university blockchain voting system built with:
- Smart contracts in Solidity (Hardhat 2.26.3)
- Next.js 14+ frontend with React 18+
- wagmi + viem for wallet & RPC integration
- React Query (TanStack Query) for caching and real-time UI updates
- Hardhat for compilation, testing and deployments
- ethers v5.8.0 for compatibility with thirdweb SDK
- Base Sepolia testnet for deployments

This README documents the architecture, setup, deployment, admin APIs, usage flows, environment variables, and troubleshooting guidance for running and developing the project.

## 🚀 Project Status

**✅ COMPLETED:**
- Smart contracts deployed on Base Sepolia (`0xAEa1F2693C0cB46AA0675b8c63cA8DD0AA4006f0`)
- Comprehensive frontend with voting interface, admin dashboard, candidate management
- Wallet integration with MetaMask, WalletConnect, Coinbase Wallet
- Blockchain hooks and services implemented
- Fixed dependency conflicts (Hardhat 2.26.3, ethers v5.8.0)
- Updated scripts to use local binaries
- Package lock generation for reproducible builds

**🔄 NEXT STEPS:**
- Test the updated scripts to ensure they work
- Complete end-to-end integration testing
- Update documentation with latest improvements
- Prepare for production deployment

## Project Overview

This repository implements a decentralized voting system for university elections. Key components:

- `contracts/UniversityVoting.sol`: A Solidity smart contract that manages elections, positions, candidates, voter whitelisting, and vote casting.
- Next.js frontend: User and admin interfaces for creating elections, verifying candidates, whitelisting voters, and casting votes.
- Blockchain integration: Wallet connection and transactions driven by wagmi + viem; read operations use public RPC clients; write operations use connected wallet clients.
- Server-side admin APIs: Admin-only operations can be executed via server-side admin flow (using server wallet signatures or an admin service).
- ID mapping: A deterministic mapping layer that maps human-friendly UI IDs to onchain uint256 IDs to keep routes and references stable.

Goals:
- Secure, auditable vote recording on-chain
- Admin tooling for election lifecycle management
- Clear developer experience for compiling, deploying, and integrating contracts

---

## Tech Stack

- Frontend
  - Next.js 14+
  - React 18+
  - Tailwind CSS & design system primitives
  - TanStack Query (React Query) for caching and data sync
  - wagmi + viem for wallet/connect and contract interactions
  - @wagmi/connectors (MetaMask, WalletConnect, Coinbase Wallet)
  - (Optional) RainbowKit for a polished wallet modal (not required)
- Smart contracts & tooling
  - Solidity (OpenZeppelin libraries)
  - Hardhat 2.26.3 for compile / test / deploy
  - ethers v5.8.0 for scripts and tests
- Backend/APIs (Next.js API routes)
  - Server-side admin routes under `app/api/admin/*`
  - Can use server signing via PRIVATE_KEY or optional thirdweb server keys

---

## Notable Changes / Consolidation

This repository standardizes on:
- wagmi + viem for wallet connectivity and contract interactions on the client
- A single source of truth for blockchain operations in `lib/blockchain/voting-service.ts`
- React Query for caching and real-time UI updates
- The in-repo mock multi-wallet provider has been removed in favor of wagmi connectors and a consistent provider hierarchy
- Fixed dependency management with Hardhat 2.26.3 and ethers v5.8.0
- Reproducible builds with package-lock.json

---

## Quickstart / Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Git
- Basic familiarity with Ethereum wallets and RPC providers
- (Optional) A funded test wallet for Base Sepolia to perform transactions

### Installation Steps

1. **Clone repository**
   ```bash
   git clone <repo-url>
   cd FINALYEARBLOCKCHAIN
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Generate package-lock.json (if needed)**
   ```bash
   # Run the automated script to generate reproducible builds
   generate-lockfile.bat
   ```

4. **Create environment file**
   - Copy example and edit values:
     ```bash
     cp .env.example .env.local
     ```
   - Minimum environment variables required for blockchain mode (recommended `.env.local`):
     - NEXT_PUBLIC_USE_BLOCKCHAIN=true
     - NEXT_PUBLIC_CHAIN_ID=84532
     - NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
     - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
     - NEXT_PUBLIC_CONTRACT_ADDRESS= (optional override; otherwise resolved from deployed-addresses.json)
     - ADMIN_WALLET_ADDRESS=0xYourAdminAddressHere
     - PRIVATE_KEY=your_server_admin_private_key (only for server-side admin flows; never commit)
   - See the "Environment variables" section below for a full list.

5. **Compile contracts and generate ABIs**
   ```bash
   npm run hh:compile
   npm run generate:abi
   ```
   This will compile contracts and populate `lib/contracts` with ABIs used by the frontend.

6. **Start a local Hardhat node for testing (optional)**
   ```bash
   npm run hh:node
   ```
   Deploy to local node:
   ```bash
   npm run hh:deploy:localhost
   ```

7. **Deploy to Base Sepolia (testnet)**
   - Ensure PRIVATE_KEY and NEXT_PUBLIC_RPC_URL are set for the deployment account
   ```bash
   npm run hh:compile
   npm run hh:deploy:baseSepolia
   ```
   After deployment, `lib/contracts/deployed-addresses.json` is updated with the contract address for `baseSepolia`.

8. **Start the Next.js application**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

---

## Development Workflow

### Available Scripts

```bash
# Contract Management
npm run hh:compile          # Compile smart contracts
npm run hh:test            # Run contract tests
npm run hh:deploy:baseSepolia  # Deploy to Base Sepolia
npm run hh:deploy:localhost    # Deploy to local Hardhat node
npm run hh:node            # Start local Hardhat node

# ABI Generation
npm run generate:abi       # Generate TypeScript ABI files

# Development
npm run dev               # Start Next.js development server
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm run test             # Run all tests
npm run test:contracts   # Run contract tests only
npm run test:e2e         # Run end-to-end tests

# Utilities
generate-lockfile.bat    # Generate package-lock.json for reproducible builds
fix-hardhat-version.bat  # Fix Hardhat dependency issues
```

### Script Validation

Before proceeding with development, validate your setup:

```bash
# Run the comprehensive script validation
# This will test all scripts and verify the environment
# See script-validation-plan.md for detailed testing procedures
```

---

## Environment Variables

Below are the key environment variables used by the project. Use `.env.local` for development (do not commit secrets).

- NEXT_PUBLIC_USE_BLOCKCHAIN=true|false
  - Toggle between onchain mode (true) and mock mode (false). Default recommended: true.

- NEXT_PUBLIC_CHAIN_ID
  - Chain ID used in the app. For Base Sepolia set to 84532.

- NEXT_PUBLIC_RPC_URL
  - RPC endpoint used by public clients (reads). Example: https://sepolia.base.org

- NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
  - WalletConnect v2 project id (if using WalletConnect connector).

- NEXT_PUBLIC_CONTRACT_ADDRESS
  - Optional override for the deployed contract address used by the client. If omitted, server-side resolves address from `lib/contracts/deployed-addresses.json` using the chain id mapping.

- ADMIN_WALLET_ADDRESS
  - The admin wallet address expected by server-side admin routes for lightweight checks.

- PRIVATE_KEY
  - Private key used by server-side scripts or admin API to sign transactions (only for server-side; never bundle this for client).

- THIRDWEB keys (optional/legacy)
  - THIRDWEB_SECRET_KEY, NEXT_PUBLIC_THIRDWEB_CLIENT_ID — only if you opt into thirdweb admin flows.

Security note: Never commit .env files containing PRIVATE_KEY or other secrets to source control.

---

## Deployment Info (Current)

The repository ships with deployment records in `lib/contracts/deployed-addresses.json`. As of the latest recorded deployment:

- Network key: baseSepolia
- Network name: Base Sepolia (testnet)
- Chain ID: 84532
- UniversityVoting Contract Address: 0xAEa1F2693C0cB46AA0675b8c63cA8DD0AA4006f0
- Deployed at: 2025-08-29T15:37:07.837Z

If you use a different deployment, update `.env.local`'s NEXT_PUBLIC_CONTRACT_ADDRESS or re-run the deploy script to populate the JSON file.

---

## Provider & App Initialization (Notes for Developers)

The recommended provider hierarchy inside `app/layout.tsx`:
- ThemeProvider (UI theming)
  - QueryClientProvider (TanStack Query)
    - WagmiConfig (configured with wagmi + viem clients and connectors)
      - UniversityVotingProvider (app-specific context wrapping React Query hooks)
        - Application UI

Key wagmi features used:
- connectors: MetaMask, WalletConnect, Coinbase Wallet via `@wagmi/connectors`
- hooks: useAccount, useConnect, useDisconnect, useSwitchChain, useBalance, etc.
- publicClient / walletClient pattern for read/write separation (viem integration)

---

## Usage Guide

1. **Wallet Connection**
   - Open the wallet connection UI (header / login page).
   - Choose connector: MetaMask, WalletConnect, or Coinbase Wallet.
   - Use useSwitchChain to prompt user to switch to Base Sepolia (chainId 84532) if they're on the wrong network.
   - After connecting, the UI shows account address, balance and network status.

2. **Admin Dashboard**
   - Admin must connect the admin wallet (ADMIN_WALLET_ADDRESS) to perform admin flows or call server admin APIs which sign using PRIVATE_KEY.
   - Create election: Fill in election title, description, start & end timestamps, and initial positions; the dashboard calls `/api/admin/create-election` or directly creates onchain tx via connected admin wallet.
   - Verify candidates: Approve or verify candidates using server route or onchain contract method `verifyCandidate`.
   - Whitelist voters: Use admin API `/api/admin/whitelist-voter` to add voter addresses.

3. **Voting Interface (Voters)**
   - Connect wallet.
   - Browse active elections and positions. The frontend maps UI ids to onchain ids via `lib/contracts/id-map.ts`.
   - If whitelisted and election is active, cast vote. The client sends a signed transaction using the connected wallet client. The UI displays tx hash and progress, then updates once `VoteCast` event is observed.

4. **Transaction Tracking & Block Explorer**
   - All onchain transactions display the transaction hash in the UI.
   - Users can open transactions in a block explorer for Base Sepolia by combining the explorer base URL and the tx hash.

---

## Admin API Endpoints (server-side)

Routes are under `app/api/admin/*`. Examples:

- POST /api/admin/create-election
  - Payload: { title, description, startTime, endTime, initialPositions }
  - Returns: { txHash, onchainElectionId, events } on success (or error object)

- POST /api/admin/verify-candidate
  - Payload: { electionId, positionId, candidateId }
  - Returns: { txHash, status }

- POST /api/admin/whitelist-voter
  - Payload: { electionId, voter }
  - Returns: { txHash, status }

Notes:
- API endpoints perform server-side validation and must be protected in production. Use server-only secrets, authentication, or IP restrictions.
- Admin endpoints now integrate with the unified blockchain service layer in `lib/blockchain/thirdweb-service.ts` or `lib/blockchain/voting-service.ts` depending on implementation; prefer `voting-service.ts` for viem/wagmi interactions.

---

## Mapping UI IDs to Onchain IDs

- The UI uses human-friendly string IDs (e.g., "pos-president") while the contract uses numeric uint256 IDs.
- Use `lib/contracts/id-map.ts` to consistently map between UI and onchain IDs. This mapping can be persisted to localStorage or a simple server-side store for deterministic references.

---

## Testing

### Unit Tests
- Unit tests live under `test/` and run with Hardhat (Mocha/Chai).
- Run:
  ```bash
  npm test
  ```
  or
  ```bash
  npx hardhat test
  ```

### End-to-End Testing
- Comprehensive E2E testing plan available in `e2e-integration-testing.md`
- Test blockchain integration, admin workflows, voting processes, and security measures
- Run automated test suites for complete system validation

### Script Validation
- Use `script-validation-plan.md` for comprehensive script testing
- Validate all npm scripts, contract compilation, and development server functionality

### Recommended Testing Flow
1. Run script validation: `script-validation-plan.md`
2. Execute unit tests: `npm test`
3. Run E2E integration tests: `e2e-integration-testing.md`
4. Validate production readiness

---

## Troubleshooting

### Common Issues and Solutions

**Wallet Connection Issues:**
- Ensure the wallet is unlocked and supports the connector chosen.
- Use the wallet UI to switch network or let the dApp call `useSwitchChain` (wagmi) to prompt switching to chainId 84532.
- Confirm NEXT_PUBLIC_CHAIN_ID and NEXT_PUBLIC_RPC_URL are correct.

**Missing Contract Address:**
- Confirm `lib/contracts/deployed-addresses.json` contains the network key (e.g., "baseSepolia") and a valid address.
- If missing, run deployment scripts or add the address manually to this JSON.

**Transaction Failures:**
- Inspect the transaction receipt and revert reason via the block explorer or local node logs.
- Verify input parameters: electionId > 0, correct position/candidate ids, valid timestamps.
- Ensure signer has enough ETH (or base token) for gas.

**ABI Mismatches:**
- Re-run `npm run hh:compile` to regenerate ABIs and artifacts.
- Ensure the frontend imports the ABI from `lib/contracts` that matches the deployed contract.

**Dependency Issues:**
- Run `fix-hardhat-version.bat` to resolve Hardhat dependency conflicts
- Use `generate-lockfile.bat` to create reproducible builds
- Clear npm cache: `npm cache clean --force`

**Event Subscription Issues:**
- Verify the `publicClient` RPC endpoint is correct and supports the event logs.
- Check the contract address and event signature names.

**Admin API Authentication:**
- Server-side admin endpoints rely on environment secrets; ensure PRIVATE_KEY and ADMIN_WALLET_ADDRESS are configured correctly for server signing or verification.

### Performance Optimization

**Development Server:**
- Clear Next.js cache: `rm -rf .next && npm run dev`
- Use `npm run build` for production builds
- Monitor memory usage during development

**Contract Compilation:**
- Use `npm run hh:compile --force` for clean compilation
- Monitor compilation times and optimize if needed
- Use incremental compilation for development

---

## Security & Best Practices

- Never commit private keys or sensitive environment variables to the repository.
- For production deployments, use secret management or CI environment secrets.
- Consider multi-signature (multi-sig) for any admin wallet used to create or control elections on mainnet.
- Add rate limiting and authentication for server-side admin APIs.
- Get a security audit prior to any mainnet deployments that will hold real value.
- Use reproducible builds with package-lock.json
- Regularly update dependencies and run security audits

---

## Development Tips

- Use NEXT_PUBLIC_USE_BLOCKCHAIN=false for rapid UI-only development if you need to stub blockchain calls (but the repo is designed to use the onchain flow).
- Use a local Hardhat node for debugging events and transactions quickly.
- Leverage React Query's invalidation on contract events (VoteCast, CandidateAdded, ElectionCreated) to keep UI in sync without heavy polling.
- Keep contract ABIs and deployed addresses up-to-date in `lib/contracts`.
- Use the automated scripts for dependency management and validation.

---

## Contributing

- Fork, create a branch, and open a pull request.
- Run tests and ensure `npm run hh:compile` is executed when modifying contracts.
- Update ABIs by using `npm run generate:abi` if contract interfaces change.
- Follow the testing procedures outlined in the testing documentation.

---

## Resources

- Hardhat: https://hardhat.org
- wagmi: https://wagmi.sh
- viem: https://github.com/wagmi-dev/viem
- WalletConnect: https://walletconnect.com
- RainbowKit (optional): https://www.rainbowkit.com
- thirdweb (optional): https://thirdweb.com
- Base Sepolia: https://docs.base.org/guides/deploy-smart-contracts

---

## Task Manager Checklist

### ✅ Completed
- [x] Smart contracts deployed on Base Sepolia
- [x] Frontend components implemented
- [x] Wallet integration configured
- [x] Blockchain hooks and services
- [x] Dependency conflicts resolved
- [x] Scripts updated for local binaries
- [x] Package lock generation implemented

### 🔄 In Progress
- [ ] Script validation testing
- [ ] End-to-end integration testing
- [ ] Documentation updates

### 📋 Next Steps
- [ ] Complete E2E testing
- [ ] Production deployment preparation
- [ ] Monitoring and alerting setup
- [ ] Performance optimization
- [ ] Security audit

---

If you need help or encounter an issue not covered here, open an issue in the repository or contact the maintainers with details (network, tx hashes, logs).