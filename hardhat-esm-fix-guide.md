# Hardhat ESM Fix Guide

## Problem Explanation

The issue occurs because `npx` is installing Hardhat 3.0.3 (which requires ESM) instead of using the pinned version 2.26.3 from `package.json`. This happens when:

1. **Missing node_modules**: When `node_modules` doesn't exist, `npx` downloads the latest version
2. **ESM vs CommonJS**: Hardhat 3.x requires ESM (`"type": "module"`), but the project uses CommonJS
3. **Package Manager Conflicts**: Mixing `pnpm-lock.yaml` with `npm` commands
4. **Missing Dependencies**: Required Hardhat plugins not installed

## Root Cause Analysis

```bash
# What's happening:
npx hardhat compile
# → npx checks for local installation
# → No node_modules found
# → Downloads latest Hardhat (3.0.3)
# → Hardhat 3.x requires ESM
# → hardhat.config.js uses require() (CommonJS)
# → ❌ ESM Error
```

## Immediate Fix Commands

### Option 1: Quick Fix (Recommended)
```bash
# Remove conflicting files
del pnpm-lock.yaml

# Install correct dependencies
npm install

# Test Hardhat installation
npx hardhat --version

# Compile contracts
npx hardhat compile

# Start development
npm run dev
```

### Option 2: Clean Install
```bash
# Use the provided script
fix-hardhat-version.bat

# Or manually:
npm run clean:deps
npm install
npx hardhat compile
npm run dev
```

## Verification Steps

### 1. Check Hardhat Version
```bash
npx hardhat --version
# Should output: 2.26.3
```

### 2. Verify Contract Compilation
```bash
npx hardhat compile
# Should output: Compilation finished successfully
```

### 3. Check ABI Generation
```bash
npm run generate:abi
# Should create/update lib/abi/ files
```

### 4. Test Development Server
```bash
npm run dev
# Should start Next.js server on localhost:3000
```

## Alternative Solutions

### Option A: Upgrade to Hardhat 3.x with ESM

If you want to use the latest Hardhat version:

1. **Update package.json**:
```json
{
  "type": "module",
  "devDependencies": {
    "hardhat": "^3.0.3"
  }
}
```

2. **Convert hardhat.config.js to ESM**:
```javascript
// hardhat.config.js → hardhat.config.mjs
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_URL || "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;
```

3. **Update scripts**:
```json
{
  "scripts": {
    "compile:contracts": "npx hardhat compile && node scripts/generate-abi.js"
  }
}
```

### Option B: Lock Hardhat 2.x Version

To prevent future version conflicts:

1. **Use exact version**:
```json
{
  "devDependencies": {
    "hardhat": "2.26.3"
  }
}
```

2. **Add .npmrc**:
```
save-exact=true
```

3. **Use package-lock.json**:
```bash
npm install
# This creates package-lock.json with exact versions
```

### Option C: Use Different Build Tools

Consider alternatives:
- **Foundry**: Rust-based, faster compilation
- **Truffle**: Alternative to Hardhat
- **Brownie**: Python-based framework

## Prevention Strategies

### 1. Always Install Dependencies First
```bash
# Before any development work
npm install
```

### 2. Use Consistent Package Manager
```bash
# Stick with npm (remove pnpm-lock.yaml)
# OR stick with pnpm (remove package-lock.json)
```

### 3. Version Locking
```bash
# Use exact versions in package.json
npm install --save-exact hardhat@2.26.3
```

### 4. Regular Dependency Audits
```bash
# Check for outdated packages
npm outdated

# Update dependencies safely
npm update
```

## Troubleshooting Common Issues

### Permission Errors on Windows
```bash
# Run Command Prompt as Administrator
# Or use PowerShell with execution policy:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Network Connectivity Problems
```bash
# Clear npm cache
npm cache clean --force

# Use different registry if needed
npm config set registry https://registry.npmjs.org/
```

### Cache Corruption Issues
```bash
# Remove all cache and reinstall
npm run clean:deps
npm install
```

### Version Conflicts
```bash
# Check installed versions
npm list hardhat
npm list @nomicfoundation/hardhat-ethers

# Force reinstall specific package
npm install hardhat@2.26.3 --force
```

## ESM Migration Guide (If Needed)

### Step 1: Update package.json
```json
{
  "type": "module",
  "devDependencies": {
    "hardhat": "^3.0.3",
    "@nomicfoundation/hardhat-toolbox": "^4.0.0"
  }
}
```

### Step 2: Convert Configuration
```javascript
// hardhat.config.mjs
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_URL || "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;
```

### Step 3: Update Scripts
```javascript
// scripts/generate-abi.mjs
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Convert to ESM syntax
```

### Step 4: Test Compatibility
```bash
# Test with Next.js
npm run dev

# Test contract compilation
npx hardhat compile

# Test deployment
npx hardhat deploy:baseSepolia
```

## Success Indicators

After applying the fix, you should see:

✅ **Hardhat Version**: `2.26.3` (not 3.x)  
✅ **Compilation**: `Compilation finished successfully`  
✅ **ABI Generation**: Files created in `lib/abi/`  
✅ **Development Server**: `Ready - started server on 0.0.0.0:3000`  
✅ **No ESM Errors**: No "require()" or "module" errors  

## Next Steps

1. **Test the complete pipeline**:
   ```bash
   npm run test:contracts
   npm run dev
   ```

2. **Deploy to testnet**:
   ```bash
   # Set your .env PRIVATE_KEY first
   npm run hh:deploy:baseSepolia
   ```

3. **Monitor for issues**:
   - Check for any remaining ESM/CommonJS conflicts
   - Verify all dependencies are compatible
   - Test the full development workflow

## Support

If issues persist:
1. Check the `fix-hardhat-version.bat` script output
2. Review the troubleshooting section above
3. Verify your Node.js version (recommend 18.x or 20.x)
4. Check for conflicting global installations
