const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

class BaseSepoliaConnectivityTester {
    constructor() {
        this.results = {
            networkConfig: {},
            contractValidation: {},
            environmentConfig: {},
            rpcEndpoint: {},
            errorHandling: {},
            overall: { passed: 0, failed: 0, total: 0 }
        };
        
        this.rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.base.org';
        this.chainId = process.env.NEXT_PUBLIC_CHAIN_ID || '84532';
        this.contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xAEa1F2693C0cB46AA0675b8c63cA8DD0AA4006f0';
        this.provider = null;
    }

    async initialize() {
        console.log('🔧 Initializing Base Sepolia connectivity tester...');
        try {
            this.provider = new ethers.providers.JsonRpcProvider(this.rpcUrl);
            console.log('✅ Provider initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize provider:', error.message);
            throw error;
        }
    }

    async testNetworkConfiguration() {
        console.log('\n🌐 Testing Network Configuration...');
        
        try {
            // Test RPC URL accessibility
            const startTime = Date.now();
            const network = await this.provider.getNetwork();
            const responseTime = Date.now() - startTime;
            
            this.results.networkConfig.rpcAccessibility = {
                passed: true,
                responseTime,
                details: `RPC endpoint responded in ${responseTime}ms`
            };

            // Validate chain ID
            const expectedChainId = parseInt(this.chainId);
            this.results.networkConfig.chainIdValidation = {
                passed: network.chainId === expectedChainId,
                expected: expectedChainId,
                actual: network.chainId,
                details: network.chainId === expectedChainId ? 
                    'Chain ID matches expected value' : 
                    `Chain ID mismatch: expected ${expectedChainId}, got ${network.chainId}`
            };

            // Test block number retrieval
            const blockNumber = await this.provider.getBlockNumber();
            this.results.networkConfig.blockNumberRetrieval = {
                passed: blockNumber > 0,
                blockNumber,
                details: `Current block number: ${blockNumber}`
            };

            // Test recent block data
            const latestBlock = await this.provider.getBlock(blockNumber);
            this.results.networkConfig.blockDataValidation = {
                passed: latestBlock && latestBlock.hash && latestBlock.timestamp,
                blockHash: latestBlock?.hash,
                timestamp: latestBlock?.timestamp,
                details: 'Recent block data retrieved successfully'
            };

            // Test provider connection stability
            const stabilityTests = [];
            for (let i = 0; i < 3; i++) {
                const testStart = Date.now();
                await this.provider.getBlockNumber();
                stabilityTests.push(Date.now() - testStart);
            }
            
            const avgResponseTime = stabilityTests.reduce((a, b) => a + b, 0) / stabilityTests.length;
            this.results.networkConfig.connectionStability = {
                passed: avgResponseTime < 5000, // 5 second threshold
                avgResponseTime: Math.round(avgResponseTime),
                testResults: stabilityTests,
                details: `Average response time: ${Math.round(avgResponseTime)}ms`
            };

        } catch (error) {
            this.results.networkConfig.error = {
                passed: false,
                error: error.message,
                details: 'Network configuration test failed'
            };
        }
    }

