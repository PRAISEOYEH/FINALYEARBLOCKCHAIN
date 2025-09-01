@echo off
setlocal enabledelayedexpansion

:: =============================================================================
:: Master Lockfile Workflow Execution Script
:: =============================================================================
:: This script orchestrates the complete lockfile generation and validation workflow
:: according to the user's requirements for reproducible installations and security.

echo.
echo =============================================================================
echo MASTER LOCKFILE WORKFLOW EXECUTION
echo =============================================================================
echo Starting comprehensive lockfile generation and validation workflow...
echo.

:: Phase 1: Pre-execution Environment Check
echo [PHASE 1] Pre-execution Environment Check
echo ============================================

:: Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js and ensure it's available in your PATH
    pause
    exit /b 1
)

:: Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed or not in PATH
    echo Please install npm and ensure it's available in your PATH
    pause
    exit /b 1
)

:: Display Node.js and npm versions
echo [INFO] Node.js version:
node --version
echo [INFO] npm version:
npm --version
echo.

:: Check if package.json exists
if not exist "package.json" (
    echo [ERROR] package.json not found in current directory
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

:: Check if we're in the correct directory (should contain package.json and other project files)
if not exist "hardhat.config.js" (
    echo [WARNING] hardhat.config.js not found - may not be in project root
)

echo [SUCCESS] Environment prerequisites validated
echo.

:: Clear previous execution artifacts
echo [INFO] Clearing previous execution artifacts...
if exist "lockfile-execution-report.md" del "lockfile-execution-report.md"
if exist "npm-ci-validation-results.json" del "npm-ci-validation-results.json"
if exist "security-audit-results.json" del "security-audit-results.json"
if exist "dependency-lock-validation.json" del "dependency-lock-validation.json"
echo [SUCCESS] Previous artifacts cleared
echo.

:: Phase 2: Execute generate-lockfile.bat
echo [PHASE 2] Execute generate-lockfile.bat
echo ======================================

if not exist "generate-lockfile.bat" (
    echo [ERROR] generate-lockfile.bat not found
    echo This script is required for lockfile generation
    pause
    exit /b 1
)

echo [INFO] Executing generate-lockfile.bat...
call generate-lockfile.bat
set GENERATE_EXIT_CODE=%errorlevel%

if %GENERATE_EXIT_CODE% neq 0 (
    echo [ERROR] generate-lockfile.bat failed with exit code %GENERATE_EXIT_CODE%
    echo Please review the output above and fix any issues
    pause
    exit /b %GENERATE_EXIT_CODE%
)

echo [SUCCESS] generate-lockfile.bat completed successfully
echo.

:: Verify package-lock.json was created
if not exist "package-lock.json" (
    echo [ERROR] package-lock.json was not created by generate-lockfile.bat
    pause
    exit /b 1
)

echo [SUCCESS] package-lock.json verified
echo.

:: Phase 3: Reproducible Installation Testing
echo [PHASE 3] Reproducible Installation Testing
echo ===========================================

if not exist "scripts\validate-npm-ci.js" (
    echo [ERROR] validate-npm-ci.js not found in scripts directory
    echo This script is required for npm ci validation
    pause
    exit /b 1
)

echo [INFO] Running npm ci validation tests...
node scripts\validate-npm-ci.js
set NPM_CI_EXIT_CODE=%errorlevel%

if %NPM_CI_EXIT_CODE% neq 0 (
    echo [ERROR] npm ci validation failed with exit code %NPM_CI_EXIT_CODE%
    echo Please review the validation results and fix any issues
    pause
    exit /b %NPM_CI_EXIT_CODE%
)

echo [SUCCESS] npm ci validation completed successfully
echo.

:: Phase 4: Security Audit Execution
echo [PHASE 4] Security Audit Execution
echo ==================================

if not exist "scripts\security-audit-analyzer.js" (
    echo [ERROR] security-audit-analyzer.js not found in scripts directory
    echo This script is required for security audit analysis
    pause
    exit /b 1
)

echo [INFO] Running comprehensive security audit analysis...
node scripts\security-audit-analyzer.js
set SECURITY_EXIT_CODE=%errorlevel%

if %SECURITY_EXIT_CODE% neq 0 (
    echo [ERROR] Security audit analysis failed with exit code %SECURITY_EXIT_CODE%
    echo Please review the security results and address any critical issues
    pause
    exit /b %SECURITY_EXIT_CODE%
)

echo [SUCCESS] Security audit analysis completed successfully
echo.

:: Phase 5: Dependency Lock Verification
echo [PHASE 5] Dependency Lock Verification
echo ======================================

if not exist "scripts\dependency-lock-validator.js" (
    echo [ERROR] dependency-lock-validator.js not found in scripts directory
    echo This script is required for dependency lock validation
    pause
    exit /b 1
)

echo [INFO] Running dependency lock validation...
node scripts\dependency-lock-validator.js
set LOCK_VALIDATION_EXIT_CODE=%errorlevel%

if %LOCK_VALIDATION_EXIT_CODE% neq 0 (
    echo [ERROR] Dependency lock validation failed with exit code %LOCK_VALIDATION_EXIT_CODE%
    echo Please review the validation results and fix any issues
    pause
    exit /b %LOCK_VALIDATION_EXIT_CODE%
)

echo [SUCCESS] Dependency lock validation completed successfully
echo.

:: Phase 6: Comprehensive Reporting
echo [PHASE 6] Comprehensive Reporting
echo =================================

echo [INFO] Generating unified execution report...

:: Create execution report
echo # Lockfile Workflow Execution Report > lockfile-execution-report.md
echo. >> lockfile-execution-report.md
echo **Generated:** %date% %time% >> lockfile-execution-report.md
echo **Node.js Version:** >> lockfile-execution-report.md
node --version >> lockfile-execution-report.md
echo **npm Version:** >> lockfile-execution-report.md
npm --version >> lockfile-execution-report.md
echo. >> lockfile-execution-report.md

:: Add phase results
echo ## Phase Results >> lockfile-execution-report.md
echo. >> lockfile-execution-report.md
echo | Phase | Status | Exit Code | >> lockfile-execution-report.md
echo |-------|--------|-----------| >> lockfile-execution-report.md
echo | Environment Check | PASS | 0 | >> lockfile-execution-report.md
echo | Lockfile Generation | %GENERATE_EXIT_CODE% | %GENERATE_EXIT_CODE% | >> lockfile-execution-report.md
echo | npm ci Validation | %NPM_CI_EXIT_CODE% | %NPM_CI_EXIT_CODE% | >> lockfile-execution-report.md
echo | Security Audit | %SECURITY_EXIT_CODE% | %SECURITY_EXIT_CODE% | >> lockfile-execution-report.md
echo | Lock Validation | %LOCK_VALIDATION_EXIT_CODE% | %LOCK_VALIDATION_EXIT_CODE% | >> lockfile-execution-report.md
echo. >> lockfile-execution-report.md

:: Determine overall status
set OVERALL_STATUS=FAIL
if %GENERATE_EXIT_CODE% equ 0 if %NPM_CI_EXIT_CODE% equ 0 if %SECURITY_EXIT_CODE% equ 0 if %LOCK_VALIDATION_EXIT_CODE% equ 0 (
    set OVERALL_STATUS=PASS
)

echo ## Overall Status: %OVERALL_STATUS% >> lockfile-execution-report.md
echo. >> lockfile-execution-report.md

:: Add detailed results if available
if exist "npm-ci-validation-results.json" (
    echo ## npm ci Validation Results >> lockfile-execution-report.md
    echo See npm-ci-validation-results.json for detailed results >> lockfile-execution-report.md
    echo. >> lockfile-execution-report.md
)

if exist "security-audit-results.json" (
    echo ## Security Audit Results >> lockfile-execution-report.md
    echo See security-audit-results.json for detailed results >> lockfile-execution-report.md
    echo. >> lockfile-execution-report.md
)

if exist "dependency-lock-validation.json" (
    echo ## Dependency Lock Validation Results >> lockfile-execution-report.md
    echo See dependency-lock-validation.json for detailed results >> lockfile-execution-report.md
    echo. >> lockfile-execution-report.md
)

echo [SUCCESS] Unified execution report generated: lockfile-execution-report.md
echo.

:: Final summary
echo =============================================================================
echo WORKFLOW EXECUTION COMPLETE
echo =============================================================================
echo.
echo Overall Status: %OVERALL_STATUS%
echo.
echo Generated Files:
echo - lockfile-execution-report.md (comprehensive execution report)
if exist "npm-ci-validation-results.json" echo - npm-ci-validation-results.json (npm ci validation details)
if exist "security-audit-results.json" echo - security-audit-results.json (security audit details)
if exist "dependency-lock-validation.json" echo - dependency-lock-validation.json (lock validation details)
echo.
echo Next Steps:
if %OVERALL_STATUS% equ PASS (
    echo ✓ All validation phases completed successfully
    echo ✓ Lockfile workflow is ready for production use
    echo ✓ Review generated reports for detailed information
) else (
    echo ✗ Some validation phases failed
    echo ✗ Review the output above and generated reports
    echo ✗ Address any issues before proceeding with production deployment
)
echo.
echo =============================================================================

pause
