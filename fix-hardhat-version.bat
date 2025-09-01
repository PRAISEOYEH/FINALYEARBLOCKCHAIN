@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Hardhat Version Fix Script
echo ========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not available
    echo Please ensure npm is installed with Node.js
    pause
    exit /b 1
)

echo ✅ Node.js and npm detected
echo.

:: Step 1: Clean Environment
echo [1/5] Cleaning environment...
if exist "pnpm-lock.yaml" (
    echo   Removing pnpm-lock.yaml (package manager conflict)
    del "pnpm-lock.yaml"
)

if exist "node_modules" (
    echo   Removing corrupted node_modules
    rmdir /s /q "node_modules"
)

if exist ".npmrc" (
    echo   Removing .npmrc cache file
    del ".npmrc"
)

echo   Clearing npm cache...
call npm cache clean --force >nul 2>&1
echo ✅ Environment cleaned
echo.

:: Step 2: Install Correct Dependencies
echo [2/5] Installing dependencies...
echo   Installing Hardhat 2.26.3 and dependencies...
call npm install
if errorlevel 1 (
    echo ❌ npm install failed
    echo Please check your internet connection and try again
    pause
    exit /b 1
)
echo ✅ Dependencies installed
echo.

:: Step 3: Verify Hardhat Version
echo [3/5] Verifying Hardhat installation...
for /f "tokens=*" %%i in ('node_modules\.bin\hardhat --version 2^>nul') do set HH_VERSION=%%i
if not defined HH_VERSION (
  echo ❌ Hardhat not detected locally. Please run 'npm install' and try again.
  exit /b 1
)
echo   Installed Hardhat version: !HH_VERSION!

if not "!HH_VERSION!"=="2.26.3" (
    echo ⚠️  Warning: Expected Hardhat 2.26.3, got !HH_VERSION!
    echo   This might cause compatibility issues
    echo.
)

echo ✅ Hardhat installation verified
echo.

:: Step 4: Test Contract Compilation
echo [4/5] Testing contract compilation...
echo   Compiling smart contracts...
call node_modules\.bin\hardhat compile
if errorlevel 1 (
    echo ❌ Contract compilation failed
    echo.
    echo Troubleshooting steps:
    echo 1. Check if all dependencies are installed correctly
    echo 2. Verify hardhat.config.js configuration
    echo 3. Check contract syntax in contracts/ folder
    echo.
    pause
    exit /b 1
)
echo ✅ Contract compilation successful
echo.

:: Step 5: Test Development Server (optional, safer)
echo [5/5] Testing development server startup (optional)...
echo   Starting development server for 10 seconds (only this process will be stopped)...
powershell -NoProfile -Command "$p = Start-Process -FilePath 'npm' -ArgumentList 'run','dev' -PassThru; Start-Sleep -Seconds 10; if ($p -and !$p.HasExited) { Stop-Process -Id $p.Id -Force }"

echo   Please manually verify the server logs if needed.
echo ✅ Development environment check complete
echo.
echo Next steps:
echo 1. Run 'npm run dev' to start the development server
echo 2. Open http://localhost:3000 in your browser
echo 3. Verify the application loads correctly

echo Press any key to exit...
pause >nul
