
import { motion } from 'framer-motion';
import { Bot, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import LoadingAnimation from './LoadingAnimation';
import ReactMarkdown from 'react-markdown';

interface AISearchResponseProps {
  query: string;
}

const AISearchResponse = ({ query }: AISearchResponseProps) => {
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showChatButton, setShowChatButton] = useState(false);
  const [requestTimeout, setRequestTimeout] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getAIResponse = async () => {
      if (!query) return;
      setIsLoading(true);
      setHasError(false);
      
      // Set a timeout to prevent hanging
      const timeout = setTimeout(() => {
        setIsLoading(false);
        setHasError(true);
        toast({
          title: "Request Timeout",
          description: "The AI assistant took too long to respond. Please try again.",
          variant: "destructive"
        });
      }, 30000);

      try {
        const { data, error } = await supabase.functions.invoke('ai-search-assistant', {
          body: {
            query,
            model: 'gemini' // Default to Gemini for quick search responses
          }
        });

        if (error) throw error;

        if (data && data.response) {
          // Format the response to replace asterisks with bullet points
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
        // Clear the timeout
        if (timeout) {
          clearTimeout(timeout);
        }
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
      className="mb-6 p-4 backdrop-blur-sm rounded-xl border border-orange-500/20 bg-orange-950/30 font-fira-code"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center mt-1 bg-black">
          <Bot className="w-5 h-5 text-orange-400" />
        </div>
        <div className="flex-1">
          {isLoading ? (
            <div className="flex flex-col items-start gap-2 text-orange-300/70 font-fira-code">
              <div className="flex items-center gap-3">
                <div className="font-fira-code">Thinking</div>
                <LoadingAnimation color="orange" size="small" variant="prism" />
              </div>
            </div>
          ) : (
            <div>
              <div className="text-orange-100 markdown-content font-fira-code">
                <ReactMarkdown 
                  components={{
                    strong: ({ node, ...props }) => <span className="font-bold font-fira-code" {...props} />,
                    em: ({ node, ...props }) => <span className="italic font-fira-code" {...props} />,
                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-4 mb-2 text-orange-100 font-fira-code" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-3 mb-2 font-fira-code" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-md font-bold mt-3 mb-1 font-fira-code" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-3 font-fira-code" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-2 font-fira-code" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3 font-fira-code" {...props} />,
                    li: ({ node, ...props }) => <li className="ml-2 font-fira-code" {...props} />,
                    a: ({ node, ...props }) => <a className="text-prism-primary-light hover:underline font-fira-code" {...props} />,
                    code: ({ node, ...props }) => <code className="bg-prism-surface/40 px-1 py-0.5 rounded text-sm font-fira-code" {...props} />,
                    pre: ({ node, ...props }) => <pre className="bg-prism-surface/40 p-3 rounded-md overflow-x-auto my-3 font-fira-code" {...props} />
                  }}
                >
                  {aiResponse.replace(/\* /g, '• ').replace(/\n\* /g, '\n• ')}
                </ReactMarkdown>
              </div>
              
              {/* Chat button - Using Link component from react-router-dom */}
              {showChatButton && (
                <div className="mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild 
                    className="border-orange-500/30 text-white bg-transparent hover:bg-orange-500/20 hover:border-orange-400/50 font-fira-code"
                  >
                    <Link to="/chat">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span className="font-fira-code">Continue in Chat Mode</span>
                    </Link>
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
