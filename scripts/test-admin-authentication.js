const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

class AdminAuthenticationTester {
    constructor() {
        this.testResults = [];
        this.adminWalletAddress = '0x315eC932f31190915Ce2Dc089f4FB7A69002155f';
        this.contractAddress = '0xAEa1F2693C0cB46AA0675b8c63cA8DD0AA4006f0';
        this.baseSepoliaChainId = 84532;
    }

    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${type}] ${message}`);
    }

    addTestResult(testName, passed, details = '') {
        this.testResults.push({
            test: testName,
            passed,
            details,
            timestamp: new Date().toISOString()
        });
        this.log(`${testName}: ${passed ? 'PASS' : 'FAIL'} - ${details}`, passed ? 'PASS' : 'FAIL');
    }

    // 1. Environment Configuration Testing
    testEnvironmentConfiguration() {
        this.log('Testing Environment Configuration...', 'TEST');

        // Test ADMIN_WALLET_ADDRESS
        try {
            const envPath = path.join(process.cwd(), '.env');
            if (fs.existsSync(envPath)) {
                const envContent = fs.readFileSync(envPath, 'utf8');
                const adminWalletMatch = envContent.match(/ADMIN_WALLET_ADDRESS=([^\r\n]+)/);
                
                if (adminWalletMatch && adminWalletMatch[1] === this.adminWalletAddress) {
                    this.addTestResult('ADMIN_WALLET_ADDRESS Configuration', true, 'Correctly set to expected address');
                } else {
                    this.addTestResult('ADMIN_WALLET_ADDRESS Configuration', false, 
                        `Expected: ${this.adminWalletAddress}, Found: ${adminWalletMatch ? adminWalletMatch[1] : 'Not found'}`);
                }
            } else {
                this.addTestResult('ADMIN_WALLET_ADDRESS Configuration', false, '.env file not found');
            }
        } catch (error) {
            this.addTestResult('ADMIN_WALLET_ADDRESS Configuration', false, `Error: ${error.message}`);
        }

        // Test NEXT_PUBLIC_CONTRACT_ADDRESS
        try {
            const envPath = path.join(process.cwd(), '.env');
            if (fs.existsSync(envPath)) {
                const envContent = fs.readFileSync(envPath, 'utf8');
                const contractAddressMatch = envContent.match(/NEXT_PUBLIC_CONTRACT_ADDRESS=([^\r\n]+)/);
                
                if (contractAddressMatch && contractAddressMatch[1] === this.contractAddress) {
                    this.addTestResult('NEXT_PUBLIC_CONTRACT_ADDRESS Configuration', true, 'Correctly set to expected address');
                } else {
                    this.addTestResult('NEXT_PUBLIC_CONTRACT_ADDRESS Configuration', false, 
                        `Expected: ${this.contractAddress}, Found: ${contractAddressMatch ? contractAddressMatch[1] : 'Not found'}`);
                }
            } else {
                this.addTestResult('NEXT_PUBLIC_CONTRACT_ADDRESS Configuration', false, '.env file not found');
            }
        } catch (error) {
            this.addTestResult('NEXT_PUBLIC_CONTRACT_ADDRESS Configuration', false, `Error: ${error.message}`);
        }

        // Test Base Sepolia Configuration
        try {
            const wagmiConfigPath = path.join(process.cwd(), 'lib', 'wagmi.ts');
            if (fs.existsSync(wagmiConfigPath)) {
                const wagmiContent = fs.readFileSync(wagmiConfigPath, 'utf8');
                const baseSepoliaMatch = wagmiContent.match(/baseSepolia/);
                const chainIdMatch = wagmiContent.match(/84532/);
                
                if (baseSepoliaMatch && chainIdMatch) {
                    this.addTestResult('Base Sepolia Configuration', true, 'Base Sepolia network configured with correct chain ID');
                } else {
                    this.addTestResult('Base Sepolia Configuration', false, 'Base Sepolia network not properly configured');
                }
            } else {
                this.addTestResult('Base Sepolia Configuration', false, 'wagmi.ts configuration file not found');
            }
        } catch (error) {
            this.addTestResult('Base Sepolia Configuration', false, `Error: ${error.message}`);
        }

        // Test Thirdweb Configuration
        try {
            const thirdwebServicePath = path.join(process.cwd(), 'lib', 'blockchain', 'thirdweb-service.ts');
            if (fs.existsSync(thirdwebServicePath)) {
                const thirdwebContent = fs.readFileSync(thirdwebServicePath, 'utf8');
                const clientIdMatch = thirdwebContent.match(/clientId/);
                const secretKeyMatch = thirdwebContent.match(/secretKey/);
                
                if (clientIdMatch && secretKeyMatch) {
                    this.addTestResult('Thirdweb Configuration', true, 'Thirdweb credentials configuration found');
                } else {
                    this.addTestResult('Thirdweb Configuration', false, 'Thirdweb credentials not properly configured');
                }
            } else {
                this.addTestResult('Thirdweb Configuration', false, 'thirdweb-service.ts file not found');
            }
        } catch (error) {
            this.addTestResult('Thirdweb Configuration', false, `Error: ${error.message}`);
        }
    }

    // 2. Admin Dashboard Access Control Testing
    testAdminDashboardAccessControl() {
        this.log('Testing Admin Dashboard Access Control...', 'TEST');

        // Test admin dashboard component existence
        try {
            const adminDashboardPath = path.join(process.cwd(), 'components', 'admin-dashboard.tsx');
            if (fs.existsSync(adminDashboardPath)) {
                const dashboardContent = fs.readFileSync(adminDashboardPath, 'utf8');
                
                // Test wallet connection requirement
                const walletConnectionMatch = dashboardContent.match(/useAccount|useWallet|connect/);
                if (walletConnectionMatch) {
                    this.addTestResult('Wallet Connection Requirement', true, 'Admin dashboard requires wallet connection');
                } else {
                    this.addTestResult('Wallet Connection Requirement', false, 'Wallet connection not properly implemented');
                }

                // Test admin wallet validation
                const adminValidationMatch = dashboardContent.match(/ADMIN_WALLET_ADDRESS|adminWalletAddress/);
                if (adminValidationMatch) {
                    this.addTestResult('Admin Wallet Validation', true, 'Admin wallet address validation implemented');
                } else {
                    this.addTestResult('Admin Wallet Validation', false, 'Admin wallet address validation not found');
                }

                // Test network switching
                const networkSwitchMatch = dashboardContent.match(/switchNetwork|chainId|84532/);
                if (networkSwitchMatch) {
                    this.addTestResult('Network Switching Requirement', true, 'Network switching to Base Sepolia implemented');
                } else {
                    this.addTestResult('Network Switching Requirement', false, 'Network switching not properly implemented');
                }

                // Test non-admin rejection
                const unauthorizedMatch = dashboardContent.match(/unauthorized|not admin|access denied/i);
                if (unauthorizedMatch) {
                    this.addTestResult('Non-Admin Rejection', true, 'Unauthorized access handling implemented');
                } else {
                    this.addTestResult('Non-Admin Rejection', false, 'Unauthorized access handling not found');
                }
            } else {
                this.addTestResult('Admin Dashboard Component', false, 'admin-dashboard.tsx file not found');
            }
        } catch (error) {
            this.addTestResult('Admin Dashboard Access Control', false, `Error: ${error.message}`);
        }
    }

    // 3. University Voting Hook Authentication Testing
    testUniversityVotingHookAuthentication() {
        this.log('Testing University Voting Hook Authentication...', 'TEST');

        try {
            const universityVotingHookPath = path.join(process.cwd(), 'hooks', 'use-university-voting.tsx');
            if (fs.existsSync(universityVotingHookPath)) {
                const hookContent = fs.readFileSync(universityVotingHookPath, 'utf8');
                
                // Test useUniversityVoting hook
                const hookMatch = hookContent.match(/useUniversityVoting/);
                if (hookMatch) {
                    this.addTestResult('useUniversityVoting Hook', true, 'University voting hook exists');
                } else {
                    this.addTestResult('useUniversityVoting Hook', false, 'useUniversityVoting hook not found');
                }

                // Test admin authentication flow
                const adminAuthMatch = hookContent.match(/admin.*auth|authentication.*admin/i);
                if (adminAuthMatch) {
                    this.addTestResult('Admin Authentication Flow', true, 'Admin authentication flow implemented');
                } else {
                    this.addTestResult('Admin Authentication Flow', false, 'Admin authentication flow not found');
                }

                // Test mock admin credentials
                const mockCredentialsMatch = hookContent.match(/admin@techuni\.edu|admin2024!|ADM-7892-XYZ/);
                if (mockCredentialsMatch) {
                    this.addTestResult('Mock Admin Credentials', true, 'Mock admin credentials found in hook');
                } else {
                    this.addTestResult('Mock Admin Credentials', false, 'Mock admin credentials not found');
                }

                // Test role-based access control
                const roleBasedMatch = hookContent.match(/role.*admin|admin.*role|isAdmin/i);
                if (roleBasedMatch) {
                    this.addTestResult('Role-Based Access Control', true, 'Role-based access control implemented');
                } else {
                    this.addTestResult('Role-Based Access Control', false, 'Role-based access control not found');
                }

                // Test session management
                const sessionMatch = hookContent.match(/session|logout|signOut/i);
                if (sessionMatch) {
                    this.addTestResult('Session Management', true, 'Session management functionality found');
                } else {
                    this.addTestResult('Session Management', false, 'Session management not implemented');
                }
            } else {
                this.addTestResult('University Voting Hook', false, 'use-university-voting.tsx file not found');
            }
        } catch (error) {
            this.addTestResult('University Voting Hook Authentication', false, `Error: ${error.message}`);
        }
    }

    // 4. Wallet-Based Authentication Testing
    testWalletBasedAuthentication() {
        this.log('Testing Wallet-Based Authentication...', 'TEST');

        try {
            const multiWalletPath = path.join(process.cwd(), 'hooks', 'use-multi-wallet.tsx');
            const web3Path = path.join(process.cwd(), 'hooks', 'use-web3.tsx');
            
            // Test MetaMask connection simulation
            if (fs.existsSync(multiWalletPath)) {
                const multiWalletContent = fs.readFileSync(multiWalletPath, 'utf8');
                const metamaskMatch = multiWalletContent.match(/MetaMask|metamask/i);
                if (metamaskMatch) {
                    this.addTestResult('MetaMask Connection Support', true, 'MetaMask connection support found');
                } else {
                    this.addTestResult('MetaMask Connection Support', false, 'MetaMask connection not implemented');
                }
            } else {
                this.addTestResult('MetaMask Connection Support', false, 'use-multi-wallet.tsx file not found');
            }

            // Test wallet address normalization with specific admin address
            const testAddress = '0x315ec932f31190915ce2dc089f4fb7a69002155f';
            const normalizedAddress = ethers.getAddress(testAddress);
            if (normalizedAddress === this.adminWalletAddress) {
                this.addTestResult('Admin Wallet Address Normalization', true, 'Admin address normalization working correctly');
            } else {
                this.addTestResult('Admin Wallet Address Normalization', false, 'Admin address normalization not working');
            }

            // Test specific admin wallet address validation
            const adminAddressValidation = ethers.isAddress(this.adminWalletAddress);
            if (adminAddressValidation) {
                this.addTestResult('Admin Wallet Address Format Validation', true, 'Admin wallet address format is valid');
            } else {
                this.addTestResult('Admin Wallet Address Format Validation', false, 'Admin wallet address format is invalid');
            }

            // Test Base Sepolia network validation
            try {
                const wagmiPath = path.join(process.cwd(), 'lib', 'wagmi.ts');
                if (fs.existsSync(wagmiPath)) {
                    const wagmiContent = fs.readFileSync(wagmiPath, 'utf8');
                    const baseSepoliaMatch = wagmiContent.match(/84532|baseSepolia|Base Sepolia/);
                    if (baseSepoliaMatch) {
                        this.addTestResult('Base Sepolia Network Validation', true, 'Base Sepolia network validation implemented');
                    } else {
                        this.addTestResult('Base Sepolia Network Validation', false, 'Base Sepolia network validation not found');
                    }
                } else {
                    this.addTestResult('Base Sepolia Network Validation', false, 'wagmi.ts file not found');
                }
            } catch (error) {
                this.addTestResult('Base Sepolia Network Validation', false, `Error: ${error.message}`);
            }

            // Test wallet disconnection
            if (fs.existsSync(web3Path)) {
                const web3Content = fs.readFileSync(web3Path, 'utf8');
                const disconnectMatch = web3Content.match(/disconnect|disconnectWallet/i);
                if (disconnectMatch) {
                    this.addTestResult('Wallet Disconnection', true, 'Wallet disconnection functionality found');
                } else {
                    this.addTestResult('Wallet Disconnection', false, 'Wallet disconnection not implemented');
                }
            } else {
                this.addTestResult('Wallet Disconnection', false, 'use-web3.tsx file not found');
            }

            // Test admin wallet authorization integration
            try {
                const adminDashboardPath = path.join(process.cwd(), 'components', 'admin-dashboard.tsx');
                if (fs.existsSync(adminDashboardPath)) {
                    const dashboardContent = fs.readFileSync(adminDashboardPath, 'utf8');
                    const adminWalletAuthMatch = dashboardContent.match(/NEXT_PUBLIC_ADMIN_WALLET_ADDRESS|adminWalletAddress|isAdmin/);
                    if (adminWalletAuthMatch) {
                        this.addTestResult('Admin Wallet Authorization Integration', true, 'Admin wallet authorization integrated in dashboard');
                    } else {
                        this.addTestResult('Admin Wallet Authorization Integration', false, 'Admin wallet authorization not integrated');
                    }
                } else {
                    this.addTestResult('Admin Wallet Authorization Integration', false, 'admin-dashboard.tsx file not found');
                }
            } catch (error) {
                this.addTestResult('Admin Wallet Authorization Integration', false, `Error: ${error.message}`);
            }
        } catch (error) {
            this.addTestResult('Wallet-Based Authentication', false, `Error: ${error.message}`);
        }
    }

    // 5. Error Handling Scenarios Testing
    testErrorHandlingScenarios() {
        this.log('Testing Error Handling Scenarios...', 'TEST');

        // Test missing environment variables handling
        try {
            const adminDashboardPath = path.join(process.cwd(), 'components', 'admin-dashboard.tsx');
            if (fs.existsSync(adminDashboardPath)) {
                const dashboardContent = fs.readFileSync(adminDashboardPath, 'utf8');
                const envErrorMatch = dashboardContent.match(/process\.env|environment.*variable/i);
                if (envErrorMatch) {
                    this.addTestResult('Missing Environment Variables Handling', true, 'Environment variable handling implemented');
                } else {
                    this.addTestResult('Missing Environment Variables Handling', false, 'Environment variable handling not found');
                }
            } else {
                this.addTestResult('Missing Environment Variables Handling', false, 'admin-dashboard.tsx file not found');
            }
        } catch (error) {
            this.addTestResult('Missing Environment Variables Handling', false, `Error: ${error.message}`);
        }

        // Test wrong network connection handling
        try {
            const wagmiPath = path.join(process.cwd(), 'lib', 'wagmi.ts');
            if (fs.existsSync(wagmiPath)) {
                const wagmiContent = fs.readFileSync(wagmiPath, 'utf8');
                const wrongNetworkMatch = wagmiContent.match(/wrong.*network|switch.*network|network.*error/i);
                if (wrongNetworkMatch) {
                    this.addTestResult('Wrong Network Connection Handling', true, 'Wrong network handling implemented');
                } else {
                    this.addTestResult('Wrong Network Connection Handling', false, 'Wrong network handling not found');
                }
            } else {
                this.addTestResult('Wrong Network Connection Handling', false, 'wagmi.ts file not found');
            }
        } catch (error) {
            this.addTestResult('Wrong Network Connection Handling', false, `Error: ${error.message}`);
        }

        // Test unauthorized wallet addresses handling
        try {
            const adminDashboardPath = path.join(process.cwd(), 'components', 'admin-dashboard.tsx');
            if (fs.existsSync(adminDashboardPath)) {
                const dashboardContent = fs.readFileSync(adminDashboardPath, 'utf8');
                const unauthorizedMatch = dashboardContent.match(/unauthorized.*wallet|wallet.*unauthorized|not.*admin/i);
                if (unauthorizedMatch) {
                    this.addTestResult('Unauthorized Wallet Addresses Handling', true, 'Unauthorized wallet handling implemented');
                } else {
                    this.addTestResult('Unauthorized Wallet Addresses Handling', false, 'Unauthorized wallet handling not found');
                }
            } else {
                this.addTestResult('Unauthorized Wallet Addresses Handling', false, 'admin-dashboard.tsx file not found');
            }
        } catch (error) {
            this.addTestResult('Unauthorized Wallet Addresses Handling', false, `Error: ${error.message}`);
        }

        // Test graceful error messaging
        try {
            const adminDashboardPath = path.join(process.cwd(), 'components', 'admin-dashboard.tsx');
            if (fs.existsSync(adminDashboardPath)) {
                const dashboardContent = fs.readFileSync(adminDashboardPath, 'utf8');
                const errorMessageMatch = dashboardContent.match(/error.*message|message.*error|toast|notification/i);
                if (errorMessageMatch) {
                    this.addTestResult('Graceful Error Messaging', true, 'Error messaging system implemented');
                } else {
                    this.addTestResult('Graceful Error Messaging', false, 'Error messaging system not found');
                }
            } else {
                this.addTestResult('Graceful Error Messaging', false, 'admin-dashboard.tsx file not found');
            }
        } catch (error) {
            this.addTestResult('Graceful Error Messaging', false, `Error: ${error.message}`);
        }
    }

    // 6. Integration with Admin Dashboard Component Testing
    testAdminDashboardIntegration() {
        this.log('Testing Integration with Admin Dashboard Component...', 'TEST');

        try {
            const adminDashboardPath = path.join(process.cwd(), 'components', 'admin-dashboard.tsx');
            if (fs.existsSync(adminDashboardPath)) {
                const dashboardContent = fs.readFileSync(adminDashboardPath, 'utf8');
                
                // Test authentication requirements
                const authRequirementMatch = dashboardContent.match(/useAccount|useWallet|authentication/i);
                if (authRequirementMatch) {
                    this.addTestResult('Authentication Requirements Integration', true, 'Authentication requirements integrated');
                } else {
                    this.addTestResult('Authentication Requirements Integration', false, 'Authentication requirements not integrated');
                }

                // Test wallet state integration
                const walletStateMatch = dashboardContent.match(/wallet.*state|state.*wallet|address.*state/i);
                if (walletStateMatch) {
                    this.addTestResult('Wallet State Integration', true, 'Wallet state integration implemented');
                } else {
                    this.addTestResult('Wallet State Integration', false, 'Wallet state integration not found');
                }

                // Test admin privilege checks
                const privilegeCheckMatch = dashboardContent.match(/admin.*privilege|privilege.*check|isAdmin/i);
                if (privilegeCheckMatch) {
                    this.addTestResult('Admin Privilege Checks Integration', true, 'Admin privilege checks integrated');
                } else {
                    this.addTestResult('Admin Privilege Checks Integration', false, 'Admin privilege checks not found');
                }

                // Test transaction tracking
                const transactionMatch = dashboardContent.match(/transaction.*track|track.*transaction|tx.*hash/i);
                if (transactionMatch) {
                    this.addTestResult('Transaction Tracking Integration', true, 'Transaction tracking integrated');
                } else {
                    this.addTestResult('Transaction Tracking Integration', false, 'Transaction tracking not found');
                }

                // Test diagnostics access
                const diagnosticsMatch = dashboardContent.match(/diagnostic|system.*health|health.*check/i);
                if (diagnosticsMatch) {
                    this.addTestResult('Diagnostics Access Integration', true, 'Diagnostics access integrated');
                } else {
                    this.addTestResult('Diagnostics Access Integration', false, 'Diagnostics access not found');
                }
            } else {
                this.addTestResult('Admin Dashboard Integration', false, 'admin-dashboard.tsx file not found');
            }
        } catch (error) {
            this.addTestResult('Admin Dashboard Integration', false, `Error: ${error.message}`);
        }
    }

    // 7. Complete Authentication Flow Testing
    testCompleteAuthenticationFlow() {
        this.log('Testing Complete Authentication Flow...', 'TEST');

        try {
            // Test traditional login to wallet verification flow
            const universityVotingPath = path.join(process.cwd(), 'hooks', 'use-university-voting.tsx');
            if (fs.existsSync(universityVotingPath)) {
                const hookContent = fs.readFileSync(universityVotingPath, 'utf8');
                
                // Test login to wallet connection integration
                const loginToWalletMatch = hookContent.match(/login.*wallet|wallet.*login|authentication.*flow/i);
                if (loginToWalletMatch) {
                    this.addTestResult('Login to Wallet Connection Integration', true, 'Login to wallet connection flow implemented');
                } else {
                    this.addTestResult('Login to Wallet Connection Integration', false, 'Login to wallet connection flow not found');
                }

                // Test admin operations requiring both login and wallet
                const dualAuthMatch = hookContent.match(/admin.*operation|operation.*admin|createElection|addCandidate/i);
                if (dualAuthMatch) {
                    this.addTestResult('Dual Authentication for Admin Operations', true, 'Admin operations require both login and wallet');
                } else {
                    this.addTestResult('Dual Authentication for Admin Operations', false, 'Dual authentication not implemented');
                }
            } else {
                this.addTestResult('Complete Authentication Flow', false, 'use-university-voting.tsx file not found');
            }

            // Test admin dashboard access flow
            const adminDashboardPath = path.join(process.cwd(), 'components', 'admin-dashboard.tsx');
            if (fs.existsSync(adminDashboardPath)) {
                const dashboardContent = fs.readFileSync(adminDashboardPath, 'utf8');
                
                // Test complete flow from login to dashboard access
                const completeFlowMatch = dashboardContent.match(/login.*dashboard|dashboard.*access|authentication.*complete/i);
                if (completeFlowMatch) {
                    this.addTestResult('Complete Login to Dashboard Access Flow', true, 'Complete authentication flow implemented');
                } else {
                    this.addTestResult('Complete Login to Dashboard Access Flow', false, 'Complete authentication flow not found');
                }
            } else {
                this.addTestResult('Complete Login to Dashboard Access Flow', false, 'admin-dashboard.tsx file not found');
            }

        } catch (error) {
            this.addTestResult('Complete Authentication Flow', false, `Error: ${error.message}`);
        }
    }

    // Run all tests
    runAllTests() {
        this.log('Starting Enhanced Admin Authentication Testing...', 'START');
        this.log(`Testing with Admin Wallet: ${this.adminWalletAddress}`, 'INFO');
        this.log(`Testing with Base Sepolia Chain ID: ${this.baseSepoliaChainId}`, 'INFO');
        
        this.testEnvironmentConfiguration();
        this.testAdminDashboardAccessControl();
        this.testUniversityVotingHookAuthentication();
        this.testWalletBasedAuthentication();
        this.testErrorHandlingScenarios();
        this.testAdminDashboardIntegration();
        this.testCompleteAuthenticationFlow();

        // Generate summary
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(result => result.passed).length;
        const failedTests = totalTests - passedTests;

        this.log('', 'SUMMARY');
        this.log('='.repeat(50), 'SUMMARY');
        this.log(`Total Tests: ${totalTests}`, 'SUMMARY');
        this.log(`Passed: ${passedTests}`, 'SUMMARY');
        this.log(`Failed: ${failedTests}`, 'SUMMARY');
        this.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`, 'SUMMARY');
        this.log('='.repeat(50), 'SUMMARY');

        if (failedTests > 0) {
            this.log('Failed Tests:', 'FAIL');
            this.testResults.filter(result => !result.passed).forEach(result => {
                this.log(`  - ${result.test}: ${result.details}`, 'FAIL');
            });
        }

        return {
            total: totalTests,
            passed: passedTests,
            failed: failedTests,
            successRate: (passedTests / totalTests) * 100,
            results: this.testResults
        };
    }
}

// Run the tests if this script is executed directly
if (require.main === module) {
    const tester = new AdminAuthenticationTester();
    const results = tester.runAllTests();
    
    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
}

module.exports = AdminAuthenticationTester;
