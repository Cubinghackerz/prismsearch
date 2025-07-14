import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Monitor, Apple, HardDrive, ExternalLink } from "lucide-react";
const DesktopDownloads = () => {
  const downloads = [{
    icon: <Apple className="w-6 h-6" />,
    title: "Download for macOS",
    description: "Compatible with Intel and Apple Silicon Macs",
    fileType: "DMG",
    fileName: "Prism-Search-1.0.0-arm64.dmg",
    size: "~85 MB",
    platform: "mac",
    downloadUrl: "#",
    altDownloadUrl: "#",
    altFileName: "Prism-Search-1.0.0.dmg"
  }, {
    icon: <Monitor className="w-6 h-6" />,
    title: "Download for Windows",
    description: "Windows 10 and 11 compatible",
    fileType: "EXE",
    fileName: "Prism-Search-Setup-1.0.0.exe",
    size: "~92 MB",
    platform: "win",
    downloadUrl: "#"
  }, {
    icon: <HardDrive className="w-6 h-6" />,
    title: "Download for Linux",
    description: "Universal AppImage for all distributions",
    fileType: "AppImage",
    fileName: "Prism-Search-1.0.0.AppImage",
    size: "~88 MB",
    platform: "linux",
    downloadUrl: "#"
  }];
  const handleDownload = (download: any) => {
    // For now, show a notification that desktop apps are coming soon
    alert(`Desktop app for ${download.platform === 'mac' ? 'macOS' : download.platform === 'win' ? 'Windows' : 'Linux'} is coming soon! 
    
To build your own desktop version:
1. Connect this project to GitHub
2. Follow the build instructions in the README
3. Use the provided build scripts`);
  };
  const handleViewInstructions = () => {
    // Show build instructions
    alert(`To build desktop apps:

1. Connect your project to GitHub
2. Clone the repository locally  
3. Run: node build-desktop.js
4. Run: npm install
5. Run: npm run build
6. Run: npm run build-electron-all

The built apps will be in the dist-electron/ folder.`);
  };
  return;
};
export default DesktopDownloads;