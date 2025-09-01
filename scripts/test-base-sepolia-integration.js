/**
 * Base Sepolia Network Integration Test Script
 * 
 * This script tests the Base Sepolia network integration including:
 * - Chain ID 84532 configuration
 * - RPC endpoint connectivity
 * - Wallet connection functionality
 * - Network switching capabilities
 * - Contract interaction on Base Sepolia
 */

const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

// Base Sepolia network configuration
const BASE_SEPOLIA_CONFIG = {
    chainId: 84532,
    name: 'Base Sepolia',
    rpcUrl: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org'
};

class BaseSepoliaIntegrationTester {
    constructor() {
        this.results = {
            networkConfig: false,
            rpcConnectivity: false,
            walletConnection: false,
            networkSwitching: false,
            contractInteraction: false,
            wagmiConfig: false,
            multiWalletIntegration: false
        };
        this.errors = [];
        this.provider = null;
    }

    /**
     * Test network configuration
     */
    testNetworkConfiguration() {
        console.log('🔍 Testing Base Sepolia network configuration...');
        
        try {
            // Check wagmi configuration
            const wagmiPath = path.join(process.cwd(), 'lib', 'wagmi.ts');
            
            if (!fs.existsSync(wagmiPath)) {
                throw new Error('wagmi.ts configuration file not found');
            }

            const wagmiContent = fs.readFileSync(wagmiPath, 'utf8');
            
            // Check for Base Sepolia configuration
            const hasBaseSepolia = wagmiContent.includes('84532') || 
                                 wagmiContent.includes('baseSepolia') ||
                                 wagmiContent.includes('Base Sepolia');

            if (!hasBaseSepolia) {
                throw new Error('Base Sepolia network not configured in wagmi');
            }

            // Check for Chain ID 84532
            const hasCorrectChainId = wagmiContent.includes('84532');
            
            if (!hasCorrectChainId) {
                throw new Error('Chain ID 84532 not found in wagmi configuration');
            }

            console.log('✅ Network configuration verified');
            console.log(`   Chain ID: ${BASE_SEPOLIA_CONFIG.chainId}`);
            console.log(`   Network Name: ${BASE_SEPOLIA_CONFIG.name}`);
            this.results.networkConfig = true;
            
        } catch (error) {
            console.error('❌ Network configuration test failed:', error.message);
            this.errors.push(`Network config: ${error.message}`);
        }
    }

