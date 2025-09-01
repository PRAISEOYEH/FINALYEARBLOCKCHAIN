/**
 * Master Test Runner for Complete Admin Dashboard Tests
 * 
 * This script executes all admin dashboard tests in a coordinated sequence.
 * Collects results from all test scripts, generates comprehensive reports,
 * and provides actionable recommendations for any issues found.
 */

const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

// Import all test classes
const AdminDashboardRenderingTester = require('./test-admin-dashboard-complete-rendering');
const CandidateVerificationWorkflowTester = require('./test-candidate-verification-workflow');
const TransactionTrackingGasEstimationTester = require('./test-transaction-tracking-gas-estimation');
const AdminDashboardIntegrationTester = require('./test-admin-dashboard-integration');
const AdminDashboardRealTimeUpdatesTester = require('./test-admin-dashboard-real-time-updates');
const AdminDashboardErrorHandlingTester = require('./test-admin-dashboard-error-handling');

class CompleteAdminDashboardTestRunner {
    constructor() {
        this.testSuites = [
            {
                name: 'Complete Rendering Tests',
                tester: AdminDashboardRenderingTester,
                description: 'Tests complete admin dashboard rendering with all tabs'
            },
            {
                name: 'Candidate Verification Workflow Tests',
                tester: CandidateVerificationWorkflowTester,
                description: 'Tests candidate verification workflow with blockchain integration'
            },
            {
                name: 'Transaction Tracking and Gas Estimation Tests',
                tester: TransactionTrackingGasEstimationTester,
                description: 'Tests transaction tracking and gas estimation features'
            },
            {
                name: 'Integration Tests',
                tester: AdminDashboardIntegrationTester,
                description: 'Tests complete admin dashboard functionality integration'
            },
            {
                name: 'Real-Time Updates Tests',
                tester: AdminDashboardRealTimeUpdatesTester,
                description: 'Tests real-time updates functionality'
            },
            {
                name: 'Error Handling Tests',
                tester: AdminDashboardErrorHandlingTester,
                description: 'Tests error handling across all admin dashboard features'
            }
        ];
        
        this.results = {
            testSuites: [],
            summary: {
                totalTestSuites: 0,
                passedTestSuites: 0,
                failedTestSuites: 0,
                errorTestSuites: 0,
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                errorTests: 0,
                executionTime: 0,
                startTime: null,
                endTime: null
            },
            recommendations: []
        };
    }

    async runAllTestSuites() {
        console.log('🚀 Starting Complete Admin Dashboard Test Suite...\n');
        console.log('='.repeat(60));
        
        this.results.summary.startTime = new Date();
        
        for (let i = 0; i < this.testSuites.length; i++) {
            const testSuite = this.testSuites[i];
            console.log(`\n📋 Running Test Suite ${i + 1}/${this.testSuites.length}: ${testSuite.name}`);
            console.log(`📝 Description: ${testSuite.description}`);
            console.log('-'.repeat(60));
            
            const suiteStartTime = Date.now();
            
            try {
                const tester = new testSuite.tester();
                const suiteResults = await tester.runAllTests();
                
                const suiteEndTime = Date.now();
                const executionTime = suiteEndTime - suiteStartTime;
                
                const suiteResult = {
                    name: testSuite.name,
                    description: testSuite.description,
                    status: suiteResults.success ? 'PASS' : 'FAIL',
                    executionTime: executionTime,
                    results: suiteResults,
                    timestamp: new Date().toISOString()
                };
                
                this.results.testSuites.push(suiteResult);
                this.results.summary.totalTestSuites++;
                
                if (suiteResults.success) {
                    this.results.summary.passedTestSuites++;
                    console.log(`\n✅ ${testSuite.name}: PASSED (${executionTime}ms)`);
                } else {
                    this.results.summary.failedTestSuites++;
                    console.log(`\n❌ ${testSuite.name}: FAILED (${executionTime}ms)`);
                }
                
                // Aggregate test statistics
                this.results.summary.totalTests += suiteResults.totalTests;
                this.results.summary.passedTests += suiteResults.passedTests;
                this.results.summary.failedTests += suiteResults.failedTests;
                this.results.summary.errorTests += suiteResults.errorTests;
                
            } catch (error) {
                const suiteEndTime = Date.now();
                const executionTime = suiteEndTime - suiteStartTime;
                
                const suiteResult = {
                    name: testSuite.name,
                    description: testSuite.description,
                    status: 'ERROR',
                    executionTime: executionTime,
                    error: error.message,
                    timestamp: new Date().toISOString()
                };
                
                this.results.testSuites.push(suiteResult);
                this.results.summary.totalTestSuites++;
                this.results.summary.errorTestSuites++;
                
                console.log(`\n💥 ${testSuite.name}: ERROR (${executionTime}ms)`);
                console.log(`   Error: ${error.message}`);
            }
        }
        
        this.results.summary.endTime = new Date();
        this.results.summary.executionTime = this.results.summary.endTime - this.results.summary.startTime;
        
        console.log('\n' + '='.repeat(60));
        console.log('🏁 All Test Suites Completed');
        console.log('='.repeat(60));
    }

