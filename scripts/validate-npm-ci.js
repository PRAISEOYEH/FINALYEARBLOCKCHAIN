#!/usr/bin/env node

/**
 * Comprehensive npm ci Validation Script
 * 
 * This script provides detailed testing of npm ci functionality beyond what
 * batch scripts can accomplish. It creates isolated test environments and
 * validates reproducible installations.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const crypto = require('crypto');

// Configuration
const CONFIG = {
    testRuns: 3,
    testTimeout: 300000, // 5 minutes
    criticalPackages: {
        'hardhat': '2.26.3',
        'ethers': '5.8.0',
        'wagmi': '1.4.13',
        'viem': '1.21.4'
    }
};

// Results storage
const results = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    npmVersion: '',
    testRuns: [],
    summary: {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        averageInstallTime: 0,
        consistencyScore: 0
    },
    criticalPackageValidation: {},
    recommendations: []
};

/**
 * Utility functions
 */
function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
}

function getNpmVersion() {
    try {
        return execSync('npm --version', { encoding: 'utf8' }).trim();
    } catch (error) {
        throw new Error('Failed to get npm version');
    }
}

function createTestDirectory(testId) {
    const testDir = path.join(process.cwd(), `npm-ci-test-${testId}`);
    if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
    return testDir;
}

function copyProjectFiles(testDir) {
    const filesToCopy = ['package.json', 'package-lock.json'];
    
    for (const file of filesToCopy) {
        const sourcePath = path.join(process.cwd(), file);
        const destPath = path.join(testDir, file);
        
        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, destPath);
        } else {
            throw new Error(`Required file ${file} not found in project root`);
        }
    }
}

function calculateDirectoryHash(dirPath) {
    const hash = crypto.createHash('sha256');
    
    function hashDirectory(currentPath) {
        const items = fs.readdirSync(currentPath, { withFileTypes: true });
        
        for (const item of items) {
            const fullPath = path.join(currentPath, item.name);
            
            if (item.isDirectory()) {
                // Skip node_modules/.cache and other volatile directories
                if (item.name === '.cache' || item.name === '.npm') {
                    continue;
                }
                hashDirectory(fullPath);
            } else if (item.isFile()) {
                const content = fs.readFileSync(fullPath);
                hash.update(content);
            }
        }
    }
    
    hashDirectory(dirPath);
    return hash.digest('hex');
}

function validateCriticalPackages(testDir) {
    const packageJsonPath = path.join(testDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const validation = {
        hardhat: { expected: CONFIG.criticalPackages.hardhat, actual: '', status: 'UNKNOWN' },
        ethers: { expected: CONFIG.criticalPackages.ethers, actual: '', status: 'UNKNOWN' },
        wagmi: { expected: CONFIG.criticalPackages.wagmi, actual: '', status: 'UNKNOWN' },
        viem: { expected: CONFIG.criticalPackages.viem, actual: '', status: 'UNKNOWN' }
    };
    
    // Check direct dependencies
    for (const [pkg, expectedVersion] of Object.entries(CONFIG.criticalPackages)) {
        if (packageJson.dependencies && packageJson.dependencies[pkg]) {
            validation[pkg].actual = packageJson.dependencies[pkg];
            validation[pkg].status = packageJson.dependencies[pkg] === expectedVersion ? 'MATCH' : 'MISMATCH';
        } else if (packageJson.devDependencies && packageJson.devDependencies[pkg]) {
            validation[pkg].actual = packageJson.devDependencies[pkg];
            validation[pkg].status = packageJson.devDependencies[pkg] === expectedVersion ? 'MATCH' : 'MISMATCH';
        } else {
            validation[pkg].status = 'MISSING';
        }
    }
    
    return validation;
}

function executeNpmCi(testDir) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        let output = '';
        let errorOutput = '';
        
        const npmProcess = spawn('npm', ['ci'], {
            cwd: testDir,
            stdio: ['pipe', 'pipe', 'pipe'],
            timeout: CONFIG.testTimeout
        });
        
        npmProcess.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        npmProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        npmProcess.on('close', (code) => {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            resolve({
                success: code === 0,
                exitCode: code,
                duration,
                output,
                errorOutput
            });
        });
        
        npmProcess.on('error', (error) => {
            reject(error);
        });
    });
}

