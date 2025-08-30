
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  acceptedFileTypes?: Record<string, string[]>;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  files, 
  onFilesChange, 
  maxFiles = 10,
  acceptedFileTypes = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
    'application/pdf': ['.pdf'],
    'text/*': ['.txt', '.md']
  }
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles];
    if (newFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }
    onFilesChange(newFiles);
    toast.success(`${acceptedFiles.length} file(s) added`);
  }, [files, onFilesChange, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles: maxFiles - files.length
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
    toast.success('File removed');
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
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-prism-primary bg-prism-primary/10' 
            : 'border-prism-border hover:border-prism-primary/50 bg-prism-surface/30'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 mx-auto mb-4 text-prism-text-muted" />
        {isDragActive ? (
          <p className="text-prism-text">Drop the files here...</p>
        ) : (
          <div className="space-y-2">
            <p className="text-prism-text">Drag & drop files here, or click to select</p>
            <p className="text-sm text-prism-text-muted">
              Supports images, PDFs, and text files (max {maxFiles} files)
            </p>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-prism-text">Uploaded Files ({files.length})</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-prism-surface/20 rounded-lg p-3">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <FileText className="h-4 w-4 text-prism-accent flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-prism-text truncate">{file.name}</p>
                    <p className="text-xs text-prism-text-muted">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