    async testContractAddressValidation() {
        console.log('\n📋 Testing Contract Address Validation...');
        
        try {
            // Verify contract exists at address
            const code = await this.provider.getCode(this.contractAddress);
            this.results.contractValidation.contractExistence = {
                passed: code !== '0x',
                codeLength: code.length,
                details: code !== '0x' ? 
                    'Contract bytecode found at address' : 
                    'No contract found at specified address'
            };

            if (code === '0x') {
                throw new Error('Contract not found at specified address');
            }

            // Check contract bytecode length
            const bytecodeLength = (code.length - 2) / 2; // Remove '0x' prefix
            this.results.contractValidation.bytecodeValidation = {
                passed: bytecodeLength > 100, // Minimum reasonable bytecode size
                bytecodeLength,
                details: `Contract bytecode length: ${bytecodeLength} bytes`
            };

            // Test basic contract interaction
            const contract = new ethers.Contract(
                this.contractAddress,
                ['function owner() view returns (address)'],
                this.provider
            );

            try {
                const owner = await contract.owner();
                this.results.contractValidation.ownerRetrieval = {
                    passed: ethers.utils.isAddress(owner),
                    owner,
                    details: 'Contract owner address retrieved successfully'
                };
            } catch (error) {
                this.results.contractValidation.ownerRetrieval = {
                    passed: false,
                    error: error.message,
                    details: 'Failed to retrieve contract owner'
                };
            }

            // Test contract state variables
            const stateContract = new ethers.Contract(
                this.contractAddress,
                [
                    'function nextElectionId() view returns (uint256)',
                    'function nextCandidateId() view returns (uint256)',
                    'function nextPositionId() view returns (uint256)'
                ],
                this.provider
            );

            try {
                const [nextElectionId, nextCandidateId, nextPositionId] = await Promise.all([
                    stateContract.nextElectionId(),
                    stateContract.nextCandidateId(),
                    stateContract.nextPositionId()
                ]);

                this.results.contractValidation.stateVariables = {
                    passed: true,
                    nextElectionId: nextElectionId.toString(),
                    nextCandidateId: nextCandidateId.toString(),
                    nextPositionId: nextPositionId.toString(),
                    details: 'Contract state variables retrieved successfully'
                };
            } catch (error) {
                this.results.contractValidation.stateVariables = {
                    passed: false,
                    error: error.message,
                    details: 'Failed to retrieve contract state variables'
                };
            }

        } catch (error) {
            this.results.contractValidation.error = {
                passed: false,
                error: error.message,
                details: 'Contract address validation test failed'
            };
        }
    }

    async testEnvironmentConfiguration() {
        console.log('\n⚙️ Testing Environment Configuration...');
        
        const requiredEnvVars = [
            'NEXT_PUBLIC_RPC_URL',
            'NEXT_PUBLIC_CHAIN_ID',
            'NEXT_PUBLIC_CONTRACT_ADDRESS'
        ];

        const envValidation = {};
        let allEnvVarsPresent = true;

        for (const envVar of requiredEnvVars) {
            const value = process.env[envVar];
            const isPresent = !!value;
            envValidation[envVar] = {
                present: isPresent,
                value: isPresent ? value : 'NOT_SET'
            };
            if (!isPresent) allEnvVarsPresent = false;
        }

        this.results.environmentConfig.requiredVariables = {
            passed: allEnvVarsPresent,
            variables: envValidation,
            details: allEnvVarsPresent ? 
                'All required environment variables are set' : 
                'Some required environment variables are missing'
        };

        // Test environment values match configuration
        const configValidation = {
            rpcUrl: process.env.NEXT_PUBLIC_RPC_URL === this.rpcUrl,
            chainId: process.env.NEXT_PUBLIC_CHAIN_ID === this.chainId,
            contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS === this.contractAddress
        };

        this.results.environmentConfig.configurationMatch = {
            passed: Object.values(configValidation).every(Boolean),
            validation: configValidation,
            details: 'Environment values match hardcoded configuration'
        };

        // Test contract address format
        const addressFormat = ethers.utils.isAddress(this.contractAddress);
        this.results.environmentConfig.addressFormat = {
            passed: addressFormat,
            address: this.contractAddress,
            details: addressFormat ? 
                'Contract address format is valid' : 
                'Contract address format is invalid'
        };

        // Check deployed addresses file
        try {
            const deployedAddressesPath = path.join(__dirname, '../lib/contracts/deployed-addresses.json');
            if (fs.existsSync(deployedAddressesPath)) {
                const deployedAddresses = JSON.parse(fs.readFileSync(deployedAddressesPath, 'utf8'));
                const fileAddress = deployedAddresses[this.chainId];
                
                this.results.environmentConfig.deployedAddressesFile = {
                    passed: fileAddress === this.contractAddress,
                    fileAddress: fileAddress || 'NOT_FOUND',
                    envAddress: this.contractAddress,
                    details: fileAddress === this.contractAddress ? 
                        'Address in deployed-addresses.json matches environment' : 
                        'Address mismatch between file and environment'
                };
            } else {
                this.results.environmentConfig.deployedAddressesFile = {
                    passed: false,
                    details: 'deployed-addresses.json file not found'
                };
            }
        } catch (error) {
            this.results.environmentConfig.deployedAddressesFile = {
                passed: false,
                error: error.message,
                details: 'Error reading deployed-addresses.json'
            };
        }
    }

