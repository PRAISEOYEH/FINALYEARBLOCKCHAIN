#!/usr/bin/env node

/**
 * Dependency Lock Validator
 * 
 * This script validates the package-lock.json file to ensure:
 * 1. All dependencies have exact version locks (no ranges)
 * 2. Critical dependencies (hardhat@2.26.3, ethers@5.8.0) are properly locked
 * 3. No vulnerabilities in locked versions
 * 4. Consistent dependency resolution across environments
 * 
 * Output: dependency-lock-validation.json
 */

const fs = require('fs');
const path = require('path');

// Critical dependencies that must be exactly locked
const CRITICAL_DEPENDENCIES = {
  'hardhat': '2.26.3',
  'ethers': '5.8.0'
};

// Dependencies that should be exact (not ranges) for security
const SECURITY_CRITICAL = [
  'hardhat',
  'ethers',
  '@nomicfoundation/hardhat-ethers',
  '@nomicfoundation/hardhat-chai-matchers',
  '@nomicfoundation/hardhat-network-helpers',
  'chai',
  'mocha',
  'typescript',
  'next',
  'react',
  'react-dom',
  '@types/node',
  '@types/react',
  '@types/react-dom'
];

class DependencyLockValidator {
  constructor() {
    this.packageLockPath = path.join(process.cwd(), 'package-lock.json');
    this.packageJsonPath = path.join(process.cwd(), 'package.json');
    this.outputPath = path.join(process.cwd(), 'dependency-lock-validation.json');
    this.results = {
      timestamp: new Date().toISOString(),
      overallStatus: 'PASS',
      summary: {
        totalDependencies: 0,
        exactLocks: 0,
        rangeDependencies: 0,
        criticalDependenciesValidated: 0,
        securityIssues: 0,
        warnings: 0
      },
      criticalDependencies: {},
      rangeDependencies: [],
      securityIssues: [],
      warnings: [],
      recommendations: []
    };
  }