function analyzeNodeModules(testDir) {
    const nodeModulesPath = path.join(testDir, 'node_modules');
    
    if (!fs.existsSync(nodeModulesPath)) {
        return {
            exists: false,
            packageCount: 0,
            directoryHash: null,
            size: 0
        };
    }
    
    // Count packages
    let packageCount = 0;
    const packages = fs.readdirSync(nodeModulesPath);
    
    for (const pkg of packages) {
        const pkgPath = path.join(nodeModulesPath, pkg);
        if (fs.statSync(pkgPath).isDirectory()) {
            packageCount++;
        }
    }
    
    // Calculate directory hash (excluding volatile files)
    const directoryHash = calculateDirectoryHash(nodeModulesPath);
    
    // Calculate size
    const size = fs.statSync(nodeModulesPath).size;
    
    return {
        exists: true,
        packageCount,
        directoryHash,
        size
    };
}

/**
 * Main validation function
 */
async function runNpmCiValidation() {
    log('Starting comprehensive npm ci validation...');
    
    try {
        // Get npm version
        results.npmVersion = getNpmVersion();
        log(`Using npm version: ${results.npmVersion}`);
        
        // Validate prerequisites
        if (!fs.existsSync('package.json')) {
            throw new Error('package.json not found in current directory');
        }
        
        if (!fs.existsSync('package-lock.json')) {
            throw new Error('package-lock.json not found. Run generate-lockfile.bat first.');
        }
        
        log('Prerequisites validated successfully');
        
        // Run multiple test iterations
        for (let i = 0; i < CONFIG.testRuns; i++) {
            log(`Starting test run ${i + 1}/${CONFIG.testRuns}`);
            
            const testId = `run-${i + 1}-${Date.now()}`;
            const testDir = createTestDirectory(testId);
            
            try {
                // Copy project files
                copyProjectFiles(testDir);
                
                // Validate critical packages before installation
                const preInstallValidation = validateCriticalPackages(testDir);
                
                // Execute npm ci
                const startTime = Date.now();
                const npmResult = await executeNpmCi(testDir);
                const endTime = Date.now();
                
                // Analyze results
                const nodeModulesAnalysis = analyzeNodeModules(testDir);
                const postInstallValidation = validateCriticalPackages(testDir);
                
                const testResult = {
                    testId,
                    testDir,
                    success: npmResult.success,
                    exitCode: npmResult.exitCode,
                    duration: npmResult.duration,
                    totalTime: endTime - startTime,
                    preInstallValidation,
                    postInstallValidation,
                    nodeModulesAnalysis,
                    output: npmResult.output,
                    errorOutput: npmResult.errorOutput
                };
                
                results.testRuns.push(testResult);
                
                if (npmResult.success) {
                    log(`Test run ${i + 1} completed successfully in ${npmResult.duration}ms`);
                    results.summary.successfulRuns++;
                } else {
                    log(`Test run ${i + 1} failed with exit code ${npmResult.exitCode}`, 'ERROR');
                    results.summary.failedRuns++;
                }
                
                results.summary.totalRuns++;
                
            } catch (error) {
                log(`Test run ${i + 1} failed with error: ${error.message}`, 'ERROR');
                results.summary.failedRuns++;
                results.summary.totalRuns++;
                
                results.testRuns.push({
                    testId,
                    testDir,
                    success: false,
                    error: error.message
                });
            }
        }
        
        // Analyze consistency
        analyzeConsistency();
        
        // Generate recommendations
        generateRecommendations();
        
        // Calculate summary statistics
        calculateSummaryStatistics();
        
        // Save results
        saveResults();
        
        // Display summary
        displaySummary();
        
        // Return appropriate exit code
        return results.summary.failedRuns === 0 ? 0 : 1;
        
    } catch (error) {
        log(`Validation failed: ${error.message}`, 'ERROR');
        console.error(error);
        return 1;
    }
}

