@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   Blockchain Integration Test Suite
echo ========================================
echo.

:: Set colors for output
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

:: Initialize variables
set "TOTAL_TESTS=0"
set "PASSED_TESTS=0"
set "FAILED_TESTS=0"
set "START_TIME=%TIME%"

:: Function to print colored output
:print_color
echo %~1%~2%~3
goto :eof

:: Function to run a test and capture results
:run_test
set "test_name=%~1"
set "test_script=%~2"
set "test_description=%~3"

call :print_color %BLUE% "Running %test_name%...%RESET%"
echo %test_description%
echo.

node "%test_script%"
set "test_exit_code=!ERRORLEVEL!"

if !test_exit_code! equ 0 (
    call :print_color %GREEN% "✓ %test_name% PASSED%RESET%"
    set /a "PASSED_TESTS+=1"
) else (
    call :print_color %RED% "✗ %test_name% FAILED%RESET%"
    set /a "FAILED_TESTS+=1"
)

set /a "TOTAL_TESTS+=1"
echo.
goto :eof

:: Check environment and prerequisites
call :print_color %YELLOW% "Checking environment and prerequisites...%RESET%"
echo.

:: Check Node.js version
node --version >nul 2>&1
if !ERRORLEVEL! neq 0 (
    call :print_color %RED% "❌ Node.js is not installed or not in PATH%RESET%"
    exit /b 1
)

:: Check npm version
npm --version >nul 2>&1
if !ERRORLEVEL! neq 0 (
    call :print_color %RED% "❌ npm is not installed or not in PATH%RESET%"
    exit /b 1
)

:: Check if package.json exists
if not exist "package.json" (
    call :print_color %RED% "❌ package.json not found - not a Next.js project%RESET%"
    exit /b 1
)

:: Check if .env file exists
if not exist ".env" (
    call :print_color %YELLOW% "⚠️  .env file not found - using default values%RESET%"
)

:: Check if node_modules exists
if not exist "node_modules" (
    call :print_color %YELLOW% "⚠️  node_modules not found - installing dependencies...%RESET%"
    npm install
    if !ERRORLEVEL! neq 0 (
        call :print_color %RED% "❌ Failed to install dependencies%RESET%"
        exit /b 1
    )
)

:: Check if contract artifacts exist
if not exist "artifacts" (
    call :print_color %YELLOW% "⚠️  Contract artifacts not found - compiling contracts...%RESET%"
    npx hardhat compile
    if !ERRORLEVEL! neq 0 (
        call :print_color %RED% "❌ Failed to compile contracts%RESET%"
        exit /b 1
    )
)

call :print_color %GREEN% "✓ Environment check completed%RESET%"
echo.

:: Verify all required environment variables are set
call :print_color %YELLOW% "Verifying environment variables...%RESET%"
echo.

:: Check for required environment variables
set "MISSING_ENV_VARS="

if "%NEXT_PUBLIC_RPC_URL%"=="" (
    set "MISSING_ENV_VARS=1"
    call :print_color %YELLOW% "⚠️  NEXT_PUBLIC_RPC_URL not set - using default%RESET%"
)

if "%NEXT_PUBLIC_CHAIN_ID%"=="" (
    set "MISSING_ENV_VARS=1"
    call :print_color %YELLOW% "⚠️  NEXT_PUBLIC_CHAIN_ID not set - using default%RESET%"
)

if "%NEXT_PUBLIC_CONTRACT_ADDRESS%"=="" (
    set "MISSING_ENV_VARS=1"
    call :print_color %YELLOW% "⚠️  NEXT_PUBLIC_CONTRACT_ADDRESS not set - using default%RESET%"
)

if defined MISSING_ENV_VARS (
    call :print_color %YELLOW% "Some environment variables are missing, but tests will continue with defaults%RESET%"
) else (
    call :print_color %GREEN% "✓ All environment variables are set%RESET%"
)
echo.

