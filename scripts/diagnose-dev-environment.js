#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

function logStatus(message, status) {
  const icon = status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌';
  const color = status === 'success' ? 'green' : status === 'warning' ? 'yellow' : 'red';
  log(`${icon} ${message}`, color);
}

function runCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      ...options 
    });
    return { success: true, output: result.trim() };
  } catch (error) {
    return { success: false, output: error.message };
  }
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

// Environment Verification
function checkEnvironment() {
  logSection('Environment Verification');
  
  // Check Node.js version
  const nodeResult = runCommand('node --version');
  if (nodeResult.success) {
    const version = nodeResult.output;
    const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
    if (majorVersion >= 16) {
      logStatus(`Node.js version: ${version}`, 'success');
    } else {
      logStatus(`Node.js version: ${version} (recommended: 16+)`, 'warning');
    }
  } else {
    logStatus('Node.js not found', 'error');
  }
  
  // Check npm version
  const npmResult = runCommand('npm --version');
  if (npmResult.success) {
    logStatus(`npm version: ${npmResult.output}`, 'success');
  } else {
    logStatus('npm not found', 'error');
  }
  
  // Check system architecture
  const arch = os.arch();
  const platform = os.platform();
  logStatus(`Platform: ${platform} (${arch})`, 'success');
  
  // Check for pnpm
  const pnpmResult = runCommand('pnpm --version');
  if (pnpmResult.success) {
    logStatus(`pnpm version: ${pnpmResult.output}`, 'success');
  } else {
    logStatus('pnpm not installed', 'warning');
  }
  
  // Check environment variables
  const envVars = ['NODE_ENV', 'NPM_CONFIG_REGISTRY', 'NPM_CONFIG_STRICT_SSL'];
  envVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      logStatus(`${varName}: ${value}`, 'success');
    } else {
      logStatus(`${varName}: not set`, 'warning');
    }
  });
}

// Dependency Analysis
function checkDependencies() {
  logSection('Dependency Analysis');
  
  // Check package.json
  if (checkFileExists('package.json')) {
    logStatus('package.json exists', 'success');
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    logStatus(`Project name: ${packageJson.name}`, 'success');
    logStatus(`Next.js version: ${packageJson.dependencies?.next || 'not found'}`, 'success');
  } else {
    logStatus('package.json not found', 'error');
    return;
  }
  
  // Check lockfiles
  const lockfiles = {
    'package-lock.json': 'npm',
    'pnpm-lock.yaml': 'pnpm',
    'yarn.lock': 'yarn'
  };
  
  let foundLockfiles = [];
  Object.entries(lockfiles).forEach(([file, manager]) => {
    if (checkFileExists(file)) {
      foundLockfiles.push(manager);
      logStatus(`${file} exists (${manager})`, 'success');
    }
  });
  
  if (foundLockfiles.length > 1) {
    logStatus('Multiple lockfiles detected - potential conflicts', 'warning');
  } else if (foundLockfiles.length === 0) {
    logStatus('No lockfile found', 'warning');
  }
  
  // Check node_modules
  if (checkFileExists('node_modules')) {
    const nodeModulesSize = getFileSize('node_modules');
    logStatus(`node_modules exists (${(nodeModulesSize / 1024 / 1024).toFixed(2)} MB)`, 'success');
  } else {
    logStatus('node_modules not found', 'error');
  }
  
  // Check for corrupted packages
  const corruptedCheck = runCommand('npm ls --depth=0');
  if (corruptedCheck.success) {
    logStatus('No dependency conflicts detected', 'success');
  } else {
    logStatus('Dependency conflicts detected', 'error');
    log(corruptedCheck.output, 'yellow');
  }
}

// SWC Binary Diagnostics
function checkSWC() {
  logSection('SWC Binary Diagnostics');
  
  // Check Next.js installation
  const nextCheck = runCommand('npm list next');
  if (nextCheck.success) {
    logStatus('Next.js installed', 'success');
  } else {
    logStatus('Next.js not installed', 'error');
  }
  
  // Check SWC binary
  const swcCheck = runCommand('npm list @next/swc-win32-x64-msvc');
  if (swcCheck.success) {
    logStatus('SWC binary installed', 'success');
    
    // Check binary file
    const swcPath = path.join('node_modules', '@next', 'swc-win32-x64-msvc');
    if (checkFileExists(swcPath)) {
      const swcSize = getFileSize(swcPath);
      if (swcSize > 0) {
        logStatus(`SWC binary size: ${(swcSize / 1024).toFixed(2)} KB`, 'success');
      } else {
        logStatus('SWC binary is empty', 'error');
      }
    } else {
      logStatus('SWC binary file not found', 'error');
    }
  } else {
    logStatus('SWC binary not installed', 'error');
  }
  
  // Test SWC compilation
  log('Testing SWC compilation...', 'blue');
  const swcTest = runCommand('npx next build --debug', { timeout: 30000 });
  if (swcTest.success) {
    logStatus('SWC compilation test passed', 'success');
  } else {
    logStatus('SWC compilation test failed', 'error');
    log(swcTest.output, 'yellow');
  }
}

