#!/usr/bin/env node

/**
 * Dependency Validation Script
 * 
 * This script performs programmatic validation of the blockchain voting system's
 * dependencies, specifically focusing on Hardhat 2.26.3 and ethers v5.8.0 compatibility.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for console output
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

// Validation results tracking
const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: []
};

/**
 * Logging utility functions
 */
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, passed, details = '') {
    const status = passed ? 'PASS' : 'FAIL';
    const color = passed ? 'green' : 'red';
    const icon = passed ? '✓' : '✗';
    
    log(`${icon} [${status}] ${testName}`, color);
    if (details) {
        log(`    ${details}`, 'cyan');
    }
    
    results.tests.push({ name: testName, passed, details });
    if (passed) {
        results.passed++;
    } else {
        results.failed++;
    }
}

function logWarning(message) {
    log(`⚠ WARNING: ${message}`, 'yellow');
    results.warnings++;
}

/**
 * Version comparison utility
 */
function compareVersions(actual, expected) {
    const actualParts = actual.split('.').map(Number);
    const expectedParts = expected.split('.').map(Number);
    
    for (let i = 0; i < Math.max(actualParts.length, expectedParts.length); i++) {
        const actualPart = actualParts[i] || 0;
        const expectedPart = expectedParts[i] || 0;
        
        if (actualPart > expectedPart) return 1;
        if (actualPart < expectedPart) return -1;
    }
    
    return 0;
}

/**
 * Test 1: Hardhat Version Validation
 */
function testHardhatVersion() {
    try {
        const hardhatPackagePath = path.join(process.cwd(), 'node_modules', 'hardhat', 'package.json');
        
        if (!fs.existsSync(hardhatPackagePath)) {
            logTest('Hardhat Version Check', false, 'Hardhat package not found in node_modules');
            return false;
        }
        
        const hardhatPackage = JSON.parse(fs.readFileSync(hardhatPackagePath, 'utf8'));
        const hardhatVersion = hardhatPackage.version;
        
        if (hardhatVersion === '2.26.3') {
            logTest('Hardhat Version Check', true, `Version: ${hardhatVersion}`);
            return true;
        } else {
            logTest('Hardhat Version Check', false, `Expected: 2.26.3, Got: ${hardhatVersion}`);
            return false;
        }
    } catch (error) {
        logTest('Hardhat Version Check', false, `Error: ${error.message}`);
        return false;
    }
}

/**
 * Test 2: Ethers Version Validation
 */
function testEthersVersion() {
    try {
        const ethersPackagePath = path.join(process.cwd(), 'node_modules', 'ethers', 'package.json');
        
        if (!fs.existsSync(ethersPackagePath)) {
            logTest('Ethers Version Check', false, 'Ethers package not found in node_modules');
            return false;
        }
        
        const ethersPackage = JSON.parse(fs.readFileSync(ethersPackagePath, 'utf8'));
        const ethersVersion = ethersPackage.version;
        
        if (ethersVersion === '5.8.0') {
            logTest('Ethers Version Check', true, `Version: ${ethersVersion}`);
            return true;
        } else {
            logTest('Ethers Version Check', false, `Expected: 5.8.0, Got: ${ethersVersion}`);
            return false;
        }
    } catch (error) {
        logTest('Ethers Version Check', false, `Error: ${error.message}`);
        return false;
    }
}

/**
 * Test 3: Package.json Dependency Validation
 */
function testPackageJsonDependencies() {
    try {
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        let allPassed = true;
        const details = [];
        
        // Check hardhat version in package.json
        if (packageJson.dependencies && packageJson.dependencies.hardhat) {
            const hardhatVersion = packageJson.dependencies.hardhat;
            if (hardhatVersion === '2.26.3') {
                details.push(`Hardhat: ${hardhatVersion}`);
            } else {
                details.push(`Hardhat: ${hardhatVersion} (expected 2.26.3)`);
                allPassed = false;
            }
        } else {
            details.push('Hardhat not found in dependencies');
            allPassed = false;
        }
        
        // Check ethers version in package.json
        if (packageJson.dependencies && packageJson.dependencies.ethers) {
            const ethersVersion = packageJson.dependencies.ethers;
            if (ethersVersion === '5.8.0') {
                details.push(`Ethers: ${ethersVersion}`);
            } else {
                details.push(`Ethers: ${ethersVersion} (expected 5.8.0)`);
                allPassed = false;
            }
        } else {
            details.push('Ethers not found in dependencies');
            allPassed = false;
        }
        
        logTest('Package.json Dependencies', allPassed, details.join(', '));
        return allPassed;
    } catch (error) {
        logTest('Package.json Dependencies', false, `Error: ${error.message}`);
        return false;
    }
}

