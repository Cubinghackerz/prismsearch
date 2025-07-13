
# Desktop App Downloads

This folder should contain the built desktop applications for direct download.

## Required Files

After building your desktop apps locally, upload these files here:

- `Prism-Search-1.0.0.dmg` - macOS installer
- `Prism-Search-Setup-1.0.0.exe` - Windows installer  
- `Prism-Search-1.0.0.AppImage` - Linux AppImage

## How to Build

1. Export your project to GitHub
2. Clone locally and run:
   ```bash
   node build-desktop.js
   npm install
   npm run build
   npm run build-electron-all
   ```
3. Copy files from `dist-electron/` to this `public/downloads/` folder
4. The download buttons will then work for users

## File Naming Convention

Make sure the filenames match exactly what's specified in the DesktopDownloads component:
- Mac: `Prism-Search-1.0.0.dmg`
- Windows: `Prism-Search-Setup-1.0.0.exe`
- Linux: `Prism-Search-1.0.0.AppImage`
