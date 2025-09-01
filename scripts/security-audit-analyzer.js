#!/usr/bin/env node

/**
 * Comprehensive Security Audit Analysis Script
 * 
 * This script enhances npm audit with detailed reporting and actionable
 * recommendations for blockchain-specific security concerns.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Configuration
const CONFIG = {
    auditTimeout: 120000, // 2 minutes
    criticalPackages: {
        'hardhat': '2.26.3',
        'ethers': '5.8.0',
        'wagmi': '1.4.13',
        'viem': '1.21.4'
    },
    blockchainSpecificPackages: [
        'hardhat', 'ethers', 'wagmi', 'viem', 'web3', 'truffle', 'ganache',
        'openzeppelin', 'solidity', 'web3.js', 'ethereumjs'
    ],
    severityLevels: {
        'critical': 4,
        'high': 3,
        'moderate': 2,
        'low': 1,
        'info': 0
    }
};

// Results storage
const results = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    npmVersion: '',
    auditResults: null,
    vulnerabilityAnalysis: {
        totalVulnerabilities: 0,
        bySeverity: {},
        byPackage: {},
        blockchainSpecific: [],
        criticalPackages: {}
    },
    riskAssessment: {
        overallRisk: 'UNKNOWN',
        blockchainRisk: 'UNKNOWN',
        productionRisk: 'UNKNOWN',
        developmentRisk: 'UNKNOWN'
    },
    remediationPlan: {
        immediate: [],
        shortTerm: [],
        longTerm: [],
        alternativePackages: []
    },
    compliance: {
        securityBestPractices: [],
        outdatedPackages: [],
        developmentDependencies: []
    },
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

function isBlockchainPackage(packageName) {
    return CONFIG.blockchainSpecificPackages.some(pkg => 
        packageName.toLowerCase().includes(pkg.toLowerCase())
    );
}

function isCriticalPackage(packageName) {
    return Object.keys(CONFIG.criticalPackages).includes(packageName);
}

function getSeverityLevel(severity) {
    const level = severity.toLowerCase();
    return CONFIG.severityLevels[level] || 0;
}

function calculateRiskScore(vulnerabilities) {
    let score = 0;
    let totalVulns = 0;
    
    for (const vuln of vulnerabilities) {
        const severity = getSeverityLevel(vuln.severity);
        score += severity;
        totalVulns++;
    }
    
    if (totalVulns === 0) return 0;
    
    const averageScore = score / totalVulns;
    
    if (averageScore >= 3.5) return 'CRITICAL';
    if (averageScore >= 2.5) return 'HIGH';
    if (averageScore >= 1.5) return 'MODERATE';
    if (averageScore >= 0.5) return 'LOW';
    return 'MINIMAL';
}

/**
 * Security audit execution
 */
function executeNpmAudit() {
    return new Promise((resolve, reject) => {
        let output = '';
        let errorOutput = '';
        
        const auditProcess = spawn('npm', ['audit', '--json'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            timeout: CONFIG.auditTimeout
        });
        
        auditProcess.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        auditProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        auditProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    const auditData = JSON.parse(output);
                    resolve(auditData);
                } catch (error) {
                    reject(new Error(`Failed to parse npm audit output: ${error.message}`));
                }
            } else {
                // npm audit returns non-zero for vulnerabilities, but we still want the data
                try {
                    const auditData = JSON.parse(output);
                    resolve(auditData);
                } catch (error) {
                    reject(new Error(`npm audit failed with code ${code}: ${errorOutput}`));
                }
            }
        });
        
        auditProcess.on('error', (error) => {
            reject(error);
        });
    });
}

/**
 * Vulnerability analysis
 */
function analyzeVulnerabilities(auditData) {
    const vulnerabilities = [];
    
    // Extract vulnerabilities from audit data
    if (auditData.vulnerabilities) {
        for (const [packageName, vulnData] of Object.entries(auditData.vulnerabilities)) {
            if (vulnData.via) {
                for (const via of vulnData.via) {
                    if (typeof via === 'object' && via.title) {
                        vulnerabilities.push({
                            package: packageName,
                            title: via.title,
                            severity: via.severity || 'unknown',
                            description: via.description || '',
                            recommendation: via.recommendation || '',
                            cwe: via.cwe || [],
                            cvss: via.cvss || {},
                            isBlockchain: isBlockchainPackage(packageName),
                            isCritical: isCriticalPackage(packageName)
                        });
                    }
                }
            }
        }
    }
    
    return vulnerabilities;
}

