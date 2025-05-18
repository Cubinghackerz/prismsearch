
import { motion } from 'framer-motion';
import { TrendingUp, Star, Users } from 'lucide-react';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="absolute left-0 right-0 mt-2 z-50 bg-[#1A1F2C]/95 backdrop-blur-lg 
                rounded-xl border border-orange-500/30 shadow-xl 
                shadow-orange-900/30 py-2 autocomplete-dropdown"
      role="listbox"
      aria-activedescendant={highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined}
    >
      <ul className="divide-y divide-orange-500/10">
        {suggestions.map((suggestion, index) => (
          <motion.li
            id={`suggestion-${index}`}
            key={index}
            onClick={() => onSelectSuggestion(suggestion.text)}
            className={`px-4 py-2 cursor-pointer text-gray-200 hover:bg-orange-500/30
                      transition-all duration-300 flex items-center autocomplete-item
                      ${highlightedIndex === index ? 'bg-orange-500/30 border-l-2 border-orange-400' : ''}`}
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
                    backgroundColor: `rgba(255, 158, 44, ${Math.min(0.4 + suggestion.score * 0.6, 1)})`
                  }}
                />
              )}
              
              {/* Display trending or popular icon if applicable */}
              {isTrending(suggestion.score) && (
                <TrendingUp className="h-3 w-3 mr-2 text-orange-400" aria-label="Trending search" />
              )}
              
              {isPopular(suggestion.score) && !isTrending(suggestion.score) && (
                <Star className="h-3 w-3 mr-2 text-orange-400" aria-label="Popular search" />
              )}
              
              {/* Show people icon for community searches */}
              {suggestion.score && suggestion.score <= 0.75 && suggestion.score > 0.6 && (
                <Users className="h-3 w-3 mr-2 text-orange-400" aria-label="Community search" />
              )}
              
              {highlightMatch(suggestion.text, inputValue)}
            </div>
            
            {/* Show popularity gauge with animation */}
            {suggestion.score && (
              <div className="ml-2 flex items-center">
                <motion.div 
                  className="w-8 h-1.5 bg-orange-900/30 rounded-full overflow-hidden"
                  whileHover={{ width: '12px', height: '12px' }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="h-full rounded-full bg-gradient-to-r from-orange-300 to-orange-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, suggestion.score * 100)}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  ></motion.div>
                </motion.div>
              </div>
            )}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

export default AutocompleteDropdown;
