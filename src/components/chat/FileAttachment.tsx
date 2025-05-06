
import React from 'react';
import { Paperclip, File, Download } from 'lucide-react';
import { Button } from '../ui/button';

interface FileAttachmentProps {
  file: {
    name: string;
    url: string | null;
    size?: number;
    type?: string;
  };
}

const FileAttachment: React.FC<FileAttachmentProps> = ({ file }) => {
  // Safely extract file URL with null check
  const fileUrl = file?.url || null;
  
  const handleDownload = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };
  
  return (
    <div className="flex items-center gap-2 mt-2 p-2 bg-blue-950/40 rounded-md max-w-xs">
      <div className="bg-blue-500/20 p-1.5 rounded">
        <File className="h-4 w-4 text-blue-300" />
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-sm font-medium text-blue-200 truncate">{file.name}</p>
      </div>
      {fileUrl && (
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleDownload}>
          <Download className="h-4 w-4 text-blue-300" />
        </Button>
      )}
    </div>
  );
};

export default FileAttachment;