function categorizeVulnerabilities(vulnerabilities) {
    const categorized = {
        bySeverity: {},
        byPackage: {},
        blockchainSpecific: [],
        criticalPackages: {}
    };
    
    // Initialize severity categories
    for (const severity of Object.keys(CONFIG.severityLevels)) {
        categorized.bySeverity[severity] = [];
    }
    
    for (const vuln of vulnerabilities) {
        // Categorize by severity
        const severity = vuln.severity.toLowerCase();
        if (categorized.bySeverity[severity]) {
            categorized.bySeverity[severity].push(vuln);
        }
        
        // Categorize by package
        if (!categorized.byPackage[vuln.package]) {
            categorized.byPackage[vuln.package] = [];
        }
        categorized.byPackage[vuln.package].push(vuln);
        
        // Categorize blockchain-specific vulnerabilities
        if (vuln.isBlockchain) {
            categorized.blockchainSpecific.push(vuln);
        }
        
        // Categorize critical package vulnerabilities
        if (vuln.isCritical) {
            if (!categorized.criticalPackages[vuln.package]) {
                categorized.criticalPackages[vuln.package] = [];
            }
            categorized.criticalPackages[vuln.package].push(vuln);
        }
    }
    
    return categorized;
}

/**
 * Risk assessment
 */
function assessRisks(vulnerabilities, categorized) {
    const assessment = {
        overallRisk: 'UNKNOWN',
        blockchainRisk: 'UNKNOWN',
        productionRisk: 'UNKNOWN',
        developmentRisk: 'UNKNOWN'
    };
    
    // Overall risk assessment
    assessment.overallRisk = calculateRiskScore(vulnerabilities);
    
    // Blockchain-specific risk
    if (categorized.blockchainSpecific.length > 0) {
        assessment.blockchainRisk = calculateRiskScore(categorized.blockchainSpecific);
    } else {
        assessment.blockchainRisk = 'MINIMAL';
    }
    
    // Production vs Development risk
    const productionVulns = vulnerabilities.filter(v => 
        v.severity === 'critical' || v.severity === 'high'
    );
    const developmentVulns = vulnerabilities.filter(v => 
        v.severity === 'moderate' || v.severity === 'low'
    );
    
    assessment.productionRisk = calculateRiskScore(productionVulns);
    assessment.developmentRisk = calculateRiskScore(developmentVulns);
    
    return assessment;
}

/**
 * Remediation planning
 */
function generateRemediationPlan(vulnerabilities, categorized) {
    const plan = {
        immediate: [],
        shortTerm: [],
        longTerm: [],
        alternativePackages: []
    };
    
    // Immediate actions (critical and high severity)
    const immediateVulns = vulnerabilities.filter(v => 
        v.severity === 'critical' || v.severity === 'high'
    );
    
    for (const vuln of immediateVulns) {
        plan.immediate.push({
            package: vuln.package,
            vulnerability: vuln.title,
            severity: vuln.severity,
            action: vuln.recommendation || 'Update package to latest secure version',
            priority: vuln.isBlockchain ? 'HIGH' : 'MEDIUM'
        });
    }
    
    // Short-term actions (moderate severity)
    const shortTermVulns = vulnerabilities.filter(v => v.severity === 'moderate');
    
    for (const vuln of shortTermVulns) {
        plan.shortTerm.push({
            package: vuln.package,
            vulnerability: vuln.title,
            severity: vuln.severity,
            action: vuln.recommendation || 'Update package to latest secure version',
            priority: vuln.isBlockchain ? 'HIGH' : 'MEDIUM'
        });
    }
    
    // Long-term actions (low severity and info)
    const longTermVulns = vulnerabilities.filter(v => 
        v.severity === 'low' || v.severity === 'info'
    );
    
    for (const vuln of longTermVulns) {
        plan.longTerm.push({
            package: vuln.package,
            vulnerability: vuln.title,
            severity: vuln.severity,
            action: vuln.recommendation || 'Consider updating package',
            priority: vuln.isBlockchain ? 'MEDIUM' : 'LOW'
        });
    }
    
    // Alternative packages for critical vulnerabilities
    for (const vuln of immediateVulns) {
        if (vuln.isBlockchain) {
            plan.alternativePackages.push({
                vulnerablePackage: vuln.package,
                vulnerability: vuln.title,
                alternatives: getAlternativePackages(vuln.package),
                migrationDifficulty: assessMigrationDifficulty(vuln.package)
            });
        }
    }
    
    return plan;
}

