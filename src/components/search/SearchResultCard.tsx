
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
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
      className={`result-card p-4 rounded-lg border border-orange-500/20
                bg-orange-500/5 hover:bg-orange-500/10 transition-all duration-300
                shadow-md hover:shadow-lg hover:shadow-orange-500/10 relative overflow-hidden group`}
      whileHover={{
        y: -3,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
    >
      {/* Simplified border effect for better readability */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-300/10 via-orange-500/10 to-teal-400/10 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out pointer-events-none"></div>
      
      <div className="flex flex-col h-full">
        {/* URL source with improved visual indicator */}
        <div className="flex items-center mb-2 text-xs text-orange-300/80">
          <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-2 opacity-70"></span>
          {getDomainFromURL(result.url)}
        </div>
        
        {/* Title with improved readability */}
        <h3 className="text-base font-medium text-orange-100 mb-2 transition-colors line-clamp-2 font-inter">
          <a href={result.url} target="_blank" rel="noopener noreferrer" className="focus:outline-1 focus:outline-orange-500/50 rounded-sm">
            {result.title}
          </a>
        </h3>
        
        {/* Snippet with improved readability */}
        <p className="text-sm text-orange-200/90 line-clamp-3 mb-4 font-inter leading-relaxed">
          {result.snippet}
        </p>
        
        <div className="mt-auto pt-2 flex justify-between items-center">
          {/* Enhanced button with better hover effects */}
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs bg-orange-600/80 
                     hover:bg-orange-500/80 text-white px-3 py-1.5 rounded-md transition-all
                     duration-200 border border-orange-500/30 shadow-sm hover:shadow
                     hover:translate-y-[-1px]"
          >
            View result <ExternalLink className="h-3 w-3 ml-1" />
          </a>
          
          {/* Search engine indicator with improved styling */}
          {result.engine && (
            <span className="text-xs bg-orange-500/15 px-2 py-0.5 rounded-full text-orange-300/90 border border-orange-500/10">
              {result.engine}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SearchResultCard;
