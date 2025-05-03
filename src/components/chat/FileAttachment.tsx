
import React, { useState, useEffect } from 'react';
import { FileText, Image as ImageIcon, X, AlertTriangle, Paperclip, FileCode } from 'lucide-react';

interface FileAttachmentProps {
  file: {
    type: 'image' | 'file';
    url: string;
    name: string;
  };
  onRemove?: () => void;
  isPreview?: boolean;
}

const FileAttachment: React.FC<FileAttachmentProps> = ({ file, onRemove, isPreview = false }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isErrored, setIsErrored] = useState(false);
  
  useEffect(() => {
    // For preview mode (when file is just selected but not yet uploaded),
    // create object URL from the file object if it's a Blob-like object
    if (isPreview && typeof file.url === 'object') {
      // Check if the object has blob-like properties
      if ('size' in file.url && 'type' in file.url) {
        const objectUrl = URL.createObjectURL(file.url as unknown as Blob);
        setPreviewUrl(objectUrl);
        
        // Clean up the object URL when component unmounts
        return () => {
          URL.revokeObjectURL(objectUrl);
        };
      }
    } else {
      setPreviewUrl(file.url);
    }
  }, [file.url, isPreview]);
  
  // Determine if file is potentially unsafe
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const unsafeExtensions = ['exe', 'bat', 'js', 'vbs', 'msi', 'xlsm', 'docm', 'py', 'sh'];
  const isPotentiallyUnsafe = unsafeExtensions.includes(fileExtension || '');
  
  // Safe file types for preview
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
  const textExtensions = ['txt', 'md', 'csv'];
  
  const getFileIcon = () => {
    if (isPotentiallyUnsafe) {
      return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
    }
    
    if (file.type === 'image') {
      return <ImageIcon className="h-5 w-5 text-blue-400" />;
    }
    
    if (textExtensions.includes(fileExtension || '')) {
      return <FileText className="h-5 w-5 text-blue-400" />;
    }
    
    return <Paperclip className="h-5 w-5 text-blue-400" />;
  };

  const handleImageError = () => {
    setIsErrored(true);
  };

  return (
    <div className={`relative rounded-lg overflow-hidden border ${isPreview ? 'border-blue-500/30 bg-blue-500/10' : 'border-blue-400/20'}`}>
      {file.type === 'image' && !isErrored ? (
        <div className="relative">
          <img 
            src={previewUrl || ''} 
            alt={file.name} 
            className="max-h-40 object-contain rounded-lg"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-2">
            <span className="text-white text-xs truncate max-w-full">{file.name}</span>
          </div>
        </div>
      ) : (
        <div className="p-2 flex items-center gap-2">
          {getFileIcon()}
          <span className="text-sm text-blue-200 truncate">{file.name}</span>
          {isPotentiallyUnsafe && (
            <span className="text-xs text-yellow-300 ml-1">(potentially unsafe)</span>
          )}
        </div>
      )}
      
      {onRemove && isPreview && (
        <button 
          onClick={onRemove}
          className="absolute top-1 right-1 bg-blue-900/80 p-1 rounded-full hover:bg-blue-800 transition-colors"
        >
          <X className="h-3 w-3 text-white" />
        </button>
      )}
    </div>
  );
};

export default FileAttachment;
