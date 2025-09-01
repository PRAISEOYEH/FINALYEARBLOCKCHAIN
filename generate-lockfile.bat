@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Package Lock Generation Script
echo ========================================
echo.

:: Set error handling
set "ERROR_COUNT=0"

:: Function to log messages
:log
echo [%date% %time%] %~1
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

:: Phase 1: Remove existing lock files
call :log "Phase 1: Cleaning existing lock files..."
if exist "pnpm-lock.yaml" (
    call :log "Removing pnpm-lock.yaml to avoid conflicts..."
    del "pnpm-lock.yaml"
    if !errorlevel! neq 0 (
        call :error "Failed to remove pnpm-lock.yaml"
        goto :cleanup
    )
)

if exist "yarn.lock" (
    call :log "Removing yarn.lock to avoid conflicts..."
    del "yarn.lock"
    if !errorlevel! neq 0 (
        call :error "Failed to remove yarn.lock"
        goto :cleanup
    )
)

echo.

:: Phase 2: Generate package-lock.json
call :log "Phase 2: Generating package-lock.json..."
call :log "Running npm install --package-lock-only..."

npm install --package-lock-only
if !errorlevel! neq 0 (
    call :error "Failed to generate package-lock.json"
    goto :cleanup
)

:: Verify package-lock.json was created
if not exist "package-lock.json" (
    call :error "package-lock.json was not created"
    goto :cleanup
)

call :log "package-lock.json generated successfully"
echo.

:: Phase 3: Verify lockfile integrity
call :log "Phase 3: Verifying lockfile integrity..."

:: Check package-lock.json size
for %%A in ("package-lock.json") do set LOCKFILE_SIZE=%%~zA
call :log "package-lock.json size: %LOCKFILE_SIZE% bytes"

:: Validate JSON structure
node -e "try { JSON.parse(require('fs').readFileSync('package-lock.json', 'utf8')); console.log('JSON structure is valid'); } catch(e) { console.error('Invalid JSON structure:', e.message); process.exit(1); }"
if !errorlevel! neq 0 (
    call :error "package-lock.json has invalid JSON structure"
    goto :cleanup
)

echo.

:: Phase 4: Test reproducible installation
call :log "Phase 4: Testing reproducible installation..."

:: Create temporary directory for testing
set "TEST_DIR=%TEMP%\npm-test-%random%"
mkdir "%TEST_DIR%"
if !errorlevel! neq 0 (
    call :error "Failed to create test directory"
    goto :cleanup
)

:: Copy package.json and package-lock.json to test directory
copy "package.json" "%TEST_DIR%\"
copy "package-lock.json" "%TEST_DIR%\"
if !errorlevel! neq 0 (
    call :error "Failed to copy files to test directory"
    goto :cleanup
)

:: Change to test directory and run npm ci
cd /d "%TEST_DIR%"
call :log "Testing npm ci installation in temporary directory..."

npm ci
if !errorlevel! neq 0 (
    call :error "npm ci failed - lockfile may not be reproducible"
    goto :cleanup
)

call :log "npm ci completed successfully"
echo.

:: Phase 5: Run security audit
call :log "Phase 5: Running security audit..."

cd /d "%~dp0"
npm audit
set AUDIT_EXIT_CODE=!errorlevel!

if !AUDIT_EXIT_CODE! equ 0 (
    call :log "Security audit passed - no vulnerabilities found"
) else if !AUDIT_EXIT_CODE! equ 1 (
    call :log "Security audit completed with vulnerabilities - review recommended"
) else (
    call :error "Security audit failed"
    goto :cleanup
)

echo.

:: Phase 6: Dependency compatibility check
call :log "Phase 6: Checking dependency compatibility..."

:: Check for critical dependencies
call :log "Checking Hardhat version..."
npm list hardhat
if !errorlevel! neq 0 (
    call :error "Hardhat not found in dependencies"
    goto :cleanup
)

call :log "Checking ethers version..."
npm list ethers
if !errorlevel! neq 0 (
    call :error "ethers not found in dependencies"
    goto :cleanup
)

call :log "Checking wagmi version..."
npm list wagmi
if !errorlevel! neq 0 (
    call :log "Warning: wagmi not found in dependencies"
)

call :log "Checking viem version..."
npm list viem
if !errorlevel! neq 0 (
    call :log "Warning: viem not found in dependencies"
)

