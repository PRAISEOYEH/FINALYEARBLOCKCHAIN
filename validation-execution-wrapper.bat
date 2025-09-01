@echo off
setlocal enabledelayedexpansion

echo ========================================
echo VALIDATION EXECUTION WRAPPER
echo ========================================
echo.

:: Set error handling
set "ERROR_COUNT=0"
set "TOTAL_TESTS=0"

:: Function to increment test counter and check result
:increment_test
set /a TOTAL_TESTS+=1
if %ERRORLEVEL% neq 0 (
    set /a ERROR_COUNT+=1
    echo [FAIL] Test %TOTAL_TESTS%
) else (
    echo [PASS] Test %TOTAL_TESTS%
)
goto :eof

echo [1/10] Checking prerequisites...
echo.

:: Check Node.js availability
echo Checking Node.js installation...
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    set /a ERROR_COUNT+=1
    goto :error_exit
) else (
    for /f "tokens=*" %%i in ('node --version') do set "NODE_VERSION=%%i"
    echo [INFO] Node.js version: !NODE_VERSION!
)

:: Check npm availability
echo Checking npm installation...
npm --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not installed or not in PATH
    set /a ERROR_COUNT+=1
    goto :error_exit
) else (
    for /f "tokens=*" %%i in ('npm --version') do set "NPM_VERSION=%%i"
    echo [INFO] npm version: !NPM_VERSION!
)

echo.
echo [2/10] Validating Hardhat version (target: 2.26.3)...
echo.

:: Check Hardhat version
for /f "tokens=*" %%i in ('npx hardhat --version 2^>nul') do set "HARDHAT_VERSION=%%i"
if "!HARDHAT_VERSION!"=="2.26.3" (
    echo [PASS] Hardhat version is correct: !HARDHAT_VERSION!
) else (
    echo [FAIL] Hardhat version mismatch. Expected: 2.26.3, Got: !HARDHAT_VERSION!
    set /a ERROR_COUNT+=1
)

echo.
echo [3/10] Validating ethers version (target: 5.8.0)...
echo.

:: Check ethers version
for /f "tokens=*" %%i in ('npm list ethers --depth=0 2^>nul ^| findstr "ethers@"') do set "ETHERS_LINE=%%i"
for /f "tokens=2" %%i in ("!ETHERS_LINE!") do set "ETHERS_VERSION=%%i"
if "!ETHERS_VERSION!"=="5.8.0" (
    echo [PASS] Ethers version is correct: !ETHERS_VERSION!
) else (
    echo [FAIL] Ethers version mismatch. Expected: 5.8.0, Got: !ETHERS_VERSION!
    set /a ERROR_COUNT+=1
)

echo.
echo [4/10] Testing dependency compatibility...
echo.

:: Check for version conflicts
npm ls --depth=0 >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Potential dependency conflicts detected
    echo [INFO] Run 'npm ls' for detailed dependency tree
) else (
    echo [PASS] No dependency conflicts detected
)

echo.
echo [5/10] Testing contract compilation...
echo.

:: Test contract compilation
echo Running contract compilation...
npm run hh:compile >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [FAIL] Contract compilation failed
    echo [INFO] Run 'npm run hh:compile' for detailed error messages
    set /a ERROR_COUNT+=1
) else (
    echo [PASS] Contract compilation successful
)

echo.
echo [6/10] Verifying ABI generation...
echo.

:: Check if ABI files exist
if exist "lib\abi\Voting.ts" (
    echo [PASS] Voting ABI file exists
) else (
    echo [FAIL] Voting ABI file missing: lib\abi\Voting.ts
    set /a ERROR_COUNT+=1
)

if exist "lib\abi\UniversityVoting.ts" (
    echo [PASS] UniversityVoting ABI file exists
) else (
    echo [FAIL] UniversityVoting ABI file missing: lib\abi\UniversityVoting.ts
    set /a ERROR_COUNT+=1
)

:: Test ABI generation command
echo Running ABI generation...
npm run generate:abi >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [FAIL] ABI generation failed
    set /a ERROR_COUNT+=1
) else (
    echo [PASS] ABI generation successful
)

echo.
echo [7/10] Testing development server startup...
echo.

:: Start development server in background
echo Starting development server...
start /B npm run dev >nul 2>&1

:: Wait for server to start
echo Waiting for server to start...
timeout /t 10 /nobreak >nul

:: Test server response
echo Testing server response...
curl -s http://localhost:3000 >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [FAIL] Development server not responding
    set /a ERROR_COUNT+=1
) else (
    echo [PASS] Development server responding correctly
)

:: Stop development server
echo Stopping development server...
taskkill /f /im node.exe >nul 2>&1

echo.
echo [8/10] Validating compilation artifacts...
echo.

:: Check for artifact files
if exist "artifacts\contracts\Voting.sol\Voting.json" (
    echo [PASS] Voting contract artifact exists
) else (
    echo [FAIL] Voting contract artifact missing
    set /a ERROR_COUNT+=1
)

if exist "artifacts\contracts\UniversityVoting.sol\UniversityVoting.json" (
    echo [PASS] UniversityVoting contract artifact exists
) else (
    echo [FAIL] UniversityVoting contract artifact missing
    set /a ERROR_COUNT+=1
)

echo.
echo [9/10] Running Node.js dependency validation...
echo.

:: Run the Node.js validation script
node scripts\validate-dependencies.js
if %ERRORLEVEL% neq 0 (
    echo [FAIL] Node.js dependency validation failed
    set /a ERROR_COUNT+=1
) else (
    echo [PASS] Node.js dependency validation successful
)

echo.
echo [10/10] Generating validation summary...
echo.

:: Calculate pass rate
set /a PASSED_TESTS=%TOTAL_TESTS%-%ERROR_COUNT%
set /a PASS_RATE=(%PASSED_TESTS%*100)/%TOTAL_TESTS%

echo ========================================
echo VALIDATION SUMMARY
echo ========================================
echo Total Tests: %TOTAL_TESTS%
echo Passed: %PASSED_TESTS%
echo Failed: %ERROR_COUNT%
echo Pass Rate: %PASS_RATE%%%
echo.

if %ERROR_COUNT% equ 0 (
    echo [SUCCESS] All validation tests passed!
    echo The system is ready for development.
) else (
    echo [WARNING] %ERROR_COUNT% test(s) failed.
    echo Please review the error messages above and fix the issues.
    echo.
    echo Troubleshooting suggestions:
    echo 1. Run 'npm install' to ensure all dependencies are installed
    echo 2. Clear npm cache: 'npm cache clean --force'
    echo 3. Delete node_modules and package-lock.json, then run 'npm install'
    echo 4. Check hardhat.config.js for configuration issues
    echo 5. Verify port 3000 is available for development server
)

echo.
echo Validation completed at %date% %time%
echo ========================================

goto :end

:error_exit
echo.
echo [CRITICAL ERROR] Prerequisites not met. Cannot continue validation.
echo Please ensure Node.js and npm are properly installed and in PATH.
echo.

:end
endlocal
