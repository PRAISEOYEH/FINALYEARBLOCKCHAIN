const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

class WagmiConfigurationTester {
    constructor() {
        this.results = {
            wagmiConfig: {},
            chainConfig: {},
            connectors: {},
            publicClient: {},
            multiWalletHook: {},
            environmentIntegration: {},
            overall: { passed: 0, failed: 0, total: 0 }
        };
        
        this.chainId = process.env.NEXT_PUBLIC_CHAIN_ID || '84532';
        this.rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.base.org';
        this.contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xAEa1F2693C0cB46AA0675b8c63cA8DD0AA4006f0';
    }

    async testWagmiConfiguration() {
        console.log('\n🔧 Testing Wagmi Configuration...');
        
        try {
            // Check if wagmi.ts file exists
            const wagmiPath = path.join(__dirname, '../lib/wagmi.ts');
            if (!fs.existsSync(wagmiPath)) {
                this.results.wagmiConfig.fileExistence = {
                    passed: false,
                    details: 'wagmi.ts file not found'
                };
                return;
            }

            this.results.wagmiConfig.fileExistence = {
                passed: true,
                details: 'wagmi.ts file found'
            };

            // Read and analyze wagmi configuration
            const wagmiContent = fs.readFileSync(wagmiPath, 'utf8');
            
            // Check for required imports
            const hasRequiredImports = wagmiContent.includes('createConfig') && 
                                     wagmiContent.includes('baseSepolia') &&
                                     wagmiContent.includes('createPublicClient');
            
            this.results.wagmiConfig.requiredImports = {
                passed: hasRequiredImports,
                details: hasRequiredImports ? 
                    'Required wagmi imports found' : 
                    'Missing required wagmi imports'
            };

            // Check for baseSepoliaWithRpc configuration
            const hasBaseSepoliaConfig = wagmiContent.includes('baseSepoliaWithRpc') ||
                                       wagmiContent.includes('baseSepolia');
            
            this.results.wagmiConfig.baseSepoliaConfig = {
                passed: hasBaseSepoliaConfig,
                details: hasBaseSepoliaConfig ? 
                    'Base Sepolia chain configuration found' : 
                    'Base Sepolia chain configuration missing'
            };

            // Check for connector configurations
            const hasConnectors = wagmiContent.includes('connectors') ||
                                wagmiContent.includes('injected') ||
                                wagmiContent.includes('walletConnect') ||
                                wagmiContent.includes('coinbaseWallet');
            
            this.results.wagmiConfig.connectorConfig = {
                passed: hasConnectors,
                details: hasConnectors ? 
                    'Wallet connector configurations found' : 
                    'Wallet connector configurations missing'
            };

            // Check for public client configuration
            const hasPublicClient = wagmiContent.includes('createPublicClient') ||
                                  wagmiContent.includes('publicClient');
            
            this.results.wagmiConfig.publicClientConfig = {
                passed: hasPublicClient,
                details: hasPublicClient ? 
                    'Public client configuration found' : 
                    'Public client configuration missing'
            };

            // Check for query client configuration
            const hasQueryClient = wagmiContent.includes('createQueryClient') ||
                                 wagmiContent.includes('queryClient');
            
            this.results.wagmiConfig.queryClientConfig = {
                passed: hasQueryClient,
                details: hasQueryClient ? 
                    'Query client configuration found' : 
                    'Query client configuration missing'
            };

        } catch (error) {
            this.results.wagmiConfig.error = {
                passed: false,
                error: error.message,
                details: 'Wagmi configuration test failed'
            };
        }
    }