function getAlternativePackages(packageName) {
    const alternatives = {
        'web3': ['ethers', 'viem'],
        'ethers': ['viem', 'web3'],
        'viem': ['ethers', 'web3'],
        'truffle': ['hardhat', 'foundry'],
        'ganache': ['hardhat', 'anvil']
    };
    
    return alternatives[packageName] || [];
}

function assessMigrationDifficulty(packageName) {
    const difficulties = {
        'web3': 'HIGH',
        'ethers': 'MEDIUM',
        'viem': 'MEDIUM',
        'truffle': 'HIGH',
        'ganache': 'LOW'
    };
    
    return difficulties[packageName] || 'UNKNOWN';
}

/**
 * Compliance checking
 */
function checkCompliance() {
    const compliance = {
        securityBestPractices: [],
        outdatedPackages: [],
        developmentDependencies: []
    };
    
    // Check package.json for security best practices
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        // Check for outdated packages
        if (packageJson.dependencies) {
            for (const [pkg, version] of Object.entries(packageJson.dependencies)) {
                if (version.includes('^') || version.includes('~')) {
                    compliance.outdatedPackages.push({
                        package: pkg,
                        currentVersion: version,
                        recommendation: 'Pin to exact version for security'
                    });
                }
            }
        }
        
        // Check development dependencies
        if (packageJson.devDependencies) {
            for (const [pkg, version] of Object.entries(packageJson.devDependencies)) {
                if (isBlockchainPackage(pkg)) {
                    compliance.developmentDependencies.push({
                        package: pkg,
                        version: version,
                        risk: 'Blockchain packages in devDependencies may affect production'
                    });
                }
            }
        }
        
        // Security best practices
        if (!packageJson.engines) {
            compliance.securityBestPractices.push({
                practice: 'Node.js version specification',
                status: 'MISSING',
                recommendation: 'Add engines field to specify Node.js version'
            });
        }
        
    } catch (error) {
        log(`Failed to analyze package.json: ${error.message}`, 'WARNING');
    }
    
    return compliance;
}

/**
 * Generate recommendations
 */
function generateRecommendations() {
    const recommendations = [];
    
    // Based on vulnerability analysis
    if (results.vulnerabilityAnalysis.totalVulnerabilities > 0) {
        recommendations.push({
            type: 'SECURITY',
            priority: 'HIGH',
            message: `Found ${results.vulnerabilityAnalysis.totalVulnerabilities} vulnerabilities. Review and address immediately.`
        });
    }
    
    // Based on risk assessment
    if (results.riskAssessment.blockchainRisk === 'CRITICAL' || results.riskAssessment.blockchainRisk === 'HIGH') {
        recommendations.push({
            type: 'BLOCKCHAIN_SECURITY',
            priority: 'CRITICAL',
            message: 'Critical blockchain-specific vulnerabilities detected. Address before production deployment.'
        });
    }
    
    // Based on compliance
    if (results.compliance.outdatedPackages.length > 0) {
        recommendations.push({
            type: 'DEPENDENCY_MANAGEMENT',
            priority: 'MEDIUM',
            message: `${results.compliance.outdatedPackages.length} packages use version ranges. Consider pinning to exact versions.`
        });
    }
    
    // Based on remediation plan
    if (results.remediationPlan.immediate.length > 0) {
        recommendations.push({
            type: 'IMMEDIATE_ACTION',
            priority: 'CRITICAL',
            message: `${results.remediationPlan.immediate.length} vulnerabilities require immediate attention.`
        });
    }
    
    return recommendations;
}

