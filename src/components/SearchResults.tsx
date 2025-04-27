
import { motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';
import { SearchResult } from './search/types';
import SearchEngineColumn from './search/SearchEngineColumn';
import LoadingSkeleton from './search/LoadingSkeleton';
import { SearchEngine } from './search/SearchEngineSettings';

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

  return (
    <div className="w-full max-w-[95vw] mx-auto mt-8 pb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-100">Search Results</h2>
        </div>
        <div className="text-sm text-gray-400">
          Found {results.length} results across selected engines
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {results.map(result => (
          <SearchEngineColumn 
            key={result.source}
            title={result.source}
            results={results.filter(r => r.source === result.source)}
            bgColor={`bg-${result.source === 'Google' ? 'blue-500' : 
              result.source === 'Bing' ? 'blue-700' : 
              result.source === 'DuckDuckGo' ? 'yellow-600' : 
              result.source === 'Brave' ? 'orange-500' : 'purple-500'}`}
            hoverBorderColor={`hover:border-${result.source === 'Google' ? 'blue-300' : 
              result.source === 'Bing' ? 'blue-400' : 
              result.source === 'DuckDuckGo' ? 'yellow-300' : 
              result.source === 'Brave' ? 'orange-300' : 'purple-300'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
