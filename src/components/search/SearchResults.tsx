
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Database, Filter, ChevronDown, ChevronUp, RefreshCcw, List } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { SearchResult } from './types';
import SearchEngineColumn from './SearchEngineColumn';
import LoadingSkeleton from './LoadingSkeleton';
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
  
  if (isLoading) {
    return <LoadingSkeleton query={query} />;
  }

  if (!results.length) {
    return null;
  }

  // Memoize expensive computations with stable dependencies
  const engines = useMemo(() => {
    return Array.from(new Set(results.map(result => result.source)));
  }, [results]);
  
  const categories = useMemo(() => {
    return Array.from(new Set(results.map(result => result.category || 'Uncategorized')));
  }, [results]);

  // Memoize filtered and sorted results
  const processedResults = useMemo(() => {
    // Filter results
    const filtered = selectedFilters.length > 0
      ? results.filter(result => selectedFilters.includes(result.category || 'Uncategorized'))
      : results;

    // Sort results
    return [...filtered].sort((a, b) => {
      if (sortBy === 'recent' && a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return (b.relevance || 0) - (a.relevance || 0);
    });
  }, [results, selectedFilters, sortBy]);

  // Fix: Create stable object reference for grouped results
  const groupedResults = useMemo(() => {
    const grouped = {
      Google: [] as SearchResult[],
      Bing: [] as SearchResult[],
      DuckDuckGo: [] as SearchResult[],
      Brave: [] as SearchResult[],
      'You.com': [] as SearchResult[]
    };

    processedResults.forEach(result => {
      if (result.source in grouped) {
        grouped[result.source as keyof typeof grouped].push(result);
      }
    });

    return grouped;
  }, [processedResults]);

  // Optimize event handlers with useCallback
  const toggleEngine = useCallback((engine: string) => {
    setCollapsedEngines(prev => ({ 
      ...prev, 
      [engine]: !prev[engine] 
    }));
  }, []);

  const toggleFilter = useCallback((filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  }, []);

  const handleSortChange = useCallback((newSort: 'relevance' | 'recent') => {
    setSortBy(newSort);
  }, []);

  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  // Handle bookmark functionality
  const handleBookmark = useCallback((result: SearchResult) => {
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
  }, [toast]);

  return (
    <div className="w-full max-w-[95vw] mx-auto mt-8 pb-12">
      <motion.div 
        className="flex items-center justify-between mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground font-montserrat">Search Results</h2>
        </div>
        
        <motion.div 
          className="text-sm bg-primary/10 px-3 py-1 rounded-full text-primary border border-border flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Database className="h-3 w-3" />
          <span>Found {results.length} results across all engines</span>
        </motion.div>
      </motion.div>
      
      {/* Filters and controls */}
      <motion.div 
        className="bg-card/50 backdrop-blur-sm rounded-lg p-3 mb-4 border border-border"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, delay: 0.05 }}
      >
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <span className="text-sm text-foreground font-medium">Filters:</span>
            
            <div className="flex flex-wrap gap-2 ml-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleFilter(category)}
                  className={`
                    text-xs px-2 py-1 rounded-full border transition-colors duration-150
                    ${selectedFilters.includes(category)
                      ? 'bg-primary/20 border-primary/40 text-primary'
                      : 'border-border text-muted-foreground hover:bg-primary/5'}
                  `}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View mode toggle */}
            <div className="flex items-center bg-muted/50 rounded-md overflow-hidden border border-border">
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`text-xs px-3 py-1.5 flex items-center gap-1 transition-colors duration-150
                  ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-primary/5'}`}
              >
                <LayoutGrid className="h-3 w-3" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`text-xs px-3 py-1.5 flex items-center gap-1 transition-colors duration-150
                  ${viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-primary/5'}`}
              >
                <List className="h-3 w-3" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as 'relevance' | 'recent')}
                className="text-xs bg-card border border-border rounded px-2 py-1 text-foreground"
              >
                <option value="relevance">Relevance</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
            
            <button 
              className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 bg-card px-2 py-1 rounded-md border border-border hover:bg-primary/5 transition-colors duration-150"
              onClick={handleRefresh}
            >
              <RefreshCcw className="h-3 w-3" />
              <span>Refresh</span>
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
          const engineResults = groupedResults[engine as keyof typeof groupedResults] || [];
          const isCollapsed = collapsedEngines[engine];
          
          // Engine color mapping
          const engineStyles = {
            'Google': { bg: 'bg-primary', hover: 'hover:border-primary/70' },
            'Bing': { bg: 'bg-primary/90', hover: 'hover:border-primary/60' },
            'DuckDuckGo': { bg: 'bg-accent', hover: 'hover:border-accent/70' },
            'Brave': { bg: 'bg-accent/90', hover: 'hover:border-accent/60' },
            'You.com': { bg: 'bg-primary/80', hover: 'hover:border-primary/50' }
          };
          
          const style = engineStyles[engine as keyof typeof engineStyles] || engineStyles['Google'];
          
          return (
            <motion.div
              key={engine}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                height: isCollapsed ? 'auto' : '100%'
              }}
              transition={{ duration: 0.15 }}
              className={viewMode === 'list' ? 'w-full' : 'flex flex-col'}
            >
              <div 
                className={`flex justify-between items-center px-3 py-2 rounded-t-lg ${style.bg} cursor-pointer transition-colors duration-150`}
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
                    transition={{ duration: 0.15 }}
                    className="flex-1"
                  >
                    <SearchEngineColumn 
                      title={engine} 
                      results={engineResults}
                      bgColor={style.bg}
                      hoverBorderColor={style.hover}
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
