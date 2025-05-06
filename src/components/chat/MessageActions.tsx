
import React, { useState } from 'react';
import { Copy, CheckIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface MessageActionsProps {
  isBot: boolean;
  messageText: string;  // Changed from message: ChatMessage to messageText: string
}

const MessageActions: React.FC<MessageActionsProps> = ({ isBot, messageText }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (!isBot) return null; // Only show actions for bot messages
  
  return (
    <div className="flex flex-col items-center space-y-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            onClick={handleCopy} 
            className="p-1 rounded-full bg-blue-600/30 hover:bg-blue-600/50 transition-colors"
          >
            {copied ? 
              <CheckIcon className="h-3 w-3 text-blue-300" /> : 
              <Copy className="h-3 w-3 text-blue-300" />
            }
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>{copied ? "Copied!" : "Copy message"}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default MessageActions;
