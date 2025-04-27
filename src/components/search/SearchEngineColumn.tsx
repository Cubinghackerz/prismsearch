
import { motion } from 'framer-motion';
import { SearchResult } from './types';
import SearchResultCard from './SearchResultCard';

interface SearchEngineColumnProps {
  title: string;
  results: SearchResult[];
  bgColor: string;
  hoverBorderColor: string;
}

const SearchEngineColumn = ({ title, results, bgColor, hoverBorderColor }: SearchEngineColumnProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-gray-800 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center`}>
            <span className="text-white font-bold">{title[0]}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
        </div>
        <div className="text-sm text-gray-400">
          {results.length} {results.length === 1 ? 'Result' : 'Results'}
        </div>
      </div>

      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result, index) => (
            <SearchResultCard
              key={result.id}
              result={result}
              index={index}
              hoverBorderColor={hoverBorderColor}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          No results from {title}
        </div>
      )}
    </motion.div>
  );
};

export default SearchEngineColumn;
