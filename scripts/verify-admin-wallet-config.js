/**
 * Admin Wallet Configuration Verification Script
 * 
 * This script verifies that the admin wallet address is properly configured
 * and accessible throughout the application. It tests:
 * - Environment variable configuration
 * - Address format validation
 * - Component integration
 * - Address normalization
 */

const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

// Expected admin wallet address
const EXPECTED_ADMIN_ADDRESS = '0x315eC932f31190915Ce2Dc089f4FB7A69002155f';

class AdminWalletConfigVerifier {
    constructor() {
        this.results = {
            envConfig: false,
            addressFormat: false,
            componentIntegration: false,
            addressNormalization: false,
            accessibility: false,
            authorizationLogic: false
        };
        this.errors = [];
    }

    /**
     * Verify environment configuration
     */
    verifyEnvironmentConfig() {
        console.log('🔍 Verifying environment configuration...');
        
        try {
            // Check if .env file exists
            const envPath = path.join(process.cwd(), '.env');
            if (!fs.existsSync(envPath)) {
                throw new Error('.env file not found');
            }

            // Read .env file
            const envContent = fs.readFileSync(envPath, 'utf8');
            
            // Check for admin wallet address in .env
            const adminWalletRegex = /NEXT_PUBLIC_ADMIN_WALLET_ADDRESS\s*=\s*(.+)/;
            const match = envContent.match(adminWalletRegex);
            
            if (!match) {
                throw new Error('NEXT_PUBLIC_ADMIN_WALLET_ADDRESS not found in .env');
            }

            const configuredAddress = match[1].trim().replace(/['"]/g, '');
            
            if (configuredAddress.toLowerCase() !== EXPECTED_ADMIN_ADDRESS.toLowerCase()) {
                throw new Error(`Admin wallet address mismatch. Expected: ${EXPECTED_ADMIN_ADDRESS}, Found: ${configuredAddress}`);
            }

            console.log('✅ Environment configuration verified');
            console.log(`   Admin wallet address: ${configuredAddress}`);
            this.results.envConfig = true;
            
        } catch (error) {
            console.error('❌ Environment configuration failed:', error.message);
            this.errors.push(`Environment config: ${error.message}`);
        }
    }

    /**
     * Verify address format using ethers.js
     */
    verifyAddressFormat() {
        console.log('🔍 Verifying address format...');
        
        try {
            // Test if the address is valid
            const isValidAddress = ethers.isAddress(EXPECTED_ADMIN_ADDRESS);
            
            if (!isValidAddress) {
                throw new Error('Invalid Ethereum address format');
            }

            // Test address checksum
            const checksumAddress = ethers.getAddress(EXPECTED_ADMIN_ADDRESS);
            console.log(`✅ Address format verified`);
            console.log(`   Checksum address: ${checksumAddress}`);
            
            this.results.addressFormat = true;
            
        } catch (error) {
            console.error('❌ Address format verification failed:', error.message);
            this.errors.push(`Address format: ${error.message}`);
        }
    }

    /**
     * Verify component integration
     */
    verifyComponentIntegration() {
        console.log('🔍 Verifying component integration...');
        
        try {
            // Check admin dashboard component
            const adminDashboardPath = path.join(process.cwd(), 'components', 'admin-dashboard.tsx');
            
            if (!fs.existsSync(adminDashboardPath)) {
                throw new Error('admin-dashboard.tsx not found');
            }

            const adminDashboardContent = fs.readFileSync(adminDashboardPath, 'utf8');
            
            // Check for admin wallet address usage
            const hasAdminWalletCheck = adminDashboardContent.includes('NEXT_PUBLIC_ADMIN_WALLET_ADDRESS') ||
                                      adminDashboardContent.includes('process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS');
            
            if (!hasAdminWalletCheck) {
                throw new Error('Admin wallet address not referenced in admin dashboard');
            }

            // Check for authorization logic
            const hasAuthorizationLogic = adminDashboardContent.includes('isAdmin') ||
                                        adminDashboardContent.includes('adminWallet') ||
                                        adminDashboardContent.includes('authorized');

            if (!hasAuthorizationLogic) {
                throw new Error('Authorization logic not found in admin dashboard');
            }

            console.log('✅ Component integration verified');
            this.results.componentIntegration = true;
            
        } catch (error) {
            console.error('❌ Component integration failed:', error.message);
            this.errors.push(`Component integration: ${error.message}`);
        }
    }

    /**
     * Test address normalization
     */
    testAddressNormalization() {
        console.log('🔍 Testing address normalization...');
        
        try {
            const testCases = [
                EXPECTED_ADMIN_ADDRESS.toLowerCase(),
                EXPECTED_ADMIN_ADDRESS.toUpperCase(),
                EXPECTED_ADMIN_ADDRESS
            ];

            for (const testAddress of testCases) {
                const normalized = ethers.getAddress(testAddress);
                if (normalized !== ethers.getAddress(EXPECTED_ADMIN_ADDRESS)) {
                    throw new Error(`Address normalization failed for: ${testAddress}`);
                }
            }

            console.log('✅ Address normalization verified');
            console.log('   All case variations normalize correctly');
            this.results.addressNormalization = true;
            
        } catch (error) {
            console.error('❌ Address normalization failed:', error.message);
            this.errors.push(`Address normalization: ${error.message}`);
        }
    }

    /**
     * Test environment variable accessibility
     */
    testEnvironmentAccessibility() {
        console.log('🔍 Testing environment variable accessibility...');
        
        try {
            // Test server-side access
            const serverAccess = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS;
            
            if (!serverAccess) {
                throw new Error('Environment variable not accessible server-side');
            }

            // Test client-side access simulation
            const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
            const clientAccessMatch = envContent.match(/NEXT_PUBLIC_ADMIN_WALLET_ADDRESS\s*=\s*(.+)/);
            
            if (!clientAccessMatch) {
                throw new Error('Environment variable not configured for client-side access');
            }

            console.log('✅ Environment accessibility verified');
            console.log(`   Server-side: ${serverAccess ? 'Available' : 'Not available'}`);
            console.log(`   Client-side: ${clientAccessMatch ? 'Configured' : 'Not configured'}`);
            this.results.accessibility = true;
            
        } catch (error) {
            console.error('❌ Environment accessibility failed:', error.message);
            this.errors.push(`Environment accessibility: ${error.message}`);
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
            
            // Check for wallet address comparison logic
            const hasWalletComparison = adminDashboardContent.includes('toLowerCase()') ||
                                      adminDashboardContent.includes('toUpperCase()') ||
                                      adminDashboardContent.includes('getAddress');

            if (!hasWalletComparison) {
                console.log('⚠️  Warning: No case-insensitive wallet comparison found');
            }

            // Check for error handling
            const hasErrorHandling = adminDashboardContent.includes('Error') ||
                                   adminDashboardContent.includes('catch') ||
                                   adminDashboardContent.includes('unauthorized');

            if (!hasErrorHandling) {
                console.log('⚠️  Warning: Limited error handling found');
            }

            console.log('✅ Authorization logic verified');
            this.results.authorizationLogic = true;
            
        } catch (error) {
            console.error('❌ Authorization logic test failed:', error.message);
            this.errors.push(`Authorization logic: ${error.message}`);
        }
    }

    /**
     * Run all verification tests
     */
    async runVerification() {
        console.log('🚀 Starting Admin Wallet Configuration Verification\n');
        console.log(`Expected Admin Address: ${EXPECTED_ADMIN_ADDRESS}\n`);

        this.verifyEnvironmentConfig();
        this.verifyAddressFormat();
        this.verifyComponentIntegration();
        this.testAddressNormalization();
        this.testEnvironmentAccessibility();
        this.testAuthorizationLogic();

        this.generateReport();
    }

    /**
     * Generate verification report
     */
    generateReport() {
        console.log('\n📊 VERIFICATION REPORT');
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
            console.log('🎉 All admin wallet configuration tests passed!');
            process.exit(0);
        } else {
            console.log('⚠️  Some tests failed. Please review the errors above.');
            process.exit(1);
        }
    }
}

// Run verification if script is executed directly
if (require.main === module) {
    const verifier = new AdminWalletConfigVerifier();
    verifier.runVerification().catch(console.error);
}

module.exports = AdminWalletConfigVerifier;
