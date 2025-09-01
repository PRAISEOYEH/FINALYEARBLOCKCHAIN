# Hardhat Command Not Found - Quick Fix Guide

## 🚨 Immediate Solution

### Quick Fix Commands (Copy & Paste)

```bash
# 1. Install dependencies
npm install --force

# 2. Test Hardhat availability
npx hardhat --version

# 3. Compile contracts
npx hardhat compile

# 4. Start development server
npm run dev
```

### Alternative Development Commands

```bash
# Skip contract compilation for faster development
npm run dev:no-contracts

# Force complete setup and start
npm run dev:force

# Compile contracts only
npm run hh:compile

# Clean and reinstall dependencies
npm run fix:deps
```

## 🔍 Root Cause Analysis

### Why Hardhat Command Wasn't Found

1. **Missing Dependencies**: The `node_modules` directory doesn't exist, indicating dependencies haven't been installed
2. **Package Manager Conflict**: `pnpm-lock.yaml` exists but you're using npm commands
3. **Script Configuration**: Package.json scripts use bare `hardhat` instead of `npx hardhat`
4. **Local vs Global Installation**: Hardhat is in devDependencies but not globally installed

### The Problem Chain

```
npm run dev
  ↓
predev script runs: npm run compile:contracts
  ↓
compile:contracts script runs: hardhat compile
  ↓
❌ 'hardhat' is not recognized as a command
```

## 🛠️ Step-by-Step Fix

### Step 1: Remove Conflicting Files

```bash
# Remove pnpm lockfile (we're using npm)
del pnpm-lock.yaml

# Clean npm cache
npm cache clean --force
```

### Step 2: Install Dependencies

```bash
# Install all dependencies including Hardhat
npm install --force

# Verify installation
npm ls hardhat
```

### Step 3: Test Hardhat Availability

```bash
# Test with npx (uses locally installed Hardhat)
npx hardhat --version

# Should output: Hardhat v2.26.3
```

### Step 4: Compile Contracts

```bash
# Compile smart contracts
npx hardhat compile

# Generate ABI files
npm run generate:abi
```

### Step 5: Start Development Server

```bash
# Start the development server
npm run dev

# Should open http://localhost:3000
```

## 🔧 Updated Scripts

The package.json has been updated with these improved scripts:

```json
{
  "scripts": {
    "compile:contracts": "npx hardhat compile && npm run generate:abi",
    "hh:compile": "npx hardhat compile && npm run generate:abi",
    "hh:test": "npx hardhat test",
    "hh:deploy:baseSepolia": "npx hardhat run scripts/deploy.js --network baseSepolia",
    "install:deps": "npm install --force",
    "setup": "npm install --force && npx hardhat compile && npm run generate:abi",
    "dev:no-contracts": "next dev",
    "dev:force": "npm run setup && npm run dev",
    "fix:deps": "npm run clean:deps && npm install --force"
  }
}
```

## 🚀 Prevention Strategies

### 1. Consistent Package Manager Usage

- **Use npm only** for this project
- Remove `pnpm-lock.yaml` and `yarn.lock` if they exist
- Always use `npm install` for dependency management

### 2. Environment Setup Best Practices

```bash
# Always use npx for local packages
npx hardhat compile    # ✅ Correct
hardhat compile        # ❌ May fail

# Install dependencies after cloning
git clone <repo>
cd <project>
npm install
```

### 3. Regular Maintenance

```bash
# Clean and reinstall periodically
npm run fix:deps

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

## 🆘 Troubleshooting Common Issues

### Issue: Permission Errors on Windows

```bash
# Run Command Prompt as Administrator
# Or use PowerShell with execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: Network Connectivity Problems

```bash
# Clear npm cache
npm cache clean --force

# Use alternative registry
npm config set registry https://registry.npmjs.org/

# Try with different network
npm install --force --no-optional
```

### Issue: Version Compatibility

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Update Node.js if needed
# Download from https://nodejs.org/
```

### Issue: Path Resolution Problems

```bash
# Check if node_modules exists
dir node_modules

# Check if Hardhat is installed
npm ls hardhat

# Reinstall if missing
npm install --save-dev hardhat@2.26.3
```

### Issue: Package Manager Conflicts

```bash
# Remove all lockfiles
del package-lock.json
del pnpm-lock.yaml
del yarn.lock

# Clean node_modules
rmdir /s node_modules

# Fresh install
npm install --force
```

## 🔄 Alternative Approaches

### Using Different Package Managers

If you prefer other package managers:

```bash
# With pnpm
pnpm install
pnpm exec hardhat compile

# With yarn
yarn install
yarn hardhat compile
```

### Global vs Local Installation

```bash
# Global installation (not recommended for projects)
npm install -g hardhat
hardhat compile

# Local installation (recommended)
npm install --save-dev hardhat
npx hardhat compile
```

### Manual Dependency Installation

```bash
# Install specific packages manually
npm install --save-dev hardhat@2.26.3
npm install --save-dev @nomicfoundation/hardhat-ethers@3.1.0
npm install --save-dev @nomicfoundation/hardhat-chai-matchers@2.1.0
npm install --save @openzeppelin/contracts@5.4.0
```

## 📋 Environment Reset Procedure

If everything is broken:

```bash
# 1. Clean everything
npm run clean:deps

# 2. Remove all generated files
del /s artifacts
del /s cache
del /s typechain-types

# 3. Fresh install
npm install --force

# 4. Compile contracts
npx hardhat compile

# 5. Test development server
npm run dev
```

## ✅ Verification Checklist

After fixing, verify these work:

- [ ] `npx hardhat --version` shows version
- [ ] `npx hardhat compile` compiles contracts
- [ ] `npm run dev` starts development server
- [ ] `npm run hh:test` runs tests
- [ ] No errors in console output
- [ ] Development server accessible at http://localhost:3000

## 🆘 Still Having Issues?

If the problem persists:

1. **Run the setup script**: `setup-dev-environment.bat`
2. **Check the logs**: Look for specific error messages
3. **Verify Node.js**: Ensure you have Node.js 18+ installed
4. **Check network**: Ensure you can access npm registry
5. **Try different terminal**: Use Command Prompt instead of PowerShell
6. **Contact support**: Share error messages and environment details

---

**Remember**: Always use `npx` for local packages and ensure dependencies are installed before running any commands!
