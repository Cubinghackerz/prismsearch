
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

  // Function to highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return <span>{text}</span>;
    
    const regex = new RegExp(`(${query.toLowerCase()})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="bg-purple-500/50 font-semibold">{part}</span>
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
                shadow-purple-900/20 py-2 max-h-60 overflow-y-auto"
    >
      <ul className="divide-y divide-purple-500/10">
        {suggestions.map((suggestion, index) => (
          <li
            key={index}
            onClick={() => onSelectSuggestion(suggestion.text)}
            className={`px-4 py-2 cursor-pointer text-gray-200 hover:bg-purple-500/20
                      transition-colors duration-150 flex items-center
                      ${highlightedIndex === index ? 'bg-purple-500/30' : ''}`}
          >
            <div className="flex-1">
              {highlightMatch(suggestion.text, inputValue)}
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default AutocompleteDropdown;