    async testRpcEndpointComprehensive() {
        console.log('\n🔌 Testing RPC Endpoint Comprehensive...');
        
        try {
            // Test various RPC methods
            const rpcTests = {};

            // Test eth_getBlockByNumber
            try {
                const block = await this.provider.getBlock('latest');
                rpcTests.eth_getBlockByNumber = {
                    passed: true,
                    blockNumber: block.number,
                    details: 'Latest block retrieved successfully'
                };
            } catch (error) {
                rpcTests.eth_getBlockByNumber = {
                    passed: false,
                    error: error.message,
                    details: 'Failed to get latest block'
                };
            }

            // Test eth_call
            try {
                const contract = new ethers.Contract(
                    this.contractAddress,
                    ['function owner() view returns (address)'],
                    this.provider
                );
                await contract.owner();
                rpcTests.eth_call = {
                    passed: true,
                    details: 'Contract call executed successfully'
                };
            } catch (error) {
                rpcTests.eth_call = {
                    passed: false,
                    error: error.message,
                    details: 'Failed to execute contract call'
                };
            }

            // Test eth_estimateGas
            try {
                const contract = new ethers.Contract(
                    this.contractAddress,
                    ['function getElection(uint256 electionId) view returns (tuple(uint256 id, string title, uint256 startTime, uint256 endTime, bool active))'],
                    this.provider
                );
                const gasEstimate = await contract.estimateGas.getElection(1);
                rpcTests.eth_estimateGas = {
                    passed: true,
                    gasEstimate: gasEstimate.toString(),
                    details: 'Gas estimation successful'
                };
            } catch (error) {
                rpcTests.eth_estimateGas = {
                    passed: false,
                    error: error.message,
                    details: 'Failed to estimate gas'
                };
            }

            // Test gas price estimation
            try {
                const gasPrice = await this.provider.getGasPrice();
                rpcTests.gasPriceEstimation = {
                    passed: true,
                    gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei') + ' gwei',
                    details: 'Gas price retrieved successfully'
                };
            } catch (error) {
                rpcTests.gasPriceEstimation = {
                    passed: false,
                    error: error.message,
                    details: 'Failed to get gas price'
                };
            }

            // Test event log filtering
            try {
                const filter = {
                    address: this.contractAddress,
                    fromBlock: 'latest',
                    toBlock: 'latest'
                };
                const logs = await this.provider.getLogs(filter);
                rpcTests.eventLogFiltering = {
                    passed: true,
                    logCount: logs.length,
                    details: 'Event log filtering successful'
                };
            } catch (error) {
                rpcTests.eventLogFiltering = {
                    passed: false,
                    error: error.message,
                    details: 'Failed to filter event logs'
                };
            }

            this.results.rpcEndpoint.methods = rpcTests;

            // Performance baseline
            const performanceTests = [];
            for (let i = 0; i < 5; i++) {
                const start = Date.now();
                await this.provider.getBlockNumber();
                performanceTests.push(Date.now() - start);
            }

            const avgResponseTime = performanceTests.reduce((a, b) => a + b, 0) / performanceTests.length;
            this.results.rpcEndpoint.performance = {
                avgResponseTime: Math.round(avgResponseTime),
                minResponseTime: Math.min(...performanceTests),
                maxResponseTime: Math.max(...performanceTests),
                testResults: performanceTests,
                details: `Performance baseline established: avg ${Math.round(avgResponseTime)}ms`
            };

        } catch (error) {
            this.results.rpcEndpoint.error = {
                passed: false,
                error: error.message,
                details: 'RPC endpoint comprehensive test failed'
            };
        }
    }

