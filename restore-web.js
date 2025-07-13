
import fs from 'fs';

console.log('🔧 Restoring web-only configuration...');

// Read current package.json
const currentPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Remove Electron-specific properties
delete currentPackage.main;
if (currentPackage.homepage === './') {
  delete currentPackage.homepage;
}
delete currentPackage.build;

// Remove Electron scripts
const electronScripts = [
  'electron',
  'electron-dev', 
  'build-electron',
  'build-electron-all',
  'dist-mac',
  'dist-win',
  'dist-linux'
];

electronScripts.forEach(script => {
  if (currentPackage.scripts && currentPackage.scripts[script]) {
    delete currentPackage.scripts[script];
  }
});

// Remove Electron dependencies
const electronDeps = [
  'electron',
  'electron-builder',
  'concurrently',
  'wait-on'
];

electronDeps.forEach(dep => {
  if (currentPackage.devDependencies && currentPackage.devDependencies[dep]) {
    delete currentPackage.devDependencies[dep];
  }
});

// Write the cleaned package.json
fs.writeFileSync('package.json', JSON.stringify(currentPackage, null, 2));

console.log('✅ Web-only configuration restored!');
console.log('Electron dependencies removed from package.json');