/**
 * Test 4: Hardhat Configuration Validation
 */
function testHardhatConfig() {
    try {
        const hardhatConfigPath = path.join(process.cwd(), 'hardhat.config.js');
        
        if (!fs.existsSync(hardhatConfigPath)) {
            logTest('Hardhat Configuration', false, 'hardhat.config.js not found');
            return false;
        }
        
        // Try to require the config file
        const config = require(hardhatConfigPath);
        
        if (config && typeof config === 'object') {
            logTest('Hardhat Configuration', true, 'Configuration file loads successfully');
            return true;
        } else {
            logTest('Hardhat Configuration', false, 'Configuration file does not export valid object');
            return false;
        }
    } catch (error) {
        logTest('Hardhat Configuration', false, `Error loading config: ${error.message}`);
        return false;
    }
}

/**
 * Test 5: Contract Artifacts Validation
 */
function testContractArtifacts() {
    try {
        const artifactsDir = path.join(process.cwd(), 'artifacts', 'contracts');
        
        if (!fs.existsSync(artifactsDir)) {
            logTest('Contract Artifacts', false, 'artifacts/contracts directory not found');
            return false;
        }
        
        const expectedContracts = ['Voting.sol', 'UniversityVoting.sol'];
        const foundContracts = [];
        const missingContracts = [];
        
        for (const contract of expectedContracts) {
            const contractDir = path.join(artifactsDir, contract);
            if (fs.existsSync(contractDir)) {
                const contractName = contract.replace('.sol', '');
                const artifactPath = path.join(contractDir, `${contractName}.json`);
                
                if (fs.existsSync(artifactPath)) {
                    foundContracts.push(contractName);
                    
                    // Validate artifact structure
                    try {
                        const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
                        if (artifact.abi && artifact.bytecode) {
                            // Artifact is valid
                        } else {
                            logWarning(`${contractName} artifact missing ABI or bytecode`);
                        }
                    } catch (parseError) {
                        logWarning(`${contractName} artifact is not valid JSON`);
                    }
                } else {
                    missingContracts.push(contractName);
                }
            } else {
                missingContracts.push(contract.replace('.sol', ''));
            }
        }
        
        if (missingContracts.length === 0) {
            logTest('Contract Artifacts', true, `Found: ${foundContracts.join(', ')}`);
            return true;
        } else {
            logTest('Contract Artifacts', false, `Missing: ${missingContracts.join(', ')}`);
            return false;
        }
    } catch (error) {
        logTest('Contract Artifacts', false, `Error: ${error.message}`);
        return false;
    }
}

/**
 * Test 6: ABI Files Validation
 */
function testAbiFiles() {
    try {
        const abiDir = path.join(process.cwd(), 'lib', 'abi');
        
        if (!fs.existsSync(abiDir)) {
            logTest('ABI Files', false, 'lib/abi directory not found');
            return false;
        }
        
        const expectedAbiFiles = ['Voting.ts', 'UniversityVoting.ts'];
        const foundFiles = [];
        const missingFiles = [];
        
        for (const abiFile of expectedAbiFiles) {
            const abiFilePath = path.join(abiDir, abiFile);
            if (fs.existsSync(abiFilePath)) {
                foundFiles.push(abiFile);
                
                // Validate TypeScript syntax
                try {
                    const content = fs.readFileSync(abiFilePath, 'utf8');
                    if (content.includes('export const') && content.includes('ABI')) {
                        // Basic TypeScript validation passed
                    } else {
                        logWarning(`${abiFile} may not have proper TypeScript exports`);
                    }
                } catch (readError) {
                    logWarning(`Could not read ${abiFile}: ${readError.message}`);
                }
            } else {
                missingFiles.push(abiFile);
            }
        }
        
        if (missingFiles.length === 0) {
            logTest('ABI Files', true, `Found: ${foundFiles.join(', ')}`);
            return true;
        } else {
            logTest('ABI Files', false, `Missing: ${missingFiles.join(', ')}`);
            return false;
        }
    } catch (error) {
        logTest('ABI Files', false, `Error: ${error.message}`);
        return false;
    }
}

/**
 * Test 7: Ethers Provider Compatibility
 */
function testEthersProvider() {
    try {
        // Test ethers import and provider creation
        const { ethers } = require('ethers');
        
        // Test provider creation with Base Sepolia configuration
        const provider = new ethers.providers.JsonRpcProvider(
            'https://sepolia.base.org'
        );
        
        logTest('Ethers Provider Compatibility', true, 'Provider creation successful');
        return true;
    } catch (error) {
        logTest('Ethers Provider Compatibility', false, `Error: ${error.message}`);
        return false;
    }
}

