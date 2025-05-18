
import { motion } from 'framer-motion';
import { LayoutGrid, Database } from 'lucide-react';
import { SearchResult } from './search/types';
import SearchEngineColumn from './search/SearchEngineColumn';
import LoadingSkeleton from './search/LoadingSkeleton';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
}

const SearchResults = ({ results, isLoading, query }: SearchResultsProps) => {
  if (isLoading) {
    return <LoadingSkeleton query={query} />;
  }

  if (!results.length) {
    return null;
  }

  const googleResults = results.filter(result => result.source === 'Google');
  const bingResults = results.filter(result => result.source === 'Bing');
  const duckduckgoResults = results.filter(result => result.source === 'DuckDuckGo');
  const braveResults = results.filter(result => result.source === 'Brave');
  const youResults = results.filter(result => result.source === 'You.com');

  return (
    <div className="w-full max-w-[95vw] mx-auto mt-8 pb-12">
      <motion.div 
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-orange-500" />
          <h2 className="text-xl font-semibold text-orange-100 font-inter">Search Results</h2>
        </div>
        <motion.div 
          className="text-sm bg-orange-500/10 px-3 py-1 rounded-full text-orange-300 border border-orange-500/10 flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Database className="h-3 w-3" />
          <span>Found {results.length} results across all engines</span>
        </motion.div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <SearchEngineColumn 
          title="Google" 
          results={googleResults}
          bgColor="bg-orange-500"
          hoverBorderColor="hover:border-orange-300"
        />

        <SearchEngineColumn 
          title="Bing" 
          results={bingResults}
          bgColor="bg-orange-700"
          hoverBorderColor="hover:border-orange-400"
        />

        <SearchEngineColumn 
          title="DuckDuckGo" 
          results={duckduckgoResults}
          bgColor="bg-yellow-600"
          hoverBorderColor="hover:border-yellow-300"
        />

        <SearchEngineColumn 
          title="Brave" 
          results={braveResults}
          bgColor="bg-orange-600"
          hoverBorderColor="hover:border-orange-300"
        />

        <SearchEngineColumn 
          title="You.com" 
          results={youResults}
          bgColor="bg-orange-500"
          hoverBorderColor="hover:border-orange-300"
        />
      </div>
    </div>
  );
};

export default SearchResults;
