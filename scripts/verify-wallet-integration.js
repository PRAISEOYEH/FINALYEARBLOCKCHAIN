#!/usr/bin/env node

/**
 * Wallet Integration Verification Script
 * 
 * This script performs automated verification of the useMultiWallet hook integration
 * across the university voting system. It checks static analysis, configuration,
 * component integration, and dependency requirements.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for output formatting
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

// Utility functions
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}`)
};

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  total: 0
};

function updateResults(type) {
  results[type]++;
  results.total++;
}

// File reading utilities with path resolution
function readFile(filePath) {
  try {
    const resolvedPath = path.resolve(process.cwd(), filePath);
    return fs.readFileSync(resolvedPath, 'utf8');
  } catch (error) {
    return null;
  }
}

function fileExists(filePath) {
  const resolvedPath = path.resolve(process.cwd(), filePath);
  return fs.existsSync(resolvedPath);
}

// Optimized file traversal that skips heavy directories
function findFiles(dir, pattern) {
  const files = [];
  const skipDirs = ['node_modules', '.next', 'out', 'dist', '.git'];
  
  function traverse(currentDir) {
    try {
      const items = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item.name);
        
        if (item.isDirectory()) {
          // Skip heavy directories
          if (!skipDirs.includes(item.name)) {
            traverse(fullPath);
          }
        } else if (pattern.test(item.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
  }
  
  const resolvedDir = path.resolve(process.cwd(), dir);
  traverse(resolvedDir);
  return files;
}

// TypeScript compilation check
function checkTypeScriptCompile() {
  log.header('🔧 TYPESCRIPT COMPILATION CHECK');
  
  try {
    const output = execSync('npx tsc --noEmit', { 
      encoding: 'utf8',
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    
    log.success('TypeScript compilation passed with no errors');
    updateResults('passed');
  } catch (error) {
    if (error.stdout) {
      log.error('TypeScript compilation failed:');
      console.log(error.stdout);
    } else {
      log.error('TypeScript compilation failed with no output');
    }
    updateResults('failed');
  }
}

// RPC URL reachability and environment validation
async function checkRpcReachability() {
  log.header('🌐 RPC URL REACHABILITY CHECK');
  
  // Read wagmi configuration to get RPC URL
  const wagmiPath = path.resolve(process.cwd(), 'lib/wagmi.ts');
  if (!fileExists(wagmiPath)) {
    log.error('wagmi.ts file not found');
    updateResults('failed');
    return;
  }
  
  const wagmiContent = readFile(wagmiPath);
  if (!wagmiContent) {
    log.error('Could not read wagmi.ts file');
    updateResults('failed');
    return;
  }
  
  // Extract RPC URL from wagmi configuration
  const rpcUrlMatch = wagmiContent.match(/const rpcUrl = process\.env\.NEXT_PUBLIC_RPC_URL \|\| "([^"]+)"/);
  const defaultRpcUrl = rpcUrlMatch ? rpcUrlMatch[1] : null;
  
  if (!defaultRpcUrl) {
    log.error('Could not extract RPC URL from wagmi configuration');
    updateResults('failed');
    return;
  }
  
  // Check if environment variable is set
  const envRpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  const rpcUrl = envRpcUrl || defaultRpcUrl;
  
  log.info(`Testing RPC URL: ${rpcUrl}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    // Use JSON-RPC POST with eth_chainId method
    const response = await fetch(rpcUrl, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      
      // Check for valid JSON-RPC response with hex chainId
      if (data.result && typeof data.result === 'string' && data.result.startsWith('0x')) {
        log.success(`RPC URL is reachable and returned chainId: ${data.result}`);
        updateResults('passed');
      } else {
        log.warning(`RPC URL responded but returned invalid chainId: ${JSON.stringify(data)}`);
        updateResults('warnings');
      }
    } else {
      log.warning(`RPC URL returned status ${response.status}`);
      updateResults('warnings');
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      log.error('RPC URL request timed out');
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      log.error('RPC URL is not reachable: Network error');
    } else {
      log.error(`RPC URL is not reachable: ${error.message}`);
    }
    updateResults('failed');
  }
  
  // Check WalletConnect project ID if WalletConnect is used
  if (wagmiContent.includes('WalletConnectConnector')) {
    const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
    if (!walletConnectProjectId) {
      log.warning('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set - WalletConnect will be disabled');
      updateResults('warnings');
    } else {
      log.success('WalletConnect project ID is configured');
      updateResults('passed');
    }
  }
}

// Enhanced static analysis checks with proper wagmi v2 APIs
function checkStaticAnalysis() {
  log.header('🔍 STATIC ANALYSIS CHECKS');
  
  // Check useMultiWallet hook implementation with wagmi v2 APIs
  const hookPath = path.resolve(process.cwd(), 'hooks/use-multi-wallet.tsx');
  if (fileExists(hookPath)) {
    const hookContent = readFile(hookPath);
    if (hookContent) {
      // Check for required wagmi v2 imports (updated from v1)
      const requiredImports = [
        'useAccount',
        'useConnect',
        'useDisconnect',
        'useSwitchChain',
        'useChainId',
        'useBalance'
      ];
      
      let missingImports = [];
      requiredImports.forEach(importName => {
        if (!hookContent.includes(importName)) {
          missingImports.push(importName);
        }
      });
      
      if (missingImports.length === 0) {
        log.success('useMultiWallet hook has all required wagmi v2 imports');
        updateResults('passed');
      } else {
        log.error(`useMultiWallet hook missing imports: ${missingImports.join(', ')}`);
        updateResults('failed');
      }
      
      // Check for Base Sepolia network validation
      if (hookContent.includes('baseSepolia') || hookContent.includes('84532')) {
        log.success('Base Sepolia network validation found in hook');
        updateResults('passed');
      } else {
        log.warning('Base Sepolia network validation not found in hook');
        updateResults('warnings');
      }
      
      // Enhanced return shape validation using targeted regex patterns
      const returnBlockMatch = hookContent.match(/return\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/s);
      if (returnBlockMatch) {
        const returnBlock = returnBlockMatch[1];
        
        // Extract only top-level keys, avoiding nested object properties
        const lines = returnBlock.split('\n');
        const returnedKeys = [];
        
        for (const line of lines) {
          const trimmed = line.trim();
          // Match property names that are at the top level (not nested in objects)
          const match = trimmed.match(/^(\w+):/);
          if (match && !trimmed.includes('{') && !trimmed.includes('}')) {
            returnedKeys.push(match[1]);
          }
        }
        
        // Debug: log what we found
        console.log('Found returned keys:', returnedKeys);
        
        // Required top-level properties from the hook contract
        const requiredProperties = [
          'isConnected',
          'account',
          'connectWallet',
          'disconnectWallet',
          'switchToSupportedNetwork',
          'needsNetworkSwitch',
          'network'
        ];
        
        let missingProperties = [];
        requiredProperties.forEach(prop => {
          if (!returnedKeys.includes(prop)) {
            missingProperties.push(prop);
          }
        });
        
        // Check that network contains chainId using targeted regex
        const networkChainIdMatch = hookContent.match(/network:\s*\{\s*[^}]*chainId[^}]*\}/);
        if (!networkChainIdMatch) {
          missingProperties.push('network.chainId');
        }
        
        if (missingProperties.length === 0) {
          log.success('useMultiWallet hook returns all required properties');
          updateResults('passed');
        } else {
          log.error(`useMultiWallet hook missing properties: ${missingProperties.join(', ')}`);
          updateResults('failed');
        }
      } else {
        log.error('Could not parse return block in useMultiWallet hook');
        updateResults('failed');
      }
    } else {
      log.error('Could not read useMultiWallet hook file');
      updateResults('failed');
    }
  } else {
    log.error('useMultiWallet hook file not found');
    updateResults('failed');
  }
  
  // Enhanced component import checks with regex validation
  const componentsToCheck = [
    'app/page.tsx',
    'components/multi-wallet-connection.tsx',
    'components/candidate-dashboard.tsx',
    'components/wallet-selector-modal.tsx'
  ];
  
  componentsToCheck.forEach(componentPath => {
    const resolvedPath = path.resolve(process.cwd(), componentPath);
    if (fileExists(resolvedPath)) {
      const content = readFile(resolvedPath);
      if (content) {
        // Use regex to check for proper import pattern
        const importRegex = /import\s+\{\s*useMultiWallet\s*\}\s+from\s+['"]@\/hooks\/use-multi-wallet['"]/;
        if (importRegex.test(content)) {
          log.success(`${componentPath} properly imports useMultiWallet hook`);
          updateResults('passed');
        } else {
          log.warning(`${componentPath} does not properly import useMultiWallet hook`);
          updateResults('warnings');
        }
      } else {
        log.warning(`Could not read ${componentPath}`);
        updateResults('warnings');
      }
    } else {
      log.warning(`${componentPath} file not found`);
      updateResults('warnings');
    }
  });
}

// Enhanced configuration validation with proper connector checks
function checkConfiguration() {
  log.header('⚙️ CONFIGURATION VALIDATION');
  
  // Check wagmi configuration with proper connector instantiation patterns
  const wagmiPath = path.resolve(process.cwd(), 'lib/wagmi.ts');
  if (fileExists(wagmiPath)) {
    const wagmiContent = readFile(wagmiPath);
    if (wagmiContent) {
      // Check for proper connector instantiation patterns
      const connectorPatterns = [
        /new MetaMaskConnector\(/,
        /new WalletConnectConnector\(/,
        /new CoinbaseWalletConnector\(/
      ];
      
      let missingConnectors = [];
      const connectorNames = ['MetaMaskConnector', 'WalletConnectConnector', 'CoinbaseWalletConnector'];
      
      connectorPatterns.forEach((pattern, index) => {
        if (!pattern.test(wagmiContent)) {
          missingConnectors.push(connectorNames[index]);
        }
      });
      
      if (missingConnectors.length === 0) {
        log.success('All required wallet connectors properly instantiated in wagmi.ts');
        updateResults('passed');
      } else {
        log.error(`Missing wallet connector instantiations: ${missingConnectors.join(', ')}`);
        updateResults('failed');
      }
      
      // Check for Base Sepolia chain configuration
      if (wagmiContent.includes('baseSepolia') || wagmiContent.includes('84532')) {
        log.success('Base Sepolia chain configuration found');
        updateResults('passed');
      } else {
        log.warning('Base Sepolia chain configuration not found');
        updateResults('warnings');
      }
    } else {
      log.error('Could not read wagmi configuration file');
      updateResults('failed');
    }
  } else {
    log.error('wagmi configuration file not found');
    updateResults('failed');
  }
  
  // Check package.json dependencies
  const packagePath = path.resolve(process.cwd(), 'package.json');
  if (fileExists(packagePath)) {
    const packageContent = readFile(packagePath);
    if (packageContent) {
      const packageJson = JSON.parse(packageContent);
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // Check for required packages
      const requiredPackages = [
        'wagmi',
        '@wagmi/connectors',
        'viem'
      ];
      
      let missingPackages = [];
      requiredPackages.forEach(pkg => {
        if (!dependencies[pkg]) {
          missingPackages.push(pkg);
        }
      });
      
      if (missingPackages.length === 0) {
        log.success('All required packages are installed');
        updateResults('passed');
      } else {
        log.error(`Missing required packages: ${missingPackages.join(', ')}`);
        updateResults('failed');
      }
      
      // Check wagmi version compatibility
      if (dependencies.wagmi) {
        const wagmiVersion = dependencies.wagmi;
        if (wagmiVersion.includes('^2.') || wagmiVersion.includes('~2.')) {
          log.success(`Wagmi version ${wagmiVersion} is compatible`);
          updateResults('passed');
        } else {
          log.warning(`Wagmi version ${wagmiVersion} may not be compatible with v2.16.8`);
          updateResults('warnings');
        }
      }
    } else {
      log.error('Could not read package.json');
      updateResults('failed');
    }
  } else {
    log.error('package.json not found');
    updateResults('failed');
  }
}

// Enhanced component integration checks
function checkComponentIntegration() {
  log.header('🧩 COMPONENT INTEGRATION CHECKS');
  
  // Check multi-wallet-connection component
  const multiWalletPath = path.resolve(process.cwd(), 'components/multi-wallet-connection.tsx');
  if (fileExists(multiWalletPath)) {
    const content = readFile(multiWalletPath);
    if (content) {
      // Check for useMultiWallet usage
      if (content.includes('useMultiWallet')) {
        log.success('multi-wallet-connection.tsx uses useMultiWallet hook');
        updateResults('passed');
      } else {
        log.error('multi-wallet-connection.tsx does not use useMultiWallet hook');
        updateResults('failed');
      }
      
      // Check for wallet connection buttons
      const walletButtons = ['MetaMask', 'WalletConnect', 'Coinbase'];
      let foundButtons = 0;
      walletButtons.forEach(button => {
        if (content.includes(button)) {
          foundButtons++;
        }
      });
      
      if (foundButtons === 3) {
        log.success('All three wallet connection buttons found');
        updateResults('passed');
      } else {
        log.warning(`Only ${foundButtons}/3 wallet buttons found`);
        updateResults('warnings');
      }
      
      // Check for network switching functionality
      if (content.includes('needsNetworkSwitch') || content.includes('switchToSupportedNetwork')) {
        log.success('Network switching functionality found');
        updateResults('passed');
      } else {
        log.warning('Network switching functionality not found');
        updateResults('warnings');
      }
    } else {
      log.error('Could not read multi-wallet-connection component');
      updateResults('failed');
    }
  } else {
    log.error('multi-wallet-connection.tsx component not found');
    updateResults('failed');
  }
  
  // Check app page integration with proper authentication check
  const appPagePath = path.resolve(process.cwd(), 'app/page.tsx');
  if (fileExists(appPagePath)) {
    const content = readFile(appPagePath);
    if (content) {
      if (content.includes('useMultiWallet')) {
        log.success('app/page.tsx integrates useMultiWallet hook');
        updateResults('passed');
      } else {
        log.warning('app/page.tsx does not integrate useMultiWallet hook');
        updateResults('warnings');
      }
      
      // Enhanced authentication check using import regex
      const authImportRegex = /import\s+\{\s*useUniversityVoting\s*\}\s+from\s+['"]@\/hooks\/use-university-voting['"]/;
      if (authImportRegex.test(content)) {
        log.success('Authentication integration found in app page');
        updateResults('passed');
      } else {
        log.warning('Authentication integration not found in app page');
        updateResults('warnings');
      }
    } else {
      log.error('Could not read app page');
      updateResults('failed');
    }
  } else {
    log.error('app/page.tsx not found');
    updateResults('failed');
  }
}

// Enhanced hook implementation validation
function checkHookImplementation() {
  log.header('🔧 HOOK IMPLEMENTATION VALIDATION');
  
  const hookPath = path.resolve(process.cwd(), 'hooks/use-multi-wallet.tsx');
  if (fileExists(hookPath)) {
    const content = readFile(hookPath);
    if (content) {
      // Check for proper wagmi v2 hook usage
      const wagmiHooks = [
        'useAccount()',
        'useConnect()',
        'useDisconnect()',
        'useSwitchChain()',
        'useChainId()',
        'useBalance('
      ];
      
      let foundHooks = 0;
      wagmiHooks.forEach(hook => {
        if (content.includes(hook)) {
          foundHooks++;
        }
      });
      
      if (foundHooks >= 5) {
        log.success(`Found ${foundHooks}/6 required wagmi v2 hooks`);
        updateResults('passed');
      } else {
        log.error(`Only found ${foundHooks}/6 required wagmi v2 hooks`);
        updateResults('failed');
      }
      
      // Check for error handling
      if (content.includes('try') && content.includes('catch')) {
        log.success('Error handling found in hook implementation');
        updateResults('passed');
      } else {
        log.warning('Error handling not found in hook implementation');
        updateResults('warnings');
      }
      
      // Check for TypeScript types
      if (content.includes(':') && (content.includes('string') || content.includes('boolean'))) {
        log.success('TypeScript types found in hook implementation');
        updateResults('passed');
      } else {
        log.warning('TypeScript types not found in hook implementation');
        updateResults('warnings');
      }
    } else {
      log.error('Could not read hook implementation');
      updateResults('failed');
    }
  } else {
    log.error('Hook implementation file not found');
    updateResults('failed');
  }
}

// Enhanced build and compilation verification
function checkBuildCompilation() {
  log.header('🏗️ BUILD AND COMPILATION VERIFICATION');
  
  // Check TypeScript configuration
  const tsConfigPath = path.resolve(process.cwd(), 'tsconfig.json');
  if (fileExists(tsConfigPath)) {
    log.success('TypeScript configuration found');
    updateResults('passed');
    
    const tsConfig = readFile(tsConfigPath);
    if (tsConfig) {
      try {
        const config = JSON.parse(tsConfig);
        if (config.compilerOptions && config.compilerOptions.strict) {
          log.success('TypeScript strict mode enabled');
          updateResults('passed');
        } else {
          log.warning('TypeScript strict mode not enabled');
          updateResults('warnings');
        }
      } catch (error) {
        log.warning('Could not parse TypeScript configuration');
        updateResults('warnings');
      }
    }
  } else {
    log.warning('TypeScript configuration not found');
    updateResults('warnings');
  }
  
  // Check for type definition files
  const typeFiles = findFiles('.', /\.d\.ts$/);
  if (typeFiles.length > 0) {
    log.success(`Found ${typeFiles.length} type definition files`);
    updateResults('passed');
  } else {
    log.warning('No type definition files found');
    updateResults('warnings');
  }
  
  // Check for Next.js configuration
  const nextConfigPath = path.resolve(process.cwd(), 'next.config.mjs');
  if (fileExists(nextConfigPath)) {
    log.success('Next.js configuration found');
    updateResults('passed');
  } else {
    log.warning('Next.js configuration not found');
    updateResults('warnings');
  }
}

// Enhanced environment validation
function checkEnvironment() {
  log.header('🌍 ENVIRONMENT VALIDATION');
  
  // Check for environment variables
  const envPath = path.resolve(process.cwd(), '.env');
  const envExamplePath = path.resolve(process.cwd(), '.env.example');
  
  if (fileExists(envPath)) {
    log.success('.env file found');
    updateResults('passed');
  } else {
    log.warning('.env file not found');
    updateResults('warnings');
  }
  
  if (fileExists(envExamplePath)) {
    log.success('.env.example file found');
    updateResults('passed');
  } else {
    log.warning('.env.example file not found');
    updateResults('warnings');
  }
  
  // Check for Hardhat configuration
  const hardhatPath = path.resolve(process.cwd(), 'hardhat.config.js');
  if (fileExists(hardhatPath)) {
    log.success('Hardhat configuration found');
    updateResults('passed');
    
    const hardhatContent = readFile(hardhatPath);
    if (hardhatContent && hardhatContent.includes('baseSepolia')) {
      log.success('Base Sepolia network configured in Hardhat');
      updateResults('passed');
    } else {
      log.warning('Base Sepolia network not configured in Hardhat');
      updateResults('warnings');
    }
  } else {
    log.warning('Hardhat configuration not found');
    updateResults('warnings');
  }
}

// Generate report
function generateReport() {
  log.header('📊 VERIFICATION REPORT');
  
  console.log(`\n${colors.bright}Test Results Summary:${colors.reset}`);
  console.log(`  ${colors.green}✅ Passed: ${results.passed}${colors.reset}`);
  console.log(`  ${colors.red}❌ Failed: ${results.failed}${colors.reset}`);
  console.log(`  ${colors.yellow}⚠ Warnings: ${results.warnings}${colors.reset}`);
  console.log(`  ${colors.blue}📊 Total: ${results.total}${colors.reset}`);
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`\n${colors.bright}Success Rate: ${successRate}%${colors.reset}`);
  
  if (results.failed === 0 && results.warnings <= 3) {
    console.log(`\n${colors.green}${colors.bright}🎉 Wallet integration verification PASSED!${colors.reset}`);
    console.log('The useMultiWallet hook integration appears to be properly configured.');
    console.log('Proceed with manual testing using the test scenarios provided.');
  } else if (results.failed === 0) {
    console.log(`\n${colors.yellow}${colors.bright}⚠️ Wallet integration verification PASSED with warnings${colors.reset}`);
    console.log('The integration is functional but has some minor issues to address.');
    console.log('Review the warnings above before proceeding with manual testing.');
  } else {
    console.log(`\n${colors.red}${colors.bright}❌ Wallet integration verification FAILED${colors.reset}`);
    console.log('Critical issues found that must be resolved before testing.');
    console.log('Fix the errors above and run this script again.');
  }
  
  console.log(`\n${colors.cyan}Next Steps:${colors.reset}`);
  console.log('1. Review any failed checks and fix issues');
  console.log('2. Address warnings if possible');
  console.log('3. Run manual tests using the test scenarios');
  console.log('4. Verify wallet connection functionality in browser');
  console.log('5. Test network switching and error handling');
}

// Main execution
async function main() {
  console.log(`${colors.bright}${colors.cyan}🔗 Wallet Integration Verification Script${colors.reset}`);
  console.log('Checking useMultiWallet hook integration across the university voting system...\n');
  
  try {
    checkStaticAnalysis();
    checkConfiguration();
    checkComponentIntegration();
    checkHookImplementation();
    checkBuildCompilation();
    checkEnvironment();
    await checkRpcReachability();
    checkTypeScriptCompile();
    generateReport();
  } catch (error) {
    log.error(`Verification script failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  checkStaticAnalysis,
  checkConfiguration,
  checkComponentIntegration,
  checkHookImplementation,
  checkBuildCompilation,
  checkEnvironment,
  checkRpcReachability,
  checkTypeScriptCompile,
  generateReport
};
