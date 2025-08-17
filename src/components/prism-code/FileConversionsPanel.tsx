
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useDropzone } from 'react-dropzone';
import { 
  RefreshCw, 
  Upload, 
  Download, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive,
  Code,
  FileType,
  Sparkles,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface ConversionOption {
  id: string;
  name: string;
  description: string;
  inputFormats: string[];
  outputFormats: string[];
  icon: React.ComponentType<any>;
  color: string;
  category: 'document' | 'image' | 'video' | 'audio' | 'code' | 'data';
}

const CONVERSION_OPTIONS: ConversionOption[] = [
  {
    id: 'document',
    name: 'Document Conversion',
    description: 'Convert between PDF, Word, text, and other document formats',
    inputFormats: ['pdf', 'docx', 'txt', 'rtf', 'odt'],
    outputFormats: ['pdf', 'docx', 'txt', 'html', 'md'],
    icon: FileText,
    color: 'from-blue-500 to-indigo-500',
    category: 'document'
  },
  {
    id: 'image',
    name: 'Image Conversion',
    description: 'Convert between different image formats and optimize',
    inputFormats: ['jpg', 'png', 'gif', 'bmp', 'webp', 'svg'],
    outputFormats: ['jpg', 'png', 'webp', 'gif', 'svg', 'ico'],
    icon: Image,
    color: 'from-green-500 to-emerald-500',
    category: 'image'
  },
  {
    id: 'video',
    name: 'Video Conversion',
    description: 'Convert video formats and compress files',
    inputFormats: ['mp4', 'avi', 'mov', 'wmv', 'flv'],
    outputFormats: ['mp4', 'webm', 'avi', 'gif'],
    icon: Video,
    color: 'from-red-500 to-pink-500',
    category: 'video'
  },
  {
    id: 'audio',
    name: 'Audio Conversion',
    description: 'Convert between audio formats and adjust quality',
    inputFormats: ['mp3', 'wav', 'flac', 'aac', 'm4a'],
    outputFormats: ['mp3', 'wav', 'ogg', 'aac'],
    icon: Music,
    color: 'from-purple-500 to-violet-500',
    category: 'audio'
  },
  {
    id: 'code',
    name: 'Code Conversion',
    description: 'Convert between programming languages and formats',
    inputFormats: ['js', 'ts', 'py', 'java', 'cpp', 'cs'],
    outputFormats: ['js', 'ts', 'py', 'java', 'json', 'xml'],
    icon: Code,
    color: 'from-orange-500 to-yellow-500',
    category: 'code'
  },
  {
    id: 'archive',
    name: 'Archive Conversion',
    description: 'Create and extract compressed archives',
    inputFormats: ['zip', 'rar', '7z', 'tar', 'gz'],
    outputFormats: ['zip', '7z', 'tar.gz'],
    icon: Archive,
    color: 'from-gray-500 to-slate-500',
    category: 'data'
  }
];

const FileConversionsPanel = () => {
  const [selectedConversion, setSelectedConversion] = useState<ConversionOption | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<{ name: string; url: string; size: string }[]>([]);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
    toast({
      title: "Files uploaded",
      description: `${acceptedFiles.length} file(s) ready for conversion`,
    });
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    disabled: !selectedConversion
  });

  const handleConversion = async () => {
    if (!selectedConversion || uploadedFiles.length === 0) return;

    setIsConverting(true);
    
    // Simulate conversion process
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockConvertedFiles = uploadedFiles.map((file, index) => ({
        name: `converted_${file.name.split('.')[0]}.${selectedConversion.outputFormats[0]}`,
        url: URL.createObjectURL(file), // Mock URL
        size: `${(file.size / 1024).toFixed(1)} KB`
      }));
      
      setConvertedFiles(mockConvertedFiles);
      
      toast({
        title: "Conversion Complete!",
        description: `${uploadedFiles.length} file(s) converted successfully`,
      });
    } catch (error) {
      toast({
        title: "Conversion Failed",
        description: "There was an error converting your files",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
    }
  };

  const clearFiles = () => {
    setUploadedFiles([]);
    setConvertedFiles([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <RefreshCw className="w-8 h-8 text-blue-400" />
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-fira-code">
            File Conversions
          </h2>
          <p className="text-prism-text-muted mt-2 font-inter">
            Convert between different file formats with AI-powered processing
          </p>
        </div>
      </div>

      {/* Conversion Options */}
      <div>
        <h3 className="text-lg font-semibold text-prism-text mb-4">Choose Conversion Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CONVERSION_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedConversion?.id === option.id;
            
            return (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    isSelected 
                      ? 'ring-2 ring-blue-500 bg-blue-500/5' 
                      : 'hover:shadow-blue-500/10'
                  }`}
                  onClick={() => setSelectedConversion(option)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${option.color} bg-opacity-10`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <CardTitle className="text-base font-semibold text-prism-text">
                      {option.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-prism-text-muted text-sm mb-3">
                      {option.description}
                    </p>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-prism-text-muted">Input:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {option.inputFormats.slice(0, 4).map((format) => (
                            <Badge key={format} variant="outline" className="text-xs">
                              {format.toUpperCase()}
                            </Badge>
                          ))}
                          {option.inputFormats.length > 4 && (
                            <span className="text-xs text-prism-text-muted">
                              +{option.inputFormats.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* File Upload Area */}
      {selectedConversion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5 text-prism-primary" />
              <span>Upload Files for {selectedConversion.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-500/5'
                  : 'border-prism-border hover:border-blue-500/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-prism-text-muted mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-blue-400">Drop files here...</p>
              ) : (
                <div>
                  <p className="text-prism-text mb-2">
                    Drop files here or click to browse
                  </p>
                  <p className="text-prism-text-muted text-sm">
                    Supports: {selectedConversion.inputFormats.join(', ').toUpperCase()}
                  </p>
                </div>
              )}
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-prism-text">
                    Uploaded Files ({uploadedFiles.length})
                  </h4>
                  <Button onClick={clearFiles} variant="outline" size="sm">
                    Clear All
                  </Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-prism-surface/10 rounded">
                      <div className="flex items-center space-x-2">
                        <FileType className="w-4 h-4 text-prism-accent" />
                        <span className="text-sm text-prism-text">{file.name}</span>
                        <span className="text-xs text-prism-text-muted">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Convert Button */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handleConversion}
                  disabled={isConverting}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  {isConverting ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Convert Files
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Converted Files */}
      {convertedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Converted Files</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {convertedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-500/5 border border-green-500/20 rounded">
                  <div className="flex items-center space-x-3">
                    <Download className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="font-medium text-prism-text">{file.name}</p>
                      <p className="text-xs text-prism-text-muted">{file.size}</p>
                    </div>
                  </div>
                  <Button size="sm" asChild>
                    <a href={file.url} download={file.name}>
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Alert */}
      <Alert className="border-blue-500/30 bg-blue-500/5">
        <AlertTriangle className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-300">
          <strong>Note:</strong> File conversion is currently in beta. Some conversions may take longer than expected. 
          Large files ({'>'}10MB) may have processing limits.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default FileConversionsPanel;
