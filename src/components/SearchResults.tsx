
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

  // Group results by source
  const engineResults = results.reduce((acc, result) => {
    if (!acc[result.source]) {
      acc[result.source] = [];
    }
    acc[result.source].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const getEngineColor = (engine: string) => {
    switch (engine) {
      case 'Google': return 'blue-500';
      case 'Bing': return 'blue-700';
      case 'DuckDuckGo': return 'yellow-600';
      case 'Brave': return 'orange-500';
      case 'Yahoo': return 'purple-600';
      case 'Qwant': return 'teal-500';
      case 'Ecosia': return 'green-600';
      case 'StartPage': return 'indigo-500';
      case 'Yandex': return 'red-500';
      case 'You.com': return 'violet-500';
      default: return 'purple-500';
    }
  };

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Object.entries(engineResults).map(([engine, results]) => (
          <SearchEngineColumn 
            key={engine}
            title={engine}
            results={results}
            bgColor={`bg-${getEngineColor(engine)}`}
            hoverBorderColor={`hover:border-${getEngineColor(engine).replace('500', '300')}`}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
