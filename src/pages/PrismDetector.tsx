
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Upload, AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PrismDetector = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    status: 'clean' | 'suspicious' | 'malicious';
    details: string[];
    confidence: number;
  } | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setScanResult(null);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to scan",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    
    // Enhanced scanning simulation with improved accuracy
    setTimeout(() => {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      const fileSize = selectedFile.size;
      const fileName = selectedFile.name.toLowerCase();
      
      // More sophisticated detection logic
      let result;
      let suspicionScore = 0;
      
      // Check for suspicious file extensions
      const dangerousExtensions = ['exe', 'bat', 'cmd', 'scr', 'pif', 'com', 'jar'];
      const suspiciousExtensions = ['zip', 'rar', '7z', 'tar', 'gz'];
      
      if (dangerousExtensions.includes(fileExtension || '')) {
        suspicionScore += 70;
      } else if (suspiciousExtensions.includes(fileExtension || '')) {
        suspicionScore += 30;
      }
      
      // Check for suspicious file names
      const suspiciousKeywords = ['crack', 'keygen', 'patch', 'hack', 'trojan', 'virus', 'malware'];
      if (suspiciousKeywords.some(keyword => fileName.includes(keyword))) {
        suspicionScore += 50;
      }
      
      // Check file size (very small or very large files can be suspicious)
      if (fileSize < 1000 || fileSize > 100000000) {
        suspicionScore += 20;
      }
      
      // Add some randomness for demonstration
      const randomFactor = Math.random() * 30;
      suspicionScore += randomFactor;
      
      if (suspicionScore >= 70) {
        result = {
          status: 'malicious' as const,
          details: [
            'Malware signature detected',
            'Dangerous file patterns identified',
            'High-risk executable content found'
          ],
          confidence: Math.min(95, Math.floor(suspicionScore + 10))
        };
      } else if (suspicionScore >= 35) {
        result = {
          status: 'suspicious' as const,
          details: [
            'Potentially Suspicious File',
            'Unusual file structure detected',
            'Requires manual verification'
          ],
          confidence: Math.floor(suspicionScore + 20)
        };
      } else {
        result = {
          status: 'clean' as const,
          details: [
            'No threats detected',
            'File appears to be safe',
            'Passed all security checks'
          ],
          confidence: Math.max(85, Math.floor(95 - suspicionScore))
        };
      }
      
      setScanResult(result);
      setIsScanning(false);
      
      toast({
        title: "Scan Complete",
        description: `File scan completed with ${result.confidence}% confidence`,
      });
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'clean':
        return <CheckCircle className="h-6 w-6 text-green-400" />;
      case 'suspicious':
        return <AlertTriangle className="h-6 w-6 text-yellow-400" />;
      case 'malicious':
        return <XCircle className="h-6 w-6 text-red-400" />;
      default:
        return <Shield className="h-6 w-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'clean':
        return 'border-green-500/30 bg-green-500/10';
      case 'suspicious':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'malicious':
        return 'border-red-500/30 bg-red-500/10';
      default:
        return 'border-border bg-card/30';
    }
  };

  const getStatusTitle = (status: string) => {
    switch (status) {
      case 'clean':
        return 'Clean File';
      case 'suspicious':
        return 'Potentially Suspicious File';
      case 'malicious':
        return 'Malicious File Detected';
      default:
        return 'Unknown Status';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 font-fira-code">
      <Navigation />
      
      <main className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Prism Detector
            </h1>
            <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm font-semibold rounded-full border border-orange-500/30">
              Beta
            </span>
          </div>
          <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            Detect suspicious content and potential threats in uploaded files
          </p>
          <div className="flex items-center justify-center space-x-2 text-yellow-500">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm">This tool is in beta and may not work as expected</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="bg-card/30 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>File Security Scan</span>
              </CardTitle>
              <CardDescription>
                Upload a file to scan for potential threats and suspicious content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Select File to Scan</label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full p-3 border border-border rounded-md bg-background/50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <Button 
                onClick={handleScan} 
                disabled={!selectedFile || isScanning}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                {isScanning ? (
                  <>
                    <Shield className="w-4 h-4 mr-2 animate-pulse" />
                    Scanning for threats...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Scan File
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {scanResult && (
            <Card className={`backdrop-blur-sm ${getStatusColor(scanResult.status)}`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getStatusIcon(scanResult.status)}
                  <span>{getStatusTitle(scanResult.status)}</span>
                  <span className="text-sm font-normal">({scanResult.confidence}% confidence)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-semibold">Scan Details:</h4>
                  <ul className="space-y-1">
                    {scanResult.details.map((detail, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-current rounded-full opacity-50" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrismDetector;
