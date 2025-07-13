
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Monitor, Apple, HardDrive } from "lucide-react";

const DesktopDownloads = () => {
  const downloads = [
    {
      icon: <Apple className="w-6 h-6" />,
      title: "Download for macOS",
      description: "Compatible with Intel and Apple Silicon Macs",
      fileType: "DMG",
      fileName: "Prism-Search-1.0.0-arm64.dmg",
      size: "~85 MB",
      platform: "mac",
      downloadUrl: "https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/releases/latest/download/Prism-Search-1.0.0-arm64.dmg",
      altDownloadUrl: "https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/releases/latest/download/Prism-Search-1.0.0.dmg",
      altFileName: "Prism-Search-1.0.0.dmg"
    },
    {
      icon: <Monitor className="w-6 h-6" />,
      title: "Download for Windows",
      description: "Windows 10 and 11 compatible",
      fileType: "EXE",
      fileName: "Prism-Search-Setup-1.0.0.exe",
      size: "~92 MB",
      platform: "win",
      downloadUrl: "https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/releases/latest/download/Prism-Search-Setup-1.0.0.exe"
    },
    {
      icon: <HardDrive className="w-6 h-6" />,
      title: "Download for Linux",
      description: "Universal AppImage for all distributions",
      fileType: "AppImage",
      fileName: "Prism-Search-1.0.0.AppImage",
      size: "~88 MB",
      platform: "linux",
      downloadUrl: "https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/releases/latest/download/Prism-Search-1.0.0.AppImage"
    }
  ];

  const handleDownload = (downloadUrl: string, fileName: string) => {
    // Open download in new tab to trigger GitHub release download
    window.open(downloadUrl, '_blank');
  };

  const handleMacDownload = (download: any) => {
    // For Mac, show both Intel and Apple Silicon options
    const userAgent = navigator.userAgent.toLowerCase();
    const isAppleSilicon = userAgent.includes('mac') && (userAgent.includes('arm') || userAgent.includes('apple silicon'));
    
    if (isAppleSilicon) {
      handleDownload(download.downloadUrl, download.fileName);
    } else {
      // Show both options or default to Intel version
      handleDownload(download.altDownloadUrl || download.downloadUrl, download.altFileName || download.fileName);
    }
  };

  return (
    <div className="mb-16">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Download className="w-8 h-8 text-prism-primary mr-3" />
          <h2 className="text-3xl font-bold text-prism-text">
            Download Desktop App
          </h2>
        </div>
        <p className="text-lg text-prism-text-muted max-w-2xl mx-auto">
          Get the full Prism experience with our native desktop applications. 
          All features work offline with enhanced performance.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {downloads.map((download, index) => (
          <Card 
            key={index} 
            className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-prism-border/50 bg-prism-surface/30 backdrop-blur-sm"
          >
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-prism-primary to-prism-accent rounded-xl flex items-center justify-center text-white">
                  {download.icon}
                </div>
              </div>
              <CardTitle className="text-xl font-semibold text-prism-text group-hover:text-prism-primary transition-colors">
                {download.title}
              </CardTitle>
              <CardDescription className="text-prism-text-muted">
                {download.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-4">
                <div className="text-sm text-prism-text-muted mb-1">
                  File: {download.fileName}
                </div>
                <div className="text-sm text-prism-text-muted">
                  Size: {download.size}
                </div>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-prism-primary to-prism-accent hover:from-prism-primary-dark hover:to-prism-accent-dark text-white font-semibold shadow-lg group-hover:shadow-xl transition-all duration-300"
                onClick={() => download.platform === 'mac' ? handleMacDownload(download) : handleDownload(download.downloadUrl, download.fileName)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download {download.fileType}
              </Button>
              {download.platform === 'mac' && download.altDownloadUrl && (
                <Button 
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 text-xs"
                  onClick={() => handleDownload(download.altDownloadUrl!, download.altFileName!)}
                >
                  Intel Mac Version
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <div className="bg-prism-surface/50 rounded-lg p-6 border border-prism-border/30">
          <h3 className="text-lg font-semibold text-prism-text mb-2">
            System Requirements
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-prism-text-muted">
            <div>
              <strong className="text-prism-text">macOS:</strong> 10.15 or later
            </div>
            <div>
              <strong className="text-prism-text">Windows:</strong> Windows 10/11 (64-bit)
            </div>
            <div>
              <strong className="text-prism-text">Linux:</strong> Most distributions
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-6">
        <p className="text-sm text-prism-text-muted">
          Don't see your platform? Visit our{" "}
          <a 
            href="https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/releases" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-prism-primary hover:underline"
          >
            GitHub Releases
          </a>{" "}
          page for all available downloads.
        </p>
      </div>
    </div>
  );
};

export default DesktopDownloads;
