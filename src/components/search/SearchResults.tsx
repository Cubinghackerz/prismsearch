import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, LayoutGrid, List, Filter, RefreshCcw } from 'lucide-react';
import SearchResultCard from './SearchResultCard';
import { SearchResult } from './types';

interface SearchResultsProps {
  googleResults: SearchResult[];
  bingResults: SearchResult[];
  duckduckgoResults: SearchResult[];
  braveResults: SearchResult[];
  youResults: SearchResult[];
  isLoading: boolean;
  searchTerm?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  googleResults,
  bingResults,
  duckduckgoResults,
  braveResults,
  youResults,
  isLoading,
  searchTerm = ''
}) => {
  const [collapsedEngines, setCollapsedEngines] = useState<Record<string, boolean>>({});
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'relevance' | 'recent'>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const engines = ['Google', 'Bing', 'DuckDuckGo', 'Brave', 'You.com'];
  
  const allResults = useMemo(() => [
    ...googleResults,
    ...bingResults,
    ...duckduckgoResults,
    ...braveResults,
    ...youResults
  ], [googleResults, bingResults, duckduckgoResults, braveResults, youResults]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    allResults.forEach(result => {
      if (result.category) cats.add(result.category);
    });
    return Array.from(cats);
  }, [allResults]);

  const toggleEngine = (engine: string) => {
    setCollapsedEngines(prev => ({
      ...prev,
      [engine]: !prev[engine]
    }));
  };

  const toggleFilter = (category: string) => {
    setSelectedFilters(prev => 
      prev.includes(category)
        ? prev.filter(f => f !== category)
        : [...prev, category]
    );
  };

  const totalResults = allResults.length;

  if (isLoading) {
    return (
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
            <div className="h-20 bg-muted rounded mb-4"></div>
          </div>
        ))}
      </motion.div>
    );
  }

  if (totalResults === 0) {
    return (
      <motion.div 
        className="text-center py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-muted-foreground">No results found for your search.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header with results count */}
      <motion.div 
        className="flex items-center justify-between mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Search Results</h2>
        </div>
       
        <motion.div 
          className="text-sm bg-primary/10 px-3 py-1 rounded-full text-primary border border-border flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <span className="font-medium">{totalResults} results</span>
        </motion.div>
      </motion.div>
     
      {/* Filters and controls */}
      <motion.div 
        className="bg-card backdrop-blur-md rounded-lg p-3 mb-4 border border-border"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Filters:</span>
            
            <div className="flex flex-wrap gap-2 ml-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleFilter(category)}
                  className={`
                    text-xs px-2 py-1 rounded-full border transition-all
                    ${selectedFilters.includes(category) 
                      ? 'bg-primary/20 border-primary/40 text-primary'
                      : 'border-border text-muted-foreground hover:bg-primary/10'}
                  `}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View mode toggle */}
            <div className="flex items-center bg-secondary rounded-md overflow-hidden border border-border">
              <button
                onClick={() => setViewMode('grid')}
                className={`text-xs px-3 py-1.5 flex items-center gap-1 transition-colors
                  ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-primary/10'}`}
              >
                <LayoutGrid className="h-3 w-3" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`text-xs px-3 py-1.5 flex items-center gap-1 transition-colors
                  ${viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-primary/10'}`}
              >
                <List className="h-3 w-3" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
           
            <div className="flex items-center gap-2">
              <span className="text-sm">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'relevance' | 'recent')}
                className="text-xs bg-secondary border border-border rounded px-2 py-1"
              >
                <option value="relevance">Relevance</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
           
            <button 
              className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 bg-secondary px-2 py-1 rounded-md border border-border hover:bg-primary/10 transition-colors"
              onClick={() => window.location.reload()}
            >
              <RefreshCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Results by engine */}
      <div className="space-y-4">
        {engines.map((engine, index) => {
          let engineResults: SearchResult[];
          let bgColor: string;
          let hoverBorderColor: string;
          
          // Engine selection with improved styling
          const engineMap = {
            'Google': {
              results: googleResults,
              bgColor: 'bg-primary',
              hoverBorderColor: 'hover:border-primary'
            },
            'Bing': {
              results: bingResults,
              bgColor: 'bg-blue-600',
              hoverBorderColor: 'hover:border-blue-500'
            },
            'DuckDuckGo': {
              results: duckduckgoResults,
              bgColor: 'bg-accent',
              hoverBorderColor: 'hover:border-accent'
            },
            'Brave': {
              results: braveResults,
              bgColor: 'bg-orange-500',
              hoverBorderColor: 'hover:border-orange-400'
            },
            'You.com': {
              results: youResults,
              bgColor: 'bg-cyan-500',
              hoverBorderColor: 'hover:border-cyan-400'
            }
          };
          
          const engineData = engineMap[engine as keyof typeof engineMap] || {
            results: [],
            bgColor: 'bg-primary',
            hoverBorderColor: 'hover:border-primary'
          };
          
          engineResults = engineData.results;
          bgColor = engineData.bgColor;
          hoverBorderColor = engineData.hoverBorderColor;
          
          const isCollapsed = collapsedEngines[engine];
          
          if (engineResults.length === 0) return null;

          return (
            <motion.div
              key={engine}
              className={`border border-border rounded-lg overflow-hidden transition-all duration-300 ${hoverBorderColor}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div 
                className={`flex justify-between items-center px-4 py-3 ${bgColor} cursor-pointer`}
                onClick={() => toggleEngine(engine)}
              >
                <h3 className="text-white font-medium">{engine}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full text-white">
                    {engineResults.length} results
                  </span>
                  {isCollapsed ? <ChevronDown className="h-4 w-4 text-white" /> : <ChevronUp className="h-4 w-4 text-white" />}
                </div>
              </div>
              
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className={`p-4 space-y-4 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}`}>
                      {engineResults
                        .filter(result => selectedFilters.length === 0 || selectedFilters.includes(result.category || ''))
                        .map((result, resultIndex) => (
                           <SearchResultCard 
                             key={`${engine}-${resultIndex}`} 
                             result={result} 
                             index={resultIndex}
                             hoverBorderColor={hoverBorderColor}
                             searchTerm={searchTerm}
                             viewMode={viewMode}
                           />
                        ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default SearchResults;