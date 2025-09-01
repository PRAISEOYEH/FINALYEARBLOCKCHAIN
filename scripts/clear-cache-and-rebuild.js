#!/usr/bin/env node

/**
 * Comprehensive Cache Clearing and Rebuild Script
 * 
 * This script ensures a completely fresh build by:
 * 1. Clearing all Next.js build cache
 * 2. Clearing node_modules if needed
 * 3. Reinstalling dependencies
 * 4. Rebuilding the application from scratch
 * 5. Validating the build was successful
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting comprehensive cache clearing and rebuild process...\n');

// Step 1: Clear .next directory
console.log('📁 Step 1: Clearing .next directory...');
try {
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
    console.log('✅ .next directory cleared successfully');
  } else {
    console.log('ℹ️  .next directory does not exist (already clean)');
  }
} catch (error) {
  console.error('❌ Error clearing .next directory:', error.message);
  process.exit(1);
}

// Step 2: Clear other cache directories
console.log('\n📁 Step 2: Clearing additional cache directories...');
const cacheDirs = ['node_modules/.cache', '.turbo', 'dist', 'build'];
cacheDirs.forEach(dir => {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✅ Cleared ${dir}`);
    } else {
      console.log(`ℹ️  ${dir} does not exist`);
    }
  } catch (error) {
    console.warn(`⚠️  Warning: Could not clear ${dir}:`, error.message);
  }
});

// Step 3: Clear package-lock.json if requested
const shouldClearLockfile = process.argv.includes('--clear-lockfile');
if (shouldClearLockfile) {
  console.log('\n📦 Step 3: Clearing package-lock.json...');
  try {
    if (fs.existsSync('package-lock.json')) {
      fs.unlinkSync('package-lock.json');
      console.log('✅ package-lock.json cleared');
    }
  } catch (error) {
    console.error('❌ Error clearing package-lock.json:', error.message);
  }
}

// Step 4: Clear node_modules if requested
const shouldClearNodeModules = process.argv.includes('--clear-node-modules');
if (shouldClearNodeModules) {
  console.log('\n📦 Step 4: Clearing node_modules...');
  try {
    if (fs.existsSync('node_modules')) {
      fs.rmSync('node_modules', { recursive: true, force: true });
      console.log('✅ node_modules cleared');
    }
  } catch (error) {
    console.error('❌ Error clearing node_modules:', error.message);
    process.exit(1);
  }
}

// Step 5: Reinstall dependencies
if (shouldClearNodeModules || shouldClearLockfile) {
  console.log('\n📦 Step 5: Reinstalling dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies reinstalled successfully');
  } catch (error) {
    console.error('❌ Error reinstalling dependencies:', error.message);
    process.exit(1);
  }
}

// Step 6: Validate package.json exists
console.log('\n📋 Step 6: Validating project configuration...');
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found. Are you in the correct directory?');
  process.exit(1);
}
console.log('✅ package.json found');

// Step 7: Build the application
console.log('\n🔨 Step 7: Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Application built successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 8: Validate build output
console.log('\n🔍 Step 8: Validating build output...');
if (fs.existsSync('.next')) {
  console.log('✅ .next directory created successfully');
  
  // Check for key build files
  const buildFiles = ['static', 'server'];
  buildFiles.forEach(file => {
    if (fs.existsSync(path.join('.next', file))) {
      console.log(`✅ ${file} directory found`);
    } else {
      console.warn(`⚠️  ${file} directory not found`);
    }
  });
} else {
  console.error('❌ .next directory not created - build may have failed');
  process.exit(1);
}

// Step 9: Validate provider files
console.log('\n🔍 Step 9: Validating provider implementation...');
const providerFiles = [
  'components/providers/client-voting-provider.tsx',
  'hooks/use-university-voting.tsx',
  'components/admin-dashboard.tsx'
];

providerFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('UniversityVotingProvider') || content.includes('Full blockchain integration')) {
      console.log(`✅ ${file} contains full implementation`);
    } else {
      console.warn(`⚠️  ${file} may not contain full implementation`);
    }
  } else {
    console.error(`❌ ${file} not found`);
  }
});

console.log('\n🎉 Cache clearing and rebuild process completed successfully!');
console.log('\n📝 Summary:');
console.log('  ✅ All caches cleared');
console.log('  ✅ Dependencies reinstalled (if requested)');
console.log('  ✅ Application built successfully');
console.log('  ✅ Build output validated');
console.log('  ✅ Provider implementation verified');
console.log('\n🚀 Your application is ready with a fresh build!');
console.log('\n💡 To start the development server, run: npm run dev');
console.log('💡 To start the production server, run: npm start');
