
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface MessageActionsProps {
  content: string;
  className?: string;
}

const MessageActions = ({ content, className }: MessageActionsProps) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={cn("flex items-center gap-1 transition-opacity opacity-0 group-hover:opacity-100", className)}>
      <button 
        onClick={copyToClipboard}
        className="p-1 rounded-md hover:bg-blue-600/20 text-blue-300 hover:text-blue-200 transition-colors"
        title="Copy message"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
};

export default MessageActions;
