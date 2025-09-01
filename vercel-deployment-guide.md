# Vercel Deployment Guide for Blockchain Voting Project

## Prerequisites
- Node.js 18+ installed
- Vercel CLI installed (`npm i -g vercel`)
- Git repository initialized
- All dependencies installed

## Step-by-Step Deployment Process

### 1. Prepare Your Project
```bash
# Ensure you're in the project root directory
cd "C:\Users\Praise Koledoye\Desktop\final year project\FINALYEARBLOCKCHAIN"

# Install dependencies
npm install --force

# Compile contracts
npm run compile:contracts

# Build the project locally to test
npm run build
```

### 2. Initialize Vercel Deployment
```bash
# Login to Vercel (if not already logged in)
vercel login

# Initialize deployment
vercel
```

### 3. Answer Vercel Questions Correctly
When prompted, use these answers:

- **Set up and deploy?** → `yes`
- **Which scope?** → `koledoyepraise-5026's projects`
- **Link to existing project?** → `no`
- **Project name?** → `VOTINGONCHAIN`
- **Code directory?** → `.` (just a dot, not the full path)

### 4. Environment Variables
Make sure these environment variables are set in Vercel:
- `NEXT_PUBLIC_CHAIN_ID`: `84532`
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: `0xAEa1F2693C0cB46AA0675b8c63cA8DD0AA4006f0`
- `NEXT_PUBLIC_RPC_URL`: `https://sepolia.base.org`
- `NEXT_PUBLIC_USE_BLOCKCHAIN`: `true`
- `NEXT_PUBLIC_APP_NAME`: `University Voting DApp`

### 5. Deployment Commands
```bash
# Deploy to production
vercel --prod

# Or deploy to preview
vercel
```

## Troubleshooting

### Path Issues
If you encounter path errors:
1. Make sure you're in the correct directory
2. Use `.` for the code directory, not the full path
3. Avoid spaces in directory names if possible

### Build Issues
If build fails:
1. Check that all dependencies are installed
2. Ensure contracts are compiled
3. Verify environment variables are set

### Contract Compilation
If Hardhat compilation fails:
```bash
# Clean and reinstall
npm run clean:deps
npm install --force
npm run compile:contracts
```

## Post-Deployment

### Verify Deployment
1. Check the deployment URL provided by Vercel
2. Test all functionality:
   - Wallet connection
   - Voting interface
   - Admin dashboard
   - Contract interactions

### Monitor Logs
```bash
# View deployment logs
vercel logs

# View function logs
vercel logs --function=api/admin/login
```

## Important Notes

1. **Blockchain Integration**: The app connects to Base Sepolia testnet
2. **Contract Address**: Ensure the contract is deployed and the address is correct
3. **Environment Variables**: All blockchain-related configs are in vercel.json
4. **Build Process**: Includes contract compilation and ABI generation

## Support
If deployment fails, check:
- Vercel build logs
- Contract compilation status
- Environment variable configuration
- Network connectivity for blockchain operations
