
import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Clock, AlertTriangle } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useDailyQueryLimit } from '@/hooks/useDailyQueryLimit';

export const QueryLimitDisplay: React.FC = () => {
  const { isSignedIn } = useUser();
  const { isLoaded, isUnlimitedUser, getRemaining, limits, updateTrigger } = useDailyQueryLimit();

  if (!isLoaded) return null;

  if (isUnlimitedUser) {
    return (
      <motion.div
        key={`unlimited-${updateTrigger}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center space-x-3 py-3 px-6 bg-card/20 backdrop-blur-sm"
      >
        <div className="flex items-center space-x-2 text-prism-primary-light">
          <SparklesIcon />
          <span className="text-sm font-medium">Unlimited Prism Chat access active today</span>
        </div>
      </motion.div>
    );
  }

  const promptsRemaining = getRemaining('chatPrompts');
  const commandsRemaining = getRemaining('chatCommands');
  const isLow = promptsRemaining <= 3 || commandsRemaining <= 2;
  const isEmpty = promptsRemaining === 0 || commandsRemaining === 0;

  const statusColor = isEmpty
    ? 'text-red-400'
    : isLow
      ? 'text-amber-400'
      : 'text-prism-primary-light';

  const StatusIcon = isEmpty ? AlertTriangle : isLow ? Clock : MessageCircle;

  return (
    <motion.div
      key={`${promptsRemaining}-${commandsRemaining}-${updateTrigger}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center justify-center gap-3 py-3 px-6 bg-card/20 backdrop-blur-sm"
    >
      <div className={`flex items-center space-x-2 ${statusColor}`}>
        <StatusIcon className="h-4 w-4" />
        <span className="text-sm font-medium">
          {isEmpty
            ? 'Daily limit reached'
            : `${promptsRemaining} of ${limits.chatPrompts} prompts • ${commandsRemaining} of ${limits.chatCommands} commands left`}
        </span>
      </div>

      {!isSignedIn && (
        <div className="text-xs text-muted-foreground px-3 py-1 bg-muted/30 rounded-full border border-border/30">
          Sign up to carry your daily progress across devices
        </div>
      )}
    </motion.div>
  );
};

const SparklesIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 2.25v2.5M12 19.25v2.5M4.772 4.772l1.768 1.768M17.46 17.46l1.768 1.768M2.25 12h2.5M19.25 12h2.5M4.772 19.228l1.768-1.768M17.46 6.54l1.768-1.768M8.75 12a3.25 3.25 0 116.5 0 3.25 3.25 0 01-6.5 0z"
    />
  </svg>
);