// Network Connectivity Tests
function checkNetwork() {
  logSection('Network Connectivity Tests');
  
  // Test npm registry connectivity
  const registryTest = runCommand('npm ping');
  if (registryTest.success) {
    logStatus('npm registry accessible', 'success');
  } else {
    logStatus('npm registry not accessible', 'error');
  }
  
  // Test package download
  const downloadTest = runCommand('npm view next version');
  if (downloadTest.success) {
    logStatus('Package download test passed', 'success');
  } else {
    logStatus('Package download test failed', 'error');
  }
  
  // Check npm configuration
  const npmConfig = runCommand('npm config list');
  if (npmConfig.success) {
    logStatus('npm configuration loaded', 'success');
    if (npmConfig.output.includes('strict-ssl=false')) {
      logStatus('SSL strict mode disabled', 'warning');
    }
  } else {
    logStatus('npm configuration error', 'error');
  }
}

// Project Structure Validation
function validateProjectStructure() {
  logSection('Project Structure Validation');
  
  const requiredFiles = [
    'package.json',
    'next.config.mjs',
    'tsconfig.json',
    'tailwind.config.ts',
    'app/layout.tsx',
    'app/page.tsx'
  ];
  
  requiredFiles.forEach(file => {
    if (checkFileExists(file)) {
      logStatus(`${file} exists`, 'success');
    } else {
      logStatus(`${file} missing`, 'error');
    }
  });
  
  // Check TypeScript configuration
  if (checkFileExists('tsconfig.json')) {
    try {
      const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
      logStatus('TypeScript configuration valid', 'success');
    } catch {
      logStatus('TypeScript configuration invalid', 'error');
    }
  }
  
  // Check Next.js configuration
  if (checkFileExists('next.config.mjs')) {
    try {
      const nextConfig = fs.readFileSync('next.config.mjs', 'utf8');
      if (nextConfig.includes('swcMinify: false')) {
        logStatus('SWC minifier disabled in config', 'success');
      }
      logStatus('Next.js configuration valid', 'success');
    } catch {
      logStatus('Next.js configuration invalid', 'error');
    }
  }
}

// Automated Fixes
function runAutomatedFixes() {
  logSection('Automated Fixes');
  
  log('Running automated fixes...', 'blue');
  
  // Clean dependencies if conflicts detected
  const conflicts = runCommand('npm ls --depth=0');
  if (!conflicts.success) {
    log('Cleaning dependencies due to conflicts...', 'yellow');
    runCommand('npm run clean:deps');
    runCommand('npm install --force');
  }
  
  // Fix SWC if not working
  const swcCheck = runCommand('npm list @next/swc-win32-x64-msvc');
  if (!swcCheck.success) {
    log('Fixing SWC binary...', 'yellow');
    runCommand('npm run fix:swc');
  }
  
  // Configure npm if needed
  const strictSSL = runCommand('npm config get strict-ssl');
  if (strictSSL.success && strictSSL.output === 'true') {
    log('Configuring npm for better compatibility...', 'yellow');
    runCommand('npm config set strict-ssl false');
    runCommand('npm config set registry https://registry.npmjs.org/');
  }
  
  logStatus('Automated fixes completed', 'success');
}

// Generate Report
function generateReport() {
  logSection('Diagnostic Report');
  
  const report = {
    timestamp: new Date().toISOString(),
    platform: os.platform(),
    architecture: os.arch(),
    nodeVersion: runCommand('node --version').output,
    npmVersion: runCommand('npm --version').output,
    nextVersion: runCommand('npm list next').output,
    swcStatus: runCommand('npm list @next/swc-win32-x64-msvc').success,
    networkStatus: runCommand('npm ping').success,
    dependenciesStatus: runCommand('npm ls --depth=0').success
  };
  
  log('Diagnostic Report:', 'bright');
  console.log(JSON.stringify(report, null, 2));
  
  // Save report to file
  fs.writeFileSync('dev-environment-report.json', JSON.stringify(report, null, 2));
  logStatus('Report saved to dev-environment-report.json', 'success');
}

// Main execution
function main() {
  log('Next.js Development Environment Diagnostic Tool', 'bright');
  log('================================================', 'bright');
  
  try {
    checkEnvironment();
    checkDependencies();
    checkSWC();
    checkNetwork();
    validateProjectStructure();
    
    // Ask user if they want to run automated fixes
    log('\nWould you like to run automated fixes? (y/n)', 'cyan');
    process.stdin.once('data', (data) => {
      const answer = data.toString().trim().toLowerCase();
      if (answer === 'y' || answer === 'yes') {
        runAutomatedFixes();
      }
      generateReport();
      
      log('\nDiagnostic complete!', 'green');
      log('Check dev-environment-report.json for detailed results.', 'blue');
      process.exit(0);
    });
    
  } catch (error) {
    log(`Diagnostic failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  checkEnvironment,
  checkDependencies,
  checkSWC,
  checkNetwork,
  validateProjectStructure,
  runAutomatedFixes,
  generateReport
};
