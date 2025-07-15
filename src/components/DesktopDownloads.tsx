import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Monitor, Apple, HardDrive, ExternalLink, Chrome } from "lucide-react";
import { toast } from "@/hooks/use-toast";
const DesktopDownloads = () => {
  const downloads = [{
    icon: <Apple className="w-6 h-6" />,
    title: "Download for macOS",
    description: "Compatible with Intel and Apple Silicon Macs",
    fileType: "DMG",
    fileName: "Prism-Search-1.0.0-arm64.dmg",
    size: "~85 MB",
    platform: "mac",
    downloadUrl: "https://github.com/your-username/prism-search/releases/latest/download/Prism-Search-1.0.0.dmg",
    altDownloadUrl: "https://github.com/your-username/prism-search/releases/latest/download/Prism-Search-1.0.0-arm64.dmg",
    altFileName: "Prism-Search-1.0.0.dmg"
  }, {
    icon: <Monitor className="w-6 h-6" />,
    title: "Download for Windows",
    description: "Windows 10 and 11 compatible",
    fileType: "EXE",
    fileName: "Prism-Search-Setup-1.0.0.exe",
    size: "~92 MB",
    platform: "win",
    downloadUrl: "https://github.com/your-username/prism-search/releases/latest/download/Prism-Search-Setup-1.0.0.exe"
  }, {
    icon: <HardDrive className="w-6 h-6" />,
    title: "Download for Linux",
    description: "Universal AppImage for all distributions",
    fileType: "AppImage",
    fileName: "Prism-Search-1.0.0.AppImage",
    size: "~88 MB",
    platform: "linux",
    downloadUrl: "https://github.com/your-username/prism-search/releases/latest/download/Prism-Search-1.0.0.AppImage"
  }];
  const handleDownload = (download: any) => {
    toast({
      title: `Downloading ${download.title}`,
      description: `Starting download of ${download.fileName}`
    });

    // Open the download URL
    window.open(download.downloadUrl, '_blank');
  };
  const handleViewInstructions = () => {
    toast({
      title: "Build Instructions",
      description: "Check the DESKTOP_BUILD.md file for complete build instructions."
    });
  };
  return <div className="mb-16">
      

      

      {/* Chrome Web App Download */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border-blue-500/20">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
              <Chrome className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-prism-text">
            Install as Chrome App
          </CardTitle>
          <CardDescription className="text-lg text-prism-text-muted">
            Get the best web experience with our Progressive Web App
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-6">
            <p className="text-prism-text-muted mb-4">
              Click the install button in your Chrome address bar or use the menu to "Install Prism"
            </p>
            <div className="flex justify-center space-x-4 text-sm text-prism-text-muted">
              <span>• Quick access</span>
              <span>• Native notifications</span>
              <span>• Desktop shortcuts</span>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold shadow-lg" onClick={() => {
          toast({
            title: "Chrome App Installation",
            description: "Look for the install button in your browser's address bar!"
          });
        }}>
            <Chrome className="w-4 h-4 mr-2" />
            How to Install
          </Button>
        </CardContent>
      </Card>
    </div>;
};
export default DesktopDownloads;