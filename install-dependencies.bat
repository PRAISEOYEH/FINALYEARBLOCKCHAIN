@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   QUICK DEPENDENCY INSTALLATION
echo   University Voting Blockchain Project
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

call :print %BLUE% "Step 1: Removing conflicting files..."

:: Remove pnpm lockfile if it exists
if exist "pnpm-lock.yaml" (
    del "pnpm-lock.yaml"
    call :print %YELLOW% "✓ Removed pnpm-lock.yaml"
)

:: Remove yarn lockfile if it exists
if exist "yarn.lock" (
    del "yarn.lock"
    call :print %YELLOW% "✓ Removed yarn.lock"
)

echo.
call :print %BLUE% "Step 2: Installing dependencies..."

:: Install dependencies with npm
call :print %YELLOW% "Installing npm dependencies..."
npm install --force

if errorlevel 1 (
    call :print %RED% "ERROR: Failed to install dependencies"
    call :print %YELLOW% "Trying alternative installation method..."
    
    :: Clean cache and try again
    npm cache clean --force
    npm install --force --no-optional
    
    if errorlevel 1 (
        call :print %RED% "ERROR: Dependency installation failed"
        call :print %YELLOW% "Please check your internet connection and try again"
        pause
        exit /b 1
    )
)

call :print %GREEN% "✓ Dependencies installed successfully"

echo.
call :print %BLUE% "Step 3: Testing Hardhat installation..."

:: Test if Hardhat is available
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
call :print %BLUE% "Step 4: Testing key dependencies..."

:: Test Next.js
npx next --version >nul 2>&1
if errorlevel 1 (
    call :print %RED% "ERROR: Next.js is not available"
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npx next --version') do set NEXT_VERSION=%%i
call :print %GREEN% "✓ Next.js version: %NEXT_VERSION%"

:: Test if node_modules exists and has content
if not exist "node_modules" (
    call :print %RED% "ERROR: node_modules directory was not created"
    pause
    exit /b 1
)

call :print %GREEN% "✓ node_modules directory exists"

echo.
call :print %GREEN% "========================================"
call :print %GREEN% "✓ Dependency installation complete!"
call :print %GREEN% "========================================"
echo.
call :print %BLUE% "Next steps:"
echo   1. Run 'hardhat compile' to compile contracts
echo   2. Run 'npm run dev' to start development server
echo   3. Open http://localhost:3000 in your browser
echo.
call :print %YELLOW% "Available commands:"
echo   npm run dev              - Start development server
echo   npm run dev:no-contracts - Start dev server without contracts
echo   npm run hh:compile       - Compile contracts only
echo   npm run hh:test          - Run contract tests
echo   npm run fix:deps         - Clean and reinstall dependencies
echo.

pause
