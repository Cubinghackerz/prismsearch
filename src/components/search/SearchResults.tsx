
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Database, Filter, ChevronDown, ChevronUp, RefreshCcw, List, BookmarkPlus } from 'lucide-react';
import { useState, useMemo } from 'react';
import { SearchResult } from './search/types';
import SearchEngineColumn from './search/SearchEngineColumn';
import LoadingSkeleton from './search/LoadingSkeleton';
import { useToast } from '@/hooks/use-toast';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
}

const SearchResults = ({ results, isLoading, query }: SearchResultsProps) => {
  const [collapsedEngines, setCollapsedEngines] = useState<Record<string, boolean>>({});
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'relevance' | 'recent'>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();
  
  // Memoize grouped results to prevent recalculation
  const groupedResults = useMemo(() => {
    const filtered = selectedFilters.length > 0
      ? results.filter(result => selectedFilters.includes(result.category || 'Uncategorized'))
      : results;

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'recent' && a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return (b.relevance || 0) - (a.relevance || 0);
    });

    const grouped: Record<string, SearchResult[]> = {};
    sorted.forEach(result => {
      if (!grouped[result.source]) {
        grouped[result.source] = [];
      }
      grouped[result.source].push(result);
    });

    return grouped;
  }, [results, selectedFilters, sortBy]);

  if (isLoading) {
    return <LoadingSkeleton query={query} />;
  }

  if (!results.length) {
    return null;
  }

  // Get all unique sources/engines
  const engines = Array.from(new Set(results.map(result => result.source)));
  
  // Get unique categories for filtering
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

  // Handle bookmark functionality
  const handleBookmark = (result: SearchResult) => {
    const existingBookmarks = localStorage.getItem('prism_bookmarks');
    let bookmarks = existingBookmarks ? JSON.parse(existingBookmarks) : [];
    
    const isAlreadyBookmarked = bookmarks.some((bookmark: SearchResult) => bookmark.url === result.url);
    
    if (!isAlreadyBookmarked) {
      bookmarks.push(result);
      localStorage.setItem('prism_bookmarks', JSON.stringify(bookmarks));
      
      toast({
        title: "Bookmark added",
        description: `${result.title} has been saved to your bookmarks.`,
        variant: "default",
      });
    } else {
      toast({
        title: "Already bookmarked",
        description: "This page is already in your bookmarks.",
        variant: "default",
      });
    }
  };

  return (
    <div className="w-full max-w-[95vw] mx-auto mt-8 pb-12">
      <motion.div 
        className="flex items-center justify-between mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-prism-primary" />
          <h2 className="text-xl font-semibold text-prism-text font-montserrat">Search Results</h2>
        </div>
        
        <motion.div 
          className="text-sm bg-prism-primary/10 px-3 py-1 rounded-full text-prism-primary border border-prism-border flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Database className="h-3 w-3" />
          <span>Found {results.length} results across all engines</span>
        </motion.div>
      </motion.div>
      
      {/* Filters and controls */}
      <motion.div 
        className="bg-prism-primary/10 backdrop-blur-md rounded-lg p-3 mb-4 border border-prism-border"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-prism-primary" />
            <span className="text-sm text-prism-text font-medium">Filters:</span>
            
            <div className="flex flex-wrap gap-2 ml-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleFilter(category)}
                  className={`
                    text-xs px-2 py-1 rounded-full border transition-all
                    ${selectedFilters.includes(category)
                      ? 'bg-prism-primary/30 border-prism-primary/40 text-prism-text'
                      : 'border-prism-border text-prism-text-muted hover:bg-prism-primary/10'}
                  `}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View mode toggle */}
            <div className="flex items-center bg-prism-surface/30 rounded-md overflow-hidden border border-prism-border">
              <button
                onClick={() => setViewMode('grid')}
                className={`text-xs px-3 py-1.5 flex items-center gap-1
                  ${viewMode === 'grid' ? 'bg-prism-primary/30 text-prism-text' : 'text-prism-text-muted hover:bg-prism-primary/10'}`}
              >
                <LayoutGrid className="h-3 w-3" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`text-xs px-3 py-1.5 flex items-center gap-1
                  ${viewMode === 'list' ? 'bg-prism-primary/30 text-prism-text' : 'text-prism-text-muted hover:bg-prism-primary/10'}`}
              >
                <List className="h-3 w-3" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-prism-text">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'relevance' | 'recent')}
                className="text-xs bg-prism-surface/20 border border-prism-border rounded px-2 py-1 text-prism-text"
              >
                <option value="relevance">Relevance</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
            
            <button 
              className="text-xs flex items-center gap-1 text-prism-primary hover:text-prism-primary-light bg-prism-surface/30 px-2 py-1 rounded-md border border-prism-border hover:bg-prism-primary/20 transition-colors"
              onClick={() => window.location.reload()}
            >
              <RefreshCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </motion.div>
      
      {/* Results grid/list */}
      <div className={viewMode === 'grid' ? 
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4" :
        "flex flex-col gap-4"
      }>
        {engines.map(engine => {
          const engineData = {
            'Google': {
              results: groupedResults['Google'] || [],
              bgColor: 'bg-prism-primary',
              hoverBorderColor: 'hover:border-prism-primary-light'
            },
            'Bing': {
              results: groupedResults['Bing'] || [],
              bgColor: 'bg-prism-primary-dark',
              hoverBorderColor: 'hover:border-prism-primary'
            },
            'DuckDuckGo': {
              results: groupedResults['DuckDuckGo'] || [],
              bgColor: 'bg-prism-accent',
              hoverBorderColor: 'hover:border-prism-accent-light'
            },
            'Brave': {
              results: groupedResults['Brave'] || [],
              bgColor: 'bg-prism-accent-dark',
              hoverBorderColor: 'hover:border-prism-accent'
            },
            'You.com': {
              results: groupedResults['You.com'] || [],
              bgColor: 'bg-cyan-500',
              hoverBorderColor: 'hover:border-cyan-400'
            }
          };
          
          const currentEngineData = engineData[engine as keyof typeof engineData] || {
            results: [],
            bgColor: 'bg-prism-primary',
            hoverBorderColor: 'hover:border-prism-primary-light'
          };
          
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
              className={viewMode === 'list' ? 'w-full' : 'flex flex-col'}
            >
              <div 
                className={`flex justify-between items-center px-3 py-2 rounded-t-lg ${currentEngineData.bgColor} cursor-pointer`}
                onClick={() => toggleEngine(engine)}
              >
                <h3 className="text-white font-medium text-sm font-montserrat">{engine}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-white/20 px-1.5 rounded-full text-white">
                    {currentEngineData.results.length}
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
                      results={currentEngineData.results}
                      bgColor={currentEngineData.bgColor}
                      hoverBorderColor={currentEngineData.hoverBorderColor}
                      showTitle={false}
                      viewMode={viewMode}
                      onBookmark={handleBookmark}
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
