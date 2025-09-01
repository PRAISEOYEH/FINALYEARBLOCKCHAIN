# Next.js Development Server Troubleshooting Guide

## Quick Fix Commands

### Immediate Fix (Recommended)
```bash
# Run the automated fix script
fix-dev-server.bat
```

### Manual Fix Steps
```bash
# 1. Clean everything
rmdir /s /q node_modules
del package-lock.json
del pnpm-lock.yaml
rmdir /s /q .next

# 2. Configure npm
npm config set registry https://registry.npmjs.org/
npm config set strict-ssl false

# 3. Reinstall dependencies
npm install --force

# 4. Start development server
npm run dev:safe
```

## Common Issues and Solutions

### 1. SWC Binary Loading Error

**Error**: `Failed to load SWC binary for win32-x64-msvc`

**Causes**:
- Corrupted SWC binary
- Architecture mismatch
- Missing dependencies

**Solutions**:
```bash
# Reinstall Next.js to fix SWC binaries
npm install next@latest --force

# Or use legacy compilation
npm run dev:legacy
```

**Prevention**:
- Use `swcMinify: false` in next.config.mjs
- Disable turbo mode if issues persist

### 2. Package Manager Conflicts

**Error**: `pnpm command not found` or lockfile conflicts

**Causes**:
- Mixed package managers (pnpm + npm)
- Corrupted lockfiles
- Inconsistent dependency resolution

**Solutions**:
```bash
# Remove pnpm lockfile and use npm
del pnpm-lock.yaml
npm install --force

# Or switch to pnpm completely
npm install -g pnpm
pnpm install
```

### 3. SSL Certificate Issues

**Error**: `SSL signature verification failed`

**Causes**:
- Corporate firewall/proxy
- Outdated certificates
- Network configuration

**Solutions**:
```bash
# Disable strict SSL
npm config set strict-ssl false

# Set registry explicitly
npm config set registry https://registry.npmjs.org/

# Use HTTP if HTTPS fails
npm config set registry http://registry.npmjs.org/
```

### 4. Network Connectivity Problems

**Error**: `Network timeout` or `ECONNRESET`

**Causes**:
- Slow internet connection
- Firewall blocking npm
- DNS issues

**Solutions**:
```bash
# Increase timeout values
npm config set fetch-retries 3
npm config set fetch-retry-mintimeout 10000
npm config set fetch-retry-maxtimeout 60000

# Use alternative DNS
npm config set registry https://registry.npmjs.org/
```

## Alternative Development Commands

### Safe Development (Recommended)
```bash
npm run dev:safe
```

### Legacy Development (Fallback)
```bash
npm run dev:legacy
```

### Clean Development
```bash
npm run dev:clean
```

### Without Turbo Mode
```bash
npm run dev -- --no-turbo
```

## Diagnostic Commands

### Check Environment
```bash
# Node.js version
node --version

# npm version
npm --version

# Check for pnpm
pnpm --version
```

### Check Dependencies
```bash
# List installed packages
npm list

# Check for conflicts
npm ls

# Verify Next.js installation
npm list next
```

### Check SWC Status
```bash
# Check SWC binary
npm list @next/swc-win32-x64-msvc

# Test SWC compilation
npx next build --debug
```

## Windows-Specific Issues

### Path Length Limitations
**Problem**: Windows has 260-character path limit

**Solution**:
```bash
# Enable long paths (run as Administrator)
fsutil behavior set SymlinkEvaluation L2L:1 R2R:1 L2R:1 R2L:1

# Or use shorter project paths
```

### Permission Issues
**Problem**: Access denied errors

**Solution**:
```bash
# Run Command Prompt as Administrator
# Or use PowerShell with execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Binary Compatibility
**Problem**: Architecture mismatch

**Solution**:
```bash
# Check system architecture
echo %PROCESSOR_ARCHITECTURE%

# Reinstall with correct architecture
npm install --force
```

## Performance Optimization

### Development Server Performance
```bash
# Use turbo mode (if stable)
npm run dev -- --turbo

# Disable type checking in development
# Add to next.config.mjs:
typescript: { ignoreBuildErrors: true }
```

### Build Performance
```bash
# Parallel builds
npm run build -- --parallel

# Incremental builds
npm run build -- --incremental
```

## Monitoring and Debugging

### Enable Debug Logging
```bash
# Next.js debug
DEBUG=* npm run dev

# npm debug
npm run dev --verbose
```

### Check Memory Usage
```bash
# Monitor Node.js memory
node --max-old-space-size=4096 node_modules/.bin/next dev
```

## Prevention Strategies

### 1. Use Consistent Package Manager
- Choose one: npm, yarn, or pnpm
- Don't mix package managers
- Keep lockfiles consistent

### 2. Regular Maintenance
```bash
# Weekly cleanup
npm cache clean --force
npm audit fix
npm update
```

### 3. Environment Isolation
```bash
# Use nvm for Node.js version management
nvm install 18
nvm use 18

# Use .nvmrc file
echo "18" > .nvmrc
```

### 4. Backup Configuration
```bash
# Export npm configuration
npm config list > npm-config-backup.txt

# Backup package.json
copy package.json package.json.backup
```

## Emergency Recovery

### Complete Reset
```bash
# 1. Backup important files
copy package.json package.json.backup
copy next.config.mjs next.config.mjs.backup

# 2. Clean everything
rmdir /s /q node_modules
del package-lock.json
del pnpm-lock.yaml
rmdir /s /q .next

# 3. Reset npm configuration
npm config delete registry
npm config delete strict-ssl

# 4. Fresh install
npm install

# 5. Restore configuration if needed
copy package.json.backup package.json
```

### Alternative Package Manager
```bash
# Switch to yarn
npm install -g yarn
yarn install

# Switch to pnpm
npm install -g pnpm
pnpm install
```

## Success Indicators

### Development Server Running
- ✅ "Ready - started server on 0.0.0.0:3000"
- ✅ "Local: http://localhost:3000"
- ✅ No error messages in console
- ✅ Browser loads application

### Build Success
- ✅ "Build completed successfully"
- ✅ No TypeScript errors
- ✅ No ESLint errors
- ✅ Optimized bundle generated

### Performance Metrics
- ✅ Development server starts in < 10 seconds
- ✅ Hot reload works correctly
- ✅ Memory usage < 1GB
- ✅ CPU usage < 50%

## Getting Help

### Check Logs
```bash
# Next.js logs
npm run dev 2>&1 | tee dev-server.log

# npm logs
npm run dev --verbose 2>&1 | tee npm-debug.log
```

### Common Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [npm Troubleshooting](https://docs.npmjs.com/troubleshooting)
- [SWC Documentation](https://swc.rs/docs/getting-started)

### When to Seek Help
- All solutions in this guide fail
- Error messages not covered here
- Performance issues persist
- Build failures in production

---

**Last Updated**: $(Get-Date -Format "yyyy-MM-dd")
**Next.js Version**: Check with `npm list next`
**Node.js Version**: Check with `node --version`
