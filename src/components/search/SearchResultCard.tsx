
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
                bg-orange-500/5 hover:bg-orange-500/10 transition-all duration-300
                shadow-lg hover:shadow-orange-500/20 relative overflow-hidden group`}
      whileHover={{
        y: -5,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
    >
      {/* Subtle gradient border effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-300/20 via-orange-500/20 to-teal-400/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      
      <div className="flex flex-col h-full">
        {/* URL source */}
        <div className="flex items-center mb-2 text-xs text-orange-300/60">
          <span className="inline-block w-2 h-2 rounded-full bg-orange-400 mr-2"></span>
          {getDomainFromURL(result.url)}
        </div>
        
        {/* Title with enhanced typography */}
        <h3 className="text-sm font-medium text-orange-200 mb-3 hover:text-orange-100 hover:underline line-clamp-2 font-montserrat group-hover:text-orange-100 transition-colors">
          <a href={result.url} target="_blank" rel="noopener noreferrer" className="focus-ring focus:outline-none rounded-sm">
            {result.title}
          </a>
        </h3>
        
        {/* Snippet with improved readability */}
        <p className="text-xs text-orange-300/80 line-clamp-2 mb-4 font-inter leading-relaxed">{result.snippet}</p>
        
        <div className="mt-auto pt-2 flex justify-between items-center">
          {/* Enhanced button */}
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs bg-gradient-to-r from-orange-600/80 to-orange-700/80
                     hover:from-orange-500 hover:to-orange-600 text-white px-3 py-1.5 rounded-lg transition-all
                     duration-200 border border-orange-500/30 shadow-sm hover:shadow-md hover:shadow-orange-600/10 focus-ring focus:outline-none"
          >
            View result <ExternalLink className="h-3 w-3" />
          </a>
          
          {/* Search engine indicator if available */}
          {result.engine && (
            <span className="text-xs text-orange-300/60 italic">
              via {result.engine}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SearchResultCard;