echo.

:: Phase 7: Generate dependency report
call :log "Phase 7: Generating dependency report..."

:: Create dependency report
echo # Dependency Report > dependency-report.md
echo Generated on: %date% %time% >> dependency-report.md
echo. >> dependency-report.md
echo ## Node.js Environment >> dependency-report.md
echo - Node.js: %NODE_VERSION% >> dependency-report.md
echo - npm: %NPM_VERSION% >> dependency-report.md
echo. >> dependency-report.md
echo ## Lockfile Information >> dependency-report.md
echo - package-lock.json size: %LOCKFILE_SIZE% bytes >> dependency-report.md
echo - Generated with: npm install --package-lock-only >> dependency-report.md
echo. >> dependency-report.md
echo ## Critical Dependencies >> dependency-report.md
npm list --depth=0 >> dependency-report.md 2>&1
echo. >> dependency-report.md
echo ## Security Audit Results >> dependency-report.md
if !AUDIT_EXIT_CODE! equ 0 (
    echo ✅ No vulnerabilities found >> dependency-report.md
) else (
    echo ⚠️ Vulnerabilities found - review recommended >> dependency-report.md
)

call :log "Dependency report generated: dependency-report.md"
echo.

:: Phase 8: CI/CD preparation
call :log "Phase 8: Preparing for CI/CD..."

:: Create .npmrc for CI environments
echo # CI/CD Configuration > .npmrc
echo package-lock=true >> .npmrc
echo save-exact=true >> .npmrc
echo audit-level=moderate >> .npmrc

call :log ".npmrc created for CI/CD environments"
echo.

:: Phase 9: Version pinning strategy
call :log "Phase 9: Reviewing version pinning strategy..."

:: Check for critical dependencies that should be pinned
call :log "Checking for critical dependencies that should be pinned..."

:: Create version pinning recommendations
echo # Version Pinning Recommendations > version-pinning.md
echo Generated on: %date% %time% >> version-pinning.md
echo. >> version-pinning.md
echo ## Critical Dependencies to Pin >> version-pinning.md
echo. >> version-pinning.md
echo ### Hardhat >> version-pinning.md
echo - Current: >> version-pinning.md
npm list hardhat >> version-pinning.md 2>&1
echo - Recommendation: Pin to exact version for reproducible builds >> version-pinning.md
echo. >> version-pinning.md
echo ### Ethers >> version-pinning.md
echo - Current: >> version-pinning.md
npm list ethers >> version-pinning.md 2>&1
echo - Recommendation: Pin to v5.8.0 for compatibility >> version-pinning.md
echo. >> version-pinning.md
echo ### Next.js >> version-pinning.md
echo - Current: >> version-pinning.md
npm list next >> version-pinning.md 2>&1
echo - Recommendation: Pin to exact version for stability >> version-pinning.md

call :log "Version pinning recommendations generated: version-pinning.md"
echo.

:: Cleanup
:cleanup
:: Remove test directory
if exist "%TEST_DIR%" (
    call :log "Cleaning up test directory..."
    rmdir /s /q "%TEST_DIR%"
)

:: Final summary
echo ========================================
echo Package Lock Generation Summary
echo ========================================
echo.

if !ERROR_COUNT! equ 0 (
    echo ✅ SUCCESS: Package lock generation completed successfully
    echo.
    echo Generated files:
    echo - package-lock.json (reproducible builds)
    echo - .npmrc (CI/CD configuration)
    echo - dependency-report.md (dependency analysis)
    echo - version-pinning.md (version recommendations)
    echo.
    echo Next steps:
    echo 1. Review dependency-report.md for any issues
    echo 2. Consider implementing version pinning recommendations
    echo 3. Test npm ci in clean environment
    echo 4. Commit package-lock.json to version control
    echo.
    echo ✅ System ready for reproducible builds
) else (
    echo ❌ FAILED: Package lock generation encountered !ERROR_COUNT! error(s)
    echo.
    echo Please review the errors above and fix them before proceeding.
    echo.
    echo Common solutions:
    echo - Ensure all dependencies are properly installed
    echo - Check for conflicting lock files
    echo - Verify Node.js and npm versions are compatible
    echo - Run 'npm cache clean --force' if needed
)

echo.
echo ========================================
pause

