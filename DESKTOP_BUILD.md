
# Desktop App Build Instructions

This project includes all the necessary configuration to build native desktop applications for macOS, Windows, and Linux using Electron.

## Quick Start

1. **Connect to GitHub** (if not already connected)
   - In Lovable, click the GitHub button
   - Follow the prompts to create a repository

2. **Clone and Build Locally**
   ```bash
   # Clone your repository
   git clone [your-repo-url]
   cd [your-repo-name]
   
   # Configure for desktop build
   node build-desktop.js
   
   # Install dependencies (including Electron)
   npm install
   
   # Build the web app first
   npm run build
   
   # Build desktop apps
   npm run build-electron-all  # All platforms
   # OR build individually:
   # npm run dist-mac     # macOS only
   # npm run dist-win     # Windows only  
   # npm run dist-linux   # Linux only
   ```

3. **Find Your Built Apps**
   - Built applications will be in the `dist-electron/` folder
   - Each platform will have its respective installer/app file

## Restore Web-Only Mode

After building desktop apps, restore the web-only configuration:

```bash
node restore-web.js
```

This removes Electron dependencies and scripts, returning `package.json` to its web-only state.

## GitHub Actions (Optional)

The project includes a GitHub Action workflow (`.github/workflows/build-desktop.yml`) that automatically builds desktop apps when you create a release tag:

1. Create a new release on GitHub with a tag like `v1.0.0`
2. The workflow will automatically build apps for all platforms
3. Built apps will be attached to the release

## File Structure

- `build-desktop.js` - Configures package.json for desktop builds
- `restore-web.js` - Restores web-only configuration
- `electron-package.json` - Electron-specific scripts and config
- `electron-builder.json` - Build configuration for each platform
- `public/electron.js` - Main Electron process file
- `.github/workflows/build-desktop.yml` - Automated build workflow

## Troubleshooting

- **Build fails**: Make sure you run `npm run build` (web build) before desktop build
- **Dependencies issue**: Run `node restore-web.js` then `node build-desktop.js` to reset
- **Icon missing**: Ensure the icon file exists at `public/lovable-uploads/3c38b6c8-23f1-4e72-bd31-5fcf258572d9.png`

## Notes

- The desktop app loads the built web application
- All web features work in the desktop version
- The app includes standard desktop menus and shortcuts
- Built apps are self-contained and don't require additional installation
