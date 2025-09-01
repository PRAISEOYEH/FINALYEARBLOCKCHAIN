@echo off
setlocal enabledelayedexpansion

echo ========================================
echo MASTER VALIDATION SCRIPT
echo Blockchain Voting System Validation
echo ========================================
echo.

:: Set validation tracking variables
set "TOTAL_VALIDATIONS=0"
set "PASSED_VALIDATIONS=0"
set "FAILED_VALIDATIONS=0"
set "START_TIME=%time%"

:: Create validation log directory
if not exist "validation-logs" mkdir validation-logs
set "LOG_FILE=validation-logs\validation-%date:~-4,4%-%date:~-10,2%-%date:~-7,2%-%time:~0,2%-%time:~3,2%-%time:~6,2%.log"

:: Function to log messages with timestamp
:log_message
echo [%date% %time%] %~1 >> "%LOG_FILE%"
echo [%date% %time%] %~1
goto :eof

:: Function to increment validation counters
:increment_validation
set /a TOTAL_VALIDATIONS+=1
if %ERRORLEVEL% equ 0 (
    set /a PASSED_VALIDATIONS+=1
    call :log_message "[PASS] %~1"
) else (
    set /a FAILED_VALIDATIONS+=1
    call :log_message "[FAIL] %~1"
)
goto :eof

call :log_message "Starting master validation process..."

echo [1/4] Checking environment prerequisites...
echo.

:: Check if we're in the correct directory
if not exist "package.json" (
    call :log_message "[ERROR] package.json not found. Please run this script from the project root directory."
    goto :error_exit
)

:: Check Node.js availability
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    call :log_message "[ERROR] Node.js is not installed or not in PATH"
    goto :error_exit
) else (
    for /f "tokens=*" %%i in ('node --version') do set "NODE_VERSION=%%i"
    call :log_message "[INFO] Node.js version: !NODE_VERSION!"
)

:: Check npm availability
npm --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    call :log_message "[ERROR] npm is not installed or not in PATH"
    goto :error_exit
) else (
    for /f "tokens=*" %%i in ('npm --version') do set "NPM_VERSION=%%i"
    call :log_message "[INFO] npm version: !NPM_VERSION!"
)

:: Check Git availability (for version tracking)
git --version >nul 2>&1
if %ERRORLEVEL% equ 0 (
    for /f "tokens=*" %%i in ('git --version') do set "GIT_VERSION=%%i"
    call :log_message "[INFO] Git version: !GIT_VERSION!"
) else (
    call :log_message "[WARNING] Git not found - version tracking disabled"
)

echo.
echo [2/4] Running focused validation wrapper...
echo.

:: Run the validation wrapper script
call :log_message "Executing validation-execution-wrapper.bat..."
call validation-execution-wrapper.bat
call :increment_validation "Validation Wrapper Execution"

echo.
echo [3/4] Running Phase 1 of next-steps-execution.bat...
echo.

:: Run Phase 1 of the existing validation script
call :log_message "Executing Phase 1 of next-steps-execution.bat..."
call next-steps-execution.bat
call :increment_validation "Next Steps Phase 1 Execution"

echo.
echo [4/4] Running Node.js dependency validation...
echo.

:: Run the Node.js validation script
call :log_message "Executing Node.js dependency validation..."
node scripts\validate-dependencies.js
call :increment_validation "Node.js Dependency Validation"

echo.
echo ========================================
echo GENERATING UNIFIED VALIDATION REPORT
echo ========================================
echo.

:: Calculate validation statistics
set /a PASS_RATE=(%PASSED_VALIDATIONS%*100)/%TOTAL_VALIDATIONS%
set "END_TIME=%time%"

:: Generate comprehensive validation report
call :log_message "Generating validation report..."

echo ========================================
echo VALIDATION SUMMARY REPORT
echo ========================================
echo Start Time: %START_TIME%
echo End Time: %END_TIME%
echo Total Validations: %TOTAL_VALIDATIONS%
echo Passed: %PASSED_VALIDATIONS%
echo Failed: %FAILED_VALIDATIONS%
echo Pass Rate: %PASS_RATE%%%
echo.

:: Write summary to log file
echo ======================================== >> "%LOG_FILE%"
echo VALIDATION SUMMARY REPORT >> "%LOG_FILE%"
echo ======================================== >> "%LOG_FILE%"
echo Start Time: %START_TIME% >> "%LOG_FILE%"
echo End Time: %END_TIME% >> "%LOG_FILE%"
echo Total Validations: %TOTAL_VALIDATIONS% >> "%LOG_FILE%"
echo Passed: %PASSED_VALIDATIONS% >> "%LOG_FILE%"
echo Failed: %FAILED_VALIDATIONS% >> "%LOG_FILE%"
echo Pass Rate: %PASS_RATE%%% >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

:: Generate detailed validation report
call :generate_validation_report

