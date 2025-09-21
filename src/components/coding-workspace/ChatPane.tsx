import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatPaneProps {
  initialPrompt?: string;
}

const ChatPane: React.FC<ChatPaneProps> = ({ initialPrompt }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { workspace, addPendingDiff, setFramework, setLanguage, addLog } = useWorkspace();

  useEffect(() => {
    if (initialPrompt && messages.length === 0) {
      handleSendMessage();
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const detectFrameworkAndLanguage = (response: string) => {
    const lowerResponse = response.toLowerCase();
    
    // Detect framework
    if (lowerResponse.includes('react')) {
      setFramework('React');
    } else if (lowerResponse.includes('vue')) {
      setFramework('Vue.js');
    } else if (lowerResponse.includes('svelte')) {
      setFramework('Svelte');
    } else if (lowerResponse.includes('angular')) {
      setFramework('Angular');
    } else if (lowerResponse.includes('next.js') || lowerResponse.includes('nextjs')) {
      setFramework('Next.js');
    } else if (lowerResponse.includes('django')) {
      setFramework('Django');
    } else if (lowerResponse.includes('flask')) {
      setFramework('Flask');
    } else if (lowerResponse.includes('fastapi')) {
      setFramework('FastAPI');
    }

    // Detect language
    if (lowerResponse.includes('typescript') || lowerResponse.includes('.tsx') || lowerResponse.includes('.ts')) {
      setLanguage('TypeScript');
    } else if (lowerResponse.includes('python') || lowerResponse.includes('.py')) {
      setLanguage('Python');
    } else if (lowerResponse.includes('java') && !lowerResponse.includes('javascript')) {
      setLanguage('Java');
    } else if (lowerResponse.includes('php')) {
      setLanguage('PHP');
    } else if (lowerResponse.includes('ruby')) {
      setLanguage('Ruby');
    } else if (lowerResponse.includes('javascript') || lowerResponse.includes('.js') || lowerResponse.includes('.jsx')) {
      setLanguage('JavaScript');
    }
  };

  const parseCodeDiffs = (response: string) => {
    // Look for file creation/modification patterns
    const filePatterns = [
      /```(\w+)\s*\/\/\s*(.+?)\n([\s\S]*?)```/g,
      /Create file `([^`]+)`:\s*```(\w+)?\n([\s\S]*?)```/g,
      /Update `([^`]+)`:\s*```(\w+)?\n([\s\S]*?)```/g
    ];

    let match;
    const diffs: Array<{ path: string; content: string; action: 'create' | 'modify' }> = [];

    filePatterns.forEach(pattern => {
      while ((match = pattern.exec(response)) !== null) {
        const [, langOrPath, pathOrContent, content] = match;
        
        // Determine if first capture is language or path
        let filePath: string;
        let fileContent: string;
        
        if (content) {
          // Pattern: ```lang // path\ncontent```
          filePath = pathOrContent;
          fileContent = content;
        } else {
          // Pattern: Create file `path`: ```lang\ncontent```
          filePath = langOrPath;
          fileContent = pathOrContent;
        }

        diffs.push({
          path: filePath.trim(),
          content: fileContent.trim(),
          action: workspace.files[filePath] ? 'modify' : 'create'
        });
      }
    });

    // Apply diffs
    diffs.forEach(diff => {
      addPendingDiff({
        path: diff.path,
        oldContent: workspace.files[diff.path]?.content || '',
        newContent: diff.content,
        action: diff.action
      });
    });

    if (diffs.length > 0) {
      addLog(`Detected ${diffs.length} file changes: ${diffs.map(d => d.path).join(', ')}`, 'info');
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare context about current workspace
      const workspaceContext = `
Current workspace:
- Framework: ${workspace.framework}
- Language: ${workspace.language}
- Files: ${Object.keys(workspace.files).join(', ') || 'none'}
- Server: ${workspace.isServerRunning ? `running on port ${workspace.serverPort}` : 'stopped'}
`;

      const { data, error } = await supabase.functions.invoke('ai-coding-assistant', {
        body: {
          prompt: inputValue,
          workspaceContext,
          currentFiles: workspace.files,
          framework: workspace.framework,
          language: workspace.language
        }
      });

      if (error) throw error;

      const response = data.response || 'No response received';

      // Detect framework/language changes
      detectFrameworkAndLanguage(response);

      // Parse any code diffs from the response
      parseCodeDiffs(response);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was an error processing your request. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Start coding by describing what you want to build!</p>
                <p className="text-sm mt-2">
                  Examples: "Create a React todo app with Tailwind", "Build a Python Flask API"
                </p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  max-w-[80%] p-4 rounded-lg
                  ${message.isUser 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                  }
                `}>
                  <div className="flex items-start space-x-2">
                    {message.isUser ? (
                      <User className="w-4 h-4 mt-1 flex-shrink-0" />
                    ) : (
                      <Bot className="w-4 h-4 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      {message.isUser ? (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      ) : (
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      )}
                      <div className="text-xs opacity-70 mt-2">
                        {format(message.timestamp, 'HH:mm')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-4 rounded-lg flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI is thinking...</span>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="flex space-x-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe what you want to build or modify..."
              className="flex-1 min-h-[60px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="h-[60px] w-[60px]"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatPane;