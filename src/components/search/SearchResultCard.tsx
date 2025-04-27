
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { SearchResult } from './types';

interface SearchResultCardProps {
  result: SearchResult;
  index: number;
  hoverBorderColor: string;
}

const SearchResultCard = ({ result, index, hoverBorderColor }: SearchResultCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`result-card p-4 bg-white/10 rounded-lg border border-gray-700 ${hoverBorderColor} transition-all duration-300 hover:bg-white/15`}
    >
      <h3 className="text-sm font-medium text-blue-400 mb-2 hover:underline line-clamp-2">
        <a href={result.url} target="_blank" rel="noopener noreferrer">
          {result.title}
        </a>
      </h3>
      
      <div className="relative">
        <p className="text-xs text-gray-300 mb-3 line-clamp-[7]">{result.snippet}</p>
        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
      </div>
      
      <a
        href={result.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-xs bg-white/10 hover:bg-white/20 text-gray-200 
                 hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200 border border-gray-700"
      >
        Show more <ChevronRight className="h-3 w-3" />
      </a>
    </motion.div>
  );
};

export default SearchResultCard;
