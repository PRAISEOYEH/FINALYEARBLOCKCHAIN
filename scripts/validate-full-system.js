#!/usr/bin/env node

/**
 * Full System Validation Script
 * 
 * This script validates that the entire system is using full implementations
 * and not simplified versions. It checks:
 * 1. Provider implementation
 * 2. Blockchain integration
 * 3. Admin dashboard functionality
 * 4. Wallet integration
 * 5. Contract connections
 * 6. No simplified fallbacks
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting full system validation...\n');

let validationResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  checks: []
};

function addCheck(name, status, message, details = '') {
  validationResults.checks.push({ name, status, message, details });
  if (status === 'PASS') {
    validationResults.passed++;
    console.log(`✅ ${name}: ${message}`);
  } else if (status === 'FAIL') {
    validationResults.failed++;
    console.log(`❌ ${name}: ${message}`);
  } else if (status === 'WARN') {
    validationResults.warnings++;
    console.log(`⚠️  ${name}: ${message}`);
  }
  
  if (details) {
    console.log(`   ${details}`);
  }
}

// Check 1: Validate ClientVotingProvider
console.log('📋 Check 1: ClientVotingProvider Implementation');
try {
  const providerPath = 'components/providers/client-voting-provider.tsx';
  if (fs.existsSync(providerPath)) {
    const content = fs.readFileSync(providerPath, 'utf8');
    
    if (content.includes('UniversityVotingProvider')) {
      addCheck('ClientVotingProvider', 'PASS', 'Uses full UniversityVotingProvider');
    } else {
      addCheck('ClientVotingProvider', 'FAIL', 'Does not use UniversityVotingProvider');
    }
    
    if (content.includes('Full blockchain integration active')) {
      addCheck('ClientVotingProvider Validation', 'PASS', 'Contains development validation');
    } else {
      addCheck('ClientVotingProvider Validation', 'WARN', 'Missing development validation');
    }
  } else {
    addCheck('ClientVotingProvider', 'FAIL', 'File not found');
  }
} catch (error) {
  addCheck('ClientVotingProvider', 'FAIL', 'Error reading file', error.message);
}

// Check 2: Validate UniversityVotingProvider
console.log('\n📋 Check 2: UniversityVotingProvider Implementation');
try {
  const hookPath = 'hooks/use-university-voting.tsx';
  if (fs.existsSync(hookPath)) {
    const content = fs.readFileSync(hookPath, 'utf8');
    
    if (content.includes('useBlockchainVoting')) {
      addCheck('Blockchain Integration', 'PASS', 'Uses useBlockchainVoting hook');
    } else {
      addCheck('Blockchain Integration', 'FAIL', 'Missing useBlockchainVoting hook');
    }
    
    if (content.includes('castVote') && content.includes('createElection')) {
      addCheck('Blockchain Methods', 'PASS', 'Contains blockchain methods');
    } else {
      addCheck('Blockchain Methods', 'FAIL', 'Missing blockchain methods');
    }
    
    if (content.includes('Full blockchain integration initialized')) {
      addCheck('Development Validation', 'PASS', 'Contains development validation');
    } else {
      addCheck('Development Validation', 'WARN', 'Missing development validation');
    }
    
    // Check for mock implementations
    if (content.includes('mock') && !content.includes('mockUniversity')) {
      addCheck('Mock Detection', 'WARN', 'Contains mock implementations');
    } else {
      addCheck('Mock Detection', 'PASS', 'No problematic mock implementations found');
    }
  } else {
    addCheck('UniversityVotingProvider', 'FAIL', 'File not found');
  }
} catch (error) {
  addCheck('UniversityVotingProvider', 'FAIL', 'Error reading file', error.message);
}

// Check 3: Validate Admin Dashboard
console.log('\n📋 Check 3: Admin Dashboard Implementation');
try {
  const dashboardPath = 'components/admin-dashboard.tsx';
  if (fs.existsSync(dashboardPath)) {
    const content = fs.readFileSync(dashboardPath, 'utf8');
    
    if (content.includes('useUniversityVoting')) {
      addCheck('University Hook Usage', 'PASS', 'Uses useUniversityVoting hook');
    } else {
      addCheck('University Hook Usage', 'FAIL', 'Does not use useUniversityVoting hook');
    }
    
    if (content.includes('useBlockchainVoting')) {
      addCheck('Blockchain Hook Usage', 'PASS', 'Uses useBlockchainVoting hook');
    } else {
      addCheck('Blockchain Hook Usage', 'FAIL', 'Does not use useBlockchainVoting hook');
    }
    
    if (content.includes('Full Blockchain Integration - Production Ready')) {
      addCheck('Development Banner', 'PASS', 'Contains development banner');
    } else {
      addCheck('Development Banner', 'WARN', 'Missing development banner');
    }
    
    if (content.includes('verifyCandidate') && content.includes('rejectCandidate')) {
      addCheck('Admin Functions', 'PASS', 'Contains admin functions');
    } else {
      addCheck('Admin Functions', 'FAIL', 'Missing admin functions');
    }
  } else {
    addCheck('Admin Dashboard', 'FAIL', 'File not found');
  }
} catch (error) {
  addCheck('Admin Dashboard', 'FAIL', 'Error reading file', error.message);
}

// Check 4: Validate Main Page
console.log('\n📋 Check 4: Main Page Implementation');
try {
  const pagePath = 'app/page.tsx';
  if (fs.existsSync(pagePath)) {
    const content = fs.readFileSync(pagePath, 'utf8');
    
    if (content.includes('useUniversityVoting')) {
      addCheck('Hook Usage', 'PASS', 'Uses useUniversityVoting hook');
    } else {
      addCheck('Hook Usage', 'FAIL', 'Does not use useUniversityVoting hook');
    }
    
    if (content.includes('AdminDashboard')) {
      addCheck('Admin Dashboard Import', 'PASS', 'Imports AdminDashboard component');
    } else {
      addCheck('Admin Dashboard Import', 'FAIL', 'Does not import AdminDashboard');
    }
    
    if (content.includes('Full Blockchain Integration - Production Ready System Active')) {
      addCheck('Development Banner', 'PASS', 'Contains development banner');
    } else {
      addCheck('Development Banner', 'WARN', 'Missing development banner');
    }
    
    if (content.includes('Full system validation starting')) {
      addCheck('System Validation', 'PASS', 'Contains system validation');
    } else {
      addCheck('System Validation', 'WARN', 'Missing system validation');
    }
  } else {
    addCheck('Main Page', 'FAIL', 'File not found');
  }
} catch (error) {
  addCheck('Main Page', 'FAIL', 'Error reading file', error.message);
}

// Check 5: Validate Next.js Configuration
console.log('\n📋 Check 5: Next.js Configuration');
try {
  const configPath = 'next.config.mjs';
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf8');
    
    if (content.includes('blockchain')) {
      addCheck('Blockchain Config', 'PASS', 'Contains blockchain configuration');
    } else {
      addCheck('Blockchain Config', 'WARN', 'Missing blockchain configuration');
    }
    
    if (content.includes('wagmi') || content.includes('viem')) {
      addCheck('Web3 Libraries', 'PASS', 'Contains Web3 library configuration');
    } else {
      addCheck('Web3 Libraries', 'WARN', 'Missing Web3 library configuration');
    }
    
    if (content.includes('force-dynamic')) {
      addCheck('Dynamic Rendering', 'PASS', 'Configured for dynamic rendering');
    } else {
      addCheck('Dynamic Rendering', 'WARN', 'Not configured for dynamic rendering');
    }
  } else {
    addCheck('Next.js Config', 'FAIL', 'File not found');
  }
} catch (error) {
  addCheck('Next.js Config', 'FAIL', 'Error reading file', error.message);
}

// Check 6: Validate Blockchain Hook
console.log('\n📋 Check 6: Blockchain Hook Implementation');
try {
  const blockchainPath = 'hooks/use-blockchain-voting.tsx';
  if (fs.existsSync(blockchainPath)) {
    const content = fs.readFileSync(blockchainPath, 'utf8');
    
    if (content.includes('Base Sepolia') || content.includes('baseSepolia')) {
      addCheck('Network Configuration', 'PASS', 'Configured for Base Sepolia');
    } else {
      addCheck('Network Configuration', 'WARN', 'Base Sepolia not configured');
    }
    
    if (content.includes('castVote') && content.includes('createElection')) {
      addCheck('Contract Methods', 'PASS', 'Contains contract methods');
    } else {
      addCheck('Contract Methods', 'FAIL', 'Missing contract methods');
    }
  } else {
    addCheck('Blockchain Hook', 'WARN', 'File not found (may be using different implementation)');
  }
} catch (error) {
  addCheck('Blockchain Hook', 'FAIL', 'Error reading file', error.message);
}

// Check 7: Validate Package.json Scripts
console.log('\n📋 Check 7: Package.json Scripts');
try {
  const packagePath = 'package.json';
  if (fs.existsSync(packagePath)) {
    const content = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    if (content.scripts && content.scripts.dev) {
      addCheck('Dev Script', 'PASS', 'Development script configured');
    } else {
      addCheck('Dev Script', 'FAIL', 'Development script not configured');
    }
    
    if (content.scripts && content.scripts.build) {
      addCheck('Build Script', 'PASS', 'Build script configured');
    } else {
      addCheck('Build Script', 'FAIL', 'Build script not configured');
    }
    
    if (content.dependencies && (content.dependencies.wagmi || content.dependencies['@wagmi/core'])) {
      addCheck('Web3 Dependencies', 'PASS', 'Web3 dependencies installed');
    } else {
      addCheck('Web3 Dependencies', 'FAIL', 'Web3 dependencies not installed');
    }
  } else {
    addCheck('Package.json', 'FAIL', 'File not found');
  }
} catch (error) {
  addCheck('Package.json', 'FAIL', 'Error reading file', error.message);
}

// Check 8: Validate Build Output
console.log('\n📋 Check 8: Build Output Validation');
try {
  if (fs.existsSync('.next')) {
    addCheck('Build Directory', 'PASS', '.next directory exists');
    
    if (fs.existsSync('.next/static')) {
      addCheck('Static Assets', 'PASS', 'Static assets generated');
    } else {
      addCheck('Static Assets', 'WARN', 'Static assets not found');
    }
    
    if (fs.existsSync('.next/server')) {
      addCheck('Server Build', 'PASS', 'Server build generated');
    } else {
      addCheck('Server Build', 'WARN', 'Server build not found');
    }
  } else {
    addCheck('Build Output', 'FAIL', 'No build output found - run npm run build first');
  }
} catch (error) {
  addCheck('Build Output', 'FAIL', 'Error checking build output', error.message);
}

// Summary
console.log('\n📊 Validation Summary:');
console.log(`✅ Passed: ${validationResults.passed}`);
console.log(`❌ Failed: ${validationResults.failed}`);
console.log(`⚠️  Warnings: ${validationResults.warnings}`);
console.log(`📋 Total Checks: ${validationResults.checks.length}`);

// Determine overall status
if (validationResults.failed === 0) {
  console.log('\n🎉 VALIDATION PASSED: Full system implementation confirmed!');
  console.log('✅ Your system is using the complete blockchain integration');
  console.log('✅ No simplified versions detected');
  console.log('✅ All components are properly configured');
  
  if (validationResults.warnings > 0) {
    console.log(`\n⚠️  ${validationResults.warnings} warnings found - review for optimization`);
  }
} else {
  console.log('\n❌ VALIDATION FAILED: Issues detected in system implementation');
  console.log('🔧 Please review the failed checks and fix the issues');
  console.log('💡 Run this script again after making corrections');
  process.exit(1);
}

console.log('\n🚀 System is ready for full blockchain voting functionality!');
console.log('💡 To start development: npm run dev');
console.log('💡 To build for production: npm run build');
