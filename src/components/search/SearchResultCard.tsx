
import { motion } from 'framer-motion';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { SearchResult } from './types';

interface SearchResultCardProps {
  result: SearchResult;
  index: number;
  hoverBorderColor: string;
}

const SearchResultCard = ({ result, index, hoverBorderColor }: SearchResultCardProps) => {
  // Extract domain from URL for display
  const getDomainFromURL = (url: string) => {
    try {
      const domain = new URL(url);
      return domain.hostname.replace('www.', '');
    } catch (error) {
      return url;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      className={`result-card p-5 glass-card rounded-xl border border-orange-500/20
                bg-orange-500/5 hover:bg-orange-500/15 transition-all duration-300
                shadow-lg hover:shadow-xl hover:shadow-orange-500/20 relative overflow-hidden group`}
      whileHover={{
        y: -5,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
    >
      {/* Enhanced gradient border effect on hover with smoother animation */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-300/25 via-orange-500/25 to-teal-400/25 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out pointer-events-none"></div>
      
      <div className="flex flex-col h-full">
        {/* URL source with improved visual indicator */}
        <div className="flex items-center mb-2 text-xs text-orange-300/70">
          <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 mr-2 shadow-sm shadow-orange-500/20 group-hover:animate-pulse"></span>
          {getDomainFromURL(result.url)}
        </div>
        
        {/* Title with enhanced typography using Playfair Display */}
        <h3 className="text-base font-medium text-orange-200 mb-3 hover:text-orange-100 group-hover:text-orange-100 transition-colors line-clamp-2 font-playfair">
          <a href={result.url} target="_blank" rel="noopener noreferrer" className="focus-ring focus:outline-none rounded-sm">
            {result.title}
          </a>
        </h3>
        
        {/* Snippet with improved readability */}
        <p className="text-xs text-orange-300/80 line-clamp-3 mb-4 font-inter leading-relaxed tracking-wide">
          {result.snippet}
        </p>
        
        <div className="mt-auto pt-2 flex justify-between items-center">
          {/* Enhanced button with better hover effects */}
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs bg-gradient-to-r from-orange-600/80 to-orange-700/80
                     hover:from-orange-500 hover:to-orange-600 text-white px-3 py-1.5 rounded-lg transition-all
                     duration-300 border border-orange-500/40 shadow-sm hover:shadow-md hover:shadow-orange-600/25 focus-ring focus:outline-none
                     hover:translate-y-[-1px] active:translate-y-[1px]"
          >
            View result <ExternalLink className="h-3 w-3 ml-1 transition-transform group-hover:rotate-12" />
          </a>
          
          {/* Search engine indicator with improved styling */}
          {result.engine && (
            <span className="text-xs bg-orange-500/15 px-2 py-0.5 rounded-full text-orange-300/80 border border-orange-500/10">
              {result.engine}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SearchResultCard;