/**
 * Main security audit function
 */
async function runSecurityAudit() {
    log('Starting comprehensive security audit analysis...');
    
    try {
        // Get npm version
        results.npmVersion = getNpmVersion();
        log(`Using npm version: ${results.npmVersion}`);
        
        // Validate prerequisites
        if (!fs.existsSync('package.json')) {
            throw new Error('package.json not found in current directory');
        }
        
        log('Prerequisites validated successfully');
        
        // Execute npm audit
        log('Executing npm audit...');
        const auditData = await executeNpmAudit();
        results.auditResults = auditData;
        
        // Analyze vulnerabilities
        log('Analyzing vulnerabilities...');
        const vulnerabilities = analyzeVulnerabilities(auditData);
        results.vulnerabilityAnalysis.totalVulnerabilities = vulnerabilities.length;
        
        // Categorize vulnerabilities
        const categorized = categorizeVulnerabilities(vulnerabilities);
        results.vulnerabilityAnalysis = { ...results.vulnerabilityAnalysis, ...categorized };
        
        // Assess risks
        log('Assessing security risks...');
        results.riskAssessment = assessRisks(vulnerabilities, categorized);
        
        // Generate remediation plan
        log('Generating remediation plan...');
        results.remediationPlan = generateRemediationPlan(vulnerabilities, categorized);
        
        // Check compliance
        log('Checking compliance...');
        results.compliance = checkCompliance();
        
        // Generate recommendations
        log('Generating recommendations...');
        results.recommendations = generateRecommendations();
        
        // Save results
        saveResults();
        
        // Display summary
        displaySummary();
        
        // Return appropriate exit code
        const hasCriticalVulns = vulnerabilities.some(v => v.severity === 'critical');
        const hasHighVulns = vulnerabilities.some(v => v.severity === 'high');
        
        if (hasCriticalVulns) return 2; // Critical vulnerabilities
        if (hasHighVulns) return 1; // High vulnerabilities
        return 0; // No critical/high vulnerabilities
        
    } catch (error) {
        log(`Security audit failed: ${error.message}`, 'ERROR');
        console.error(error);
        return 1;
    }
}

function saveResults() {
    const outputPath = path.join(process.cwd(), 'security-audit-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    log(`Results saved to: ${outputPath}`);
}

function displaySummary() {
    console.log('\n' + '='.repeat(60));
    console.log('SECURITY AUDIT SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`Total Vulnerabilities: ${results.vulnerabilityAnalysis.totalVulnerabilities}`);
    
    // Display by severity
    for (const [severity, vulns] of Object.entries(results.vulnerabilityAnalysis.bySeverity)) {
        if (vulns.length > 0) {
            console.log(`${severity.toUpperCase()}: ${vulns.length}`);
        }
    }
    
    console.log(`\nRisk Assessment:`);
    console.log(`Overall Risk: ${results.riskAssessment.overallRisk}`);
    console.log(`Blockchain Risk: ${results.riskAssessment.blockchainRisk}`);
    console.log(`Production Risk: ${results.riskAssessment.productionRisk}`);
    console.log(`Development Risk: ${results.riskAssessment.developmentRisk}`);
    
    if (results.vulnerabilityAnalysis.blockchainSpecific.length > 0) {
        console.log(`\nBlockchain-Specific Vulnerabilities: ${results.vulnerabilityAnalysis.blockchainSpecific.length}`);
    }
    
    if (Object.keys(results.vulnerabilityAnalysis.criticalPackages).length > 0) {
        console.log(`\nCritical Package Vulnerabilities: ${Object.keys(results.vulnerabilityAnalysis.criticalPackages).length} packages affected`);
    }
    
    if (results.recommendations.length > 0) {
        console.log('\nKey Recommendations:');
        for (const rec of results.recommendations.slice(0, 5)) { // Show top 5
            console.log(`[${rec.priority}] ${rec.message}`);
        }
    }
    
    console.log('\n' + '='.repeat(60));
}

// Run the security audit if this script is executed directly
if (require.main === module) {
    runSecurityAudit()
        .then(exitCode => {
            process.exit(exitCode);
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { runSecurityAudit, CONFIG };
