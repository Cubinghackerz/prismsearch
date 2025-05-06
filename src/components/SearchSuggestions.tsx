
import React from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface SearchSuggestion {
  type: 'autocomplete' | 'trending' | 'chat-prompt';
  text: string;
  highlightIndices?: [number, number][];
  category?: string;
  description?: string;
}

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  highlightedIndex: number;
  onSelectSuggestion: (suggestion: SearchSuggestion) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  visible: boolean;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  highlightedIndex,
  onSelectSuggestion,
  onKeyDown,
  visible
}) => {
  if (!visible || suggestions.length === 0) return null;
  
  // Group suggestions by type
  const autocompleteSuggestions = suggestions.filter(s => s.type === 'autocomplete').slice(0, 5);
  const trendingSuggestions = suggestions.filter(s => s.type === 'trending').slice(0, 3);
  const chatPrompts = suggestions.filter(s => s.type === 'chat-prompt').slice(0, 3);

  const highlightText = (text: string, indices?: [number, number][]) => {
    if (!indices || indices.length === 0) return text;
    
    let result = [];
    let lastIndex = 0;
    
    indices.forEach(([start, end]) => {
      // Add text before highlight
      if (start > lastIndex) {
        result.push(<span key={`text-${lastIndex}-${start}`}>{text.slice(lastIndex, start)}</span>);
      }
      
      // Add highlighted text
      result.push(
        <span key={`highlight-${start}-${end}`} className="text-purple-300 font-medium">
          {text.slice(start, end)}
        </span>
      );
      
      lastIndex = end;
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
      result.push(<span key={`text-${lastIndex}-end`}>{text.slice(lastIndex)}</span>);
    }
    
    return <>{result}</>;
  };

  const getSuggestionIndex = (type: string, index: number): number => {
    let offset = 0;
    if (type === 'trending') offset = autocompleteSuggestions.length;
    if (type === 'chat-prompt') offset = autocompleteSuggestions.length + trendingSuggestions.length;
    return offset + index;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl bg-[#1A1F2C]/95 backdrop-blur-lg border border-purple-500/30 shadow-lg shadow-purple-900/20 overflow-hidden"
      role="listbox"
      tabIndex={-1}
      onKeyDown={onKeyDown}
    >
      <div className="max-h-96 overflow-y-auto py-3">
        {/* Autocomplete Suggestions */}
        {autocompleteSuggestions.length > 0 && (
          <div className="px-4 mb-3">
            <div className="flex items-center mb-2 text-xs text-purple-300/80 font-medium uppercase tracking-wider">
              <Search className="mr-1 w-3 h-3" /> 
              <span>Search Suggestions</span>
            </div>
            <div className="space-y-1">
              {autocompleteSuggestions.map((suggestion, index) => {
                const globalIndex = getSuggestionIndex('autocomplete', index);
                return (
                  <div
                    key={`autocomplete-${index}`}
                    className={`px-3 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-colors ${
                      globalIndex === highlightedIndex ? 'bg-purple-500/20 text-white' : 'text-gray-300 hover:bg-purple-500/10'
                    }`}
                    onClick={() => onSelectSuggestion(suggestion)}
                    role="option"
                    aria-selected={globalIndex === highlightedIndex}
                  >
                    <Search className="w-4 h-4 text-purple-400/80" />
                    <span>{highlightText(suggestion.text, suggestion.highlightIndices)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Trending Searches */}
        {trendingSuggestions.length > 0 && (
          <div className="px-4 mb-3">
            <div className="flex items-center mb-2 text-xs text-purple-300/80 font-medium uppercase tracking-wider">
              <TrendingUp className="mr-1 w-3 h-3" /> 
              <span>Trending Now</span>
            </div>
            <div className="space-y-1">
              {trendingSuggestions.map((suggestion, index) => {
                const globalIndex = getSuggestionIndex('trending', index);
                return (
                  <div
                    key={`trending-${index}`}
                    className={`px-3 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-colors ${
                      globalIndex === highlightedIndex ? 'bg-purple-500/20 text-white' : 'text-gray-300 hover:bg-purple-500/10'
                    }`}
                    onClick={() => onSelectSuggestion(suggestion)}
                    role="option"
                    aria-selected={globalIndex === highlightedIndex}
                  >
                    <TrendingUp className="w-4 h-4 text-purple-400/80" />
                    <span>{highlightText(suggestion.text, suggestion.highlightIndices)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Chat Prompts */}
        {chatPrompts.length > 0 && (
          <div className="px-4">
            <div className="flex items-center mb-2 text-xs text-blue-300/80 font-medium uppercase tracking-wider">
              <MessageSquare className="mr-1 w-3 h-3" /> 
              <span>Try in Prism Chat</span>
            </div>
            <div className="space-y-1">
              {chatPrompts.map((suggestion, index) => {
                const globalIndex = getSuggestionIndex('chat-prompt', index);
                return (
                  <Link
                    to={`/chat?prompt=${encodeURIComponent(suggestion.text)}`}
                    key={`chat-prompt-${index}`}
                    className={`px-3 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-colors ${
                      globalIndex === highlightedIndex ? 'bg-blue-500/20 text-white' : 'text-gray-300 hover:bg-blue-500/10'
                    }`}
                    onClick={() => onSelectSuggestion(suggestion)}
                    role="option"
                    aria-selected={globalIndex === highlightedIndex}
                  >
                    <MessageSquare className="w-4 h-4 text-blue-400/80" />
                    <div>
                      <div>{highlightText(suggestion.text, suggestion.highlightIndices)}</div>
                      {suggestion.description && (
                        <div className="text-xs text-gray-400">{suggestion.description}</div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SearchSuggestions;