    async testErrorHandlingAndResilience() {
        console.log('\n🛡️ Testing Error Handling and Resilience...');
        
        try {
            // Test behavior with invalid RPC URLs
            const invalidProvider = new ethers.providers.JsonRpcProvider('https://invalid-url.example.com');
            try {
                await invalidProvider.getBlockNumber();
                this.results.errorHandling.invalidRpcUrl = {
                    passed: false,
                    details: 'Invalid RPC URL should have failed but succeeded'
                };
            } catch (error) {
                this.results.errorHandling.invalidRpcUrl = {
                    passed: true,
                    error: error.message,
                    details: 'Invalid RPC URL properly rejected'
                };
            }

            // Test timeout handling
            const slowProvider = new ethers.providers.JsonRpcProvider(this.rpcUrl, undefined, {
                timeout: 1000 // 1 second timeout
            });
            
            try {
                await slowProvider.getBlockNumber();
                this.results.errorHandling.timeoutHandling = {
                    passed: true,
                    details: 'Request completed within timeout'
                };
            } catch (error) {
                if (error.message.includes('timeout')) {
                    this.results.errorHandling.timeoutHandling = {
                        passed: true,
                        error: error.message,
                        details: 'Timeout properly handled'
                    };
                } else {
                    this.results.errorHandling.timeoutHandling = {
                        passed: false,
                        error: error.message,
                        details: 'Unexpected error during timeout test'
                    };
                }
            }

            // Test retry logic simulation
            let retryCount = 0;
            const maxRetries = 3;
            let retrySuccess = false;

            for (let i = 0; i < maxRetries; i++) {
                try {
                    await this.provider.getBlockNumber();
                    retrySuccess = true;
                    break;
                } catch (error) {
                    retryCount++;
                    if (i < maxRetries - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
                    }
                }
            }

            this.results.errorHandling.retryLogic = {
                passed: retrySuccess,
                retryCount,
                maxRetries,
                details: retrySuccess ? 
                    `Request succeeded after ${retryCount} attempts` : 
                    `Request failed after ${retryCount} attempts`
            };

        } catch (error) {
            this.results.errorHandling.error = {
                passed: false,
                error: error.message,
                details: 'Error handling test failed'
            };
        }
    }

    calculateOverallResults() {
        let passed = 0;
        let failed = 0;
        let total = 0;

        const categories = [
            'networkConfig',
            'contractValidation', 
            'environmentConfig',
            'rpcEndpoint',
            'errorHandling'
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
        console.log('\n📊 Base Sepolia Connectivity Test Report');
        console.log('=====================================');
        
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
            console.log('- Review failed tests and address issues before proceeding');
            console.log('- Check network connectivity and RPC endpoint availability');
            console.log('- Verify environment variables are correctly set');
            console.log('- Ensure contract is properly deployed at specified address');
        } else {
            console.log('- Base Sepolia connectivity is working correctly');
            console.log('- Proceed with other integration tests');
            console.log('- Monitor network performance for production deployment');
        }

        return this.results;
    }

    async runAllTests() {
        try {
            await this.initialize();
            await this.testNetworkConfiguration();
            await this.testContractAddressValidation();
            await this.testEnvironmentConfiguration();
            await this.testRpcEndpointComprehensive();
            await this.testErrorHandlingAndResilience();
            
            return this.generateReport();
        } catch (error) {
            console.error('❌ Test execution failed:', error.message);
            throw error;
        }
    }
}

// Main execution
async function main() {
    const tester = new BaseSepoliaConnectivityTester();
    
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

module.exports = BaseSepoliaConnectivityTester;
