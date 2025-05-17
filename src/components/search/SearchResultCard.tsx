
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
      className={`result-card-enhanced p-5 glass-card rounded-xl border border-orange-500/20 backdrop-blur-md
                bg-gradient-to-br from-orange-500/5 via-orange-500/10 to-orange-500/5 
                hover:bg-orange-500/15 transition-all duration-300
                shadow-lg hover:shadow-orange-500/20`}
      whileHover={{
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <div className="flex flex-col h-full">
        <h3 className="text-sm font-semibold text-orange-200 mb-3 hover:text-orange-50 
                    hover:underline line-clamp-2 font-montserrat tracking-tight">
          <a href={result.url} target="_blank" rel="noopener noreferrer" 
             className="bg-clip-text text-transparent bg-gradient-to-r from-orange-200 to-orange-50">
            {result.title}
          </a>
        </h3>
        
        <p className="text-xs text-orange-300/90 line-clamp-2 mb-4 font-inter leading-relaxed">{result.snippet}</p>
        
        <div className="mt-auto">
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 text-xs bg-gradient-to-r from-orange-600 to-orange-700
                     hover:from-orange-500 hover:to-orange-600 text-white px-3 py-1.5 rounded-lg transition-all
                     duration-200 border border-orange-500/40 shadow-md shadow-orange-700/15 
                     hover:shadow-orange-600/25 ember-glow`}
          >
            Show more <ChevronRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchResultCard;
