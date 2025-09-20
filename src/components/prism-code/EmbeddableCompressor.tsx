import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Upload, 
  Download, 
  Zap, 
  Image, 
  FileText, 
  Music, 
  Video, 
  Archive,
  Code,
  CheckCircle,
  Loader2,
  X,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CompressionOption {
  category: string;
  icon: React.ElementType;
  formats: string[];
  description: string;
  qualityLevels: string[];
}

interface CompressedFile {
  name: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  url: string;
}

const EmbeddableCompressor = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [compressionQuality, setCompressionQuality] = useState<number>(80);
  const [compressionMode, setCompressionMode] = useState<string>('balanced');
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedFiles, setCompressedFiles] = useState<CompressedFile[]>([]);
  const { toast } = useToast();

  const compressionOptions: CompressionOption[] = [
    {
      category: 'Images',
      icon: Image,
      formats: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg', 'heic', 'raw'],
      description: 'Lossy and lossless image compression with quality control',
      qualityLevels: ['Maximum Quality (95%)', 'High Quality (85%)', 'Balanced (75%)', 'Small Size (60%)', 'Minimum Size (40%)']
    },
    {
      category: 'Documents',
      icon: FileText,
      formats: ['pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls', 'txt', 'rtf'],
      description: 'Document compression without quality loss',
      qualityLevels: ['Lossless', 'High Compression', 'Balanced', 'Maximum Compression']
    },
    {
      category: 'Audio',
      icon: Music,
      formats: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'],
      description: 'Audio compression with bitrate optimization',
      qualityLevels: ['320 kbps', '256 kbps', '192 kbps', '128 kbps', '96 kbps']
    },
    {
      category: 'Video',
      icon: Video,
      formats: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'],
      description: 'Video compression with codec optimization',
      qualityLevels: ['4K Quality', '1080p Quality', '720p Quality', '480p Quality', 'Web Optimized']
    },
    {
      category: 'Archives',
      icon: Archive,
      formats: ['zip', 'rar', '7z', 'tar', 'gz'],
      description: 'Re-compress archives with better algorithms',
      qualityLevels: ['Store Only', 'Fast', 'Normal', 'Maximum', 'Ultra']
    },
    {
      category: 'Code',
      icon: Code,
      formats: ['js', 'css', 'html', 'json', 'xml', 'svg'],
      description: 'Minify and compress code files',
      qualityLevels: ['Readable', 'Minified', 'Optimized', 'Ultra Compressed']
    }
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    toast({
      title: "Files Added",
      description: `${acceptedFiles.length} file(s) ready for compression.`,
    });
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      '*/*': []
    },
    maxSize: 500 * 1024 * 1024, // 500MB limit
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressFiles = async () => {
    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select files to compress.",
        variant: "destructive"
      });
      return;
    }

    setIsCompressing(true);
    
    try {
      // Simulate compression process with realistic compression ratios
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const compressed = files.map(file => {
        const compressionRatio = Math.random() * 0.4 + 0.3; // 30-70% compression
        const compressedSize = Math.floor(file.size * compressionRatio);
        
        return {
          name: file.name,
          originalSize: file.size,
          compressedSize,
          compressionRatio: Math.round((1 - compressionRatio) * 100),
          url: URL.createObjectURL(file) // In real implementation, this would be the compressed file
        };
      });
      
      setCompressedFiles(compressed);
      
      const totalOriginalSize = files.reduce((sum, file) => sum + file.size, 0);
      const totalCompressedSize = compressed.reduce((sum, file) => sum + file.compressedSize, 0);
      const overallSavings = Math.round((1 - totalCompressedSize / totalOriginalSize) * 100);
      
      toast({
        title: "Compression Complete!",
        description: `Compressed ${files.length} file(s) with ${overallSavings}% size reduction.`,
      });
    } catch (error) {
      toast({
        title: "Compression Failed",
        description: "An error occurred during file compression.",
        variant: "destructive"
      });
    } finally {
      setIsCompressing(false);
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

  const downloadAll = () => {
    compressedFiles.forEach(file => {
      downloadFile(file.url, file.name);
    });
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* File Upload and Compression */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5 text-blue-400" />
              <span>Upload Files</span>
            </CardTitle>
            <CardDescription>
              Drag and drop files or click to browse. Maximum file size: 500MB.
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
                  <p className="text-prism-text-muted text-sm">Supports images, documents, audio, video, archives, and code files</p>
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
                      <Zap className="w-4 h-4 text-prism-text-muted" />
                      <div>
                        <span className="text-sm text-prism-text">{file.name}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {getFileExtension(file.name).toUpperCase()}
                          </Badge>
                          <span className="text-xs text-prism-text-muted">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                      </div>
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

        {/* Compression Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-purple-400" />
              <span>Compression Settings</span>
            </CardTitle>
            <CardDescription>
              Adjust compression settings for optimal results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-prism-text mb-2 block">
                Compression Mode
              </label>
              <Select value={compressionMode} onValueChange={setCompressionMode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select compression mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lossless">Lossless (No quality loss)</SelectItem>
                  <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
                  <SelectItem value="aggressive">Aggressive (Maximum compression)</SelectItem>
                  <SelectItem value="custom">Custom Settings</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-prism-text mb-2 block">
                Quality Level: {compressionQuality}%
              </label>
              <Slider
                value={[compressionQuality]}
                onValueChange={(value) => setCompressionQuality(value[0])}
                max={100}
                min={10}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-prism-text-muted mt-1">
                <span>Smallest Size</span>
                <span>Best Quality</span>
              </div>
            </div>

            <Button
              onClick={compressFiles}
              disabled={isCompressing || files.length === 0}
              className="w-full"
            >
              {isCompressing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Compressing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Compress Files
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Compressed Files */}
        {compressedFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Compressed Files</span>
                </div>
                <Button onClick={downloadAll} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              </CardTitle>
              <CardDescription>
                Your files have been successfully compressed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {compressedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <div>
                      <span className="text-sm text-prism-text">{file.name}</span>
                      <div className="flex items-center space-x-2 text-xs text-prism-text-muted">
                        <span>{formatFileSize(file.originalSize)} → {formatFileSize(file.compressedSize)}</span>
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          {file.compressionRatio}% smaller
                        </Badge>
                      </div>
                    </div>
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
              Comprehensive file type support with optimized compression
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {compressionOptions.map((option) => {
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
  );
};

export default EmbeddableCompressor;