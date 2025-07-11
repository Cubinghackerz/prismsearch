import { motion } from 'framer-motion';
import { Bot, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import LoadingAnimation from './LoadingAnimation';
import ReactMarkdown from 'react-markdown';

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
  
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.3
  }} className="mb-6 p-4 backdrop-blur-sm rounded-xl border border-orange-500/20 bg-orange-950/30">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center mt-1 bg-black">
          <Bot className="w-5 h-5 text-orange-400" />
        </div>
        <div className="flex-1">
          {isLoading ? <div className="flex flex-col items-start gap-2 text-orange-300/70">
              <div className="flex items-center gap-3">
                <div>Thinking</div>
                <LoadingAnimation color="orange" size="small" variant="prism" />
              </div>
            </div> : <div>
            <div className="text-orange-100 markdown-content">
              <ReactMarkdown components={{
                strong: ({ node, ...props }) => <span className="font-bold" {...props} />,
                em: ({ node, ...props }) => <span className="italic" {...props} />,
                h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-3 mb-2" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-md font-bold mt-3 mb-1" {...props} />,
                p: ({ node, ...props }) => <p className="mb-3" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-2" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3" {...props} />,
                li: ({ node, ...props }) => <li className="ml-2" {...props} />,
                a: ({ node, ...props }) => <a className="text-prism-primary-light hover:underline" {...props} />,
                code: ({ node, ...props }) => <code className="bg-prism-surface/40 px-1 py-0.5 rounded text-sm" {...props} />
              }}>
                {aiResponse.replace(/\*/g, '•')}
              </ReactMarkdown>
            </div>
              
              {/* Chat button - Using Link component from react-router-dom */}
              {showChatButton && <div className="mt-3">
                  <Button variant="outline" size="sm" asChild className="border-orange-500/30 text-white bg-transparent hover:bg-orange-500/20 hover:border-orange-400/50">
                    <Link to="/chat">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Continue in Chat Mode
                    </Link>
                  </Button>
                </div>}
            </div>}
        </div>
      </div>
    </motion.div>;
};
export default AISearchResponse;
