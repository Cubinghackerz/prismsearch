
import React from 'react';
import { X, FileText } from 'lucide-react';
import { Button } from '../ui/button';

interface FileAttachmentProps {
  file: {
    id: string;
    name: string;
    size: number;
    url: string | null;
  };
  onRemove?: (id: string) => void;
}

const FileAttachment: React.FC<FileAttachmentProps> = ({ file, onRemove }) => {
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
};

export default FileAttachment;
