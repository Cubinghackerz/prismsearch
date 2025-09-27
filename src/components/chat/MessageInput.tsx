import { useState, useRef, useEffect } from 'react';
import { X, ArrowUp, Loader2, Plus, Mic, Paperclip, FileText, Image, File } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/context/ChatContext';
import { useToast } from '@/hooks/use-toast';
import { useChat, isChatCommandKey, getCommandLabel, CHAT_COMMAND_GUIDE, SupportedCommand } from '@/context/ChatContext';
interface MessageInputProps {
  onSendMessage: (content: string, parentMessageId?: string | null) => void;
  isLoading: boolean;
  messages: ChatMessage[];
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  isWelcomeMode?: boolean;
}
const MessageInput: React.FC<MessageInputProps> = ({
  isLoading,
  messages,
  replyingTo,
  setReplyingTo,
  isWelcomeMode = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState(CHAT_COMMAND_GUIDE);
  const [highlightedCommandIndex, setHighlightedCommandIndex] = useState(0);
  const [commandQuery, setCommandQuery] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    sendMessageWithFiles,
    generateCodeFromPrompt,
    executeCommand,
    limits,
    usage,
    isUnlimitedUser,
  } = useChat();
  const {
    toast
  } = useToast();

  useEffect(() => {
    const trimmed = inputValue;
    if (!trimmed.startsWith('/')) {
      if (showCommandPalette) {
        setShowCommandPalette(false);
      }
      if (commandQuery) {
        setCommandQuery('');
      }
      return;
    }

    const spaceIndex = inputValue.indexOf(' ');
    if (spaceIndex > 0) {
      if (showCommandPalette) {
        setShowCommandPalette(false);
      }
      if (commandQuery) {
        setCommandQuery('');
      }
      return;
    }

    const [rawQuery] = trimmed.slice(1).split(/\s+/);
    const normalizedQuery = rawQuery?.toLowerCase() ?? '';

    const results = CHAT_COMMAND_GUIDE.filter((command) => {
      const label = command.label.toLowerCase();
      const key = command.key.toLowerCase();
      return !normalizedQuery || label.includes(normalizedQuery) || key.includes(normalizedQuery);
    });

    setFilteredCommands(results.length > 0 ? results : CHAT_COMMAND_GUIDE);
    setShowCommandPalette(true);

    if (normalizedQuery !== commandQuery) {
      setHighlightedCommandIndex(0);
      setCommandQuery(normalizedQuery);
    }
  }, [inputValue, showCommandPalette, commandQuery]);

  const applyCommandShortcut = (commandKey: SupportedCommand) => {
    const suffix = inputValue.replace(/^\/[^\s]*\s?/, '').trimStart();
    const trailing = suffix.length > 0 ? ` ${suffix}` : ' ';

    setInputValue(`/${commandKey}${trailing}`);
    setShowCommandPalette(false);
    setHighlightedCommandIndex(0);
    setCommandQuery('');

    requestAnimationFrame(() => {
      textAreaRef.current?.focus();
    });
  };
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const maxFiles = 5;
    const maxFileSize = 10 * 1024 * 1024; // 10MB

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
        const attachedFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          data: base64Data
        };
        setAttachedFiles(prev => [...prev, attachedFile]);
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
  const handleFileRemove = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    const commandMatch = trimmed.match(/^\/(\w+)(?:\s+|$)/i);
    const commandKey = commandMatch?.[1]?.toLowerCase();

    if (commandKey === 'code') {
      if (attachedFiles.length > 0) {
        toast({
          title: 'Attachments ignored',
          description: 'File attachments are not supported with /code. They have been cleared.',
          variant: 'destructive',
        });
        setAttachedFiles([]);
      }

      const prompt = trimmed.replace(/^\/code\s*/i, '');
      if (!prompt) {
        toast({
          title: 'Missing details',
          description: 'Please provide a description after /code to generate an app.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Beta command',
        description: '/code is currently in beta. Preview output carefully.',
      });

      await generateCodeFromPrompt(prompt);
      setInputValue('');
      setAttachedFiles([]);
      setReplyingTo(null);
      return;
    }

    if (commandKey && isChatCommandKey(commandKey)) {
      if (attachedFiles.length > 0) {
        toast({
          title: 'Attachments ignored',
          description: 'File attachments are not supported with chat commands. They have been cleared.',
          variant: 'destructive',
        });
        setAttachedFiles([]);
      }

      const commandInput = trimmed.replace(/^\/\w+\s*/i, '');
      if (!commandInput) {
        toast({
          title: 'Missing details',
          description: `Please provide details after ${getCommandLabel(commandKey)} to continue.`,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Beta command',
        description: `${getCommandLabel(commandKey)} is currently in beta. Results may vary.`,
      });

      await executeCommand(commandKey, commandInput);
      setInputValue('');
      setAttachedFiles([]);
      setReplyingTo(null);
      return;
    }

    await sendMessageWithFiles(trimmed, attachedFiles, replyingTo);
    setInputValue('');
    setAttachedFiles([]);
    setReplyingTo(null);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showCommandPalette && filteredCommands.length > 0) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedCommandIndex((prev) => {
          const nextIndex = e.key === 'ArrowDown' ? prev + 1 : prev - 1;
          if (nextIndex < 0) {
            return filteredCommands.length - 1;
          }
          if (nextIndex >= filteredCommands.length) {
            return 0;
          }
          return nextIndex;
        });
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        const selected = filteredCommands[highlightedCommandIndex] ?? filteredCommands[0];
        if (selected) {
          applyCommandShortcut(selected.key);
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setShowCommandPalette(false);
        return;
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        const trimmed = inputValue.trim();
        const isCommandOnly = trimmed === '/' || /^\/[^\s]*$/.test(trimmed);
        if (isCommandOnly) {
          e.preventDefault();
          const selected = filteredCommands[highlightedCommandIndex] ?? filteredCommands[0];
          if (selected) {
            applyCommandShortcut(selected.key);
          }
          return;
        }
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  const getReplyingToMessage = () => {
    if (!replyingTo) return null;
    return messages.find(m => m.id === replyingTo);
  };
  const isLimitReached = !isUnlimitedUser && usage.chatPrompts >= limits.chatPrompts;
  const isInputDisabled = isLoading || isLimitReached;
  return <div className={`${isWelcomeMode ? '' : 'border-t border-border/30 bg-card/20 backdrop-blur-sm'}`}>
      <form onSubmit={handleSubmit} className={isWelcomeMode ? "" : "p-6"}>
        {/* Replying to message indicator */}
        {replyingTo && !isWelcomeMode && <div className="mb-4 p-3 rounded-xl bg-secondary/50 border border-border/50 flex justify-between items-center backdrop-blur-sm">
            <div className="flex items-center text-sm text-foreground">
              <span>
                Replying to: "{getReplyingToMessage()?.content.substring(0, 50)}
                {getReplyingToMessage()?.content.length! > 50 ? '...' : ''}
                "
              </span>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>}

        {/* Attached Files Display */}
        {attachedFiles.length > 0 && <div className="flex flex-wrap gap-2 mb-4">
            {attachedFiles.map(file => <div key={file.id} className="flex items-center gap-2 bg-muted/50 rounded-lg px-2 py-1 text-xs max-w-[200px]">
                {getFileIcon(file.type)}
                <span className="truncate text-foreground">{file.name}</span>
                <span className="text-muted-foreground">({formatFileSize(file.size)})</span>
                <Button type="button" variant="ghost" size="icon" onClick={() => handleFileRemove(file.id)} className="h-4 w-4 p-0 hover:bg-destructive/20">
                  <X className="h-3 w-3" />
                </Button>
              </div>)}
          </div>}
        
        <div className={`relative flex items-end gap-3 ${isWelcomeMode ? 'max-w-2xl mx-auto' : 'max-w-4xl mx-auto'}`}>
          {/* Hidden file input */}
          <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.csv,.json" disabled={isInputDisabled} />

          <div className="relative flex-1">
            {/* ChatGPT-style input container */}
            <div className={`
              relative flex items-center bg-muted/30 backdrop-blur-sm rounded-3xl border border-border/30
              transition-all duration-300
              ${isFocused ? 'border-primary/50 shadow-lg shadow-primary/10' : 'hover:border-border/50'}
              ${isLimitReached ? 'opacity-50 cursor-not-allowed' : ''}
            `}>
              {/* Text input */}
              <Textarea ref={textAreaRef} value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} placeholder={isLimitReached ? "Daily limit reached" : "Ask anything"} className={`
                  flex-1 border-0 bg-transparent resize-none text-foreground placeholder:text-muted-foreground/60
                  focus-visible:ring-0 focus-visible:ring-offset-0 min-h-0 py-4 px-4
                  ${isInputDisabled ? 'cursor-not-allowed' : ''}
                `} disabled={isInputDisabled} rows={1} style={{
              minHeight: '24px',
              maxHeight: '120px'
            }} />

              {/* Right side buttons */}
              <div className="flex items-center space-x-2 mr-3 flex-shrink-0">
                {/* Attachment button */}


                {/* Send button */}
                <AnimatePresence>
                  <motion.div initial={{
                  opacity: 0
                }} animate={{
                  opacity: 1
                }} exit={{
                  opacity: 0
                }} transition={{
                  duration: 0.2
                }}>
                    <Button type="submit" size="icon" className={`
                        h-8 w-8 rounded-full shadow-sm
                        ${!inputValue.trim() || isInputDisabled ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50' : 'bg-foreground text-background hover:bg-foreground/90'}
                      `} disabled={!inputValue.trim() || isInputDisabled}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
                    </Button>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence>
              {showCommandPalette && filteredCommands.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.12 }}
                  className="absolute bottom-[calc(100%+0.75rem)] left-4 w-[22rem] max-w-[calc(100%-2rem)] rounded-2xl border border-border/60 bg-background/95 shadow-xl backdrop-blur"
                >
                  <div className="px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground/80">
                    Shortcuts
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {filteredCommands.slice(0, 8).map((command, index) => {
                      const isActive = index === highlightedCommandIndex;
                      const cleanLabel = command.label.replace(/\s*\(beta\)$/i, '');

                      return (
                        <button
                          type="button"
                          key={command.key}
                          className={`w-full px-4 py-3 text-left transition-colors ${
                            isActive
                              ? 'bg-primary/10 text-primary'
                              : 'text-foreground hover:bg-muted/40'
                          }`}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            applyCommandShortcut(command.key);
                          }}
                          onMouseEnter={() => setHighlightedCommandIndex(index)}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold">{cleanLabel}</span>
                            <span
                              className={`text-[0.55rem] uppercase tracking-[0.35em] ${
                                isActive ? 'text-primary' : 'text-muted-foreground/80'
                              }`}
                            >
                              Beta
                            </span>
                          </div>
                          <p
                            className={`mt-1 text-xs leading-snug ${
                              isActive ? 'text-primary/80' : 'text-muted-foreground/80'
                            }`}
                          >
                            {command.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Glow effect when focused */}
            {isFocused && !isLoading && !isLimitReached && <motion.div className="absolute inset-0 rounded-3xl bg-primary/20 blur-xl -z-10" initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} exit={{
            opacity: 0
          }} transition={{
            duration: 0.3
          }} />}
          </div>
        </div>
      </form>
    </div>;
};
export default MessageInput;