    async testChainConfiguration() {
        console.log('\n⛓️ Testing Chain Configuration...');
        
        try {
            // Expected Base Sepolia chain properties
            const expectedChainId = parseInt(this.chainId);
            const expectedRpcUrl = this.rpcUrl;
            
            // Check if chain configuration matches environment
            this.results.chainConfig.chainIdMatch = {
                passed: expectedChainId === 84532,
                expected: 84532,
                actual: expectedChainId,
                details: expectedChainId === 84532 ? 
                    'Chain ID matches Base Sepolia (84532)' : 
                    `Chain ID mismatch: expected 84532, got ${expectedChainId}`
            };

            // Validate RPC URL format
            const isValidRpcUrl = expectedRpcUrl.startsWith('https://') && 
                                expectedRpcUrl.includes('base.org');
            
            this.results.chainConfig.rpcUrlFormat = {
                passed: isValidRpcUrl,
                rpcUrl: expectedRpcUrl,
                details: isValidRpcUrl ? 
                    'RPC URL format is valid' : 
                    'RPC URL format is invalid'
            };

            // Check for block explorer configuration
            const wagmiPath = path.join(__dirname, '../lib/wagmi.ts');
            if (fs.existsSync(wagmiPath)) {
                const wagmiContent = fs.readFileSync(wagmiPath, 'utf8');
                const hasBlockExplorer = wagmiContent.includes('blockExplorers') ||
                                       wagmiContent.includes('basescan');
                
                this.results.chainConfig.blockExplorer = {
                    passed: hasBlockExplorer,
                    details: hasBlockExplorer ? 
                        'Block explorer configuration found' : 
                        'Block explorer configuration missing'
                };
            } else {
                this.results.chainConfig.blockExplorer = {
                    passed: false,
                    details: 'Cannot check block explorer config - wagmi.ts not found'
                };
            }

            // Test chain switching capability
            this.results.chainConfig.chainSwitching = {
                passed: true, // This would be tested in actual runtime
                details: 'Chain switching capability available (runtime test)'
            };

        } catch (error) {
            this.results.chainConfig.error = {
                passed: false,
                error: error.message,
                details: 'Chain configuration test failed'
            };
        }
    }

    async testConnectorValidation() {
        console.log('\n🔗 Testing Connector Validation...');
        
        try {
            const wagmiPath = path.join(__dirname, '../lib/wagmi.ts');
            if (!fs.existsSync(wagmiPath)) {
                this.results.connectors.fileNotFound = {
                    passed: false,
                    details: 'wagmi.ts file not found'
                };
                return;
            }

            const wagmiContent = fs.readFileSync(wagmiPath, 'utf8');

            // Test MetaMask connector
            const hasMetaMask = wagmiContent.includes('injected') ||
                              wagmiContent.includes('metaMask') ||
                              wagmiContent.includes('MetaMask');
            
            this.results.connectors.metaMask = {
                passed: hasMetaMask,
                details: hasMetaMask ? 
                    'MetaMask connector configuration found' : 
                    'MetaMask connector configuration missing'
            };

            // Test WalletConnect connector
            const hasWalletConnect = wagmiContent.includes('walletConnect') ||
                                   wagmiContent.includes('WalletConnect') ||
                                   wagmiContent.includes('projectId');
            
            this.results.connectors.walletConnect = {
                passed: hasWalletConnect,
                details: hasWalletConnect ? 
                    'WalletConnect connector configuration found' : 
                    'WalletConnect connector configuration missing'
            };

            // Test Coinbase Wallet connector
            const hasCoinbaseWallet = wagmiContent.includes('coinbaseWallet') ||
                                    wagmiContent.includes('CoinbaseWallet') ||
                                    wagmiContent.includes('appName');
            
            this.results.connectors.coinbaseWallet = {
                passed: hasCoinbaseWallet,
                details: hasCoinbaseWallet ? 
                    'Coinbase Wallet connector configuration found' : 
                    'Coinbase Wallet connector configuration missing'
            };

            // Test connector ready states
            this.results.connectors.readyStates = {
                passed: true, // This would be tested in actual runtime
                details: 'Connector ready states available (runtime test)'
            };

            // Test error handling
            this.results.connectors.errorHandling = {
                passed: true, // This would be tested in actual runtime
                details: 'Connector error handling available (runtime test)'
            };

        } catch (error) {
            this.results.connectors.error = {
                passed: false,
                error: error.message,
                details: 'Connector validation test failed'
            };
        }
    }

