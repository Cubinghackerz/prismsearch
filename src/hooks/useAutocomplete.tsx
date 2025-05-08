
import { useState, useEffect, useCallback, useRef } from 'react';
import { searchIndex, initializeSearchIndex } from '../utils/searchIndex';

export interface AutocompleteOption {
  text: string;
  highlighted: boolean;
}

interface UseAutocompleteOptions {
  minChars?: number;
  maxSuggestions?: number;
  debounceMs?: number;
}

export const useAutocomplete = (options: UseAutocompleteOptions = {}) => {
  const { 
    minChars = 1, 
    maxSuggestions = 5, 
    debounceMs = 150 
  } = options;
  
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize the search index
  useEffect(() => {
    initializeSearchIndex();
  }, []);
  
  // Get suggestions based on input
  const getSuggestions = useCallback((value: string) => {
    if (value.length < minChars) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    
    const newSuggestions = searchIndex.findSuggestions(value, maxSuggestions);
    setSuggestions(newSuggestions);
    setIsOpen(newSuggestions.length > 0);
    setHighlightedIndex(-1);
  }, [minChars, maxSuggestions]);
  
  // Debounced input handler
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new timer
    debounceTimer.current = setTimeout(() => {
      getSuggestions(value);
    }, debounceMs);
  }, [getSuggestions, debounceMs]);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
        
      case 'Enter':
        if (highlightedIndex >= 0) {
          e.preventDefault();
          setInputValue(suggestions[highlightedIndex]);
          setIsOpen(false);
          // Record the search in our index
          searchIndex.recordSearch(suggestions[highlightedIndex]);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
        
      default:
        break;
    }
  }, [isOpen, suggestions, highlightedIndex]);
  
  // Handle selecting a suggestion
  const handleSelectSuggestion = useCallback((suggestion: string) => {
    setInputValue(suggestion);
    setIsOpen(false);
    searchIndex.recordSearch(suggestion);
  }, []);
  
  // Close the suggestions on outside click
  const handleClickOutside = useCallback(() => {
    setIsOpen(false);
  }, []);
  
  // Helper to highlight matching text
  const getHighlightedText = useCallback((text: string): AutocompleteOption => {
    if (!inputValue) {
      return { text, highlighted: false };
    }
    
    return {
      text,
      highlighted: text.toLowerCase().includes(inputValue.toLowerCase())
    };
  }, [inputValue]);
  
  // Format suggestions with highlighting
  const formattedSuggestions = suggestions.map(getHighlightedText);
  
  return {
    inputValue,
    setInputValue,
    handleInputChange,
    suggestions: formattedSuggestions,
    isOpen,
    highlightedIndex,
    handleKeyDown,
    handleSelectSuggestion,
    handleClickOutside,
  };
};
