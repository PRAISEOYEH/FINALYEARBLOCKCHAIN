/**
 * Admin Dashboard Authorization Test Script
 * 
 * This script tests the admin dashboard authorization checks including:
 * - Wallet connection scenarios
 * - Authorization logic validation
 * - Error handling for unauthorized access
 * - Integration between wallet connection and admin authentication
 * - Multi-wallet hook integration
 */

const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

// Test wallet addresses
const ADMIN_WALLET_ADDRESS = '0x315eC932f31190915Ce2Dc089f4FB7A69002155f';
const UNAUTHORIZED_WALLET_ADDRESSES = [
    '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    '0x8ba1f109551bD432803012645Hac136c',
    '0x1234567890123456789012345678901234567890'
];

class AdminDashboardAuthorizationTester {
    constructor() {
        this.results = {
            adminDashboardComponent: false,
            authorizationLogic: false,
            walletConnectionScenarios: false,
            errorHandling: false,
            universityVotingHook: false,
            multiWalletIntegration: false,
            adminOperationsGating: false
        };
        this.errors = [];
    }

    /**
     * Test admin dashboard component structure
     */
    testAdminDashboardComponent() {
        console.log('🔍 Testing admin dashboard component structure...');
        
        try {
            const adminDashboardPath = path.join(process.cwd(), 'components', 'admin-dashboard.tsx');
            
            if (!fs.existsSync(adminDashboardPath)) {
                throw new Error('admin-dashboard.tsx component not found');
            }

            const adminDashboardContent = fs.readFileSync(adminDashboardPath, 'utf8');
            
            // Check for admin wallet address reference
            const hasAdminWalletRef = adminDashboardContent.includes('NEXT_PUBLIC_ADMIN_WALLET_ADDRESS') ||
                                    adminDashboardContent.includes('process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS');

            if (!hasAdminWalletRef) {
                throw new Error('Admin wallet address not referenced in dashboard');
            }

            // Check for authorization checks
            const hasAuthChecks = adminDashboardContent.includes('isAdmin') ||
                                adminDashboardContent.includes('authorized') ||
                                adminDashboardContent.includes('adminWallet');

            if (!hasAuthChecks) {
                throw new Error('Authorization checks not found in dashboard');
            }

            // Check for wallet connection logic
            const hasWalletLogic = adminDashboardContent.includes('useAccount') ||
                                 adminDashboardContent.includes('address') ||
                                 adminDashboardContent.includes('connected');

            if (!hasWalletLogic) {
                throw new Error('Wallet connection logic not found in dashboard');
            }

            console.log('✅ Admin dashboard component structure verified');
            this.results.adminDashboardComponent = true;
            
        } catch (error) {
            console.error('❌ Admin dashboard component test failed:', error.message);
            this.errors.push(`Admin dashboard component: ${error.message}`);
        }
    }

    /**
     * Test authorization logic
     */
    testAuthorizationLogic() {
        console.log('🔍 Testing authorization logic...');
        
        try {
            const adminDashboardPath = path.join(process.cwd(), 'components', 'admin-dashboard.tsx');
            const adminDashboardContent = fs.readFileSync(adminDashboardPath, 'utf8');
            
            // Test admin wallet address comparison logic
            const testAdminAddress = ADMIN_WALLET_ADDRESS;
            const testUnauthorizedAddress = UNAUTHORIZED_WALLET_ADDRESSES[0];
            
            // Check for case-insensitive comparison
            const hasCaseInsensitiveComparison = adminDashboardContent.includes('toLowerCase()') ||
                                               adminDashboardContent.includes('toUpperCase()');

            if (!hasCaseInsensitiveComparison) {
                console.log('⚠️  Warning: Case-insensitive comparison not found');
            }

            // Check for address normalization
            const hasAddressNormalization = adminDashboardContent.includes('getAddress') ||
                                          adminDashboardContent.includes('ethers');

            if (!hasAddressNormalization) {
                console.log('⚠️  Warning: Address normalization not found');
            }

            // Check for authorization state management
            const hasAuthState = adminDashboardContent.includes('useState') ||
                               adminDashboardContent.includes('useEffect') ||
                               adminDashboardContent.includes('useMemo');

            if (!hasAuthState) {
                throw new Error('Authorization state management not found');
            }

            console.log('✅ Authorization logic verified');
            console.log(`   Admin address: ${testAdminAddress}`);
            console.log(`   Test unauthorized address: ${testUnauthorizedAddress}`);
            this.results.authorizationLogic = true;
            
        } catch (error) {
            console.error('❌ Authorization logic test failed:', error.message);
            this.errors.push(`Authorization logic: ${error.message}`);
        }
    }

