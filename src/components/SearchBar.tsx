
import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import LoadingAnimation from './LoadingAnimation';
import AutocompleteDropdown from './search/AutocompleteDropdown';
import { useAutocomplete } from '@/hooks/useAutocomplete';
import { AnimatePresence, motion } from 'framer-motion';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  expanded: boolean;
}

const SearchBar = ({ onSearch, isSearching, expanded }: SearchBarProps) => {
  const {
    inputValue: query,
    setInputValue,
    handleInputChange,
    suggestions,
    isOpen,
    highlightedIndex,
    handleKeyDown,
    handleSelectSuggestion,
    handleClickOutside
  } = useAutocomplete({
    minChars: 2,
    maxSuggestions: 7,
    debounceMs: 200
  });
  
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutsideListener = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) && 
        inputRef.current && 
        !inputRef.current.contains(e.target as Node)
      ) {
        handleClickOutside();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutsideListener);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideListener);
    };
  }, [handleClickOutside]);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleClear = () => {
    handleInputChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    // First update input value
    setInputValue(suggestion);
    
    // Record the selection in the hook's internal state
    handleSelectSuggestion(suggestion);
    
    // Then trigger the search with a slight delay to ensure state updates have completed
    setTimeout(() => {
      onSearch(suggestion);
    }, 10);
  };

  // Create 10 sparks with different positions and timing
  const sparks = Array.from({ length: 10 }, (_, i) => i);

  // Generate random position based on search bar width
  const getRandomPosition = (i: number) => {
    // Use pre-calculated positions for initial render
    const basePositions = [10, 22, 35, 47, 60, 72, 85, 92, 78, 65];
    return basePositions[i % basePositions.length];
  };

  return (
    <div className={`search-bar-container w-full max-w-3xl mx-auto transition-all duration-500 ${expanded ? 'search-bar-expanded' : ''}`}>
      <div className="relative">
        <div 
          ref={searchBarRef}
          className={`
            relative flex items-center w-full h-16 rounded-2xl 
            bg-[#1A1F2C]/90 backdrop-blur-lg
            border border-orange-500/30
            transition-all duration-300 group
            ${query ? 'shadow-[0_0_35px_rgba(255,158,44,0.5)] border-orange-400/50' : ''}
            ${isFocused ? 'shadow-[0_0_40px_rgba(255,158,44,0.45)] border-orange-300/50 scale-[1.02]' : ''}
            hover:shadow-[0_0_30px_rgba(255,158,44,0.35)] hover:border-orange-400/40
            hover:scale-[1.01] hover:bg-[#1A1F2C]/95
          `}
        >
          <div className="relative flex items-center h-full w-full rounded-2xl group">
            <div className="grid place-items-center h-full w-12 text-orange-300/80 transition-all duration-300 group-hover:text-orange-200">
              <Search className={`h-5 w-5 transition-all duration-300 
                ${isFocused ? 'scale-110 text-orange-300' : ''}
                ${isSearching ? 'animate-pulse' : ''}
              `} />
            </div>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                handleKeyDown(e);
                if (e.key === 'Enter' && query.trim() && !isOpen) {
                  onSearch(query);
                }
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="peer h-full w-full outline-none text-lg text-white/90 px-2 bg-transparent 
                placeholder:text-orange-200/30 
                transition-all duration-300 
                placeholder:transition-opacity placeholder:duration-300
                focus:placeholder:opacity-50
                focus:text-white"
              type="text"
              placeholder="Search across the web..."
              disabled={isSearching}
              aria-label="Search input"
              aria-autocomplete="list"
              aria-controls="search-suggestions"
              aria-expanded={isOpen}
            />
            {query && !isSearching && (
              <button
                onClick={handleClear}
                className="absolute right-28 h-8 w-8 flex items-center justify-center text-orange-300/70 
                  hover:text-orange-200 transition-all duration-300 rounded-full 
                  hover:bg-orange-500/10 hover:scale-110
                  active:scale-95"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button 
              onClick={handleSearch}
              disabled={isSearching || !query.trim()} 
              className={`
                absolute right-2 h-12 w-24 rounded-xl text-white font-medium
                transition-all duration-300 
                ${query.trim() && !isSearching 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 cursor-pointer shadow-lg shadow-orange-900/30 hover:shadow-orange-800/40 hover:scale-105 active:scale-95 ember-glow' 
                  : 'bg-gray-700/30 cursor-not-allowed opacity-50'}
              `}
              aria-label="Search button"
            >
              {isSearching ? (
                <div className="flex items-center justify-center">
                  <LoadingAnimation color="orange" size="small" />
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>Search</span>
                  <Sparkles className="ml-1 h-4 w-4" />
                </div>
              )}
            </button>
            
            {/* Fiery sparks animation - distributed across the search bar */}
            {isFocused && !isSearching && (
              <>
                {sparks.map((i) => (
                  <motion.div
                    key={`spark-${i}`}
                    className="absolute pointer-events-none fiery-spark"
                    style={{ 
                      bottom: '0px',
                      left: `${getRandomPosition(i)}%`,
                      zIndex: 5
                    }}
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0, scale: 0 },
                      visible: { 
                        opacity: [0, 1, 0],
                        scale: [0.2, 1, 0.2],
                        y: [-5, -25, -45],
                        transition: {
                          duration: 1.5,
                          repeat: Infinity,
                          repeatType: "loop" as const,
                          delay: i * 0.3, // Different delay for each spark
                          ease: "easeOut"
                        }
                      }
                    }}
                  >
                    <div className="spark-animation w-2 h-2 rounded-full 
                      bg-gradient-to-t from-orange-500 via-orange-300 to-yellow-200
                      shadow-[0_0_10px_rgba(255,158,44,0.7)]" 
                    />
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </div>
        
        {/* Dropdown suggestions container */}
        <div ref={dropdownRef} className="relative w-full">
          <AnimatePresence>
            <AutocompleteDropdown
              suggestions={suggestions}
              isOpen={isOpen && isFocused}
              highlightedIndex={highlightedIndex}
              onSelectSuggestion={handleSuggestionClick}
              inputValue={query}
            />
          </AnimatePresence>
        </div>
        
        {/* Decorative gradient blur effect */}
        <div className={`
          absolute inset-0 -z-10 transition-opacity duration-500
          bg-gradient-to-r from-orange-500/20 via-orange-500/20 to-orange-500/20
          blur-3xl rounded-full
          ${isFocused ? 'opacity-100' : 'opacity-0'}
        `} />
      </div>
    </div>
  );
};

export default SearchBar;
