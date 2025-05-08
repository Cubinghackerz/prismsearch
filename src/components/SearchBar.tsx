
import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import LoadingAnimation from './LoadingAnimation';
import AutocompleteDropdown from './search/AutocompleteDropdown';
import { useAutocomplete } from '@/hooks/useAutocomplete';
import { AnimatePresence } from 'framer-motion';

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
    // This helps ensure the search is triggered with the updated value
    setTimeout(() => {
      onSearch(suggestion);
    }, 0);
  };

  return (
    <div className={`search-bar-container w-full max-w-3xl mx-auto transition-all duration-500 ${expanded ? 'search-bar-expanded' : ''}`}>
      <div className="relative">
        <div 
          className={`
            relative flex items-center w-full h-16 rounded-2xl 
            bg-[#1A1F2C]/90 backdrop-blur-lg
            border border-purple-500/30
            transition-all duration-300 group
            ${query ? 'shadow-[0_0_35px_rgba(147,51,234,0.5)] border-purple-400/50' : ''}
            ${isFocused ? 'shadow-[0_0_40px_rgba(168,85,247,0.45)] border-violet-300/50 scale-[1.02]' : ''}
            hover:shadow-[0_0_30px_rgba(168,85,247,0.35)] hover:border-violet-400/40
            hover:scale-[1.01] hover:bg-[#1A1F2C]/95
          `}
        >
          <div className="relative flex items-center h-full w-full rounded-2xl group">
            <div className="grid place-items-center h-full w-12 text-purple-300/80 transition-all duration-300 group-hover:text-purple-200">
              <Search className={`h-5 w-5 transition-all duration-300 
                ${isFocused ? 'scale-110 text-purple-300' : ''}
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
                placeholder:text-purple-200/30 
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
                className="absolute right-28 h-8 w-8 flex items-center justify-center text-purple-300/70 
                  hover:text-purple-200 transition-all duration-300 rounded-full 
                  hover:bg-purple-500/10 hover:scale-110
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
                  ? 'bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 cursor-pointer shadow-lg shadow-purple-900/30 hover:shadow-purple-800/40 hover:scale-105 active:scale-95' 
                  : 'bg-gray-700/30 cursor-not-allowed opacity-50'}
              `}
              aria-label="Search button"
            >
              {isSearching ? (
                <div className="flex items-center justify-center">
                  <LoadingAnimation color="purple" size="small" />
                </div>
              ) : 'Search'}
            </button>
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
          bg-gradient-to-r from-purple-500/20 via-violet-500/20 to-fuchsia-500/20
          blur-3xl rounded-full
          ${isFocused ? 'opacity-100' : 'opacity-0'}
        `} />
      </div>
    </div>
  );
};

export default SearchBar;