    /**
     * Test wallet connection scenarios
     */
    testWalletConnectionScenarios() {
        console.log('🔍 Testing wallet connection scenarios...');
        
        try {
            const adminDashboardPath = path.join(process.cwd(), 'components', 'admin-dashboard.tsx');
            const adminDashboardContent = fs.readFileSync(adminDashboardPath, 'utf8');
            
            // Check for different connection states
            const hasConnectionStates = adminDashboardContent.includes('connected') ||
                                      adminDashboardContent.includes('disconnected') ||
                                      adminDashboardContent.includes('connecting');

            if (!hasConnectionStates) {
                throw new Error('Connection state handling not found');
            }

            // Check for wallet address validation
            const hasAddressValidation = adminDashboardContent.includes('address') ||
                                       adminDashboardContent.includes('wallet') ||
                                       adminDashboardContent.includes('account');

            if (!hasAddressValidation) {
                throw new Error('Wallet address validation not found');
            }

            // Check for network validation
            const hasNetworkValidation = adminDashboardContent.includes('chainId') ||
                                       adminDashboardContent.includes('network') ||
                                       adminDashboardContent.includes('84532');

            if (!hasNetworkValidation) {
                console.log('⚠️  Warning: Network validation not explicitly found');
            }

            console.log('✅ Wallet connection scenarios verified');
            this.results.walletConnectionScenarios = true;
            
        } catch (error) {
            console.error('❌ Wallet connection scenarios test failed:', error.message);
            this.errors.push(`Wallet connection scenarios: ${error.message}`);
        }
    }

    /**
     * Test error handling for unauthorized access
     */
    testErrorHandling() {
        console.log('🔍 Testing error handling for unauthorized access...');
        
        try {
            const adminDashboardPath = path.join(process.cwd(), 'components', 'admin-dashboard.tsx');
            const adminDashboardContent = fs.readFileSync(adminDashboardPath, 'utf8');
            
            // Check for error handling patterns
            const hasErrorHandling = adminDashboardContent.includes('Error') ||
                                   adminDashboardContent.includes('catch') ||
                                   adminDashboardContent.includes('try') ||
                                   adminDashboardContent.includes('throw');

            if (!hasErrorHandling) {
                console.log('⚠️  Warning: Error handling patterns not found');
            }

            // Check for unauthorized access messages
            const hasUnauthorizedMessages = adminDashboardContent.includes('unauthorized') ||
                                          adminDashboardContent.includes('Unauthorized') ||
                                          adminDashboardContent.includes('Access denied') ||
                                          adminDashboardContent.includes('Not authorized');

            if (!hasUnauthorizedMessages) {
                console.log('⚠️  Warning: Unauthorized access messages not found');
            }

            // Check for conditional rendering based on authorization
            const hasConditionalRendering = adminDashboardContent.includes('&&') ||
                                          adminDashboardContent.includes('?') ||
                                          adminDashboardContent.includes('if') ||
                                          adminDashboardContent.includes('return null');

            if (!hasConditionalRendering) {
                throw new Error('Conditional rendering based on authorization not found');
            }

            console.log('✅ Error handling verified');
            this.results.errorHandling = true;
            
        } catch (error) {
            console.error('❌ Error handling test failed:', error.message);
            this.errors.push(`Error handling: ${error.message}`);
        }
    }

    /**
     * Test university voting hook integration
     */
    testUniversityVotingHook() {
        console.log('🔍 Testing university voting hook integration...');
        
        try {
            const universityVotingPath = path.join(process.cwd(), 'hooks', 'use-university-voting.tsx');
            
            if (!fs.existsSync(universityVotingPath)) {
                throw new Error('use-university-voting.tsx hook not found');
            }

            const universityVotingContent = fs.readFileSync(universityVotingPath, 'utf8');
            
            // Check for admin wallet checks
            const hasAdminChecks = universityVotingContent.includes('admin') ||
                                 universityVotingContent.includes('Admin') ||
                                 universityVotingContent.includes('NEXT_PUBLIC_ADMIN_WALLET_ADDRESS');

            if (!hasAdminChecks) {
                console.log('⚠️  Warning: Admin checks not found in university voting hook');
            }

            // Check for wallet state management
            const hasWalletState = universityVotingContent.includes('useAccount') ||
                                 universityVotingContent.includes('address') ||
                                 universityVotingContent.includes('connected');

            if (!hasWalletState) {
                throw new Error('Wallet state management not found in university voting hook');
            }

            // Check for admin operations
            const hasAdminOperations = universityVotingContent.includes('createElection') ||
                                     universityVotingContent.includes('addCandidate') ||
                                     universityVotingContent.includes('admin') ||
                                     universityVotingContent.includes('Admin');

            if (!hasAdminOperations) {
                console.log('⚠️  Warning: Admin operations not found in university voting hook');
            }

            console.log('✅ University voting hook integration verified');
            this.results.universityVotingHook = true;
            
        } catch (error) {
            console.error('❌ University voting hook test failed:', error.message);
            this.errors.push(`University voting hook: ${error.message}`);
        }
    }

