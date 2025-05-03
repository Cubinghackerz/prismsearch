
import React, { useState } from 'react';
import { Copy, Check, Reply } from 'lucide-react';

interface MessageActionsProps {
  message: string;
  onReply: () => void;
}

const MessageActions: React.FC<MessageActionsProps> = ({ message, onReply }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={handleCopy}
        className="p-1 rounded-md hover:bg-blue-700/30 text-blue-300 transition-colors"
        aria-label="Copy message"
        title="Copy to clipboard"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
      
      <button
        onClick={onReply}
        className="p-1 rounded-md hover:bg-blue-700/30 text-blue-300 transition-colors"
        aria-label="Reply to this message"
        title="Reply to this message"
      >
        <Reply className="h-4 w-4" />
      </button>
    </div>
  );
};

export default MessageActions;