    generateComprehensiveReport() {
        console.log('\n📊 COMPREHENSIVE ADMIN DASHBOARD TEST REPORT');
        console.log('='.repeat(60));
        
        // Overall Summary
        console.log('\n📈 OVERALL SUMMARY:');
        console.log(`Total Test Suites: ${this.results.summary.totalTestSuites}`);
        console.log(`Passed Test Suites: ${this.results.summary.passedTestSuites} (${((this.results.summary.passedTestSuites/this.results.summary.totalTestSuites)*100).toFixed(1)}%)`);
        console.log(`Failed Test Suites: ${this.results.summary.failedTestSuites} (${((this.results.summary.failedTestSuites/this.results.summary.totalTestSuites)*100).toFixed(1)}%)`);
        console.log(`Error Test Suites: ${this.results.summary.errorTestSuites} (${((this.results.summary.errorTestSuites/this.results.summary.totalTestSuites)*100).toFixed(1)}%)`);
        console.log(`Total Execution Time: ${this.results.summary.executionTime}ms`);
        
        console.log('\n📊 DETAILED TEST STATISTICS:');
        console.log(`Total Tests: ${this.results.summary.totalTests}`);
        console.log(`Passed Tests: ${this.results.summary.passedTests} (${((this.results.summary.passedTests/this.results.summary.totalTests)*100).toFixed(1)}%)`);
        console.log(`Failed Tests: ${this.results.summary.failedTests} (${((this.results.summary.failedTests/this.results.summary.totalTests)*100).toFixed(1)}%)`);
        console.log(`Error Tests: ${this.results.summary.errorTests} (${((this.results.summary.errorTests/this.results.summary.totalTests)*100).toFixed(1)}%)`);
        
        // Individual Test Suite Results
        console.log('\n📋 INDIVIDUAL TEST SUITE RESULTS:');
        this.results.testSuites.forEach((suite, index) => {
            console.log(`\n${index + 1}. ${suite.name}`);
            console.log(`   Status: ${suite.status === 'PASS' ? '✅ PASSED' : suite.status === 'FAIL' ? '❌ FAILED' : '💥 ERROR'}`);
            console.log(`   Execution Time: ${suite.executionTime}ms`);
            console.log(`   Description: ${suite.description}`);
            
            if (suite.results) {
                console.log(`   Tests: ${suite.results.passedTests}/${suite.results.totalTests} passed`);
                if (suite.results.failedTests > 0) {
                    console.log(`   Failed Tests: ${suite.results.failedTests}`);
                }
                if (suite.results.errorTests > 0) {
                    console.log(`   Error Tests: ${suite.results.errorTests}`);
                }
            }
            
            if (suite.error) {
                console.log(`   Error: ${suite.error}`);
            }
        });
        
        // Performance Analysis
        console.log('\n⚡ PERFORMANCE ANALYSIS:');
        const avgExecutionTime = this.results.summary.executionTime / this.results.summary.totalTestSuites;
        console.log(`Average Test Suite Execution Time: ${avgExecutionTime.toFixed(2)}ms`);
        
        const slowestSuite = this.results.testSuites.reduce((slowest, current) => 
            current.executionTime > slowest.executionTime ? current : slowest
        );
        console.log(`Slowest Test Suite: ${slowestSuite.name} (${slowestSuite.executionTime}ms)`);
        
        const fastestSuite = this.results.testSuites.reduce((fastest, current) => 
            current.executionTime < fastest.executionTime ? current : fastest
        );
        console.log(`Fastest Test Suite: ${fastestSuite.name} (${fastestSuite.executionTime}ms)`);
        
        // Generate Recommendations
        this.generateRecommendations();
        
        // Overall Status
        const overallSuccess = this.results.summary.failedTestSuites === 0 && this.results.summary.errorTestSuites === 0;
        console.log(`\n${overallSuccess ? '🎉' : '⚠️'} OVERALL STATUS: ${overallSuccess ? 'ALL TEST SUITES PASSED' : 'SOME TEST SUITES FAILED'}`);
        
        if (this.results.recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            this.results.recommendations.forEach((recommendation, index) => {
                console.log(`${index + 1}. ${recommendation}`);
            });
        }
        
        return this.results;
    }

