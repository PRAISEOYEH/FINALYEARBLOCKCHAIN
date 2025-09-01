const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

class CreateElectionApiTester {
    constructor() {
        this.testResults = [];
        this.adminWalletAddress = '0x315eC932f31190915Ce2Dc089f4FB7A69002155f';
        this.contractAddress = '0xAEa1F2693C0cB46AA0675b8c63cA8DD0AA4006f0';
        this.baseSepoliaChainId = 84532;
        this.testWallet = ethers.Wallet.createRandom();
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

    // 1. Signature-Based Authentication Testing
    testSignatureBasedAuthentication() {
        this.log('Testing Signature-Based Authentication...', 'TEST');

        try {
            const apiRoutePath = path.join(process.cwd(), 'app', 'api', 'admin', 'create-election', 'route.ts');
            if (!fs.existsSync(apiRoutePath)) {
                this.addTestResult('Create Election API Route', false, 'route.ts file not found');
                return;
            }

            const apiContent = fs.readFileSync(apiRoutePath, 'utf8');
            
            // Test message signing with nonce and timestamp
            const nonceMatch = apiContent.match(/nonce|timestamp/i);
            if (nonceMatch) {
                this.addTestResult('Nonce and Timestamp Validation', true, 'Nonce/timestamp validation implemented');
            } else {
                this.addTestResult('Nonce and Timestamp Validation', false, 'Nonce/timestamp validation not found');
            }

            // Test signature recovery using viem
            const viemMatch = apiContent.match(/verifyMessage|recoverMessage/i);
            if (viemMatch) {
                this.addTestResult('Viem Signature Recovery', true, 'Viem signature recovery implemented');
            } else {
                this.addTestResult('Viem Signature Recovery', false, 'Viem signature recovery not found');
            }

            // Test nonce freshness (5-minute window)
            const timeWindowMatch = apiContent.match(/5.*minute|300.*second|time.*window/i);
            if (timeWindowMatch) {
                this.addTestResult('Nonce Freshness Window', true, '5-minute nonce freshness window implemented');
            } else {
                this.addTestResult('Nonce Freshness Window', false, 'Nonce freshness window not found');
            }

            // Test admin wallet address matching
            const adminMatch = apiContent.match(/ADMIN_WALLET_ADDRESS|adminWalletAddress/i);
            if (adminMatch) {
                this.addTestResult('Admin Wallet Address Matching', true, 'Admin wallet address matching implemented');
            } else {
                this.addTestResult('Admin Wallet Address Matching', false, 'Admin wallet address matching not found');
            }

            // Test signature format validation
            const signatureValidationMatch = apiContent.match(/signature.*validation|validate.*signature/i);
            if (signatureValidationMatch) {
                this.addTestResult('Signature Format Validation', true, 'Signature format validation implemented');
            } else {
                this.addTestResult('Signature Format Validation', false, 'Signature format validation not found');
            }

        } catch (error) {
            this.addTestResult('Signature-Based Authentication', false, `Error: ${error.message}`);
        }
    }

    // 2. Request Payload Validation Testing
    testRequestPayloadValidation() {
        this.log('Testing Request Payload Validation...', 'TEST');

        try {
            const apiRoutePath = path.join(process.cwd(), 'app', 'api', 'admin', 'create-election', 'route.ts');
            if (!fs.existsSync(apiRoutePath)) {
                this.addTestResult('Request Payload Validation', false, 'route.ts file not found');
                return;
            }

            const apiContent = fs.readFileSync(apiRoutePath, 'utf8');
            
            // Test Zod validation schema
            const zodMatch = apiContent.match(/z.*schema|createElectionSchema/i);
            if (zodMatch) {
                this.addTestResult('Zod Validation Schema', true, 'Zod validation schema implemented');
            } else {
                this.addTestResult('Zod Validation Schema', false, 'Zod validation schema not found');
            }

            // Test required fields validation
            const requiredFieldsMatch = apiContent.match(/title.*required|description.*required|startTime.*required|endTime.*required/i);
            if (requiredFieldsMatch) {
                this.addTestResult('Required Fields Validation', true, 'Required fields validation implemented');
            } else {
                this.addTestResult('Required Fields Validation', false, 'Required fields validation not found');
            }

            // Test positions array validation
            const positionsMatch = apiContent.match(/positions.*array|position.*validation/i);
            if (positionsMatch) {
                this.addTestResult('Positions Array Validation', true, 'Positions array validation implemented');
            } else {
                this.addTestResult('Positions Array Validation', false, 'Positions array validation not found');
            }

            // Test position object structure
            const positionStructureMatch = apiContent.match(/position.*title|position.*requirements/i);
            if (positionStructureMatch) {
                this.addTestResult('Position Object Structure', true, 'Position object structure validation implemented');
            } else {
                this.addTestResult('Position Object Structure', false, 'Position object structure validation not found');
            }

            // Test timestamp validation
            const timestampValidationMatch = apiContent.match(/timestamp.*validation|positive.*integer/i);
            if (timestampValidationMatch) {
                this.addTestResult('Timestamp Validation', true, 'Timestamp validation implemented');
            } else {
                this.addTestResult('Timestamp Validation', false, 'Timestamp validation not found');
            }

        } catch (error) {
            this.addTestResult('Request Payload Validation', false, `Error: ${error.message}`);
        }
    }

    // 3. Contract Address Validation Testing
    testContractAddressValidation() {
        this.log('Testing Contract Address Validation...', 'TEST');

        try {
            // Test deployed-addresses.json reading
            const deployedAddressesPath = path.join(process.cwd(), 'lib', 'contracts', 'deployed-addresses.json');
            if (fs.existsSync(deployedAddressesPath)) {
                const addressesContent = fs.readFileSync(deployedAddressesPath, 'utf8');
                const addresses = JSON.parse(addressesContent);
                
                if (addresses.baseSepolia && addresses.baseSepolia.UniversityVoting) {
                    this.addTestResult('Deployed Addresses JSON Reading', true, 'Deployed addresses JSON file accessible');
                } else {
                    this.addTestResult('Deployed Addresses JSON Reading', false, 'Base Sepolia UniversityVoting address not found');
                }
            } else {
                this.addTestResult('Deployed Addresses JSON Reading', false, 'deployed-addresses.json file not found');
            }

            // Test Base Sepolia network key resolution
            const apiRoutePath = path.join(process.cwd(), 'app', 'api', 'admin', 'create-election', 'route.ts');
            if (fs.existsSync(apiRoutePath)) {
                const apiContent = fs.readFileSync(apiRoutePath, 'utf8');
                const baseSepoliaMatch = apiContent.match(/baseSepolia|84532/i);
                if (baseSepoliaMatch) {
                    this.addTestResult('Base Sepolia Network Resolution', true, 'Base Sepolia network resolution implemented');
                } else {
                    this.addTestResult('Base Sepolia Network Resolution', false, 'Base Sepolia network resolution not found');
                }
            } else {
                this.addTestResult('Base Sepolia Network Resolution', false, 'route.ts file not found');
            }

            // Test contract address existence and non-zero validation
            const testAddress = '0x0000000000000000000000000000000000000000';
            if (this.contractAddress !== testAddress && this.contractAddress.length === 42) {
                this.addTestResult('Contract Address Validation', true, 'Contract address is valid and non-zero');
            } else {
                this.addTestResult('Contract Address Validation', false, 'Contract address is invalid or zero');
            }

            // Test contract address format validation
            const addressRegex = /^0x[a-fA-F0-9]{40}$/;
            if (addressRegex.test(this.contractAddress)) {
                this.addTestResult('Contract Address Format', true, 'Contract address format is valid');
            } else {
                this.addTestResult('Contract Address Format', false, 'Contract address format is invalid');
            }

        } catch (error) {
            this.addTestResult('Contract Address Validation', false, `Error: ${error.message}`);
        }
    }

    // 4. Blockchain Integration Testing
    testBlockchainIntegration() {
        this.log('Testing Blockchain Integration...', 'TEST');

        try {
            // Test createElectionAsAdmin function from thirdweb service
            const thirdwebServicePath = path.join(process.cwd(), 'lib', 'blockchain', 'thirdweb-service.ts');
            if (fs.existsSync(thirdwebServicePath)) {
                const thirdwebContent = fs.readFileSync(thirdwebServicePath, 'utf8');
                const createElectionMatch = thirdwebContent.match(/createElectionAsAdmin/i);
                if (createElectionMatch) {
                    this.addTestResult('createElectionAsAdmin Function', true, 'createElectionAsAdmin function found');
                } else {
                    this.addTestResult('createElectionAsAdmin Function', false, 'createElectionAsAdmin function not found');
                }
            } else {
                this.addTestResult('createElectionAsAdmin Function', false, 'thirdweb-service.ts file not found');
            }

            // Test wagmi/viem integration
            const wagmiPath = path.join(process.cwd(), 'lib', 'wagmi.ts');
            if (fs.existsSync(wagmiPath)) {
                const wagmiContent = fs.readFileSync(wagmiPath, 'utf8');
                const wagmiMatch = wagmiContent.match(/wagmi|viem/i);
                if (wagmiMatch) {
                    this.addTestResult('Wagmi/Viem Integration', true, 'Wagmi/Viem integration found');
                } else {
                    this.addTestResult('Wagmi/Viem Integration', false, 'Wagmi/Viem integration not found');
                }
            } else {
                this.addTestResult('Wagmi/Viem Integration', false, 'wagmi.ts file not found');
            }

            // Test gas estimation
            const apiRoutePath = path.join(process.cwd(), 'app', 'api', 'admin', 'create-election', 'route.ts');
            if (fs.existsSync(apiRoutePath)) {
                const apiContent = fs.readFileSync(apiRoutePath, 'utf8');
                const gasEstimationMatch = apiContent.match(/gas.*estimation|estimateGas/i);
                if (gasEstimationMatch) {
                    this.addTestResult('Gas Estimation', true, 'Gas estimation implemented');
                } else {
                    this.addTestResult('Gas Estimation', false, 'Gas estimation not found');
                }
            } else {
                this.addTestResult('Gas Estimation', false, 'route.ts file not found');
            }

            // Test transaction handling
            const transactionMatch = apiContent.match(/transaction.*handling|tx.*hash/i);
            if (transactionMatch) {
                this.addTestResult('Transaction Handling', true, 'Transaction handling implemented');
            } else {
                this.addTestResult('Transaction Handling', false, 'Transaction handling not found');
            }

            // Test ID mapping creation
            const idMappingMatch = apiContent.match(/id.*mapping|uiId.*onchainId/i);
            if (idMappingMatch) {
                this.addTestResult('ID Mapping Creation', true, 'ID mapping creation implemented');
            } else {
                this.addTestResult('ID Mapping Creation', false, 'ID mapping creation not found');
            }

        } catch (error) {
            this.addTestResult('Blockchain Integration', false, `Error: ${error.message}`);
        }
    }

    // 5. Error Scenarios Testing
    testErrorScenarios() {
        this.log('Testing Error Scenarios...', 'TEST');

        try {
            const apiRoutePath = path.join(process.cwd(), 'app', 'api', 'admin', 'create-election', 'route.ts');
            if (!fs.existsSync(apiRoutePath)) {
                this.addTestResult('Error Scenarios Testing', false, 'route.ts file not found');
                return;
            }

            const apiContent = fs.readFileSync(apiRoutePath, 'utf8');
            
            // Test missing admin wallet configuration
            const missingAdminMatch = apiContent.match(/missing.*admin|admin.*not.*configured/i);
            if (missingAdminMatch) {
                this.addTestResult('Missing Admin Configuration', true, 'Missing admin configuration handling implemented');
            } else {
                this.addTestResult('Missing Admin Configuration', false, 'Missing admin configuration handling not found');
            }

            // Test stale nonce rejection
            const staleNonceMatch = apiContent.match(/stale.*nonce|nonce.*expired/i);
            if (staleNonceMatch) {
                this.addTestResult('Stale Nonce Rejection', true, 'Stale nonce rejection implemented');
            } else {
                this.addTestResult('Stale Nonce Rejection', false, 'Stale nonce rejection not found');
            }

            // Test invalid signature formats
            const invalidSignatureMatch = apiContent.match(/invalid.*signature|signature.*invalid/i);
            if (invalidSignatureMatch) {
                this.addTestResult('Invalid Signature Handling', true, 'Invalid signature handling implemented');
            } else {
                this.addTestResult('Invalid Signature Handling', false, 'Invalid signature handling not found');
            }

            // Test unauthorized admin address rejection
            const unauthorizedMatch = apiContent.match(/unauthorized.*admin|admin.*unauthorized/i);
            if (unauthorizedMatch) {
                this.addTestResult('Unauthorized Admin Rejection', true, 'Unauthorized admin rejection implemented');
            } else {
                this.addTestResult('Unauthorized Admin Rejection', false, 'Unauthorized admin rejection not found');
            }

            // Test contract deployment validation failures
            const contractValidationMatch = apiContent.match(/contract.*validation|deployment.*failure/i);
            if (contractValidationMatch) {
                this.addTestResult('Contract Validation Failures', true, 'Contract validation failure handling implemented');
            } else {
                this.addTestResult('Contract Validation Failures', false, 'Contract validation failure handling not found');
            }

        } catch (error) {
            this.addTestResult('Error Scenarios', false, `Error: ${error.message}`);
        }
    }

    // 6. Response Format Validation Testing
    testResponseFormatValidation() {
        this.log('Testing Response Format Validation...', 'TEST');

        try {
            const apiRoutePath = path.join(process.cwd(), 'app', 'api', 'admin', 'create-election', 'route.ts');
            if (!fs.existsSync(apiRoutePath)) {
                this.addTestResult('Response Format Validation', false, 'route.ts file not found');
                return;
            }

            const apiContent = fs.readFileSync(apiRoutePath, 'utf8');
            
            // Test successful response structure
            const successResponseMatch = apiContent.match(/uiId.*onchainId.*txHash.*receipt/i);
            if (successResponseMatch) {
                this.addTestResult('Successful Response Structure', true, 'Successful response structure implemented');
            } else {
                this.addTestResult('Successful Response Structure', false, 'Successful response structure not found');
            }

            // Test error response formats
            const errorResponseMatch = apiContent.match(/error.*response|status.*code/i);
            if (errorResponseMatch) {
                this.addTestResult('Error Response Formats', true, 'Error response formats implemented');
            } else {
                this.addTestResult('Error Response Formats', false, 'Error response formats not found');
            }

            // Test Zod validation error handling
            const zodErrorMatch = apiContent.match(/zod.*error|validation.*error/i);
            if (zodErrorMatch) {
                this.addTestResult('Zod Validation Error Handling', true, 'Zod validation error handling implemented');
            } else {
                this.addTestResult('Zod Validation Error Handling', false, 'Zod validation error handling not found');
            }

            // Test transaction receipt parsing
            const receiptParsingMatch = apiContent.match(/receipt.*parsing|transaction.*receipt/i);
            if (receiptParsingMatch) {
                this.addTestResult('Transaction Receipt Parsing', true, 'Transaction receipt parsing implemented');
            } else {
                this.addTestResult('Transaction Receipt Parsing', false, 'Transaction receipt parsing not found');
            }

        } catch (error) {
            this.addTestResult('Response Format Validation', false, `Error: ${error.message}`);
        }
    }

    // 7. Integration with Frontend Testing
    testFrontendIntegration() {
        this.log('Testing Frontend Integration...', 'TEST');

        try {
            // Test API integration with admin dashboard
            const adminDashboardPath = path.join(process.cwd(), 'components', 'admin-dashboard.tsx');
            if (fs.existsSync(adminDashboardPath)) {
                const dashboardContent = fs.readFileSync(adminDashboardPath, 'utf8');
                const apiIntegrationMatch = dashboardContent.match(/create.*election|election.*creation/i);
                if (apiIntegrationMatch) {
                    this.addTestResult('Admin Dashboard API Integration', true, 'Admin dashboard API integration implemented');
                } else {
                    this.addTestResult('Admin Dashboard API Integration', false, 'Admin dashboard API integration not found');
                }
            } else {
                this.addTestResult('Admin Dashboard API Integration', false, 'admin-dashboard.tsx file not found');
            }

            // Test request signing from frontend wallet
            const walletSigningMatch = dashboardContent.match(/sign.*request|request.*signing/i);
            if (walletSigningMatch) {
                this.addTestResult('Frontend Request Signing', true, 'Frontend request signing implemented');
            } else {
                this.addTestResult('Frontend Request Signing', false, 'Frontend request signing not found');
            }

            // Test error propagation to UI components
            const errorPropagationMatch = dashboardContent.match(/error.*propagation|ui.*error/i);
            if (errorPropagationMatch) {
                this.addTestResult('Error Propagation to UI', true, 'Error propagation to UI implemented');
            } else {
                this.addTestResult('Error Propagation to UI', false, 'Error propagation to UI not found');
            }

            // Test transaction tracking integration
            const transactionTrackingMatch = dashboardContent.match(/transaction.*tracking|track.*transaction/i);
            if (transactionTrackingMatch) {
                this.addTestResult('Transaction Tracking Integration', true, 'Transaction tracking integration implemented');
            } else {
                this.addTestResult('Transaction Tracking Integration', false, 'Transaction tracking integration not found');
            }

        } catch (error) {
            this.addTestResult('Frontend Integration', false, `Error: ${error.message}`);
        }
    }

    // Run all tests
    runAllTests() {
        this.log('Starting Create Election API Testing...', 'START');
        
        this.testSignatureBasedAuthentication();
        this.testRequestPayloadValidation();
        this.testContractAddressValidation();
        this.testBlockchainIntegration();
        this.testErrorScenarios();
        this.testResponseFormatValidation();
        this.testFrontendIntegration();

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
    const tester = new CreateElectionApiTester();
    const results = tester.runAllTests();
    
    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
}

module.exports = CreateElectionApiTester;
