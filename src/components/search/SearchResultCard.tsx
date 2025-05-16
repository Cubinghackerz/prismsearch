
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
      className={`result-card p-5 glass-card rounded-xl border border-orange-500/20 backdrop-blur-md
                bg-orange-500/10 hover:bg-orange-500/15 transition-all duration-300
                shadow-lg hover:shadow-orange-500/20`}
      whileHover={{
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <h3 className="text-sm font-medium text-orange-200 mb-3 hover:text-orange-100 hover:underline line-clamp-2 font-montserrat">
        <a href={result.url} target="_blank" rel="noopener noreferrer">
          {result.title}
        </a>
      </h3>
      
      <p className="text-xs text-orange-300/80 line-clamp-2 mb-4 font-inter">{result.snippet}</p>
      
      <a
        href={result.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-xs bg-gradient-to-r from-orange-600 to-orange-800
                 hover:from-orange-500 hover:to-orange-700 text-white px-3 py-1.5 rounded-lg transition-all
                 duration-200 border border-orange-500/30 shadow-lg shadow-orange-600/10 hover:shadow-orange-600/20"
      >
        Show more <ChevronRight className="h-3 w-3" />
      </a>
    </motion.div>
  );
};

export default SearchResultCard;
