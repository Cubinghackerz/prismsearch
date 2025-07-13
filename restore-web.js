
const fs = require('fs');

console.log('🔧 Restoring web-only configuration...');

// Check if backup exists
if (fs.existsSync('package.json.backup')) {
  // Restore the original package.json
  const originalPackage = fs.readFileSync('package.json.backup', 'utf8');
  fs.writeFileSync('package.json', originalPackage);
  
  // Remove the backup
  fs.unlinkSync('package.json.backup');
  
  console.log('✅ Web-only configuration restored!');
  console.log('Run: npm install (to clean up Electron dependencies)');
} else {
  console.log('❌ No backup found. Cannot restore original configuration.');
}
