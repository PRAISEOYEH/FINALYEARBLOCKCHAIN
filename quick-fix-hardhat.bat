@echo off
setlocal enabledelayedexpansion
echo ========================================
echo    Quick Hardhat Fix
echo ========================================
echo.

:: Check prerequisites
echo Checking prerequisites...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm not found. Please ensure npm is installed.
    pause
    exit /b 1
)

echo ✅ Prerequisites OK
echo.

:: Step 1: Remove conflicting files
echo [1/4] Removing conflicting files...
if exist "pnpm-lock.yaml" (
    echo   Removing pnpm-lock.yaml
    del "pnpm-lock.yaml"
)

if exist ".npmrc" (
    echo   Removing .npmrc
    del ".npmrc"
)

echo ✅ Cleaned conflicting files
echo.

:: Step 2: Install dependencies
echo [2/4] Installing dependencies...
echo   This may take a few minutes...
call npm install
if errorlevel 1 (
    echo ❌ Installation failed. Check your internet connection.
    echo.
    echo Try running: npm cache clean --force
    echo Then run this script again.
    pause
    exit /b 1
)
echo ✅ Dependencies installed
echo.

:: Step 3: Verify Hardhat
echo [3/4] Verifying Hardhat installation...
for /f "tokens=*" %%i in ('node_modules\.bin\hardhat --version 2^>nul') do set VERSION=%%i
echo   Hardhat version: !VERSION!

if not "!VERSION!"=="2.26.3" (
    echo ⚠️  Warning: Expected 2.26.3, got !VERSION!
    echo   This might cause issues.
    echo.
)

echo ✅ Hardhat verified
echo.

:: Step 4: Test compilation
echo [4/4] Testing compilation...
call node_modules\.bin\hardhat compile
if errorlevel 1 (
    echo ❌ Compilation failed
    echo.
    echo Troubleshooting:
    echo 1. Check contracts/ folder for syntax errors
    echo 2. Verify hardhat.config.js configuration
    echo 3. Run 'npm run clean:deps && npm install' for fresh install
    echo.
    pause
    exit /b 1
)
echo ✅ Compilation successful
echo.

:: Success message
echo ========================================
echo    ✅ Fix completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Run 'npm run dev' to start development
echo 2. Run 'npm run test:contracts' to test contracts
echo 3. Set .env PRIVATE_KEY for deployment
echo.
echo If you have issues:
echo - Check hardhat-esm-fix-guide.md for detailed help
echo - Run 'npm run install:clean' for fresh install
echo.
pause
