
import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/context/ChatContext';
import { motion } from 'framer-motion';

interface DeepResearchButtonProps {
  topic: string;
  disabled?: boolean;
}

const DeepResearchButton: React.FC<DeepResearchButtonProps> = ({ topic, disabled = false }) => {
  const { runDeepResearch, isLoading } = useChat();
  const [isResearching, setIsResearching] = useState(false);

  const handleDeepResearch = async () => {
    if (!topic.trim() || disabled || isLoading) return;
    
    setIsResearching(true);
    try {
      await runDeepResearch(topic);
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        onClick={handleDeepResearch}
        disabled={disabled || isLoading || isResearching || !topic.trim()}
        variant="outline"
        size="sm"
        className="bg-gradient-to-r from-purple-600/20 to-purple-800/20 border-purple-500/30 text-purple-200 hover:from-purple-600/30 hover:to-purple-800/30 hover:border-purple-400/50 transition-all duration-300"
      >
        {isResearching ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Search className="mr-2 h-4 w-4" />
        )}
        {isResearching ? 'Researching...' : 'Deep Research'}
      </Button>
    </motion.div>
  );
};

export default DeepResearchButton;