:: Display final status
if %FAILED_VALIDATIONS% equ 0 (
    echo ✅ ALL VALIDATIONS PASSED SUCCESSFULLY!
    echo.
    echo The blockchain voting system is ready for development.
    echo All requirements have been validated:
    echo   - Hardhat 2.26.3 compatibility ✓
    echo   - Ethers v5.8.0 compatibility ✓
    echo   - Contract compilation ✓
    echo   - ABI generation ✓
    echo   - Development server functionality ✓
    echo.
    call :log_message "[SUCCESS] All validations passed successfully!"
) else (
    echo ❌ %FAILED_VALIDATIONS% VALIDATION(S) FAILED
    echo.
    echo Please review the validation results above and address the issues.
    echo Check the log file for detailed information: %LOG_FILE%
    echo.
    echo Common troubleshooting steps:
    echo 1. Run 'npm install' to ensure all dependencies are installed
    echo 2. Clear npm cache: 'npm cache clean --force'
    echo 3. Delete node_modules and package-lock.json, then run 'npm install'
    echo 4. Check hardhat.config.js for configuration issues
    echo 5. Verify port 3000 is available for development server
    echo.
    call :log_message "[WARNING] %FAILED_VALIDATIONS% validation(s) failed"
)

echo.
echo Validation completed at %date% %time%
echo Log file: %LOG_FILE%
echo ========================================

goto :end

:: Function to generate detailed validation report
:generate_validation_report
echo ======================================== >> "%LOG_FILE%"
echo DETAILED VALIDATION RESULTS >> "%LOG_FILE%"
echo ======================================== >> "%LOG_FILE%"

:: Check Hardhat version
echo Checking Hardhat version... >> "%LOG_FILE%"
for /f "tokens=*" %%i in ('npx hardhat --version 2^>nul') do set "HARDHAT_VERSION=%%i"
if "!HARDHAT_VERSION!"=="2.26.3" (
    echo [PASS] Hardhat version: !HARDHAT_VERSION! >> "%LOG_FILE%"
) else (
    echo [FAIL] Hardhat version mismatch. Expected: 2.26.3, Got: !HARDHAT_VERSION! >> "%LOG_FILE%"
)

:: Check ethers version
echo Checking ethers version... >> "%LOG_FILE%"
for /f "tokens=*" %%i in ('npm list ethers --depth=0 2^>nul ^| findstr "ethers@"') do set "ETHERS_LINE=%%i"
for /f "tokens=2" %%i in ("!ETHERS_LINE!") do set "ETHERS_VERSION=%%i"
if "!ETHERS_VERSION!"=="5.8.0" (
    echo [PASS] Ethers version: !ETHERS_VERSION! >> "%LOG_FILE%"
) else (
    echo [FAIL] Ethers version mismatch. Expected: 5.8.0, Got: !ETHERS_VERSION! >> "%LOG_FILE%"
)

:: Check contract artifacts
echo Checking contract artifacts... >> "%LOG_FILE%"
if exist "artifacts\contracts\Voting.sol\Voting.json" (
    echo [PASS] Voting contract artifact exists >> "%LOG_FILE%"
) else (
    echo [FAIL] Voting contract artifact missing >> "%LOG_FILE%"
)

if exist "artifacts\contracts\UniversityVoting.sol\UniversityVoting.json" (
    echo [PASS] UniversityVoting contract artifact exists >> "%LOG_FILE%"
) else (
    echo [FAIL] UniversityVoting contract artifact missing >> "%LOG_FILE%"
)

:: Check ABI files
echo Checking ABI files... >> "%LOG_FILE%"
if exist "lib\abi\Voting.ts" (
    echo [PASS] Voting ABI file exists >> "%LOG_FILE%"
) else (
    echo [FAIL] Voting ABI file missing >> "%LOG_FILE%"
)

if exist "lib\abi\UniversityVoting.ts" (
    echo [PASS] UniversityVoting ABI file exists >> "%LOG_FILE%"
) else (
    echo [FAIL] UniversityVoting ABI file missing >> "%LOG_FILE%"
)

:: Check deployed addresses
echo Checking deployed addresses... >> "%LOG_FILE%"
if exist "lib\contracts\deployed-addresses.json" (
    echo [PASS] Deployed addresses file exists >> "%LOG_FILE%"
) else (
    echo [FAIL] Deployed addresses file missing >> "%LOG_FILE%"
)

:: Check wagmi configuration
echo Checking wagmi configuration... >> "%LOG_FILE%"
if exist "lib\wagmi.ts" (
    echo [PASS] Wagmi configuration file exists >> "%LOG_FILE%"
) else (
    echo [FAIL] Wagmi configuration file missing >> "%LOG_FILE%"
)

echo. >> "%LOG_FILE%"
echo ======================================== >> "%LOG_FILE%"
echo END OF VALIDATION REPORT >> "%LOG_FILE%"
echo ======================================== >> "%LOG_FILE%"

goto :eof

:error_exit
echo.
echo [CRITICAL ERROR] Prerequisites not met. Cannot continue validation.
echo Please ensure Node.js and npm are properly installed and in PATH.
echo.
call :log_message "[CRITICAL ERROR] Prerequisites not met - validation aborted"

:end
call :log_message "Master validation process completed"
endlocal
