#!/usr/bin/env node

/**
 * University Voting System - Contract Integration Test Script
 * 
 * This script verifies the deployed UniversityVoting contract integration
 * and basic functionality on Base Sepolia network.
 * 
 * Usage: node scripts/test-contract-integration.js
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  CONTRACT_ADDRESS: '0xAEa1F2693C0cB46AA0675b8c63cA8DD0AA4006f0',
  NETWORK: {
    name: 'Base Sepolia',
    rpc: 'https://sepolia.base.org',
    chainId: 84532,
    explorer: 'https://sepolia.basescan.org'
  },
  TEST_DATA: {
    electionTitle: 'Test Election 2024',
    electionDescription: 'Test election for contract integration verification',
    positionTitle: 'Test Position',
    positionRequirements: 'Test requirements for position',
    candidateName: 'Test Candidate',
    candidateWallet: '0x742d35Cc6634C0532925a3b8D43C67B8c8B3E9C6'
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class ContractIntegrationTester {
  constructor() {
    this.provider = null;
    this.contract = null;
    this.abi = null;
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logTest(testName, status, details = '') {
    const statusColor = status === 'PASS' ? 'green' : 'red';
    const statusIcon = status === 'PASS' ? '✓' : '✗';
    
    this.log(`${statusIcon} ${testName}: ${status}`, statusColor);
    if (details) {
      this.log(`   ${details}`, 'cyan');
    }
    
    this.results.tests.push({ name: testName, status, details });
    if (status === 'PASS') {
      this.results.passed++;
    } else {
      this.results.failed++;
    }
  }

  async initialize() {
    this.log('🔧 Initializing Contract Integration Test...', 'blue');
    
    try {
      // Load ABI
      const abiPath = path.join(__dirname, '../lib/abi/UniversityVoting.ts');
      if (!fs.existsSync(abiPath)) {
        throw new Error('ABI file not found. Please run npm run generate-abi first.');
      }
      
      // Parse ABI from TypeScript file
      const abiContent = fs.readFileSync(abiPath, 'utf8');
      const abiMatch = abiContent.match(/export const UniversityVotingABI = (\[.*?\])/s);
      if (!abiMatch) {
        throw new Error('Could not parse ABI from TypeScript file');
      }
      
      this.abi = JSON.parse(abiMatch[1]);
      
      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.rpc);
      
      // Initialize contract
      this.contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, this.abi, this.provider);
      
      this.log('✅ Initialization completed successfully', 'green');
      return true;
    } catch (error) {
      this.log(`❌ Initialization failed: ${error.message}`, 'red');
      return false;
    }
  }

  async testContractDeployment() {
    this.log('\n📋 Testing Contract Deployment...', 'blue');
    
    try {
      // Test 1: Contract exists at address
      const code = await this.provider.getCode(CONFIG.CONTRACT_ADDRESS);
      if (code === '0x') {
        throw new Error('No contract deployed at specified address');
      }
      this.logTest('Contract Deployment', 'PASS', 'Contract exists at address');
      
      // Test 2: Contract owner
      const owner = await this.contract.owner();
      this.logTest('Contract Owner', 'PASS', `Owner: ${owner}`);
      
      // Test 3: Basic contract state
      const nextElectionId = await this.contract.nextElectionId();
      const nextCandidateId = await this.contract.nextCandidateId();
      const nextPositionId = await this.contract.nextPositionId();
      
      this.logTest('Contract State', 'PASS', 
        `Next IDs - Election: ${nextElectionId}, Candidate: ${nextCandidateId}, Position: ${nextPositionId}`);
      
      return true;
    } catch (error) {
      this.logTest('Contract Deployment', 'FAIL', error.message);
      return false;
    }
  }

  async testReadFunctions() {
    this.log('\n📖 Testing Read Functions...', 'blue');
    
    try {
      // Test view functions
      const functions = [
        { name: 'nextElectionId', call: () => this.contract.nextElectionId() },
        { name: 'nextCandidateId', call: () => this.contract.nextCandidateId() },
        { name: 'nextPositionId', call: () => this.contract.nextPositionId() },
        { name: 'owner', call: () => this.contract.owner() }
      ];
      
      for (const func of functions) {
        try {
          const result = await func.call();
          this.logTest(`${func.name}()`, 'PASS', `Returns: ${result}`);
        } catch (error) {
          this.logTest(`${func.name}()`, 'FAIL', error.message);
        }
      }
      
      return true;
    } catch (error) {
      this.logTest('Read Functions', 'FAIL', error.message);
      return false;
    }
  }

  async testAdminFunctionAccess() {
    this.log('\n🔐 Testing Admin Function Access...', 'blue');
    
    try {
      // Test admin-only function signatures
      const adminFunctions = [
        'createElection',
        'addCandidate',
        'verifyCandidate',
        'whitelistVoter'
      ];
      
      for (const funcName of adminFunctions) {
        try {
          const func = this.contract.interface.getFunction(funcName);
          if (func) {
            this.logTest(`${funcName}() Signature`, 'PASS', `Function exists: ${func.signature}`);
          } else {
            this.logTest(`${funcName}() Signature`, 'FAIL', 'Function not found in ABI');
          }
        } catch (error) {
          this.logTest(`${funcName}() Signature`, 'FAIL', error.message);
        }
      }
      
      return true;
    } catch (error) {
      this.logTest('Admin Function Access', 'FAIL', error.message);
      return false;
    }
  }

  async testEventListening() {
    this.log('\n📡 Testing Event Listening...', 'blue');
    
    try {
      // Test event signatures
      const events = [
        'ElectionCreated',
        'CandidateAdded',
        'VoteCast'
      ];
      
      for (const eventName of events) {
        try {
          const event = this.contract.interface.getEvent(eventName);
          if (event) {
            this.logTest(`${eventName} Event`, 'PASS', `Event exists: ${event.signature}`);
          } else {
            this.logTest(`${eventName} Event`, 'FAIL', 'Event not found in ABI');
          }
        } catch (error) {
          this.logTest(`${eventName} Event`, 'FAIL', error.message);
        }
      }
      
      return true;
    } catch (error) {
      this.logTest('Event Listening', 'FAIL', error.message);
      return false;
    }
  }

  async testFrontendServiceIntegration() {
    this.log('\n🔗 Testing Frontend Service Integration...', 'blue');
    
    try {
      // Test voting service integration
      const votingServicePath = path.join(__dirname, '../lib/blockchain/voting-service.ts');
      if (fs.existsSync(votingServicePath)) {
        this.logTest('Voting Service File', 'PASS', 'voting-service.ts exists');
      } else {
        this.logTest('Voting Service File', 'FAIL', 'voting-service.ts not found');
      }
      
      // Test deployed addresses file
      const addressesPath = path.join(__dirname, '../lib/contracts/deployed-addresses.json');
      if (fs.existsSync(addressesPath)) {
        const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
        if (addresses.UniversityVoting && addresses.UniversityVoting.baseSepolia) {
          this.logTest('Deployed Addresses', 'PASS', 
            `Contract address: ${addresses.UniversityVoting.baseSepolia}`);
        } else {
          this.logTest('Deployed Addresses', 'FAIL', 'UniversityVoting address not found');
        }
      } else {
        this.logTest('Deployed Addresses', 'FAIL', 'deployed-addresses.json not found');
      }
      
      return true;
    } catch (error) {
      this.logTest('Frontend Service Integration', 'FAIL', error.message);
      return false;
    }
  }

  async testTransactionSimulation() {
    this.log('\n💾 Testing Transaction Simulation...', 'blue');
    
    try {
      // Simulate election creation transaction (without sending)
      const electionData = {
        title: CONFIG.TEST_DATA.electionTitle,
        description: CONFIG.TEST_DATA.electionDescription,
        startTime: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        endTime: Math.floor(Date.now() / 1000) + 7200,   // 2 hours from now
        positions: [{
          title: CONFIG.TEST_DATA.positionTitle,
          requirements: CONFIG.TEST_DATA.positionRequirements
        }]
      };
      
      try {
        // Test gas estimation for createElection
        const gasEstimate = await this.contract.createElection.estimateGas(
          electionData.title,
          electionData.description,
          electionData.startTime,
          electionData.endTime,
          electionData.positions.map(p => ({ title: p.title, requirements: p.requirements }))
        );
        
        this.logTest('Election Creation Gas Estimate', 'PASS', 
          `Estimated gas: ${gasEstimate.toString()}`);
      } catch (error) {
        this.logTest('Election Creation Gas Estimate', 'FAIL', error.message);
      }
      
      return true;
    } catch (error) {
      this.logTest('Transaction Simulation', 'FAIL', error.message);
      return false;
    }
  }

  async testDataConsistency() {
    this.log('\n🔍 Testing Data Consistency...', 'blue');
    
    try {
      // Test contract state consistency
      const nextElectionId = await this.contract.nextElectionId();
      const nextCandidateId = await this.contract.nextCandidateId();
      const nextPositionId = await this.contract.nextPositionId();
      
      // Verify IDs are reasonable (should be >= 0)
      if (nextElectionId >= 0 && nextCandidateId >= 0 && nextPositionId >= 0) {
        this.logTest('ID Consistency', 'PASS', 
          `All IDs are valid: Election=${nextElectionId}, Candidate=${nextCandidateId}, Position=${nextPositionId}`);
      } else {
        this.logTest('ID Consistency', 'FAIL', 'Invalid ID values detected');
      }
      
      // Test contract owner is valid address
      const owner = await this.contract.owner();
      if (ethers.isAddress(owner)) {
        this.logTest('Owner Address Format', 'PASS', `Valid address: ${owner}`);
      } else {
        this.logTest('Owner Address Format', 'FAIL', 'Invalid owner address format');
      }
      
      return true;
    } catch (error) {
      this.logTest('Data Consistency', 'FAIL', error.message);
      return false;
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Contract Integration Tests...', 'magenta');
    this.log(`Network: ${CONFIG.NETWORK.name} (${CONFIG.NETWORK.rpc})`, 'cyan');
    this.log(`Contract: ${CONFIG.CONTRACT_ADDRESS}`, 'cyan');
    
    const tests = [
      this.testContractDeployment.bind(this),
      this.testReadFunctions.bind(this),
      this.testAdminFunctionAccess.bind(this),
      this.testEventListening.bind(this),
      this.testFrontendServiceIntegration.bind(this),
      this.testTransactionSimulation.bind(this),
      this.testDataConsistency.bind(this)
    ];
    
    for (const test of tests) {
      await test();
    }
    
    this.printResults();
  }

  printResults() {
    this.log('\n📊 Test Results Summary', 'magenta');
    this.log('=' * 50, 'blue');
    
    this.log(`Total Tests: ${this.results.passed + this.results.failed}`, 'cyan');
    this.log(`Passed: ${this.results.passed}`, 'green');
    this.log(`Failed: ${this.results.failed}`, 'red');
    
    const successRate = ((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1);
    this.log(`Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');
    
    if (this.results.failed > 0) {
      this.log('\n❌ Failed Tests:', 'red');
      this.results.tests
        .filter(test => test.status === 'FAIL')
        .forEach(test => {
          this.log(`  - ${test.name}: ${test.details}`, 'red');
        });
    }
    
    this.log('\n🔗 Contract Explorer:', 'cyan');
    this.log(`${CONFIG.NETWORK.explorer}/address/${CONFIG.CONTRACT_ADDRESS}`, 'blue');
    
    if (this.results.failed === 0) {
      this.log('\n✅ All tests passed! Contract is ready for end-to-end testing.', 'green');
    } else {
      this.log('\n⚠️  Some tests failed. Please review and fix issues before proceeding.', 'yellow');
    }
  }
}

// Main execution
async function main() {
  const tester = new ContractIntegrationTester();
  
  const initialized = await tester.initialize();
  if (!initialized) {
    process.exit(1);
  }
  
  await tester.runAllTests();
}

// Handle command line arguments
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = ContractIntegrationTester;