    generateRecommendations() {
        this.results.recommendations = [];
        
        // Check for failed test suites
        const failedSuites = this.results.testSuites.filter(suite => suite.status === 'FAIL');
        if (failedSuites.length > 0) {
            this.results.recommendations.push(`Address ${failedSuites.length} failed test suite(s): ${failedSuites.map(s => s.name).join(', ')}`);
        }
        
        // Check for error test suites
        const errorSuites = this.results.testSuites.filter(suite => suite.status === 'ERROR');
        if (errorSuites.length > 0) {
            this.results.recommendations.push(`Fix ${errorSuites.length} error test suite(s): ${errorSuites.map(s => s.name).join(', ')}`);
        }
        
        // Check for performance issues
        const slowSuites = this.results.testSuites.filter(suite => suite.executionTime > 30000); // 30 seconds
        if (slowSuites.length > 0) {
            this.results.recommendations.push(`Optimize performance for slow test suites: ${slowSuites.map(s => s.name).join(', ')}`);
        }
        
        // Check for high failure rates
        const highFailureRateSuites = this.results.testSuites.filter(suite => 
            suite.results && (suite.results.failedTests / suite.results.totalTests) > 0.2
        );
        if (highFailureRateSuites.length > 0) {
            this.results.recommendations.push(`Investigate high failure rates in: ${highFailureRateSuites.map(s => s.name).join(', ')}`);
        }
        
        // Check for error rates
        const highErrorRateSuites = this.results.testSuites.filter(suite => 
            suite.results && (suite.results.errorTests / suite.results.totalTests) > 0.1
        );
        if (highErrorRateSuites.length > 0) {
            this.results.recommendations.push(`Fix error handling in: ${highErrorRateSuites.map(s => s.name).join(', ')}`);
        }
        
        // General recommendations
        if (this.results.summary.passedTests / this.results.summary.totalTests < 0.9) {
            this.results.recommendations.push('Overall test pass rate is below 90%. Consider comprehensive code review and testing improvements.');
        }
        
        if (this.results.summary.executionTime > 300000) { // 5 minutes
            this.results.recommendations.push('Total execution time exceeds 5 minutes. Consider test optimization and parallel execution.');
        }
    }

    async saveReportToFile() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportPath = path.join(__dirname, '..', 'validation-logs', `admin-dashboard-test-report-${timestamp}.json`);
        
        // Ensure validation-logs directory exists
        const logsDir = path.dirname(reportPath);
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: this.results.summary,
            testSuites: this.results.testSuites,
            recommendations: this.results.recommendations
        };
        
        fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
        console.log(`\n💾 Test report saved to: ${reportPath}`);
        
        return reportPath;
    }

    async runCompleteTestSuite() {
        try {
            await this.runAllTestSuites();
            const report = this.generateComprehensiveReport();
            const reportPath = await this.saveReportToFile();
            
            const overallSuccess = this.results.summary.failedTestSuites === 0 && this.results.summary.errorTestSuites === 0;
            
            if (overallSuccess) {
                console.log('\n🎉 Complete Admin Dashboard Test Suite: ALL TESTS PASSED!');
                console.log('✅ The admin dashboard is fully functional and ready for production.');
                return { success: true, report, reportPath };
            } else {
                console.log('\n⚠️ Complete Admin Dashboard Test Suite: SOME TESTS FAILED!');
                console.log('❌ Please address the issues identified in the recommendations above.');
                return { success: false, report, reportPath };
            }
            
        } catch (error) {
            console.error('💥 Complete test suite execution failed:', error);
            throw error;
        }
    }
}

// Main execution
async function main() {
    const testRunner = new CompleteAdminDashboardTestRunner();
    
    try {
        const results = await testRunner.runCompleteTestSuite();
        
        if (results.success) {
            console.log('\n🎉 All admin dashboard tests completed successfully!');
            process.exit(0);
        } else {
            console.log('\n⚠️ Some admin dashboard tests failed. Check the report for details.');
            process.exit(1);
        }
    } catch (error) {
        console.error('💥 Test suite execution failed:', error);
        process.exit(1);
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    main().catch((error) => {
        console.error('💥 Unhandled error:', error);
        process.exit(1);
    });
}

module.exports = CompleteAdminDashboardTestRunner;
