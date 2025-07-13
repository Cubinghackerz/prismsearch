
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Monitor, Apple, HardDrive, Github, Code } from "lucide-react";

const DesktopDownloads = () => {
  const downloads = [
    {
      icon: <Apple className="w-6 h-6" />,
      title: "Download for macOS",
      description: "Compatible with Intel and Apple Silicon Macs",
      fileType: "DMG",
      fileName: "Prism-Search-1.0.0.dmg",
      size: "~85 MB",
      platform: "mac"
    },
    {
      icon: <Monitor className="w-6 h-6" />,
      title: "Download for Windows",
      description: "Windows 10 and 11 compatible",
      fileType: "EXE",
      fileName: "Prism-Search-Setup-1.0.0.exe",
      size: "~92 MB",
      platform: "win"
    },
    {
      icon: <HardDrive className="w-6 h-6" />,
      title: "Download for Linux",
      description: "Universal AppImage for all distributions",
      fileType: "AppImage",
      fileName: "Prism-Search-1.0.0.AppImage",
      size: "~88 MB",
      platform: "linux"
    }
  ];

  const handleDownload = (platform: string) => {
    const instructions = `To build the ${platform} desktop app:

1. Export this project to GitHub (use the GitHub button in the top right)
2. Clone the repository to your local machine
3. Run: node build-desktop.js
4. Run: npm install
5. Run: npm run build
6. Run: npm run dist-${platform}

The installer will be created in the 'dist-electron' folder.

For more details, check the README in your exported project.`;
    
    alert(instructions);
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

      {/* Build Instructions Card */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-2">
              <Github className="w-6 h-6 text-blue-600 mr-2" />
              <Code className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-blue-900">
              How to Build Desktop Apps
            </CardTitle>
            <CardDescription className="text-blue-700">
              Export to GitHub and build locally for the best experience
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-blue-800">
            <div className="space-y-2">
              <p><strong>1.</strong> Export this project to GitHub (button in top right)</p>
              <p><strong>2.</strong> Clone to your local machine</p>
              <p><strong>3.</strong> Run: <code className="bg-blue-100 px-2 py-1 rounded">node build-desktop.js</code></p>
              <p><strong>4.</strong> Run: <code className="bg-blue-100 px-2 py-1 rounded">npm install && npm run build</code></p>
              <p><strong>5.</strong> Build for your platform using the buttons below</p>
            </div>
          </CardContent>
        </Card>
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
                onClick={() => handleDownload(download.platform)}
              >
                <Download className="w-4 h-4 mr-2" />
                Build {download.fileType}
              </Button>
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
    </div>
  );
};

export default DesktopDownloads;
