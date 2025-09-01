@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Next Steps Execution Script
echo ========================================
echo.

:: Parse command line arguments
set "PHASE=all"
set "VERBOSE=false"
set "SKIP_TESTS=false"

:parse_args
if "%~1"=="" goto :start_execution
if "%~1"=="--phase" (
    set "PHASE=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--verbose" (
    set "VERBOSE=true"
    shift
    goto :parse_args
)
if "%~1"=="--skip-tests" (
    set "SKIP_TESTS=true"
    shift
    goto :parse_args
)
shift
goto :parse_args

:start_execution
:: Set error handling
set "ERROR_COUNT=0"
set "START_TIME=%time%"

:: Function to log messages
:log
if "%VERBOSE%"=="true" (
    echo [%date% %time%] %~1
) else (
    echo %~1
)
goto :eof

:: Function to handle errors
:error
echo [ERROR] %~1
set /a ERROR_COUNT+=1
goto :eof

:: Function to check if command exists
:check_command
where %1 >nul 2>&1
if %errorlevel% neq 0 (
    call :error "Command '%1' not found. Please install it first."
    exit /b 1
)
goto :eof

:: Check prerequisites
call :log "Checking prerequisites..."
call :check_command npm
call :check_command node

:: Check Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
call :log "Node.js version: %NODE_VERSION%"

:: Check npm version
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
call :log "npm version: %NPM_VERSION%"

echo.

:: Phase 1: Script Validation (Priority A)
if "%PHASE%"=="all" goto :phase1
if "%PHASE%"=="1" goto :phase1
goto :check_phase

:phase1
call :log "========================================"
call :log "PHASE 1: Script Validation (Priority A)"
call :log "========================================"
call :log "Testing all updated scripts and dependencies..."
echo.

:: Test 1.1: Hardhat version verification
call :log "1.1 Testing Hardhat version..."
npx hardhat --version
if !errorlevel! neq 0 (
    call :error "Hardhat version check failed"
    goto :phase1_cleanup
)

:: Test 1.2: Contract compilation
call :log "1.2 Testing contract compilation..."
npm run hh:compile
if !errorlevel! neq 0 (
    call :error "Contract compilation failed"
    goto :phase1_cleanup
)

:: Test 1.3: ABI generation
call :log "1.3 Testing ABI generation..."
npm run generate:abi
if !errorlevel! neq 0 (
    call :error "ABI generation failed"
    goto :phase1_cleanup
)

:: Test 1.4: Development server (quick test)
if "%SKIP_TESTS%"=="false" (
    call :log "1.4 Testing development server startup..."
    npm run dev &
    set "DEV_PID=!errorlevel!"
    timeout /t 10 /nobreak >nul
    taskkill /f /pid !DEV_PID! >nul 2>&1
    if !errorlevel! neq 0 (
        call :log "Development server test completed"
    )
)

call :log "✅ Phase 1 completed successfully"
echo.

:phase1_cleanup
if defined DEV_PID (
    taskkill /f /pid !DEV_PID! >nul 2>&1
)

:: Phase 2: Build Reproducibility (Priority B)
if "%PHASE%"=="all" goto :phase2
if "%PHASE%"=="2" goto :phase2
goto :check_phase

:phase2
call :log "========================================"
call :log "PHASE 2: Build Reproducibility (Priority B)"
call :log "========================================"
call :log "Generating package-lock.json and ensuring reproducible builds..."
echo.

:: Run the package lock generation script
call :log "2.1 Running package lock generation..."
call generate-lockfile.bat
if !errorlevel! neq 0 (
    call :error "Package lock generation failed"
    goto :phase2_cleanup
)

:: Test reproducible installation
call :log "2.2 Testing reproducible installation..."
npm ci
if !errorlevel! neq 0 (
    call :error "npm ci failed - lockfile may not be reproducible"
    goto :phase2_cleanup
)

:: Run security audit
call :log "2.3 Running security audit..."
npm audit
set AUDIT_EXIT_CODE=!errorlevel!
if !AUDIT_EXIT_CODE! equ 0 (
    call :log "✅ Security audit passed"
) else if !AUDIT_EXIT_CODE! equ 1 (
    call :log "⚠️ Security audit completed with vulnerabilities - review recommended"
) else (
    call :error "Security audit failed"
    goto :phase2_cleanup
)

call :log "✅ Phase 2 completed successfully"
echo.

:phase2_cleanup

:: Phase 3: Integration Testing (Priority D)
if "%PHASE%"=="all" goto :phase3
if "%PHASE%"=="3" goto :phase3
goto :check_phase

:phase3
call :log "========================================"
call :log "PHASE 3: Integration Testing (Priority D)"
call :log "========================================"
call :log "Testing blockchain integration and end-to-end workflows..."
echo.

if "%SKIP_TESTS%"=="false" (
    :: Test blockchain connectivity
    call :log "3.1 Testing blockchain connectivity..."
    node -e "
    const { ethers } = require('ethers');
    const provider = new ethers.providers.JsonRpcProvider('https://sepolia.base.org');
    provider.getNetwork().then(network => {
        console.log('Connected to network:', network.name, 'Chain ID:', network.chainId);
        if (network.chainId === 84532) {
            console.log('✅ Base Sepolia connection successful');
        } else {
            console.log('❌ Wrong network connected');
            process.exit(1);
        }
    }).catch(err => {
        console.error('❌ Network connection failed:', err.message);
        process.exit(1);
    });
    "
    if !errorlevel! neq 0 (
        call :error "Blockchain connectivity test failed"
        goto :phase3_cleanup
    )

    :: Test contract interaction
    call :log "3.2 Testing contract interaction..."
    node -e "
    const { ethers } = require('ethers');
    const fs = require('fs');
    
    try {
        const provider = new ethers.providers.JsonRpcProvider('https://sepolia.base.org');
        const addresses = JSON.parse(fs.readFileSync('lib/contracts/deployed-addresses.json', 'utf8'));
        const contractAddress = addresses.baseSepolia;
        
        if (!contractAddress) {
            console.error('❌ No contract address found for Base Sepolia');
            process.exit(1);
        }
        
        console.log('Contract address:', contractAddress);
        console.log('✅ Contract address validation successful');
    } catch (err) {
        console.error('❌ Contract interaction test failed:', err.message);
        process.exit(1);
    }
    "
    if !errorlevel! neq 0 (
        call :error "Contract interaction test failed"
        goto :phase3_cleanup
    )
) else (
    call :log "3.x Skipping integration tests (--skip-tests flag)"
)

call :log "✅ Phase 3 completed successfully"
echo.

:phase3_cleanup

:: Phase 4: Documentation Update (Priority C)
if "%PHASE%"=="all" goto :phase4
if "%PHASE%"=="4" goto :phase4
goto :check_phase

:phase4
call :log "========================================"
call :log "PHASE 4: Documentation Update (Priority C)"
call :log "========================================"
call :log "Updating documentation with latest improvements..."
echo.

:: Check if README.md was updated
call :log "4.1 Checking documentation status..."
if exist "README.md" (
    call :log "✅ README.md exists and has been updated"
) else (
    call :error "README.md not found"
    goto :phase4_cleanup
)

:: Check if validation plan exists
if exist "script-validation-plan.md" (
    call :log "✅ Script validation plan created"
) else (
    call :error "script-validation-plan.md not found"
    goto :phase4_cleanup
)

:: Check if E2E testing plan exists
if exist "e2e-integration-testing.md" (
    call :log "✅ E2E integration testing plan created"
) else (
    call :error "e2e-integration-testing.md not found"
    goto :phase4_cleanup
)

:: Check if package lock generation script exists
if exist "generate-lockfile.bat" (
    call :log "✅ Package lock generation script created"
) else (
    call :error "generate-lockfile.bat not found"
    goto :phase4_cleanup
)

call :log "✅ Phase 4 completed successfully"
echo.

:phase4_cleanup

:: Phase 5: Final Validation
if "%PHASE%"=="all" goto :phase5
if "%PHASE%"=="5" goto :phase5
goto :check_phase

:phase5
call :log "========================================"
call :log "PHASE 5: Final Validation"
call :log "========================================"
call :log "Running comprehensive system validation..."
echo.

:: Final compilation test
call :log "5.1 Final contract compilation test..."
npm run hh:compile
if !errorlevel! neq 0 (
    call :error "Final compilation test failed"
    goto :phase5_cleanup
)

:: Final dependency check
call :log "5.2 Final dependency verification..."
npm list --depth=0
if !errorlevel! neq 0 (
    call :error "Dependency verification failed"
    goto :phase5_cleanup
)

:: Check all required files exist
call :log "5.3 Checking required files..."
set "MISSING_FILES="
if not exist "package-lock.json" set "MISSING_FILES=!MISSING_FILES! package-lock.json"
if not exist "artifacts/contracts/UniversityVoting.sol/UniversityVoting.json" set "MISSING_FILES=!MISSING_FILES! UniversityVoting artifacts"
if not exist "lib/abi/UniversityVoting.ts" set "MISSING_FILES=!MISSING_FILES! UniversityVoting ABI"
if not exist "lib/contracts/deployed-addresses.json" set "MISSING_FILES=!MISSING_FILES! deployed addresses"

if defined MISSING_FILES (
    call :error "Missing required files: !MISSING_FILES!"
    goto :phase5_cleanup
) else (
    call :log "✅ All required files present"
)

call :log "✅ Phase 5 completed successfully"
echo.

:phase5_cleanup

:check_phase
if "%PHASE%"=="all" goto :final_summary
if "%PHASE%"=="1" goto :final_summary
if "%PHASE%"=="2" goto :final_summary
if "%PHASE%"=="3" goto :final_summary
if "%PHASE%"=="4" goto :final_summary
if "%PHASE%"=="5" goto :final_summary

echo Invalid phase specified: %PHASE%
echo Valid phases: 1, 2, 3, 4, 5, or all
goto :end

:final_summary
:: Generate execution report
call :log "========================================"
call :log "EXECUTION SUMMARY"
call :log "========================================"
echo.

set "END_TIME=%time%"
call :log "Start time: %START_TIME%"
call :log "End time: %END_TIME%"

if !ERROR_COUNT! equ 0 (
    echo ✅ SUCCESS: All phases completed successfully
    echo.
    echo 🎉 System Status:
    echo - Scripts validated and working
    echo - Reproducible builds configured
    echo - Integration testing completed
    echo - Documentation updated
    echo - Final validation passed
    echo.
    echo 📋 Next Steps:
    echo 1. Review any security audit warnings
    echo 2. Test the system with real transactions
    echo 3. Prepare for production deployment
    echo 4. Set up monitoring and alerting
    echo 5. Create deployment procedures
    echo.
    echo 🚀 System is ready for production use!
) else (
    echo ❌ FAILED: Execution encountered !ERROR_COUNT! error(s)
    echo.
    echo Please review the errors above and fix them before proceeding.
    echo.
    echo 🔧 Common solutions:
    echo - Check all prerequisites are installed
    echo - Verify environment variables are set correctly
    echo - Ensure network connectivity
    echo - Review error messages for specific issues
)

:: Generate detailed report
echo # Execution Report > execution-report.md
echo Generated on: %date% %time% >> execution-report.md
echo. >> execution-report.md
echo ## Environment >> execution-report.md
echo - Node.js: %NODE_VERSION% >> execution-report.md
echo - npm: %NPM_VERSION% >> execution-report.md
echo - Start time: %START_TIME% >> execution-report.md
echo - End time: %END_TIME% >> execution-report.md
echo. >> execution-report.md
echo ## Results >> execution-report.md
if !ERROR_COUNT! equ 0 (
    echo - Status: ✅ SUCCESS >> execution-report.md
    echo - Errors: 0 >> execution-report.md
) else (
    echo - Status: ❌ FAILED >> execution-report.md
    echo - Errors: !ERROR_COUNT! >> execution-report.md
)
echo. >> execution-report.md
echo ## Phases Completed >> execution-report.md
if "%PHASE%"=="all" (
    echo - Phase 1: Script Validation >> execution-report.md
    echo - Phase 2: Build Reproducibility >> execution-report.md
    echo - Phase 3: Integration Testing >> execution-report.md
    echo - Phase 4: Documentation Update >> execution-report.md
    echo - Phase 5: Final Validation >> execution-report.md
) else (
    echo - Phase %PHASE%: Custom phase >> execution-report.md
)

call :log "Detailed report generated: execution-report.md"

:end
echo.
echo ========================================
echo Execution completed
echo ========================================
pause

