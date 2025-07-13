
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read the main package.json
const mainPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const electronPackage = JSON.parse(fs.readFileSync('electron-package.json', 'utf8'));

// Merge the electron scripts and config into the main package.json
mainPackage.main = electronPackage.main;
mainPackage.homepage = electronPackage.homepage;
mainPackage.scripts = { ...mainPackage.scripts, ...electronPackage.scripts };

// Write the updated package.json
fs.writeFileSync('package.json', JSON.stringify(mainPackage, null, 2));

console.log('✅ Desktop build configuration updated!');
console.log('\nTo build desktop apps:');
console.log('1. Run: npm install (to install new dependencies)');
console.log('2. For Mac: npm run dist-mac');
console.log('3. For Windows: npm run dist-win');
console.log('4. For Linux: npm run dist-linux');
console.log('5. For all platforms: npm run build-electron-all');