:: Validate project dependencies are installed
call :print_color %YELLOW% "Validating project dependencies...%RESET%"
echo.

:: Check for required packages
npm list ethers >nul 2>&1
if !ERRORLEVEL! neq 0 (
    call :print_color %RED% "❌ ethers package not found%RESET%"
    exit /b 1
)

npm list wagmi >nul 2>&1
if !ERRORLEVEL! neq 0 (
    call :print_color %RED% "❌ wagmi package not found%RESET%"
    exit /b 1
)

call :print_color %GREEN% "✓ Dependencies validation completed%RESET%"
echo.

:: Check that contract artifacts and ABIs are generated
call :print_color %YELLOW% "Checking contract artifacts and ABIs...%RESET%"
echo.

if not exist "artifacts\contracts\UniversityVoting.sol\UniversityVoting.json" (
    call :print_color %RED% "❌ UniversityVoting contract artifact not found%RESET%"
    exit /b 1
)

if not exist "lib\abi\UniversityVoting.ts" (
    call :print_color %YELLOW% "⚠️  UniversityVoting ABI file not found - will use minimal ABI%RESET%"
)

call :print_color %GREEN% "✓ Contract artifacts check completed%RESET%"
echo.

:: Start test execution sequence
call :print_color %BLUE% "Starting blockchain integration test suite...%RESET%"
echo ========================================
echo.

:: Test 1: Base Sepolia Connectivity
call :run_test "Base Sepolia Connectivity" "scripts\test-base-sepolia-connectivity.js" "Testing Base Sepolia network connectivity, RPC endpoint accessibility, and contract address validation"

:: Test 2: Wagmi Configuration
call :run_test "Wagmi Configuration" "scripts\test-wagmi-configuration.js" "Validating wagmi configuration, chain setup, wallet connectors, and public client functionality"

:: Test 3: Voting Service Integration
call :run_test "Voting Service Integration" "scripts\test-voting-service-integration.js" "Testing voting service layer integration, contract address resolution, and wagmi integration"

:: Test 4: Deployed Contract Validation
call :run_test "Deployed Contract Validation" "scripts\validate-deployed-contract.js" "Validating deployed contract at specific address, contract state analysis, and ABI compatibility"

:: Test 5: Contract Read/Write Operations
call :run_test "Contract Read/Write Operations" "scripts\test-contract-read-write-operations.js" "Testing actual contract read/write operations, gas estimation, and event emission"

:: Test 6: Frontend Blockchain Integration
call :run_test "Frontend Blockchain Integration" "scripts\test-frontend-blockchain-integration.js" "Testing frontend-to-blockchain integration, component rendering, and transaction flow simulation"

:: Generate comprehensive test report
echo.
echo ========================================
call :print_color %BLUE% "Generating comprehensive test report...%RESET%"
echo ========================================
echo.

:: Calculate test statistics
set /a "SUCCESS_RATE=(PASSED_TESTS * 100) / TOTAL_TESTS"

:: Display overall results
echo.
call :print_color %BLUE% "BLOCKCHAIN INTEGRATION TEST RESULTS%RESET%"
echo ========================================
echo.
call :print_color %GREEN% "Total Tests: %TOTAL_TESTS%%RESET%"
call :print_color %GREEN% "Passed: %PASSED_TESTS%%RESET%"
call :print_color %RED% "Failed: %FAILED_TESTS%%RESET%"
echo.
call :print_color %BLUE% "Success Rate: %SUCCESS_RATE%%%RESET%"
echo.

:: Display detailed results summary
if %FAILED_TESTS% equ 0 (
    call :print_color %GREEN% "🎉 ALL TESTS PASSED! Blockchain integration is working correctly.%RESET%"
    echo.
    echo Next steps:
    echo - Proceed with production deployment
    echo - Monitor network performance
    echo - Set up monitoring and alerting
    echo - Test with actual wallet connections
) else (
    call :print_color %RED% "⚠️  SOME TESTS FAILED. Review the results above and address issues.%RESET%"
    echo.
    echo Recommended actions:
    echo - Review failed tests and error messages
    echo - Check network connectivity and RPC endpoint
    echo - Verify environment variables and configuration
    echo - Ensure contract is properly deployed
    echo - Test with actual wallet connections
)

