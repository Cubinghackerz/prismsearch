import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, X, FileText, Image, File } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
interface AttachedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  data?: string; // base64 data for sending to API
}
interface FileUploadProps {
  attachedFiles: AttachedFile[];
  onFileAdd: (file: AttachedFile) => void;
  onFileRemove: (fileId: string) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
}
const FileUpload: React.FC<FileUploadProps> = ({
  attachedFiles,
  onFileAdd,
  onFileRemove,
  disabled = false,
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024 // 10MB default
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    toast
  } = useToast();
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      // Check file size
      if (file.size > maxFileSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than ${Math.round(maxFileSize / (1024 * 1024))}MB`,
          variant: "destructive"
        });
        continue;
      }

      // Check file count limit
      if (attachedFiles.length >= maxFiles) {
        toast({
          title: "Too many files",
          description: `Maximum ${maxFiles} files allowed`,
          variant: "destructive"
        });
        break;
      }
      try {
        // Convert file to base64
        const base64Data = await fileToBase64(file);
        const attachedFile: AttachedFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          data: base64Data
        };
        onFileAdd(attachedFile);
        toast({
          title: "File attached",
          description: `${file.name} has been attached`
        });
      } catch (error) {
        console.error('Error processing file:', error);
        toast({
          title: "Upload failed",
          description: `Failed to attach ${file.name}`,
          variant: "destructive"
        });
      }
    }

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.includes('text') || type.includes('document')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };
  return <div className="space-y-2">
      {/* File Input */}
      <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.csv,.json" disabled={disabled} />

      {/* Upload Button */}
      

      {/* Attached Files Display */}
      {attachedFiles.length > 0 && <div className="flex flex-wrap gap-2">
          {attachedFiles.map(file => <div key={file.id} className="flex items-center gap-2 bg-muted/50 rounded-lg px-2 py-1 text-xs max-w-[200px]">
              {getFileIcon(file.type)}
              <span className="truncate text-foreground">{file.name}</span>
              <span className="text-muted-foreground">({formatFileSize(file.size)})</span>
              <Button type="button" variant="ghost" size="icon" onClick={() => onFileRemove(file.id)} className="h-4 w-4 p-0 hover:bg-destructive/20">
                <X className="h-3 w-3" />
              </Button>
            </div>)}
        </div>}
    </div>;
};
export default FileUpload;