
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up desktop build configuration...');

// Read the main package.json
const mainPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const electronPackage = JSON.parse(fs.readFileSync('electron-package.json', 'utf8'));

// Create a backup of the original package.json
fs.writeFileSync('package.json.backup', JSON.stringify(mainPackage, null, 2));

// Merge the electron scripts and config into the main package.json
mainPackage.main = electronPackage.main;
mainPackage.homepage = electronPackage.homepage;
mainPackage.scripts = { ...mainPackage.scripts, ...electronPackage.scripts };

// Add Electron dependencies
mainPackage.devDependencies = {
  ...mainPackage.devDependencies,
  "electron": "^37.2.1",
  "electron-builder": "^26.0.12",
  "concurrently": "^9.2.0",
  "wait-on": "^8.0.3"
};

// Add electron-builder configuration
mainPackage.build = JSON.parse(fs.readFileSync('electron-builder.json', 'utf8'));

// Write the updated package.json
fs.writeFileSync('package.json', JSON.stringify(mainPackage, null, 2));

console.log('✅ Desktop build configuration updated!');
console.log('\nTo build desktop apps:');
console.log('1. Run: npm install (to install Electron dependencies)');
console.log('2. Run: npm run build (to build the web app first)');
console.log('3. For Mac: npm run dist-mac');
console.log('4. For Windows: npm run dist-win');
console.log('5. For Linux: npm run dist-linux');
console.log('6. For all platforms: npm run build-electron-all');
console.log('\nTo restore web-only configuration:');
console.log('7. Run: node restore-web.js');
