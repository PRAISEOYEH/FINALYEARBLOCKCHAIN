@echo off
echo ========================================
echo   Next.js Development Server Fix Script
echo ========================================
echo.

echo [1/8] Checking current environment...
node --version
npm --version
echo.

echo [2/8] Stopping any running development servers...
taskkill /f /im node.exe 2>nul
echo.

echo [3/8] Cleaning all dependency files...
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json
)
if exist pnpm-lock.yaml (
    echo Removing pnpm-lock.yaml...
    del pnpm-lock.yaml
)
if exist .next (
    echo Removing .next build cache...
    rmdir /s /q .next
)
echo.

echo [4/8] Configuring npm for better compatibility...
npm config set registry https://registry.npmjs.org/
npm config set strict-ssl false
npm config set fetch-retries 3
npm config set fetch-retry-mintimeout 10000
npm config set fetch-retry-maxtimeout 60000
echo.

echo [5/8] Installing dependencies with npm...
echo Installing with --force to resolve conflicts...
npm install --force
if %errorlevel% neq 0 (
    echo Failed to install dependencies. Trying with legacy peer deps...
    npm install --legacy-peer-deps --force
)
echo.

echo [6/8] Fixing SWC binary issues...
echo Reinstalling Next.js to fix SWC binaries...
npm install next@latest --force
echo.

echo [7/8] Verifying installation...
echo Checking for critical dependencies...
npm list next
npm list @next/swc-win32-x64-msvc
echo.

echo [8/8] Testing development server startup...
echo Starting development server in safe mode...
echo.
echo ========================================
echo   Starting Development Server
echo ========================================
echo.
echo If the server starts successfully, you should see:
echo - "Ready - started server on 0.0.0.0:3000"
echo - "Local: http://localhost:3000"
echo.
echo If you encounter issues, try:
echo 1. npm run dev:safe
echo 2. npm run dev:legacy
echo 3. Check the troubleshooting guide: dev-server-troubleshooting.md
echo.
echo Press Ctrl+C to stop the server when done testing.
echo.

npm run dev:safe

pause
