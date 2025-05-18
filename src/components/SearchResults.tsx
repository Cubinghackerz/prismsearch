
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Database, Filter, ChevronDown, ChevronUp, RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import { SearchResult } from './search/types';
import SearchEngineColumn from './search/SearchEngineColumn';
import LoadingSkeleton from './search/LoadingSkeleton';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
}

const SearchResults = ({ results, isLoading, query }: SearchResultsProps) => {
  const [collapsedEngines, setCollapsedEngines] = useState<Record<string, boolean>>({});
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'relevance' | 'recent'>('relevance');
  
  if (isLoading) {
    return <LoadingSkeleton query={query} />;
  }

  if (!results.length) {
    return null;
  }

  // Get all unique sources/engines
  const engines = Array.from(new Set(results.map(result => result.source)));
  
  // Get unique categories for filtering - handle cases where category may be undefined
  const categories = Array.from(new Set(results.map(result => result.category || 'Uncategorized')));

  // Toggle engine collapse
  const toggleEngine = (engine: string) => {
    setCollapsedEngines(prev => ({ 
      ...prev, 
      [engine]: !prev[engine] 
    }));
  };

  // Toggle filter selection
  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  // Filter results based on selected filters - safely handle undefined category
  const filteredResults = selectedFilters.length > 0
    ? results.filter(result => selectedFilters.includes(result.category || 'Uncategorized'))
    : results;

  // Sort results - safely handle undefined date
  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === 'recent' && a.date && b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return (b.relevance || 0) - (a.relevance || 0); // Default to API-provided relevance
  });

  // Group results by engine
  const googleResults = sortedResults.filter(result => result.source === 'Google');
  const bingResults = sortedResults.filter(result => result.source === 'Bing');
  const duckduckgoResults = sortedResults.filter(result => result.source === 'DuckDuckGo');
  const braveResults = sortedResults.filter(result => result.source === 'Brave');
  const youResults = sortedResults.filter(result => result.source === 'You.com');

  return (
    <div className="w-full max-w-[95vw] mx-auto mt-8 pb-12">
      <motion.div 
        className="flex items-center justify-between mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-orange-500" />
          <h2 className="text-xl font-semibold text-orange-100 font-montserrat">Search Results</h2>
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
      
      {/* Filters and controls */}
      <motion.div 
        className="bg-orange-900/10 backdrop-blur-md rounded-lg p-3 mb-4 border border-orange-500/20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-orange-400" />
            <span className="text-sm text-orange-200 font-medium">Filters:</span>
            
            <div className="flex flex-wrap gap-2 ml-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleFilter(category)}
                  className={`
                    text-xs px-2 py-1 rounded-full border transition-all
                    ${selectedFilters.includes(category)
                      ? 'bg-orange-500/30 border-orange-500/40 text-orange-100'
                      : 'border-orange-500/20 text-orange-200 hover:bg-orange-500/10'}
                  `}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-orange-200">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'relevance' | 'recent')}
                className="text-xs bg-orange-900/20 border border-orange-500/30 rounded px-2 py-1 text-orange-100"
              >
                <option value="relevance">Relevance</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
            
            <button 
              className="text-xs flex items-center gap-1 text-orange-300 hover:text-orange-200"
              onClick={() => window.location.reload()}
            >
              <RefreshCcw className="h-3 w-3" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {engines.map(engine => {
          let engineResults;
          let bgColor;
          let hoverBorderColor;
          
          switch (engine) {
            case 'Google':
              engineResults = googleResults;
              bgColor = 'bg-orange-500';
              hoverBorderColor = 'hover:border-orange-300';
              break;
            case 'Bing':
              engineResults = bingResults;
              bgColor = 'bg-orange-700';
              hoverBorderColor = 'hover:border-orange-400';
              break;
            case 'DuckDuckGo':
              engineResults = duckduckgoResults;
              bgColor = 'bg-yellow-600';
              hoverBorderColor = 'hover:border-yellow-300';
              break;
            case 'Brave':
              engineResults = braveResults;
              bgColor = 'bg-orange-600';
              hoverBorderColor = 'hover:border-orange-300';
              break;
            case 'You.com':
              engineResults = youResults;
              bgColor = 'bg-orange-500';
              hoverBorderColor = 'hover:border-orange-300';
              break;
            default:
              engineResults = [];
              bgColor = 'bg-orange-500';
              hoverBorderColor = 'hover:border-orange-300';
          }
          
          const isCollapsed = collapsedEngines[engine];
          
          return (
            <motion.div
              key={engine}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                height: isCollapsed ? 'auto' : '100%'
              }}
              transition={{ duration: 0.3 }}
              className="flex flex-col"
            >
              <div 
                className={`flex justify-between items-center px-3 py-2 rounded-t-lg ${bgColor} cursor-pointer`}
                onClick={() => toggleEngine(engine)}
              >
                <h3 className="text-white font-medium text-sm font-montserrat">{engine}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-white/20 px-1.5 rounded-full text-white">
                    {engineResults.length}
                  </span>
                  {isCollapsed ? 
                    <ChevronDown className="h-4 w-4 text-white" /> : 
                    <ChevronUp className="h-4 w-4 text-white" />
                  }
                </div>
              </div>
              
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex-1"
                  >
                    <SearchEngineColumn 
                      title={engine} 
                      results={engineResults}
                      bgColor={bgColor}
                      hoverBorderColor={hoverBorderColor}
                      showTitle={false}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SearchResults;