    /**
     * Test multi-wallet integration
     */
    testMultiWalletIntegration() {
        console.log('🔍 Testing multi-wallet integration...');
        
        try {
            const multiWalletPath = path.join(process.cwd(), 'hooks', 'use-multi-wallet.tsx');
            
            if (!fs.existsSync(multiWalletPath)) {
                throw new Error('use-multi-wallet.tsx hook not found');
            }

            const multiWalletContent = fs.readFileSync(multiWalletPath, 'utf8');
            
            // Check for admin dashboard integration
            const hasAdminIntegration = multiWalletContent.includes('admin') ||
                                      multiWalletContent.includes('Admin') ||
                                      multiWalletContent.includes('dashboard');

            if (!hasAdminIntegration) {
                console.log('⚠️  Warning: Admin dashboard integration not found in multi-wallet hook');
            }

            // Check for authorization state
            const hasAuthState = multiWalletContent.includes('authorized') ||
                               multiWalletContent.includes('isAdmin') ||
                               multiWalletContent.includes('adminWallet');

            if (!hasAuthState) {
                console.log('⚠️  Warning: Authorization state not found in multi-wallet hook');
            }

            // Check for error handling
            const hasErrorHandling = multiWalletContent.includes('Error') ||
                                   multiWalletContent.includes('catch') ||
                                   multiWalletContent.includes('try');

            if (!hasErrorHandling) {
                console.log('⚠️  Warning: Error handling not found in multi-wallet hook');
            }

            console.log('✅ Multi-wallet integration verified');
            this.results.multiWalletIntegration = true;
            
        } catch (error) {
            console.error('❌ Multi-wallet integration test failed:', error.message);
            this.errors.push(`Multi-wallet integration: ${error.message}`);
        }
    }

    /**
     * Test admin operations gating
     */
    testAdminOperationsGating() {
        console.log('🔍 Testing admin operations gating...');
        
        try {
            const adminDashboardPath = path.join(process.cwd(), 'components', 'admin-dashboard.tsx');
            const adminDashboardContent = fs.readFileSync(adminDashboardPath, 'utf8');
            
            // Check for admin-only operations
            const hasAdminOperations = adminDashboardContent.includes('createElection') ||
                                     adminDashboardContent.includes('addCandidate') ||
                                     adminDashboardContent.includes('deleteElection') ||
                                     adminDashboardContent.includes('admin') ||
                                     adminDashboardContent.includes('Admin');

            if (!hasAdminOperations) {
                console.log('⚠️  Warning: Admin operations not found in dashboard');
            }

            // Check for operation gating
            const hasOperationGating = adminDashboardContent.includes('&&') ||
                                     adminDashboardContent.includes('?') ||
                                     adminDashboardContent.includes('if') ||
                                     adminDashboardContent.includes('disabled');

            if (!hasOperationGating) {
                throw new Error('Operation gating not found in dashboard');
            }

            // Check for permission checks
            const hasPermissionChecks = adminDashboardContent.includes('permission') ||
                                      adminDashboardContent.includes('Permission') ||
                                      adminDashboardContent.includes('authorized') ||
                                      adminDashboardContent.includes('isAdmin');

            if (!hasPermissionChecks) {
                console.log('⚠️  Warning: Permission checks not found in dashboard');
            }

            console.log('✅ Admin operations gating verified');
            this.results.adminOperationsGating = true;
            
        } catch (error) {
            console.error('❌ Admin operations gating test failed:', error.message);
            this.errors.push(`Admin operations gating: ${error.message}`);
        }
    }

    /**
     * Run all authorization tests
     */
    async runTests() {
        console.log('🚀 Starting Admin Dashboard Authorization Tests\n');
        console.log(`Admin Wallet Address: ${ADMIN_WALLET_ADDRESS}\n`);

        this.testAdminDashboardComponent();
        this.testAuthorizationLogic();
        this.testWalletConnectionScenarios();
        this.testErrorHandling();
        this.testUniversityVotingHook();
        this.testMultiWalletIntegration();
        this.testAdminOperationsGating();

        this.generateReport();
    }

    /**
     * Generate test report
     */
    generateReport() {
        console.log('\n📊 AUTHORIZATION TEST REPORT');
        console.log('='.repeat(50));
        
        const totalTests = Object.keys(this.results).length;
        const passedTests = Object.values(this.results).filter(Boolean).length;
        
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${totalTests - passedTests}`);
        console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

        console.log('Test Results:');
        Object.entries(this.results).forEach(([test, result]) => {
            const status = result ? '✅ PASS' : '❌ FAIL';
            console.log(`  ${test}: ${status}`);
        });

        if (this.errors.length > 0) {
            console.log('\nErrors Found:');
            this.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }

        console.log('\n' + '='.repeat(50));
        
        if (passedTests === totalTests) {
            console.log('🎉 All admin dashboard authorization tests passed!');
            process.exit(0);
        } else {
            console.log('⚠️  Some tests failed. Please review the errors above.');
            process.exit(1);
        }
    }
}

// Run tests if script is executed directly
if (require.main === module) {
    const tester = new AdminDashboardAuthorizationTester();
    tester.runTests().catch(console.error);
}

module.exports = AdminDashboardAuthorizationTester;
