/**
 * Admin Verification Suite - Master Test Runner
 * 
 * This script executes all admin verification tests in sequence and generates
 * a comprehensive report. It runs:
 * - Admin wallet configuration verification
 * - Base Sepolia network integration tests
 * - Admin dashboard authorization tests
 * - Enhanced admin authentication tests
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class AdminVerificationSuite {
    constructor() {
        this.testScripts = [
            {
                name: 'Admin Wallet Configuration Verification',
                script: 'verify-admin-wallet-config.js',
                description: 'Verifies admin wallet address configuration and accessibility'
            },
            {
                name: 'Base Sepolia Network Integration',
                script: 'test-base-sepolia-integration.js',
                description: 'Tests Base Sepolia network connectivity and configuration'
            },
            {
                name: 'Admin Dashboard Authorization',
                script: 'test-admin-dashboard-authorization.js',
                description: 'Validates admin dashboard authorization checks'
            },
            {
                name: 'Enhanced Admin Authentication',
                script: 'test-admin-authentication.js',
                description: 'Tests complete admin authentication flow'
            }
        ];
        this.results = [];
        this.startTime = null;
        this.endTime = null;
    }

    /**
     * Log message with timestamp
     */
    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        const prefix = type === 'ERROR' ? '❌' : type === 'SUCCESS' ? '✅' : type === 'WARNING' ? '⚠️' : 'ℹ️';
        console.log(`[${timestamp}] ${prefix} ${message}`);
    }

    /**
     * Run a single test script
     */
    async runTestScript(testConfig) {
        return new Promise((resolve) => {
            this.log(`Starting: ${testConfig.name}`, 'INFO');
            this.log(`Description: ${testConfig.description}`, 'INFO');
            
            const scriptPath = path.join(__dirname, testConfig.script);
            const startTime = Date.now();
            
            const child = spawn('node', [scriptPath], {
                stdio: ['pipe', 'pipe', 'pipe'],
                cwd: process.cwd()
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                const endTime = Date.now();
                const duration = endTime - startTime;
                
                const result = {
                    name: testConfig.name,
                    script: testConfig.script,
                    description: testConfig.description,
                    exitCode: code,
                    duration: duration,
                    success: code === 0,
                    stdout: stdout,
                    stderr: stderr,
                    timestamp: new Date().toISOString()
                };

                if (code === 0) {
                    this.log(`Completed: ${testConfig.name} (${duration}ms)`, 'SUCCESS');
                } else {
                    this.log(`Failed: ${testConfig.name} (${duration}ms)`, 'ERROR');
                }

                resolve(result);
            });

            child.on('error', (error) => {
                const endTime = Date.now();
                const duration = endTime - startTime;
                
                const result = {
                    name: testConfig.name,
                    script: testConfig.script,
                    description: testConfig.description,
                    exitCode: -1,
                    duration: duration,
                    success: false,
                    stdout: '',
                    stderr: error.message,
                    error: error.message,
                    timestamp: new Date().toISOString()
                };

                this.log(`Error: ${testConfig.name} - ${error.message}`, 'ERROR');
                resolve(result);
            });
        });
    }

    /**
     * Run all test scripts sequentially
     */
    async runAllTests() {
        this.startTime = Date.now();
        this.log('🚀 Starting Admin Verification Suite', 'INFO');
        this.log(`Total Tests: ${this.testScripts.length}`, 'INFO');
        this.log('='.repeat(60), 'INFO');

        for (let i = 0; i < this.testScripts.length; i++) {
            const testConfig = this.testScripts[i];
            this.log(`\n[${i + 1}/${this.testScripts.length}] Running: ${testConfig.name}`, 'INFO');
            
            const result = await this.runTestScript(testConfig);
            this.results.push(result);
            
            // Add delay between tests
            if (i < this.testScripts.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        this.endTime = Date.now();
        this.generateComprehensiveReport();
    }

    /**
     * Generate comprehensive verification report
     */
    generateComprehensiveReport() {
        const totalDuration = this.endTime - this.startTime;
        const successfulTests = this.results.filter(result => result.success).length;
        const failedTests = this.results.filter(result => !result.success).length;
        const successRate = (successfulTests / this.results.length) * 100;

        console.log('\n' + '='.repeat(80));
        console.log('📊 COMPREHENSIVE ADMIN VERIFICATION REPORT');
        console.log('='.repeat(80));
        
        console.log(`\n📈 SUMMARY STATISTICS:`);
        console.log(`   Total Tests: ${this.results.length}`);
        console.log(`   Successful: ${successfulTests}`);
        console.log(`   Failed: ${failedTests}`);
        console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
        console.log(`   Total Duration: ${totalDuration}ms (${(totalDuration / 1000).toFixed(1)}s)`);

        console.log(`\n📋 DETAILED RESULTS:`);
        this.results.forEach((result, index) => {
            const status = result.success ? '✅ PASS' : '❌ FAIL';
            const duration = `${result.duration}ms`;
            console.log(`   ${index + 1}. ${result.name}`);
            console.log(`      Status: ${status}`);
            console.log(`      Duration: ${duration}`);
            console.log(`      Exit Code: ${result.exitCode}`);
            if (result.error) {
                console.log(`      Error: ${result.error}`);
            }
            console.log('');
        });

        if (failedTests > 0) {
            console.log(`\n❌ FAILED TESTS DETAILS:`);
            this.results.filter(result => !result.success).forEach((result, index) => {
                console.log(`   ${index + 1}. ${result.name}`);
                console.log(`      Script: ${result.script}`);
                console.log(`      Exit Code: ${result.exitCode}`);
                if (result.stderr) {
                    console.log(`      Error Output: ${result.stderr.substring(0, 200)}...`);
                }
                console.log('');
            });
        }

        console.log(`\n🔧 RECOMMENDATIONS:`);
        if (successRate === 100) {
            console.log('   🎉 All tests passed! Your admin verification system is fully functional.');
            console.log('   ✅ Admin wallet address is properly configured');
            console.log('   ✅ Base Sepolia network integration is working');
            console.log('   ✅ Admin dashboard authorization is secure');
            console.log('   ✅ Complete authentication flow is operational');
        } else if (successRate >= 75) {
            console.log('   ⚠️  Most tests passed, but some issues need attention.');
            console.log('   🔍 Review failed tests and address the issues');
            console.log('   📝 Check the detailed error messages above');
        } else {
            console.log('   🚨 Multiple test failures detected. Immediate attention required.');
            console.log('   🔧 Review and fix all failed tests before proceeding');
            console.log('   📞 Consider checking environment configuration and dependencies');
        }

        console.log(`\n📁 REPORT FILES:`);
        this.saveReportToFile();
        this.saveDetailedLogs();

        console.log('\n' + '='.repeat(80));
        
        if (successRate === 100) {
            console.log('🎉 ADMIN VERIFICATION SUITE COMPLETED SUCCESSFULLY!');
            process.exit(0);
        } else {
            console.log('⚠️  ADMIN VERIFICATION SUITE COMPLETED WITH ISSUES');
            process.exit(1);
        }
    }

    /**
     * Save summary report to file
     */
    saveReportToFile() {
        try {
            const reportPath = path.join(process.cwd(), 'admin-verification-report.json');
            const report = {
                timestamp: new Date().toISOString(),
                summary: {
                    totalTests: this.results.length,
                    successful: this.results.filter(r => r.success).length,
                    failed: this.results.filter(r => !r.success).length,
                    successRate: (this.results.filter(r => r.success).length / this.results.length) * 100,
                    totalDuration: this.endTime - this.startTime
                },
                results: this.results.map(result => ({
                    name: result.name,
                    success: result.success,
                    duration: result.duration,
                    exitCode: result.exitCode,
                    timestamp: result.timestamp
                }))
            };

            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            console.log(`   📄 Summary Report: ${reportPath}`);
        } catch (error) {
            console.log(`   ❌ Failed to save summary report: ${error.message}`);
        }
    }

    /**
     * Save detailed logs to file
     */
    saveDetailedLogs() {
        try {
            const logsPath = path.join(process.cwd(), 'admin-verification-logs.txt');
            let logs = `Admin Verification Suite - Detailed Logs\n`;
            logs += `Generated: ${new Date().toISOString()}\n`;
            logs += '='.repeat(80) + '\n\n';

            this.results.forEach((result, index) => {
                logs += `TEST ${index + 1}: ${result.name}\n`;
                logs += `Script: ${result.script}\n`;
                logs += `Status: ${result.success ? 'PASS' : 'FAIL'}\n`;
                logs += `Duration: ${result.duration}ms\n`;
                logs += `Exit Code: ${result.exitCode}\n`;
                logs += `Timestamp: ${result.timestamp}\n`;
                
                if (result.stdout) {
                    logs += `\nSTDOUT:\n${result.stdout}\n`;
                }
                
                if (result.stderr) {
                    logs += `\nSTDERR:\n${result.stderr}\n`;
                }
                
                if (result.error) {
                    logs += `\nERROR:\n${result.error}\n`;
                }
                
                logs += '\n' + '-'.repeat(80) + '\n\n';
            });

            fs.writeFileSync(logsPath, logs);
            console.log(`   📝 Detailed Logs: ${logsPath}`);
        } catch (error) {
            console.log(`   ❌ Failed to save detailed logs: ${error.message}`);
        }
    }
}

// Run the verification suite if script is executed directly
if (require.main === module) {
    const suite = new AdminVerificationSuite();
    suite.runAllTests().catch(error => {
        console.error('❌ Verification suite failed:', error);
        process.exit(1);
    });
}

module.exports = AdminVerificationSuite;
