import { motion } from 'framer-motion';
import { Bot, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';

interface AISearchResponseProps {
  query: string;
}

const AISearchResponse = ({
  query
}: AISearchResponseProps) => {
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showChatButton, setShowChatButton] = useState(false);
  const {
    toast
  } = useToast();
  
  useEffect(() => {
    const getAIResponse = async () => {
      if (!query) return;
      setIsLoading(true);
      setHasError(false);
      try {
        const {
          data,
          error
        } = await supabase.functions.invoke('ai-search-assistant', {
          body: {
            query,
            model: 'gemini' // Default to Gemini for quick search responses
          }
        });
        if (error) throw error;
        if (data && data.response) {
          setAiResponse(data.response);
          setShowChatButton(true);
        } else {
          throw new Error('No response data received');
        }
      } catch (error) {
        console.error('AI Response Error:', error);
        setHasError(true);
        toast({
          title: "AI Assistant Error",
          description: "Could not get an AI response. Showing search results only.",
          variant: "destructive"
        });
        setAiResponse('');
        setShowChatButton(false);
      } finally {
        setIsLoading(false);
      }
    };
    getAIResponse();
  }, [query, toast]);

  // Don't render anything if there's no query, no response and no loading state
  if (!query) return null;

  // Don't show the component if we had an error and aren't loading
  if (hasError && !isLoading && !aiResponse) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }} 
      className="mb-6 p-4 bg-purple-500/10 backdrop-blur-sm rounded-xl border border-purple-500/20"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mt-1">
          <Bot className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center gap-2 text-purple-300/70">
              <div className="animate-pulse">Thinking</div>
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          ) : (
            <div>
              <p className="text-purple-100">{aiResponse}</p>
              
              {/* Chat button - links to Chat mode with proper router navigation */}
              {showChatButton && (
                <div className="mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => { window.location.href = '/chat'; }} 
                    className="text-purple-200 border-purple-500/30 bg-transparent hover:bg-purple-500/10"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Continue in Chat Mode
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AISearchResponse;