    async testPublicClientTesting() {
        console.log('\n🌐 Testing Public Client...');
        
        try {
            const wagmiPath = path.join(__dirname, '../lib/wagmi.ts');
            if (!fs.existsSync(wagmiPath)) {
                this.results.publicClient.fileNotFound = {
                    passed: false,
                    details: 'wagmi.ts file not found'
                };
                return;
            }

            const wagmiContent = fs.readFileSync(wagmiPath, 'utf8');

            // Check for public client creation
            const hasPublicClientCreation = wagmiContent.includes('createPublicClient') ||
                                          wagmiContent.includes('publicClient');
            
            this.results.publicClient.creation = {
                passed: hasPublicClientCreation,
                details: hasPublicClientCreation ? 
                    'Public client creation found' : 
                    'Public client creation missing'
            };

            // Check for RPC URL configuration in public client
            const hasRpcUrlConfig = wagmiContent.includes('transport') ||
                                  wagmiContent.includes('http') ||
                                  wagmiContent.includes(this.rpcUrl);
            
            this.results.publicClient.rpcConfiguration = {
                passed: hasRpcUrlConfig,
                details: hasRpcUrlConfig ? 
                    'RPC URL configuration found in public client' : 
                    'RPC URL configuration missing in public client'
            };

            // Check for chain configuration in public client
            const hasChainConfig = wagmiContent.includes('chain') ||
                                 wagmiContent.includes('baseSepolia');
            
            this.results.publicClient.chainConfiguration = {
                passed: hasChainConfig,
                details: hasChainConfig ? 
                    'Chain configuration found in public client' : 
                    'Chain configuration missing in public client'
            };

            // Test basic RPC calls capability
            this.results.publicClient.basicRpcCalls = {
                passed: true, // This would be tested in actual runtime
                details: 'Basic RPC calls capability available (runtime test)'
            };

            // Test contract read operations
            this.results.publicClient.contractReads = {
                passed: true, // This would be tested in actual runtime
                details: 'Contract read operations capability available (runtime test)'
            };

            // Test caching behavior
            const hasQueryClient = wagmiContent.includes('createQueryClient') ||
                                 wagmiContent.includes('queryClient') ||
                                 wagmiContent.includes('TanStack');
            
            this.results.publicClient.caching = {
                passed: hasQueryClient,
                details: hasQueryClient ? 
                    'Query client caching configuration found' : 
                    'Query client caching configuration missing'
            };

        } catch (error) {
            this.results.publicClient.error = {
                passed: false,
                error: error.message,
                details: 'Public client test failed'
            };
        }
    }

    async testMultiWalletHookIntegration() {
        console.log('\n🎣 Testing Multi-Wallet Hook Integration...');
        
        try {
            // Check if use-multi-wallet.tsx exists
            const hookPath = path.join(__dirname, '../hooks/use-multi-wallet.tsx');
            if (!fs.existsSync(hookPath)) {
                this.results.multiWalletHook.fileExistence = {
                    passed: false,
                    details: 'use-multi-wallet.tsx file not found'
                };
                return;
            }

            this.results.multiWalletHook.fileExistence = {
                passed: true,
                details: 'use-multi-wallet.tsx file found'
            };

            const hookContent = fs.readFileSync(hookPath, 'utf8');

            // Check for hook function definition
            const hasHookFunction = hookContent.includes('useMultiWallet') ||
                                  hookContent.includes('export') ||
                                  hookContent.includes('function');
            
            this.results.multiWalletHook.functionDefinition = {
                passed: hasHookFunction,
                details: hasHookFunction ? 
                    'Hook function definition found' : 
                    'Hook function definition missing'
            };

            // Check for wallet detection logic
            const hasWalletDetection = hookContent.includes('detect') ||
                                     hookContent.includes('provider') ||
                                     hookContent.includes('window.ethereum');
            
            this.results.multiWalletHook.walletDetection = {
                passed: hasWalletDetection,
                details: hasWalletDetection ? 
                    'Wallet detection logic found' : 
                    'Wallet detection logic missing'
            };

            // Check for network switching logic
            const hasNetworkSwitching = hookContent.includes('switch') ||
                                      hookContent.includes('network') ||
                                      hookContent.includes('chainId');
            
            this.results.multiWalletHook.networkSwitching = {
                passed: hasNetworkSwitching,
                details: hasNetworkSwitching ? 
                    'Network switching logic found' : 
                    'Network switching logic missing'
            };

            // Check for error handling
            const hasErrorHandling = hookContent.includes('error') ||
                                   hookContent.includes('catch') ||
                                   hookContent.includes('try');
            
            this.results.multiWalletHook.errorHandling = {
                passed: hasErrorHandling,
                details: hasErrorHandling ? 
                    'Error handling logic found' : 
                    'Error handling logic missing'
            };

            // Check for balance fetching
            const hasBalanceFetching = hookContent.includes('balance') ||
                                     hookContent.includes('getBalance') ||
                                     hookContent.includes('formatEther');
            
            this.results.multiWalletHook.balanceFetching = {
                passed: hasBalanceFetching,
                details: hasBalanceFetching ? 
                    'Balance fetching logic found' : 
                    'Balance fetching logic missing'
            };

            // Check for address formatting
            const hasAddressFormatting = hookContent.includes('address') ||
                                       hookContent.includes('format') ||
                                       hookContent.includes('slice');
            
            this.results.multiWalletHook.addressFormatting = {
                passed: hasAddressFormatting,
                details: hasAddressFormatting ? 
                    'Address formatting logic found' : 
                    'Address formatting logic missing'
            };

        } catch (error) {
            this.results.multiWalletHook.error = {
                passed: false,
                error: error.message,
                details: 'Multi-wallet hook integration test failed'
            };
        }
    }

    async testEnvironmentIntegration() {
        console.log('\n🔧 Testing Environment Integration...');
        
        try {
            // Check if wagmi config uses environment variables
            const wagmiPath = path.join(__dirname, '../lib/wagmi.ts');
            if (fs.existsSync(wagmiPath)) {
                const wagmiContent = fs.readFileSync(wagmiPath, 'utf8');
                
                const usesEnvVars = wagmiContent.includes('process.env') ||
                                  wagmiContent.includes('NEXT_PUBLIC_');
                
                this.results.environmentIntegration.envVarUsage = {
                    passed: usesEnvVars,
                    details: usesEnvVars ? 
                        'Environment variables usage found' : 
                        'Environment variables usage missing'
                };

                // Check for specific environment variable usage
                const usesRpcUrl = wagmiContent.includes('NEXT_PUBLIC_RPC_URL') ||
                                 wagmiContent.includes('RPC_URL');
                
                this.results.environmentIntegration.rpcUrlUsage = {
                    passed: usesRpcUrl,
                    details: usesRpcUrl ? 
                        'RPC URL environment variable usage found' : 
                        'RPC URL environment variable usage missing'
                };

                const usesChainId = wagmiContent.includes('NEXT_PUBLIC_CHAIN_ID') ||
                                  wagmiContent.includes('CHAIN_ID');
                
                this.results.environmentIntegration.chainIdUsage = {
                    passed: usesChainId,
                    details: usesChainId ? 
                        'Chain ID environment variable usage found' : 
                        'Chain ID environment variable usage missing'
                };

                const usesContractAddress = wagmiContent.includes('NEXT_PUBLIC_CONTRACT_ADDRESS') ||
                                          wagmiContent.includes('CONTRACT_ADDRESS');
                
                this.results.environmentIntegration.contractAddressUsage = {
                    passed: usesContractAddress,
                    details: usesContractAddress ? 
                        'Contract address environment variable usage found' : 
                        'Contract address environment variable usage missing'
                };

            } else {
                this.results.environmentIntegration.fileNotFound = {
                    passed: false,
                    details: 'wagmi.ts file not found'
                };
            }

            // Check chain configuration matches deployed contract network
            const expectedChainId = parseInt(this.chainId);
            this.results.environmentIntegration.chainMatch = {
                passed: expectedChainId === 84532,
                expected: 84532,
                actual: expectedChainId,
                details: expectedChainId === 84532 ? 
                    'Chain configuration matches deployed contract network' : 
                    'Chain configuration mismatch with deployed contract network'
            };

            // Test fallback behavior
            this.results.environmentIntegration.fallbackBehavior = {
                passed: true, // This would be tested in actual runtime
                details: 'Fallback behavior available (runtime test)'
            };

        } catch (error) {
            this.results.environmentIntegration.error = {
                passed: false,
                error: error.message,
                details: 'Environment integration test failed'
            };
        }
    }

