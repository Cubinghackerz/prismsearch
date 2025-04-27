
import { motion } from 'framer-motion';
import { LayoutGrid, ChevronDown, ChevronUp } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from 'react';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
}

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
          <LayoutGrid className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-100">Search Results</h2>
        </div>
        <div className="text-sm text-gray-400">
          Found {results.length} results across all engines
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <SearchEngineColumn 
          title="Google" 
          results={googleResults}
          bgColor="bg-blue-500"
          hoverBorderColor="hover:border-blue-300"
        />

        <SearchEngineColumn 
          title="Bing" 
          results={bingResults}
          bgColor="bg-blue-700"
          hoverBorderColor="hover:border-blue-400"
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
          bgColor="bg-orange-500"
          hoverBorderColor="hover:border-orange-300"
        />

        <SearchEngineColumn 
          title="You.com" 
          results={youResults}
          bgColor="bg-purple-500"
          hoverBorderColor="hover:border-purple-300"
        />
      </div>
    </div>
  );
};

interface SearchEngineColumnProps {
  title: string;
  results: SearchResult[];
  bgColor: string;
  hoverBorderColor: string;
}

const SearchEngineColumn = ({ title, results, bgColor, hoverBorderColor }: SearchEngineColumnProps) => {
  const [isOpen, setIsOpen] = useState(false);

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
          {results.length} results
        </div>
      </div>

      {results.length > 0 && (
        <div className="mb-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className={`result-card p-4 bg-white/10 rounded-lg border border-gray-700 ${hoverBorderColor} transition-all duration-300 hover:bg-white/15`}
          >
            <h3 className="text-sm font-medium text-blue-400 mt-1 hover:underline line-clamp-2">
              <a href={results[0].url} target="_blank" rel="noopener noreferrer">
                {results[0].title}
              </a>
            </h3>
            <p className="text-xs text-gray-300 mt-1 line-clamp-2">{results[0].snippet}</p>
          </motion.div>
        </div>
      )}
      
      {results.length > 1 && (
        <div className="mt-3 mb-1">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm bg-white/10 hover:bg-white/20 rounded-lg text-gray-200 hover:text-white transition-all duration-200 border border-gray-700 shadow-md">
              {isOpen ? (
                <>Show less <ChevronUp className="h-4 w-4" /></>
              ) : (
                <>Show more {results.length - 1} results <ChevronDown className="h-4 w-4" /></>
              )}
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="space-y-4 mt-4">
                {results.slice(1).map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`result-card p-4 bg-white/10 rounded-lg border border-gray-700 ${hoverBorderColor} transition-all duration-300 hover:bg-white/15`}
                  >
                    <h3 className="text-sm font-medium text-blue-400 mt-1 hover:underline line-clamp-2">
                      <a href={result.url} target="_blank" rel="noopener noreferrer">
                        {result.title}
                      </a>
                    </h3>
                    
                    <p className="text-xs text-gray-300 mt-1 line-clamp-3">{result.snippet}</p>
                    
                    <div className="mt-2 overflow-hidden">
                      <a 
                        href={result.url}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-blue-400 transition-colors block truncate"
                      >
                        {result.url}
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {results.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No results from {title}
        </div>
      )}
    </motion.div>
  );
};

const LoadingSkeleton = ({ query }: { query: string }) => {
  return (
    <div className="w-full max-w-[95vw] mx-auto mt-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-6 w-24" />
            </div>
            
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="mb-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
