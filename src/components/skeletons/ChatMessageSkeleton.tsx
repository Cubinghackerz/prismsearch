
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from 'framer-motion';

interface ChatMessageSkeletonProps {
  isUser?: boolean;
  count?: number;
}

const ChatMessageSkeleton = ({ isUser = false, count = 1 }: ChatMessageSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
        >
          <div className={`
            max-w-[80%] p-4 rounded-2xl shadow-lg
            ${isUser 
              ? 'bg-gradient-to-r from-prism-primary/20 to-prism-accent/20 border border-prism-border' 
              : 'bg-prism-surface/40 border border-prism-border'
            }
          `}>
            {/* Message content skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              
              {/* Additional content for AI messages */}
              {!isUser && (
                <>
                  <div className="mt-3 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  
                  {/* Bullet points skeleton */}
                  <div className="mt-3 space-y-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Skeleton className="h-2 w-2 rounded-full mt-1.5 flex-shrink-0" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Timestamp skeleton */}
            <div className="flex justify-end mt-2">
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
};

export default ChatMessageSkeleton;
