@echo off
echo ========================================
echo Preparing Project for Vercel Deployment
echo ========================================
echo.

echo [1/5] Checking project structure...
if not exist "package.json" (
    echo ERROR: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)
echo ✓ Found package.json
echo.

echo [2/5] Creating environment variables for Vercel...
echo Creating .env.local file with deployment variables...

(
echo # Vercel Deployment Environment Variables
echo NEXT_PUBLIC_CHAIN_ID=84532
echo NEXT_PUBLIC_CONTRACT_ADDRESS=0xAEa1F2693C0cB46AA0675b8c63cA8DD0AA4006f0
echo NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
echo NEXT_PUBLIC_USE_BLOCKCHAIN=true
echo NEXT_PUBLIC_APP_NAME=University Voting DApp
echo.
echo # Note: These variables are already configured in vercel.json
echo # No additional environment setup required for deployment
) > .env.local

echo ✓ Environment variables created
echo.

echo [3/5] Installing dependencies...
call npm install --force
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

echo [4/5] Compiling smart contracts...
call npm run compile:contracts
if %errorlevel% neq 0 (
    echo ERROR: Failed to compile contracts
    pause
    exit /b 1
)
echo ✓ Contracts compiled
echo.

echo [5/5] Testing build process...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed. Please fix issues before deploying.
    pause
    exit /b 1
)
echo ✓ Build successful
echo.

echo ========================================
echo Project is ready for Vercel deployment!
echo ========================================
echo.
echo Next steps:
echo 1. Run 'vercel' to start deployment
echo 2. When asked for code directory, enter: .
echo 3. Follow the prompts to complete deployment
echo.
echo Environment variables are configured in vercel.json
echo No additional setup required.
echo.
pause