:: Generate detailed report file
echo.
call :print_color %YELLOW% "Generating detailed report file...%RESET%"

set "REPORT_FILE=blockchain-integration-test-report-%date:~-4,4%-%date:~-10,2%-%date:~-7,2%-%time:~0,2%-%time:~3,2%-%time:~6,2%.md"
set "REPORT_FILE=%REPORT_FILE: =0%"

(
echo # Blockchain Integration Test Report
echo.
echo **Generated:** %date% %time%
echo **Total Tests:** %TOTAL_TESTS%
echo **Passed:** %PASSED_TESTS%
echo **Failed:** %FAILED_TESTS%
echo **Success Rate:** %SUCCESS_RATE%%%
echo.
echo ## Test Summary
echo.
if %FAILED_TESTS% equ 0 (
    echo ✅ **ALL TESTS PASSED** - Blockchain integration is working correctly
) else (
    echo ❌ **SOME TESTS FAILED** - Review results and address issues
)
echo.
echo ## Environment Information
echo.
echo - **Node.js Version:** 
node --version
echo - **npm Version:** 
npm --version
echo - **Chain ID:** %NEXT_PUBLIC_CHAIN_ID%
echo - **RPC URL:** %NEXT_PUBLIC_RPC_URL%
echo - **Contract Address:** %NEXT_PUBLIC_CONTRACT_ADDRESS%
echo.
echo ## Recommendations
echo.
if %FAILED_TESTS% equ 0 (
    echo - Proceed with production deployment
    echo - Monitor network performance
    echo - Set up monitoring and alerting
    echo - Test with actual wallet connections
) else (
    echo - Review failed tests and error messages
    echo - Check network connectivity and RPC endpoint
    echo - Verify environment variables and configuration
    echo - Ensure contract is properly deployed
    echo - Test with actual wallet connections
)
) > "%REPORT_FILE%"

call :print_color %GREEN% "✓ Detailed report saved to: %REPORT_FILE%%RESET%"

:: Cleanup and finalization
echo.
echo ========================================
call :print_color %BLUE% "Cleaning up and finalizing...%RESET%"
echo ========================================
echo.

:: Reset any modified state
call :print_color %YELLOW% "Resetting test state...%RESET%"

:: Generate final test report
echo.
call :print_color %BLUE% "FINAL TEST SUMMARY%RESET%"
echo ========================================
echo.
echo Test execution completed at: %TIME%
echo Total execution time: Calculated from %START_TIME% to %TIME%
echo.
echo **Overall Status:** 
if %FAILED_TESTS% equ 0 (
    call :print_color %GREEN% "SUCCESS%RESET%"
) else (
    call :print_color %RED% "FAILED%RESET%"
)
echo.

:: Provide next steps and recommendations
echo **Next Steps:**
if %FAILED_TESTS% equ 0 (
    echo 1. ✅ All tests passed - proceed with confidence
    echo 2. 🔧 Set up production monitoring
    echo 3. 🧪 Test with real wallet connections
    echo 4. 📊 Monitor performance in production
) else (
    echo 1. 🔍 Review failed test results above
    echo 2. 🛠️  Address identified issues
    echo 3. 🔄 Re-run failed tests
    echo 4. ✅ Proceed only after all tests pass
)

echo.
echo **Report File:** %REPORT_FILE%
echo.

:: Exit with appropriate code
if %FAILED_TESTS% equ 0 (
    call :print_color %GREEN% "🎉 Blockchain integration test suite completed successfully!%RESET%"
    exit /b 0
) else (
    call :print_color %RED% "❌ Blockchain integration test suite completed with failures.%RESET%"
    exit /b 1
)
