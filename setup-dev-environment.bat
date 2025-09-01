@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   UNIVERSITY VOTING BLOCKCHAIN PROJECT
echo   Development Environment Setup Script
echo ========================================
echo.

:: Set colors for output
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "BLUE=[94m"
set "RESET=[0m"

:: Function to print colored output
:print
echo %~1%~2%RESET%
goto :eof

:: Check if we're in the right directory
if not exist "package.json" (
    call :print %RED% "ERROR: package.json not found. Please run this script from the project root directory."
    pause
    exit /b 1
)

call :print %BLUE% "Step 1: Checking current environment..."

:: Check Node.js version
node --version >nul 2>&1
if errorlevel 1 (
    call :print %RED% "ERROR: Node.js is not installed or not in PATH"
    call :print %YELLOW% "Please install Node.js from https://nodejs.org/"
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
call :print %GREEN% "✓ Node.js version: %NODE_VERSION%"

:: Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    call :print %RED% "ERROR: npm is not installed or not in PATH"
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
call :print %GREEN% "✓ npm version: %NPM_VERSION%"

echo.
call :print %BLUE% "Step 2: Cleaning up conflicting files..."

:: Remove conflicting lockfiles
if exist "pnpm-lock.yaml" (
    del "pnpm-lock.yaml"
    call :print %YELLOW% "✓ Removed pnpm-lock.yaml (using npm)"
)

if exist "yarn.lock" (
    del "yarn.lock"
    call :print %YELLOW% "✓ Removed yarn.lock (using npm)"
)

:: Clean node_modules if it exists and is corrupted
if exist "node_modules" (
    call :print %YELLOW% "Found existing node_modules, checking integrity..."
    npm ls --depth=0 >nul 2>&1
    if errorlevel 1 (
        call :print %YELLOW% "node_modules appears corrupted, removing..."
        rmdir /s /q "node_modules" 2>nul
        call :print %GREEN% "✓ Cleaned corrupted node_modules"
    ) else (
        call :print %GREEN% "✓ Existing node_modules is valid"
    )
)

echo.
call :print %BLUE% "Step 3: Installing dependencies..."

:: Install dependencies
call :print %YELLOW% "Installing npm dependencies (this may take a few minutes)..."
npm install --force

if errorlevel 1 (
    call :print %RED% "ERROR: Failed to install dependencies"
    call :print %YELLOW% "Trying alternative installation method..."
    npm cache clean --force
    npm install --force --no-optional
    if errorlevel 1 (
        call :print %RED% "ERROR: Dependency installation failed completely"
        call :print %YELLOW% "Please check your internet connection and try again"
        pause
        exit /b 1
    )
)

call :print %GREEN% "✓ Dependencies installed successfully"

echo.
call :print %BLUE% "Step 4: Verifying Hardhat installation..."

:: Test Hardhat availability
node_modules\.bin\hardhat --version >nul 2>&1
if errorlevel 1 (
    call :print %RED% "ERROR: Hardhat is not available after installation"
    call :print %YELLOW% "Trying to install Hardhat specifically..."
    npm install --save-dev hardhat@^2.26.3 --force
    node_modules\.bin\hardhat --version >nul 2>&1
    if errorlevel 1 (
        call :print %RED% "ERROR: Hardhat installation failed"
        pause
        exit /b 1
    )
)

for /f "tokens=*" %%i in ('node_modules\.bin\hardhat --version') do set HARDHAT_VERSION=%%i
call :print %GREEN% "✓ Hardhat version: %HARDHAT_VERSION%"

echo.
call :print %BLUE% "Step 5: Compiling smart contracts..."

:: Compile contracts
call :print %YELLOW% "Compiling smart contracts..."
node_modules\.bin\hardhat compile

if errorlevel 1 (
    call :print %RED% "ERROR: Contract compilation failed"
    call :print %YELLOW% "This might be due to missing OpenZeppelin contracts"
    call :print %YELLOW% "Installing OpenZeppelin contracts..."
    npm install --save @openzeppelin/contracts@^5.4.0 --force
    node_modules\.bin\hardhat compile
    if errorlevel 1 (
        call :print %RED% "ERROR: Contract compilation still failed"
        call :print %YELLOW% "Please check the contract files for syntax errors"
        pause
        exit /b 1
    )
)

call :print %GREEN% "✓ Smart contracts compiled successfully"

:: Generate ABI files if the script exists
if exist "scripts\generate-abi.js" (
    call :print %YELLOW% "Generating ABI files..."
    node scripts/generate-abi.js
    if errorlevel 1 (
        call :print %YELLOW% "Warning: ABI generation failed, but continuing..."
    ) else (
        call :print %GREEN% "✓ ABI files generated"
    )
)

echo.
call :print %BLUE% "Step 6: Testing development environment..."

:: Test Next.js configuration
call :print %YELLOW% "Testing Next.js configuration..."
npx next --version >nul 2>&1
if errorlevel 1 (
    call :print %RED% "ERROR: Next.js is not available"
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npx next --version') do set NEXT_VERSION=%%i
call :print %GREEN% "✓ Next.js version: %NEXT_VERSION%"

echo.
call :print %GREEN% "========================================"
call :print %GREEN% "✓ Development environment setup complete!"
call :print %GREEN% "========================================"
echo.
call :print %BLUE% "Available commands:"
echo   npm run dev              - Start development server
echo   npm run dev:no-contracts - Start dev server without contract compilation
echo   npm run hh:compile       - Compile contracts only
echo   npm run hh:test          - Run contract tests
echo   npm run hh:deploy:baseSepolia - Deploy to Base Sepolia
echo.
call :print %YELLOW% "Next steps:"
echo   1. Set up your .env file with PRIVATE_KEY for deployment
echo   2. Run 'npm run dev' to start the development server
echo   3. Open http://localhost:3000 in your browser
echo.
call :print %BLUE% "If you encounter any issues:"
echo   - Run 'npm run fix:deps' to clean and reinstall dependencies
echo   - Run 'npm run dev:force' for a complete setup and start
echo   - Check the hardhat-fix-guide.md for troubleshooting
echo.

pause