/**
 * Test 8: Contract Interaction Test
 */
function testContractInteraction() {
    try {
        const { ethers } = require('ethers');
        
        // Test basic contract interface creation
        const abi = ['function name() view returns (string)'];
        const contract = new ethers.Contract('0x0000000000000000000000000000000000000000', abi);
        
        logTest('Contract Interaction Test', true, 'Contract interface creation successful');
        return true;
    } catch (error) {
        logTest('Contract Interaction Test', false, `Error: ${error.message}`);
        return false;
    }
}

/**
 * Test 9: Deployed Addresses Validation
 */
function testDeployedAddresses() {
    try {
        const deployedAddressesPath = path.join(process.cwd(), 'lib', 'contracts', 'deployed-addresses.json');
        
        if (!fs.existsSync(deployedAddressesPath)) {
            logTest('Deployed Addresses', false, 'deployed-addresses.json not found');
            return false;
        }
        
        const deployedAddresses = JSON.parse(fs.readFileSync(deployedAddressesPath, 'utf8'));
        
        if (deployedAddresses && typeof deployedAddresses === 'object') {
            const networks = Object.keys(deployedAddresses);
            if (networks.length > 0) {
                logTest('Deployed Addresses', true, `Networks: ${networks.join(', ')}`);
                return true;
            } else {
                logTest('Deployed Addresses', false, 'No network configurations found');
                return false;
            }
        } else {
            logTest('Deployed Addresses', false, 'Invalid JSON structure');
            return false;
        }
    } catch (error) {
        logTest('Deployed Addresses', false, `Error: ${error.message}`);
        return false;
    }
}

/**
 * Test 10: Wagmi Configuration Validation
 */
function testWagmiConfig() {
    try {
        const wagmiConfigPath = path.join(process.cwd(), 'lib', 'wagmi.ts');
        
        if (!fs.existsSync(wagmiConfigPath)) {
            logTest('Wagmi Configuration', false, 'lib/wagmi.ts not found');
            return false;
        }
        
        // Basic file existence and structure check
        const content = fs.readFileSync(wagmiConfigPath, 'utf8');
        
        if (content.includes('createConfig') && content.includes('baseSepolia')) {
            logTest('Wagmi Configuration', true, 'Configuration file contains expected exports');
            return true;
        } else {
            logTest('Wagmi Configuration', false, 'Configuration file missing expected content');
            return false;
        }
    } catch (error) {
        logTest('Wagmi Configuration', false, `Error: ${error.message}`);
        return false;
    }
}

/**
 * Main validation function
 */
function runValidation() {
    log('\n🔍 Starting Dependency Validation...\n', 'bright');
    
    // Run all tests
    const tests = [
        testHardhatVersion,
        testEthersVersion,
        testPackageJsonDependencies,
        testHardhatConfig,
        testContractArtifacts,
        testAbiFiles,
        testEthersProvider,
        testContractInteraction,
        testDeployedAddresses,
        testWagmiConfig
    ];
    
    tests.forEach(test => {
        try {
            test();
        } catch (error) {
            logTest(test.name || 'Unknown Test', false, `Unexpected error: ${error.message}`);
        }
    });
    
    // Generate summary
    log('\n' + '='.repeat(50), 'bright');
    log('VALIDATION SUMMARY', 'bright');
    log('='.repeat(50), 'bright');
    
    log(`\nTests Passed: ${results.passed}`, 'green');
    log(`Tests Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
    log(`Warnings: ${results.warnings}`, results.warnings > 0 ? 'yellow' : 'green');
    
    const totalTests = results.passed + results.failed;
    const passRate = totalTests > 0 ? Math.round((results.passed / totalTests) * 100) : 0;
    
    log(`Pass Rate: ${passRate}%`, passRate >= 80 ? 'green' : 'red');
    
    if (results.failed > 0) {
        log('\n❌ Some tests failed. Please review the errors above.', 'red');
        process.exit(1);
    } else if (results.warnings > 0) {
        log('\n⚠️  All tests passed but there are warnings to review.', 'yellow');
        process.exit(0);
    } else {
        log('\n✅ All tests passed successfully!', 'green');
        process.exit(0);
    }
}

// Run validation if this script is executed directly
if (require.main === module) {
    runValidation();
}

module.exports = {
    runValidation,
    testHardhatVersion,
    testEthersVersion,
    testPackageJsonDependencies,
    testHardhatConfig,
    testContractArtifacts,
    testAbiFiles,
    testEthersProvider,
    testContractInteraction,
    testDeployedAddresses,
    testWagmiConfig
};