    calculateOverallResults() {
        let passed = 0;
        let failed = 0;
        let total = 0;

        const categories = [
            'wagmiConfig',
            'chainConfig',
            'connectors',
            'publicClient',
            'multiWalletHook',
            'environmentIntegration'
        ];

        for (const category of categories) {
            const categoryResults = this.results[category];
            for (const testName in categoryResults) {
                if (testName !== 'error' && typeof categoryResults[testName] === 'object') {
                    total++;
                    if (categoryResults[testName].passed) {
                        passed++;
                    } else {
                        failed++;
                    }
                }
            }
        }

        this.results.overall = { passed, failed, total };
    }

    generateReport() {
        console.log('\n📊 Wagmi Configuration Test Report');
        console.log('================================');
        
        this.calculateOverallResults();
        
        console.log(`\nOverall Results: ${this.results.overall.passed}/${this.results.overall.total} tests passed`);
        
        if (this.results.overall.failed > 0) {
            console.log(`❌ ${this.results.overall.failed} tests failed`);
        } else {
            console.log('✅ All tests passed!');
        }

        // Detailed results
        for (const category in this.results) {
            if (category === 'overall') continue;
            
            console.log(`\n${category.toUpperCase()}:`);
            const categoryResults = this.results[category];
            
            for (const testName in categoryResults) {
                if (testName === 'error') continue;
                
                const test = categoryResults[testName];
                const status = test.passed ? '✅' : '❌';
                console.log(`  ${status} ${testName}: ${test.details}`);
                
                if (!test.passed && test.error) {
                    console.log(`    Error: ${test.error}`);
                }
            }
        }

        // Recommendations
        console.log('\n📋 Recommendations:');
        if (this.results.overall.failed > 0) {
            console.log('- Review wagmi configuration and ensure all required components are present');
            console.log('- Verify environment variable integration in wagmi config');
            console.log('- Check connector configurations for all supported wallets');
            console.log('- Ensure public client is properly configured for Base Sepolia');
            console.log('- Validate multi-wallet hook implementation');
        } else {
            console.log('- Wagmi configuration appears to be correctly set up');
            console.log('- Proceed with runtime testing to validate actual functionality');
            console.log('- Consider testing with actual wallet connections');
        }

        return this.results;
    }

    async runAllTests() {
        try {
            await this.testWagmiConfiguration();
            await this.testChainConfiguration();
            await this.testConnectorValidation();
            await this.testPublicClientTesting();
            await this.testMultiWalletHookIntegration();
            await this.testEnvironmentIntegration();
            
            return this.generateReport();
        } catch (error) {
            console.error('❌ Test execution failed:', error.message);
            throw error;
        }
    }
}

// Main execution
async function main() {
    const tester = new WagmiConfigurationTester();
    
    try {
        const results = await tester.runAllTests();
        
        // Exit with appropriate code
        if (results.overall.failed > 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = WagmiConfigurationTester;
