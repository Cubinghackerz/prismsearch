import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileType, AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PrismConversions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null);
  const [convertedFileName, setConvertedFileName] = useState<string | null>(null);

  const supportedFormats = [
    { value: 'png', label: 'PNG' },
    { value: 'jpeg', label: 'JPEG' },
    { value: 'webp', label: 'WebP' },
    { value: 'bmp', label: 'BMP' },
    { value: 'gif', label: 'GIF' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setConvertedFileUrl(null);
      setConvertedFileName(null);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile || !targetFormat) {
      toast({
        title: "Missing information",
        description: "Please select a file and target format",
        variant: "destructive"
      });
      return;
    }

    setIsConverting(true);
    
    // Simulate conversion process with actual file creation
    setTimeout(() => {
      // Create a canvas to simulate file conversion
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        // Convert to target format
        const mimeType = `image/${targetFormat === 'jpeg' ? 'jpeg' : targetFormat}`;
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const fileName = `converted_${selectedFile.name.split('.')[0]}.${targetFormat}`;
            setConvertedFileUrl(url);
            setConvertedFileName(fileName);
            
            toast({
              title: "Conversion Complete",
              description: `File converted to ${targetFormat.toUpperCase()} format`,
            });
          }
        }, mimeType, 0.9);
        
        setIsConverting(false);
      };
      
      // Create object URL for the selected file to load it
      const fileUrl = URL.createObjectURL(selectedFile);
      img.src = fileUrl;
    }, 2000);
  };

  const handleDownload = () => {
    if (convertedFileUrl && convertedFileName) {
      const link = document.createElement('a');
      link.href = convertedFileUrl;
      link.download = convertedFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 font-fira-code flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-6 py-16 flex-1">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <FileType className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Prism Conversions
            </h1>
            <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm font-semibold rounded-full border border-orange-500/30">
              Beta
            </span>
          </div>
          <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            Convert between different file formats while maintaining quality
          </p>
          <div className="flex items-center justify-center space-x-2 text-yellow-500">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm">This tool is in beta and may not work as expected</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-card/30 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>File Conversion</span>
              </CardTitle>
              <CardDescription>
                Upload your file and select the target format for conversion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Select File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border border-border rounded-md bg-background/50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Format</label>
                <select
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value)}
                  className="w-full p-3 border border-border rounded-md bg-background/50"
                >
                  <option value="">Select format...</option>
                  {supportedFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
              </div>

              <Button 
                onClick={handleConvert} 
                disabled={!selectedFile || !targetFormat || isConverting}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                {isConverting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <FileType className="w-4 h-4 mr-2" />
                    Convert File
                  </>
                )}
              </Button>

              {convertedFileUrl && convertedFileName && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Download className="h-5 w-5 text-green-400" />
                      <span className="text-green-400 font-medium">Conversion Complete</span>
                    </div>
                    <Button 
                      onClick={handleDownload}
                      variant="outline" 
                      size="sm" 
                      className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                    >
                      Download {convertedFileName}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrismConversions;