function analyzeConsistency() {
    const successfulRuns = results.testRuns.filter(run => run.success);
    
    if (successfulRuns.length < 2) {
        results.summary.consistencyScore = 0;
        return;
    }
    
    // Compare directory hashes
    const hashes = successfulRuns.map(run => run.nodeModulesAnalysis.directoryHash);
    const uniqueHashes = new Set(hashes);
    
    if (uniqueHashes.size === 1) {
        results.summary.consistencyScore = 100;
    } else {
        results.summary.consistencyScore = Math.round((1 - (uniqueHashes.size - 1) / successfulRuns.length) * 100);
    }
    
    // Check package counts
    const packageCounts = successfulRuns.map(run => run.nodeModulesAnalysis.packageCount);
    const uniquePackageCounts = new Set(packageCounts);
    
    if (uniquePackageCounts.size > 1) {
        results.recommendations.push({
            type: 'WARNING',
            message: `Inconsistent package counts across runs: ${Array.from(uniquePackageCounts).join(', ')}`
        });
    }
}

function generateRecommendations() {
    // Check for critical package mismatches
    const successfulRuns = results.testRuns.filter(run => run.success);
    
    if (successfulRuns.length > 0) {
        const lastRun = successfulRuns[successfulRuns.length - 1];
        
        for (const [pkg, validation] of Object.entries(lastRun.postInstallValidation)) {
            if (validation.status === 'MISMATCH') {
                results.recommendations.push({
                    type: 'CRITICAL',
                    message: `${pkg} version mismatch: expected ${validation.expected}, got ${validation.actual}`
                });
            } else if (validation.status === 'MISSING') {
                results.recommendations.push({
                    type: 'WARNING',
                    message: `Critical package ${pkg} is missing from dependencies`
                });
            }
        }
    }
    
    // Performance recommendations
    const avgDuration = results.testRuns
        .filter(run => run.success)
        .reduce((sum, run) => sum + run.duration, 0) / Math.max(1, results.summary.successfulRuns);
    
    if (avgDuration > 60000) { // More than 1 minute
        results.recommendations.push({
            type: 'INFO',
            message: `Average installation time is ${Math.round(avgDuration / 1000)}s. Consider optimizing dependencies.`
        });
    }
    
    // Consistency recommendations
    if (results.summary.consistencyScore < 100) {
        results.recommendations.push({
            type: 'WARNING',
            message: `Installation consistency score is ${results.summary.consistencyScore}%. Review for non-deterministic dependencies.`
        });
    }
}

function calculateSummaryStatistics() {
    const successfulRuns = results.testRuns.filter(run => run.success);
    
    if (successfulRuns.length > 0) {
        const totalDuration = successfulRuns.reduce((sum, run) => sum + run.duration, 0);
        results.summary.averageInstallTime = Math.round(totalDuration / successfulRuns.length);
    }
}

function saveResults() {
    const outputPath = path.join(process.cwd(), 'npm-ci-validation-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    log(`Results saved to: ${outputPath}`);
}

function displaySummary() {
    console.log('\n' + '='.repeat(60));
    console.log('NPM CI VALIDATION SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`Total Test Runs: ${results.summary.totalRuns}`);
    console.log(`Successful Runs: ${results.summary.successfulRuns}`);
    console.log(`Failed Runs: ${results.summary.failedRuns}`);
    console.log(`Success Rate: ${Math.round((results.summary.successfulRuns / results.summary.totalRuns) * 100)}%`);
    
    if (results.summary.successfulRuns > 0) {
        console.log(`Average Install Time: ${results.summary.averageInstallTime}ms`);
        console.log(`Consistency Score: ${results.summary.consistencyScore}%`);
    }
    
    if (results.recommendations.length > 0) {
        console.log('\nRecommendations:');
        for (const rec of results.recommendations) {
            console.log(`[${rec.type}] ${rec.message}`);
        }
    }
    
    console.log('\n' + '='.repeat(60));
}

// Run the validation if this script is executed directly
if (require.main === module) {
    runNpmCiValidation()
        .then(exitCode => {
            process.exit(exitCode);
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { runNpmCiValidation, CONFIG };
