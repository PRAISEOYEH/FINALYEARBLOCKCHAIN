@echo off
echo ========================================
echo Vercel Deployment Script for Voting DApp
echo ========================================
echo.

echo [1/6] Checking current directory...
if not exist "package.json" (
    echo ERROR: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)
echo ✓ Found package.json in current directory
echo.

echo [2/6] Installing dependencies...
call npm install --force
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed successfully
echo.

echo [3/6] Compiling smart contracts...
call npm run compile:contracts
if %errorlevel% neq 0 (
    echo ERROR: Failed to compile contracts
    pause
    exit /b 1
)
echo ✓ Contracts compiled successfully
echo.

echo [4/6] Building project locally...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build project
    pause
    exit /b 1
)
echo ✓ Project built successfully
echo.

echo [5/6] Checking Vercel CLI...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    call npm install -g vercel
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install Vercel CLI
        pause
        exit /b 1
    )
)
echo ✓ Vercel CLI is available
echo.

echo [6/6] Starting Vercel deployment...
echo.
echo IMPORTANT: When prompted for the code directory, enter: .
echo (just a dot, not the full path)
echo.
echo Press any key to continue with deployment...
pause >nul

vercel

echo.
echo ========================================
echo Deployment process completed!
echo ========================================
echo.
echo If deployment was successful, you can:
echo 1. Visit your deployment URL
echo 2. Run 'vercel --prod' to deploy to production
echo 3. Check logs with 'vercel logs'
echo.
pause