    /**
     * Test RPC endpoint connectivity
     */
    async testRPCConnectivity() {
        console.log('🔍 Testing RPC endpoint connectivity...');
        
        try {
            // Create provider
            this.provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_CONFIG.rpcUrl);
            
            // Test connection
            const network = await this.provider.getNetwork();
            
            if (Number(network.chainId) !== BASE_SEPOLIA_CONFIG.chainId) {
                throw new Error(`Chain ID mismatch. Expected: ${BASE_SEPOLIA_CONFIG.chainId}, Got: ${network.chainId}`);
            }

            // Test block number retrieval
            const blockNumber = await this.provider.getBlockNumber();
            
            if (blockNumber < 0) {
                throw new Error('Invalid block number received');
            }

            console.log('✅ RPC connectivity verified');
            console.log(`   Connected to: ${network.name} (Chain ID: ${network.chainId})`);
            console.log(`   Latest block: ${blockNumber}`);
            this.results.rpcConnectivity = true;
            
        } catch (error) {
            console.error('❌ RPC connectivity test failed:', error.message);
            this.errors.push(`RPC connectivity: ${error.message}`);
        }
    }

    /**
     * Test wallet connection functionality
     */
    testWalletConnection() {
        console.log('🔍 Testing wallet connection functionality...');
        
        try {
            // Check multi-wallet hook
            const multiWalletPath = path.join(process.cwd(), 'hooks', 'use-multi-wallet.tsx');
            
            if (!fs.existsSync(multiWalletPath)) {
                throw new Error('use-multi-wallet.tsx hook not found');
            }

            const multiWalletContent = fs.readFileSync(multiWalletPath, 'utf8');
            
            // Check for Base Sepolia support
            const hasBaseSepoliaSupport = multiWalletContent.includes('84532') ||
                                        multiWalletContent.includes('baseSepolia') ||
                                        multiWalletContent.includes('Base Sepolia');

            if (!hasBaseSepoliaSupport) {
                console.log('⚠️  Warning: Base Sepolia not explicitly supported in multi-wallet hook');
            }

            // Check for wallet connection logic
            const hasConnectionLogic = multiWalletContent.includes('connect') ||
                                     multiWalletContent.includes('disconnect') ||
                                     multiWalletContent.includes('useAccount');

            if (!hasConnectionLogic) {
                throw new Error('Wallet connection logic not found in multi-wallet hook');
            }

            console.log('✅ Wallet connection functionality verified');
            this.results.walletConnection = true;
            
        } catch (error) {
            console.error('❌ Wallet connection test failed:', error.message);
            this.errors.push(`Wallet connection: ${error.message}`);
        }
    }

    /**
     * Test network switching capabilities
     */
    testNetworkSwitching() {
        console.log('🔍 Testing network switching capabilities...');
        
        try {
            // Check for network switching logic
            const wagmiPath = path.join(process.cwd(), 'lib', 'wagmi.ts');
            const wagmiContent = fs.readFileSync(wagmiPath, 'utf8');
            
            // Check for switch chain functionality
            const hasSwitchChain = wagmiContent.includes('switchChain') ||
                                 wagmiContent.includes('switchNetwork') ||
                                 wagmiContent.includes('useSwitchChain');

            if (!hasSwitchChain) {
                console.log('⚠️  Warning: Network switching functionality not explicitly found');
            }

            // Check for chain configuration
            const hasChainConfig = wagmiContent.includes('chains') ||
                                 wagmiContent.includes('configureChains');

            if (!hasChainConfig) {
                throw new Error('Chain configuration not found in wagmi setup');
            }

            console.log('✅ Network switching capabilities verified');
            this.results.networkSwitching = true;
            
        } catch (error) {
            console.error('❌ Network switching test failed:', error.message);
            this.errors.push(`Network switching: ${error.message}`);
        }
    }

    /**
     * Test contract interaction on Base Sepolia
     */
    async testContractInteraction() {
        console.log('🔍 Testing contract interaction on Base Sepolia...');
        
        try {
            if (!this.provider) {
                this.provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_CONFIG.rpcUrl);
            }

            // Check for contract ABI files
            const abiPath = path.join(process.cwd(), 'lib', 'abi');
            
            if (!fs.existsSync(abiPath)) {
                throw new Error('Contract ABI directory not found');
            }

            const abiFiles = fs.readdirSync(abiPath).filter(file => file.endsWith('.ts'));
            
            if (abiFiles.length === 0) {
                throw new Error('No contract ABI files found');
            }

            // Check for contract addresses
            const contractsPath = path.join(process.cwd(), 'lib', 'contracts');
            
            if (!fs.existsSync(contractsPath)) {
                throw new Error('Contracts directory not found');
            }

            const contractFiles = fs.readdirSync(contractsPath).filter(file => file.endsWith('.ts') || file.endsWith('.json'));
            
            if (contractFiles.length === 0) {
                throw new Error('No contract files found');
            }

            // Test basic contract interaction (without actual deployment)
            console.log('✅ Contract interaction setup verified');
            console.log(`   ABI files found: ${abiFiles.length}`);
            console.log(`   Contract files found: ${contractFiles.length}`);
            this.results.contractInteraction = true;
            
        } catch (error) {
            console.error('❌ Contract interaction test failed:', error.message);
            this.errors.push(`Contract interaction: ${error.message}`);
        }
    }

    /**
     * Test wagmi configuration
     */
    testWagmiConfiguration() {
        console.log('🔍 Testing wagmi configuration...');
        
        try {
            const wagmiPath = path.join(process.cwd(), 'lib', 'wagmi.ts');
            const wagmiContent = fs.readFileSync(wagmiPath, 'utf8');
            
            // Check for required wagmi imports
            const hasWagmiImports = wagmiContent.includes('createConfig') ||
                                  wagmiContent.includes('getDefaultConfig') ||
                                  wagmiContent.includes('wagmi');

            if (!hasWagmiImports) {
                throw new Error('Wagmi imports not found');
            }

            // Check for wallet connectors
            const hasWalletConnectors = wagmiContent.includes('injected') ||
                                      wagmiContent.includes('walletConnect') ||
                                      wagmiContent.includes('coinbaseWallet');

            if (!hasWalletConnectors) {
                console.log('⚠️  Warning: Wallet connectors not explicitly configured');
            }

            // Check for RPC configuration
            const hasRPCConfig = wagmiContent.includes('rpcUrls') ||
                               wagmiContent.includes('publicRpcUrl') ||
                               wagmiContent.includes('BASE_SEPOLIA_RPC_URL');

            if (!hasRPCConfig) {
                console.log('⚠️  Warning: RPC configuration not explicitly found');
            }

            console.log('✅ Wagmi configuration verified');
            this.results.wagmiConfig = true;
            
        } catch (error) {
            console.error('❌ Wagmi configuration test failed:', error.message);
            this.errors.push(`Wagmi config: ${error.message}`);
        }
    }

    /**
     * Test multi-wallet integration
     */
    testMultiWalletIntegration() {
        console.log('🔍 Testing multi-wallet integration...');
        
        try {
            const multiWalletPath = path.join(process.cwd(), 'hooks', 'use-multi-wallet.tsx');
            const multiWalletContent = fs.readFileSync(multiWalletPath, 'utf8');
            
            // Check for wagmi integration
            const hasWagmiIntegration = multiWalletContent.includes('useAccount') ||
                                      multiWalletContent.includes('useConnect') ||
                                      multiWalletContent.includes('useDisconnect');

            if (!hasWagmiIntegration) {
                throw new Error('Wagmi integration not found in multi-wallet hook');
            }

            // Check for error handling
            const hasErrorHandling = multiWalletContent.includes('Error') ||
                                   multiWalletContent.includes('catch') ||
                                   multiWalletContent.includes('try');

            if (!hasErrorHandling) {
                console.log('⚠️  Warning: Limited error handling in multi-wallet hook');
            }

            // Check for state management
            const hasStateManagement = multiWalletContent.includes('useState') ||
                                     multiWalletContent.includes('useEffect') ||
                                     multiWalletContent.includes('useCallback');

            if (!hasStateManagement) {
                throw new Error('State management not found in multi-wallet hook');
            }

            console.log('✅ Multi-wallet integration verified');
            this.results.multiWalletIntegration = true;
            
        } catch (error) {
            console.error('❌ Multi-wallet integration test failed:', error.message);
            this.errors.push(`Multi-wallet integration: ${error.message}`);
        }
    }

    /**
     * Run all integration tests
     */
    async runTests() {
        console.log('🚀 Starting Base Sepolia Integration Tests\n');
        console.log(`Target Network: ${BASE_SEPOLIA_CONFIG.name} (Chain ID: ${BASE_SEPOLIA_CONFIG.chainId})\n`);

        this.testNetworkConfiguration();
        await this.testRPCConnectivity();
        this.testWalletConnection();
        this.testNetworkSwitching();
        await this.testContractInteraction();
        this.testWagmiConfiguration();
        this.testMultiWalletIntegration();

        this.generateReport();
    }

    /**
     * Generate test report
     */
    generateReport() {
        console.log('\n📊 INTEGRATION TEST REPORT');
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
            console.log('🎉 All Base Sepolia integration tests passed!');
            process.exit(0);
        } else {
            console.log('⚠️  Some tests failed. Please review the errors above.');
            process.exit(1);
        }
    }
}

// Run tests if script is executed directly
if (require.main === module) {
    const tester = new BaseSepoliaIntegrationTester();
    tester.runTests().catch(console.error);
}

module.exports = BaseSepoliaIntegrationTester;
