
import { motion } from 'framer-motion';
import { SearchResult } from './types';
import SearchResultCard from './SearchResultCard';
import { memo } from 'react';

interface SearchEngineColumnProps {
  title: string;
  results: SearchResult[];
  bgColor: string;
  hoverBorderColor: string;
  showTitle?: boolean;
  viewMode?: 'grid' | 'list';
  onBookmark?: (result: SearchResult) => void;
}

const SearchEngineColumn = memo(({ 
  title, 
  results, 
  bgColor, 
  hoverBorderColor, 
  showTitle = true, 
  viewMode = 'grid',
  onBookmark 
}: SearchEngineColumnProps) => {
  if (!results.length) {
    return (
      <div className="bg-card border border-border rounded-b-lg p-4 text-center">
        <p className="text-muted-foreground text-sm">No results found</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`bg-card border border-border ${showTitle ? 'rounded-lg' : 'rounded-b-lg'}`}
    >
      {showTitle && (
        <div className={`${bgColor} text-white p-3 rounded-t-lg`}>
          <h3 className="font-medium text-sm font-montserrat">{title}</h3>
          <span className="text-xs opacity-80">{results.length} results</span>
        </div>
      )}
      
      <div className={`p-3 space-y-3 ${viewMode === 'list' ? 'max-h-[600px] overflow-y-auto' : ''}`}>
        {results.map((result, index) => (
          <SearchResultCard
            key={`${result.id}-${index}`}
            result={result}
            index={index}
            hoverBorderColor={hoverBorderColor}
            viewMode={viewMode}
            onBookmark={onBookmark}
          />
        ))}
      </div>
    </motion.div>
  );
});

SearchEngineColumn.displayName = 'SearchEngineColumn';

export default SearchEngineColumn;
