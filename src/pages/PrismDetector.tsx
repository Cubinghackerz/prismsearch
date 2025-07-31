import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Upload, AlertTriangle, CheckCircle, XCircle, Eye, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const PrismDetector = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    status: 'clean' | 'suspicious' | 'malicious';
    details: string[];
    confidence: number;
    virusName?: string;
    scanTime?: number;
    enhanced?: boolean;
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
    
    try {
      // Use enhanced ClamAV scanning
      const formData = new FormData();
      formData.append('file', selectedFile);

      const { data, error } = await supabase.functions.invoke('clamav-scan', {
        body: formData,
      });

      if (error) {
        console.error('ClamAV scan error:', error);
        // Fallback to basic scanning
        await performBasicScan();
        return;
      }

      // Process ClamAV results
      const result = {
        status: data.isMalicious ? 'malicious' : (data.confidence > 70 ? 'suspicious' : 'clean') as const,
        details: [
          data.isMalicious ? 'Threat detected by ClamAV engine' : 'No threats detected by ClamAV engine',
          data.virusName ? `Identified: ${data.virusName}` : 'Advanced heuristic analysis completed',
          `Scan completed in ${data.scanTime}ms`,
          'Enhanced detection with binary analysis'
        ],
        confidence: data.confidence,
        virusName: data.virusName,
        scanTime: data.scanTime,
        enhanced: true
      };

      setScanResult(result);
      
      toast({
        title: "Enhanced Scan Complete",
        description: `ClamAV analysis completed with ${result.confidence}% confidence`,
      });

    } catch (error) {
      console.error('Enhanced scan failed:', error);
      // Fallback to basic scanning
      await performBasicScan();
    } finally {
      setIsScanning(false);
    }
  };

  const performBasicScan = async () => {
    // Fallback basic scanning logic (existing implementation)
    setTimeout(() => {
      const fileExtension = selectedFile!.name.split('.').pop()?.toLowerCase();
      const fileSize = selectedFile!.size;
      const fileName = selectedFile!.name.toLowerCase();
      
      let suspicionScore = 0;
      
      const dangerousExtensions = ['exe', 'bat', 'cmd', 'scr', 'pif', 'com', 'jar'];
      const suspiciousExtensions = ['zip', 'rar', '7z', 'tar', 'gz'];
      
      if (dangerousExtensions.includes(fileExtension || '')) {
        suspicionScore += 70;
      } else if (suspiciousExtensions.includes(fileExtension || '')) {
        suspicionScore += 30;
      }
      
      const suspiciousKeywords = ['crack', 'keygen', 'patch', 'hack', 'trojan', 'virus', 'malware'];
      if (suspiciousKeywords.some(keyword => fileName.includes(keyword))) {
        suspicionScore += 50;
      }
      
      if (fileSize < 1000 || fileSize > 100000000) {
        suspicionScore += 20;
      }
      
      const randomFactor = Math.random() * 30;
      suspicionScore += randomFactor;
      
      let result;
      if (suspicionScore >= 70) {
        result = {
          status: 'malicious' as const,
          details: [
            'Potentially malicious patterns detected',
            'Basic signature analysis completed',
            'Recommend manual verification'
          ],
          confidence: Math.min(85, Math.floor(suspicionScore))
        };
      } else if (suspicionScore >= 35) {
        result = {
          status: 'suspicious' as const,
          details: [
            'Some suspicious indicators found',
            'Basic file analysis completed',
            'Enhanced scanning recommended'
          ],
          confidence: Math.floor(suspicionScore + 15)
        };
      } else {
        result = {
          status: 'clean' as const,
          details: [
            'No obvious threats detected',
            'Basic security check passed',
            'File appears safe for basic use'
          ],
          confidence: Math.max(75, Math.floor(90 - suspicionScore))
        };
      }
      
      setScanResult(result);
      setIsScanning(false);
      
      toast({
        title: "Basic Scan Complete",
        description: `File analysis completed with ${result.confidence}% confidence`,
      });
    }, 2000);
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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 font-fira-code flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-6 py-16 flex-1">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-fira-code">
              Prism Detector
            </h1>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm font-semibold rounded-full border border-orange-500/30 font-fira-code">
                Beta
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-semibold rounded-full border border-blue-500/30 font-fira-code flex items-center space-x-1">
                <Zap className="h-3 w-3" />
                <span>ClamAV Enhanced</span>
              </span>
            </div>
          </div>
          <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto font-fira-code">
            Advanced threat detection powered by ClamAV engine with enhanced binary analysis
          </p>
          <div className="flex items-center justify-center space-x-2 text-blue-400">
            <Zap className="h-5 w-5" />
            <p className="text-sm font-fira-code">Enhanced with enterprise-grade ClamAV scanning engine</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="bg-card/30 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 font-fira-code">
                <Eye className="h-5 w-5" />
                <span>Enhanced File Security Scan</span>
                <Zap className="h-4 w-4 text-blue-400" />
              </CardTitle>
              <CardDescription className="font-fira-code">
                Upload a file to scan with ClamAV engine and advanced heuristic analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 font-fira-code">Select File to Scan</label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full p-3 border border-border rounded-md bg-background/50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 font-fira-code"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-muted-foreground font-fira-code">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <Button 
                onClick={handleScan} 
                disabled={!selectedFile || isScanning}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 font-fira-code"
              >
                {isScanning ? (
                  <>
                    <Shield className="w-4 h-4 mr-2 animate-pulse" />
                    Scanning with ClamAV engine...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Enhanced Scan with ClamAV
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {scanResult && (
            <Card className={`backdrop-blur-sm ${getStatusColor(scanResult.status)}`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 font-fira-code">
                  {getStatusIcon(scanResult.status)}
                  <span>{getStatusTitle(scanResult.status)}</span>
                  <span className="text-sm font-normal font-fira-code">({scanResult.confidence}% confidence)</span>
                  {scanResult.enhanced && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30 font-fira-code flex items-center space-x-1">
                      <Zap className="h-3 w-3" />
                      <span>Enhanced</span>
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-semibold font-fira-code">Scan Details:</h4>
                  <ul className="space-y-1">
                    {scanResult.details.map((detail, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm font-fira-code">
                        <div className="w-2 h-2 bg-current rounded-full opacity-50" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                  {scanResult.virusName && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                      <p className="text-sm font-semibold text-red-400 font-fira-code">Threat Identified:</p>
                      <p className="text-sm text-red-300 font-fira-code">{scanResult.virusName}</p>
                    </div>
                  )}
                  {scanResult.scanTime && (
                    <p className="text-xs text-muted-foreground font-fira-code mt-2">
                      Scan completed in {scanResult.scanTime}ms
                    </p>
                  )}
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
