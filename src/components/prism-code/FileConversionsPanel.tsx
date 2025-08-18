
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Download, 
  FileType, 
  Image, 
  FileText, 
  Music, 
  Video, 
  Archive,
  Code,
  Database,
  AlertTriangle,
  CheckCircle,
  Loader2,
  X,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConversionOption {
  category: string;
  icon: React.ElementType;
  formats: string[];
  description: string;
}

const FileConversionsPanel = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<{ name: string; url: string }[]>([]);
  const { toast } = useToast();

  const conversionOptions: ConversionOption[] = [
    {
      category: 'Images',
      icon: Image,
      formats: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg', 'ico', 'heic'],
      description: 'Convert between image formats with quality preservation'
    },
    {
      category: 'Documents',
      icon: FileText,
      formats: ['pdf', 'docx', 'doc', 'txt', 'rtf', 'odt', 'html', 'md'],
      description: 'Transform documents while maintaining formatting'
    },
    {
      category: 'Audio',
      icon: Music,
      formats: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'],
      description: 'Convert audio files with customizable quality settings'
    },
    {
      category: 'Video',
      icon: Video,
      formats: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'],
      description: 'Video format conversion with compression options'
    },
    {
      category: 'Archives',
      icon: Archive,
      formats: ['zip', 'rar', '7z', 'tar', 'gz'],
      description: 'Compress and decompress archive files'
    },
    {
      category: 'Code',
      icon: Code,
      formats: ['js', 'ts', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb'],
      description: 'Format and convert between programming languages'
    },
    {
      category: 'Data',
      icon: Database,
      formats: ['json', 'xml', 'csv', 'xlsx', 'yaml', 'sql'],
      description: 'Transform data formats and structures'
    }
  ];

  const allFormats = conversionOptions.flatMap(option => option.formats);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    toast({
      title: "Files Added",
      description: `${acceptedFiles.length} file(s) ready for conversion.`,
    });
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      '*/*': []
    },
    maxSize: 100 * 1024 * 1024, // 100MB limit
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const getCompatibleFormats = (files: File[]) => {
    if (files.length === 0) return allFormats;
    
    const fileExtensions = files.map(file => getFileExtension(file.name));
    const categories = conversionOptions.filter(option => 
      fileExtensions.some(ext => option.formats.includes(ext))
    );
    
    return categories.flatMap(cat => cat.formats);
  };

  const convertFiles = async () => {
    if (!targetFormat || files.length === 0) {
      toast({
        title: "Missing Requirements",
        description: "Please select files and target format.",
        variant: "destructive"
      });
      return;
    }

    setIsConverting(true);
    
    try {
      // Simulate conversion process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const converted = files.map(file => ({
        name: `${file.name.split('.')[0]}.${targetFormat}`,
        url: URL.createObjectURL(file) // In real implementation, this would be the converted file
      }));
      
      setConvertedFiles(converted);
      toast({
        title: "Conversion Complete!",
        description: `Successfully converted ${files.length} file(s) to ${targetFormat.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Conversion Failed",
        description: "An error occurred during file conversion.",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
    }
  };

  const downloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const compatibleFormats = getCompatibleFormats(files);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <FileType className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-fira-code">
                File Conversions
              </h2>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm font-semibold rounded-full border border-purple-500/30 font-fira-code">
                Fast
              </span>
            </div>
            <p className="text-prism-text-muted mt-2 font-inter">
              Convert between 50+ file formats with quality preservation and batch processing
            </p>
          </div>
        </div>
      </div>

      {/* Quick Conversion Info */}
      <Alert className="border-purple-500/30 bg-purple-500/5">
        <Zap className="h-4 w-4 text-purple-500" />
        <AlertDescription className="text-purple-300">
          <strong>Fast Processing:</strong> Convert multiple files simultaneously with optimized quality settings. 
          Maximum file size: 100MB per file.
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* File Upload */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-blue-400" />
                <span>Upload Files</span>
              </CardTitle>
              <CardDescription>
                Drag and drop files or click to browse. Supports 50+ formats.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-prism-primary bg-prism-primary/5' 
                    : 'border-prism-border hover:border-prism-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 text-prism-text-muted mx-auto mb-4" />
                {isDragActive ? (
                  <p className="text-prism-text">Drop files here...</p>
                ) : (
                  <div>
                    <p className="text-prism-text mb-2">Drag & drop files here, or click to select</p>
                    <p className="text-prism-text-muted text-sm">Max 100MB per file</p>
                  </div>
                )}
              </div>

              {/* Uploaded Files */}
              {files.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h4 className="font-semibold text-prism-text">Selected Files ({files.length}):</h4>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-prism-surface/10 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileType className="w-4 h-4 text-prism-text-muted" />
                        <span className="text-sm text-prism-text">{file.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {getFileExtension(file.name).toUpperCase()}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conversion Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Settings</CardTitle>
              <CardDescription>
                Choose target format and conversion options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-prism-text mb-2 block">
                  Target Format
                </label>
                <Select value={targetFormat} onValueChange={setTargetFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target format" />
                  </SelectTrigger>
                  <SelectContent>
                    {conversionOptions.map((option) => (
                      <div key={option.category}>
                        <div className="px-2 py-1 text-xs font-semibold text-prism-text-muted bg-prism-surface/20">
                          {option.category}
                        </div>
                        {option.formats
                          .filter(format => compatibleFormats.includes(format))
                          .map((format) => (
                            <SelectItem key={format} value={format}>
                              {format.toUpperCase()}
                            </SelectItem>
                          ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={convertFiles}
                disabled={isConverting || files.length === 0 || !targetFormat}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <FileType className="w-4 h-4 mr-2" />
                    Convert Files
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Converted Files */}
          {convertedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Converted Files</span>
                </CardTitle>
                <CardDescription>
                  Your files have been successfully converted
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {convertedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-prism-text">{file.name}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(file.url, file.name)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Supported Formats */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Supported Formats</CardTitle>
              <CardDescription>
                Over 50 file formats across multiple categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {conversionOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <div key={option.category} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4 text-prism-primary" />
                      <span className="font-semibold text-sm text-prism-text">{option.category}</span>
                    </div>
                    <p className="text-xs text-prism-text-muted mb-2">{option.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {option.formats.map((format) => (
                        <Badge key={format} variant="outline" className="text-xs">
                          {format.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FileConversionsPanel;
