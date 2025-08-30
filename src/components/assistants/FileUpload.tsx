
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, FileText, Image, File } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  files: File[];
  maxFiles?: number;
  acceptedFileTypes?: Record<string, string[]>;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesChange,
  files,
  maxFiles = 100,
  acceptedFileTypes = {
    'text/*': ['.txt', '.md', '.csv', '.json'],
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  }
}) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles = [...files, ...acceptedFiles];
    onFilesChange(newFiles);
    toast.success(`${acceptedFiles.length} file(s) uploaded`);
  }, [files, maxFiles, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles: maxFiles - files.length,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
    toast.success('File removed');
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) 
      return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <Card className="border-2 border-dashed border-prism-border">
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`cursor-pointer transition-colors ${
              isDragActive || dragActive
                ? 'bg-prism-surface/20 border-prism-primary'
                : 'hover:bg-prism-surface/10'
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-prism-text-muted" />
              <p className="text-lg font-medium text-prism-text mb-2">
                {isDragActive ? 'Drop files here' : 'Upload files'}
              </p>
              <p className="text-sm text-prism-text-muted mb-4">
                Drag & drop files here, or click to select files
              </p>
              <p className="text-xs text-prism-text-muted">
                Supports: TXT, MD, CSV, JSON, PDF, DOC, DOCX, Images
              </p>
              <p className="text-xs text-prism-text-muted">
                Maximum {maxFiles} files • Unlimited file size
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card className="bg-prism-surface/30">
          <CardContent className="p-4">
            <h4 className="font-medium text-prism-text mb-3">
              Uploaded Files ({files.length}/{maxFiles})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-prism-surface/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-prism-text truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-prism-text-muted">
                        {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;
