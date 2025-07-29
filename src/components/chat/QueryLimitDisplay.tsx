
import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Clock, AlertTriangle } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useDailyQueryLimit } from '@/hooks/useDailyQueryLimit';

export const QueryLimitDisplay: React.FC = () => {
  const { isSignedIn } = useUser();
  const { queriesLeft, maxQueries, isLimitReached, isLoaded, updateTrigger } = useDailyQueryLimit();

  if (!isLoaded) return null;

  const getStatusColor = () => {
    if (isLimitReached) return 'text-red-400';
    if (queriesLeft <= 10) return 'text-amber-400';
    return 'text-prism-primary-light';
  };

  const getStatusIcon = () => {
    if (isLimitReached) return <AlertTriangle className="h-4 w-4" />;
    if (queriesLeft <= 10) return <Clock className="h-4 w-4" />;
    return <MessageCircle className="h-4 w-4" />;
  };

  return (
    <motion.div
      key={`${queriesLeft}-${updateTrigger}`} // Use both values to trigger re-animation
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center space-x-2 py-2 px-4 bg-prism-bg/50 border-b border-prism-border/30"
    >
      <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">
          {isLimitReached ? (
            'Daily limit reached'
          ) : (
            <>
              {queriesLeft} {queriesLeft === 1 ? 'query' : 'queries'} left today
            </>
          )}
        </span>
      </div>
      
      {!isSignedIn && (
        <div className="text-xs text-prism-text-muted">
          • Sign up for 70 more daily queries
        </div>
      )}
    </motion.div>
  );
};
