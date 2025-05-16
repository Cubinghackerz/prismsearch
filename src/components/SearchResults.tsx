
import { motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-orange-500" />
          <h2 className="text-xl font-semibold text-orange-100">Search Results</h2>
        </div>
        <div className="text-sm text-orange-400">
          Found {results.length} results across all engines
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
