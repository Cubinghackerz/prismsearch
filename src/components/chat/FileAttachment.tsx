import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, FileText, Upload } from 'lucide-react';
import { Button } from '../ui/button';

interface FileAttachmentProps {
  file?: {
    id: string;
    name: string;
    size: number;
    url: string | null;
  };
  onRemove?: (id: string) => void;
  onFileSelect?: (files: File[]) => void;
}

const FileAttachment: React.FC<FileAttachmentProps> = ({ file, onRemove, onFileSelect }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (onFileSelect) {
      onFileSelect(acceptedFiles);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'application/pdf': [],
      'text/plain': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': []
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  // If file prop is provided, show the file
  if (file) {
    return (
      <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded-md border border-blue-500/20 max-w-xs">
        <FileText className="h-4 w-4 text-blue-400 shrink-0" />
        <div className="truncate flex-1 text-sm">
          <a 
            href={file.url || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className={file.url ? "text-blue-300 hover:underline" : "text-gray-400 cursor-not-allowed"}
          >
            {file.name}
          </a>
          <div className="text-xs text-gray-400">
            {Math.round(file.size / 1024)} KB
          </div>
        </div>
        {onRemove && (
          <Button variant="ghost" size="sm" onClick={() => onRemove(file.id)} className="p-0 h-6 w-6">
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    );
  }

  // Otherwise, show the dropzone
  return (
    <div 
      {...getRootProps()} 
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer col-span-4 transition-colors duration-200 ${
        isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-300 hover:border-blue-400'
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
      <p className="text-sm text-gray-500">
        {isDragActive ? (
          "Drop your files here..."
        ) : (
          <>
            Drag & drop files here, or <span className="text-blue-400">browse</span>
          </>
        )}
      </p>
      <p className="text-xs text-gray-400 mt-1">
        Supports images, PDFs, and documents (max 5MB)
      </p>
    </div>
  );
};

export default FileAttachment;
