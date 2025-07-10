import { motion } from 'framer-motion';
import { TrendingUp, Star, Users, BookmarkPlus } from 'lucide-react';
import { AutocompleteOption } from '@/hooks/useAutocomplete';

interface AutocompleteDropdownProps {
  suggestions: AutocompleteOption[];
  isOpen: boolean;
  highlightedIndex: number;
  onSelectSuggestion: (suggestion: string) => void;
  inputValue: string;
}

const AutocompleteDropdown = ({
  suggestions,
  isOpen,
  highlightedIndex,
  onSelectSuggestion,
  inputValue
}: AutocompleteDropdownProps) => {
  if (!isOpen || suggestions.length === 0) {
    return null;
  }

  // Function to highlight matching text with enhanced pattern matching
  const highlightMatch = (text: string, query: string) => {
    if (!query) return <span>{text}</span>;
    
    // More sophisticated matching that handles partial words and case variations
    const regex = new RegExp(`(${query.toLowerCase().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="autocomplete-highlight">{part}</span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  // Simple functions to determine suggestion type based on score
  const isTrending = (score?: number): boolean => {
    return score !== undefined && score > 0.85;
  };

  const isPopular = (score?: number): boolean => {
    return score !== undefined && score > 0.75 && score <= 0.85;
  };

  // Group suggestions by category for better organization
  const trendingSuggestions = suggestions.filter(s => isTrending(s.score));
  const popularSuggestions = suggestions.filter(s => isPopular(s.score) && !isTrending(s.score));
  const otherSuggestions = suggestions.filter(s => !isTrending(s.score) && !isPopular(s.score));

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.12 }}
      className="absolute left-0 right-0 mt-2 z-50 bg-[#1A1F2C]/95 backdrop-blur-lg 
                rounded-xl border border-prism-border shadow-xl 
                shadow-prism-primary/30 py-2 autocomplete-dropdown"
      role="listbox"
      aria-activedescendant={highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined}
    >
      <ul className="divide-y divide-prism-border/30">
        {/* Trending suggestions */}
        {trendingSuggestions.length > 0 && (
          <li className="pt-2 pb-1">
            <div className="px-3 py-1.5 text-xs text-prism-primary/80 font-medium flex items-center">
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
              Trending Searches
            </div>
            <ul>
              {trendingSuggestions.map((suggestion, index) => (
                <SuggestionItem
                  key={`trending-${index}`}
                  suggestion={suggestion}
                  index={index}
                  highlightedIndex={highlightedIndex}
                  inputValue={inputValue}
                  onSelect={onSelectSuggestion}
                  highlightMatch={highlightMatch}
                />
              ))}
            </ul>
          </li>
        )}

        {/* Popular suggestions */}
        {popularSuggestions.length > 0 && (
          <li className="pt-2 pb-1">
            <div className="px-3 py-1.5 text-xs text-prism-primary/80 font-medium flex items-center">
              <Star className="h-3.5 w-3.5 mr-1.5" />
              Popular Searches
            </div>
            <ul>
              {popularSuggestions.map((suggestion, index) => (
                <SuggestionItem
                  key={`popular-${index}`}
                  suggestion={suggestion}
                  index={trendingSuggestions.length + index}
                  highlightedIndex={highlightedIndex}
                  inputValue={inputValue}
                  onSelect={onSelectSuggestion}
                  highlightMatch={highlightMatch}
                />
              ))}
            </ul>
          </li>
        )}

        {/* Other suggestions */}
        {otherSuggestions.length > 0 && (
          <li className="pt-2">
            <div className="px-3 py-1.5 text-xs text-prism-primary/80 font-medium flex items-center">
              <Users className="h-3.5 w-3.5 mr-1.5" />
              Suggested Searches
            </div>
            <ul>
              {otherSuggestions.map((suggestion, index) => (
                <SuggestionItem
                  key={`other-${index}`}
                  suggestion={suggestion}
                  index={trendingSuggestions.length + popularSuggestions.length + index}
                  highlightedIndex={highlightedIndex}
                  inputValue={inputValue}
                  onSelect={onSelectSuggestion}
                  highlightMatch={highlightMatch}
                />
              ))}
            </ul>
          </li>
        )}
        
        {/* Save search suggestion */}
        {inputValue && (
          <li className="pt-2 mt-1">
            <motion.div
              onClick={() => onSelectSuggestion(inputValue)}
              className="px-4 py-2 cursor-pointer text-prism-text hover:bg-prism-primary/30
                      transition-all duration-300 flex items-center justify-between"
              whileHover={{ backgroundColor: 'rgba(0, 194, 168, 0.2)' }}
            >
              <div className="flex items-center">
                <BookmarkPlus className="h-4 w-4 mr-2 text-prism-primary" />
                <span>Search for "{inputValue}"</span>
              </div>
              <div className="text-xs px-2 py-0.5 rounded bg-prism-primary/20 text-prism-primary-light">Enter</div>
            </motion.div>
          </li>
        )}
      </ul>
    </motion.div>
  );
};

// Extract suggestion item to a separate component for reusability
const SuggestionItem = ({ 
  suggestion, 
  index, 
  highlightedIndex, 
  inputValue, 
  onSelect,
  highlightMatch 
}: { 
  suggestion: AutocompleteOption, 
  index: number,
  highlightedIndex: number,
  inputValue: string,
  onSelect: (text: string) => void,
  highlightMatch: (text: string, query: string) => React.ReactNode
}) => {
  return (
    <motion.li
      id={`suggestion-${index}`}
      onClick={() => onSelect(suggestion.text)}
      className={`px-4 py-2 cursor-pointer text-gray-200 hover:bg-orange-500/30
                transition-all duration-300 flex items-center autocomplete-item 
                ${highlightedIndex === index ? 'bg-prism-primary/30 border-l-2 border-prism-primary' : ''}`}
      role="option"
      aria-selected={highlightedIndex === index}
      whileHover={{ x: 5 }}
      transition={{ type: "spring", stiffness: 300, damping: 10 }}
    >
      <div className="flex-1 flex items-center">
        {/* Show relevance score indicator if available */}
        {suggestion.score && (
          <div 
            className="w-1 h-6 mr-2 rounded-full" 
            style={{ 
              backgroundColor: `rgba(0, 194, 168, ${Math.min(0.4 + suggestion.score * 0.6, 1)})`
            }}
          />
        )}
        
        {highlightMatch(suggestion.text, inputValue)}
      </div>
      
      {/* Show popularity gauge with animation */}
      {suggestion.score && (
        <div className="ml-2 flex items-center">
          <motion.div 
            className="w-8 h-1.5 bg-orange-900/30 rounded-full overflow-hidden"
            whileHover={{ width: '12px', height: '12px' }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="h-full rounded-full bg-gradient-to-r from-prism-primary-light to-prism-primary"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, suggestion.score * 100)}%` }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
            ></motion.div>
          </motion.div>
        </div>
      )}
    </motion.li>
  );
};

export default AutocompleteDropdown;
