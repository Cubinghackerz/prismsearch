
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from 'framer-motion';

interface SearchResultsSkeletonProps {
  query?: string;
}

const SearchResultsSkeleton = ({ query }: SearchResultsSkeletonProps) => {
  return (
    <div className="w-full max-w-[95vw] mx-auto mt-8 pb-12">
      {/* Header skeleton */}
      <motion.div 
        className="flex items-center justify-between mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-8 w-48 rounded-full" />
      </motion.div>
      
      {/* Filters skeleton */}
      <motion.div 
        className="bg-prism-primary/10 backdrop-blur-md rounded-lg p-3 mb-4 border border-prism-border"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-2 ml-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-20 rounded-full" />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      </motion.div>
      
      {/* Search engines grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, engineIndex) => (
          <motion.div
            key={engineIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: engineIndex * 0.1 }}
            className="flex flex-col"
          >
            {/* Engine header */}
            <div className="flex justify-between items-center px-3 py-2 rounded-t-lg bg-gradient-to-r from-prism-primary/80 to-prism-primary">
              <Skeleton className="h-4 w-16 bg-white/20" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-6 rounded-full bg-white/20" />
                <Skeleton className="h-4 w-4 bg-white/20" />
              </div>
            </div>
            
            {/* Engine results */}
            <div className="bg-prism-surface/40 border border-prism-border rounded-b-lg p-3 flex-1">
              {Array.from({ length: 3 }).map((_, resultIndex) => (
                <div key={resultIndex} className="mb-4 last:mb-0">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="flex items-center gap-2 mt-2">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      
      {query && (
        <motion.div 
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 text-prism-text-muted">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-prism-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-prism-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-prism-primary rounded-full animate-bounce"></div>
            </div>
            <span>Searching "{query}" across all engines...</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SearchResultsSkeleton;