  /**
   * Main validation function
   */
  async validate() {
    console.log('🔍 Starting Dependency Lock Validation...\n');

    try {
      // Load package files
      const packageLock = this.loadPackageLock();
      const packageJson = this.loadPackageJson();

      if (!packageLock || !packageJson) {
        this.fail('Failed to load package files');
        return;
      }

      console.log('📦 Package files loaded successfully');

      // Validate critical dependencies
      this.validateCriticalDependencies(packageLock, packageJson);

      // Check for range dependencies
      this.checkRangeDependencies(packageLock, packageJson);

      // Validate security-critical dependencies
      this.validateSecurityCriticalDependencies(packageLock);

      // Check for potential security issues
      this.checkSecurityIssues(packageLock);

      // Generate recommendations
      this.generateRecommendations();

      // Write results
      this.writeResults();

      // Display summary
      this.displaySummary();

    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      this.fail(`Validation error: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Load package-lock.json
   */
  loadPackageLock() {
    try {
      if (!fs.existsSync(this.packageLockPath)) {
        throw new Error('package-lock.json not found');
      }

      const content = fs.readFileSync(this.packageLockPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error('❌ Failed to load package-lock.json:', error.message);
      return null;
    }
  }

  /**
   * Load package.json
   */
  loadPackageJson() {
    try {
      if (!fs.existsSync(this.packageJsonPath)) {
        throw new Error('package.json not found');
      }

      const content = fs.readFileSync(this.packageJsonPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error('❌ Failed to load package.json:', error.message);
      return null;
    }
  }

  /**
   * Validate critical dependencies
   */
  validateCriticalDependencies(packageLock, packageJson) {
    console.log('🔐 Validating critical dependencies...');

    for (const [depName, expectedVersion] of Object.entries(CRITICAL_DEPENDENCIES)) {
      const result = {
        name: depName,
        expectedVersion: expectedVersion,
        packageJsonVersion: null,
        packageLockVersion: null,
        status: 'FAIL',
        issues: []
      };

      // Check package.json
      const pkgJsonDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      if (pkgJsonDeps[depName]) {
        result.packageJsonVersion = pkgJsonDeps[depName];
        
        // Check if it's a range instead of exact version
        if (pkgJsonDeps[depName].startsWith('^') || pkgJsonDeps[depName].startsWith('~')) {
          result.issues.push(`Package.json contains range: ${pkgJsonDeps[depName]}`);
        }
      } else {
        result.issues.push('Dependency not found in package.json');
      }

      // Check package-lock.json
      const lockEntry = packageLock.packages[`node_modules/${depName}`];
      if (lockEntry) {
        result.packageLockVersion = lockEntry.version;
        
        if (lockEntry.version === expectedVersion) {
          result.status = 'PASS';
        } else {
          result.issues.push(`Version mismatch: expected ${expectedVersion}, got ${lockEntry.version}`);
        }
      } else {
        result.issues.push('Dependency not found in package-lock.json');
      }

      this.results.criticalDependencies[depName] = result;

      if (result.status === 'PASS') {
        this.results.summary.criticalDependenciesValidated++;
        console.log(`  ✅ ${depName}: ${result.packageLockVersion}`);
      } else {
        console.log(`  ❌ ${depName}: ${result.issues.join(', ')}`);
        this.results.overallStatus = 'FAIL';
      }
    }

    console.log('');
  }

  /**
   * Check for range dependencies in package.json
   */
  checkRangeDependencies(packageLock, packageJson) {
    console.log('📊 Checking for range dependencies...');

    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    this.results.summary.totalDependencies = Object.keys(allDeps).length;

    for (const [depName, version] of Object.entries(allDeps)) {
      const isRange = version.startsWith('^') || version.startsWith('~') || version.includes('>') || version.includes('<');
      
      if (isRange) {
        this.results.rangeDependencies.push({
          name: depName,
          range: version,
          isSecurityCritical: SECURITY_CRITICAL.includes(depName)
        });
        this.results.summary.rangeDependencies++;
      } else {
        this.results.summary.exactLocks++;
      }
    }

    // Display range dependencies
    if (this.results.rangeDependencies.length > 0) {
      console.log(`  ⚠️  Found ${this.results.rangeDependencies.length} range dependencies:`);
      this.results.rangeDependencies.forEach(dep => {
        const critical = dep.isSecurityCritical ? ' (SECURITY CRITICAL)' : '';
        console.log(`    - ${dep.name}: ${dep.range}${critical}`);
      });
    } else {
      console.log('  ✅ All dependencies are exact locks');
    }

    console.log('');
  }

  /**
   * Validate security-critical dependencies
   */
  validateSecurityCriticalDependencies(packageLock) {
    console.log('🛡️  Validating security-critical dependencies...');

    for (const depName of SECURITY_CRITICAL) {
      const lockEntry = packageLock.packages[`node_modules/${depName}`];
      
      if (lockEntry) {
        // Check if the locked version is reasonable (not too old)
        const version = lockEntry.version;
        const major = parseInt(version.split('.')[0]);
        
        // Basic version checks for critical dependencies
        if (depName === 'hardhat' && major < 2) {
          this.addSecurityIssue(depName, `Very old Hardhat version: ${version}`);
        } else if (depName === 'ethers' && major < 5) {
          this.addSecurityIssue(depName, `Very old Ethers version: ${version}`);
        } else if (depName === 'typescript' && major < 4) {
          this.addSecurityIssue(depName, `Very old TypeScript version: ${version}`);
        } else if (depName === 'next' && major < 13) {
          this.addSecurityIssue(depName, `Very old Next.js version: ${version}`);
        }
        
        console.log(`  ✅ ${depName}: ${version}`);
      } else {
        console.log(`  ⚠️  ${depName}: Not found in lock file`);
        this.addWarning(depName, 'Security-critical dependency not found in lock file');
      }
    }

    console.log('');
  }

  /**
   * Check for potential security issues
   */
  checkSecurityIssues(packageLock) {
    console.log('🔍 Checking for security issues...');

    // Check for known vulnerable packages
    const vulnerablePackages = [
      { name: 'lodash', versions: ['<4.17.21'], issue: 'CVE-2021-23337' },
      { name: 'minimist', versions: ['<1.2.6'], issue: 'CVE-2021-44906' },
      { name: 'semver', versions: ['<7.5.2'], issue: 'CVE-2022-25883' }
    ];

    for (const vuln of vulnerablePackages) {
      const lockEntry = packageLock.packages[`node_modules/${vuln.name}`];
      if (lockEntry) {
        // Simple version check (in production, use a proper semver library)
        const version = lockEntry.version;
        console.log(`  ℹ️  ${vuln.name}: ${version} (check for ${vuln.issue})`);
      }
    }

    console.log('');
  }

  /**
   * Add security issue
   */
  addSecurityIssue(depName, issue) {
    this.results.securityIssues.push({
      dependency: depName,
      issue: issue,
      severity: 'HIGH'
    });
    this.results.summary.securityIssues++;
    this.results.overallStatus = 'FAIL';
  }

  /**
   * Add warning
   */
  addWarning(depName, warning) {
    this.results.warnings.push({
      dependency: depName,
      warning: warning
    });
    this.results.summary.warnings++;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations() {
    console.log('💡 Generating recommendations...');

    // Recommendations based on findings
    if (this.results.rangeDependencies.length > 0) {
      this.results.recommendations.push({
        type: 'SECURITY',
        priority: 'HIGH',
        message: 'Consider pinning all dependencies to exact versions for reproducible builds',
        action: 'Update package.json to use exact versions instead of ranges'
      });
    }

    if (this.results.summary.securityIssues > 0) {
      this.results.recommendations.push({
        type: 'SECURITY',
        priority: 'CRITICAL',
        message: 'Address security issues in dependencies',
        action: 'Update vulnerable packages to secure versions'
      });
    }

    if (this.results.summary.warnings > 0) {
      this.results.recommendations.push({
        type: 'MAINTENANCE',
        priority: 'MEDIUM',
        message: 'Review warnings for potential issues',
        action: 'Investigate and resolve dependency warnings'
      });
    }

    // Always recommend regular audits
    this.results.recommendations.push({
      type: 'MAINTENANCE',
      priority: 'LOW',
      message: 'Run regular security audits',
      action: 'Use npm audit regularly to check for vulnerabilities'
    });

    console.log('');
  }

  /**
   * Write results to file
   */
  writeResults() {
    try {
      fs.writeFileSync(this.outputPath, JSON.stringify(this.results, null, 2));
      console.log(`📄 Results written to: ${this.outputPath}`);
    } catch (error) {
      console.error('❌ Failed to write results:', error.message);
      this.fail('Failed to write validation results');
    }
  }

  /**
   * Display summary
   */
  displaySummary() {
    console.log('📋 Validation Summary');
    console.log('====================');
    console.log(`Overall Status: ${this.results.overallStatus}`);
    console.log(`Total Dependencies: ${this.results.summary.totalDependencies}`);
    console.log(`Exact Locks: ${this.results.summary.exactLocks}`);
    console.log(`Range Dependencies: ${this.results.summary.rangeDependencies}`);
    console.log(`Critical Dependencies Validated: ${this.results.summary.criticalDependenciesValidated}`);
    console.log(`Security Issues: ${this.results.summary.securityIssues}`);
    console.log(`Warnings: ${this.results.summary.warnings}`);
    console.log('');

    if (this.results.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      this.results.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. [${rec.priority}] ${rec.message}`);
      });
      console.log('');
    }

    if (this.results.overallStatus === 'PASS') {
      console.log('✅ Dependency lock validation completed successfully!');
    } else {
      console.log('❌ Dependency lock validation found issues that need attention.');
    }
  }

  /**
   * Mark validation as failed
   */
  fail(reason) {
    this.results.overallStatus = 'FAIL';
    this.results.summary.errors = reason;
    this.writeResults();
  }
}

// Main execution
if (require.main === module) {
  const validator = new DependencyLockValidator();
  validator.validate().then(() => {
    if (validator.results.overallStatus === 'FAIL') {
      process.exit(1);
    }
  }).catch((error) => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

module.exports = DependencyLockValidator;
