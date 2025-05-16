
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
      className={`result-card p-5 glass-card rounded-xl border border-purple-500/20 backdrop-blur-md
                bg-purple-500/10 hover:bg-purple-500/15 transition-all duration-300
                shadow-lg hover:shadow-purple-500/20`}
      whileHover={{
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <h3 className="text-sm font-medium text-purple-200 mb-3 hover:text-purple-100 hover:underline line-clamp-2 font-montserrat">
        <a href={result.url} target="_blank" rel="noopener noreferrer">
          {result.title}
        </a>
      </h3>
      
      <p className="text-xs text-purple-300/80 line-clamp-2 mb-4 font-inter">{result.snippet}</p>
      
      <a
        href={result.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-xs bg-gradient-to-r from-purple-600 to-purple-800
                 hover:from-purple-500 hover:to-purple-700 text-white px-3 py-1.5 rounded-lg transition-all
                 duration-200 border border-purple-500/30 shadow-lg shadow-purple-600/10 hover:shadow-purple-600/20"
      >
        Show more <ChevronRight className="h-3 w-3" />
      </a>
    </motion.div>
  );
};

export default SearchResultCard;
