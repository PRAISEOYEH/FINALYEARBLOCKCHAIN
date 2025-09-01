@echo off
echo 🧹 Cleaning project...

REM Remove build and dependencies
if exist .next rmdir /s /q .next
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f /q package-lock.json

echo 📦 Reinstalling dependencies...
npm install

echo 🔧 Forcing Next.js SWC binary reinstall...
npm install next --force

echo 🚀 Starting Next.js dev server...
npm run dev
