
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AISearchResponseProps {
  query: string;
}

const AISearchResponse = ({ query }: AISearchResponseProps) => {
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getAIResponse = async () => {
      if (!query) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('ai-search-assistant', {
          body: { query }
        });

        if (error) throw error;
        setAiResponse(data.response);
      } catch (error) {
        console.error('AI Response Error:', error);
        setAiResponse('');
      } finally {
        setIsLoading(false);
      }
    };

    getAIResponse();
  }, [query]);

  if (!query || (!isLoading && !aiResponse)) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 p-4 bg-purple-500/10 backdrop-blur-sm rounded-xl border border-purple-500/20"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
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
            <p className="text-purple-100">{aiResponse}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AISearchResponse;
