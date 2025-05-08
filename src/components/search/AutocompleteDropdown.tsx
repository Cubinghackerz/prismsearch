
import { motion } from 'framer-motion';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="absolute left-0 right-0 mt-2 z-50 bg-[#1A1F2C]/95 backdrop-blur-lg 
                rounded-xl border border-purple-500/30 shadow-xl 
                shadow-purple-900/20 py-2 autocomplete-dropdown"
      role="listbox"
      aria-activedescendant={highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined}
    >
      <ul className="divide-y divide-purple-500/10">
        {suggestions.map((suggestion, index) => (
          <li
            id={`suggestion-${index}`}
            key={index}
            onClick={() => onSelectSuggestion(suggestion.text)}
            className={`px-4 py-2 cursor-pointer text-gray-200 hover:bg-purple-500/20
                      transition-colors duration-150 flex items-center autocomplete-item
                      ${highlightedIndex === index ? 'bg-purple-500/30' : ''}`}
            role="option"
            aria-selected={highlightedIndex === index}
          >
            <div className="flex-1 flex items-center">
              {/* Show relevance score indicator if available */}
              {suggestion.score && (
                <div 
                  className="w-1 h-6 mr-2 rounded-full" 
                  style={{ 
                    backgroundColor: `rgba(168, 85, 247, ${Math.min(0.3 + suggestion.score * 0.7, 1)})`
                  }}
                  title={`Relevance: ${Math.round(suggestion.score * 100)}%`}
                />
              )}
              {highlightMatch(suggestion.text, inputValue)}
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default AutocompleteDropdown;
