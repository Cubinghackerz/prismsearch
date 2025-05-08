
import { useState, useEffect, useCallback, useRef } from 'react';

export interface AutocompleteOption {
  text: string;
  highlighted: boolean;
  score?: number;
}

interface UseAutocompleteOptions {
  minChars?: number;
  maxSuggestions?: number;
  debounceMs?: number;
}

// Hardcoded sample suggestions for autocomplete without indexing
const SAMPLE_SUGGESTIONS = [
  { text: 'javascript', score: 0.95 },
  { text: 'react', score: 0.9 },
  { text: 'typescript', score: 0.88 },
  { text: 'python', score: 0.86 },
  { text: 'machine learning', score: 0.85 },
  { text: 'data science', score: 0.83 },
  { text: 'web development', score: 0.8 },
  { text: 'artificial intelligence', score: 0.78 },
  { text: 'blockchain', score: 0.75 },
  { text: 'cybersecurity', score: 0.73 },
  { text: 'cloud computing', score: 0.7 },
  { text: 'mobile development', score: 0.68 },
  { text: 'devops', score: 0.65 },
  { text: 'databases', score: 0.62 }
];

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
  const isMounted = useRef(true);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Simplified suggestion function without indexing
  const getSuggestions = useCallback((value: string) => {
    if (value.length < minChars) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    
    // Filter suggestions based on input value
    const filteredSuggestions = SAMPLE_SUGGESTIONS
      .filter(item => 
        item.text.toLowerCase().includes(value.toLowerCase())
      )
      .map(item => item.text)
      .slice(0, maxSuggestions);
    
    if (isMounted.current) {
      setSuggestions(filteredSuggestions);
      setIsOpen(filteredSuggestions.length > 0);
      setHighlightedIndex(-1);
    }
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
      if (isMounted.current) {
        getSuggestions(value);
      }
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
  }, []);
  
  // Close the suggestions on outside click
  const handleClickOutside = useCallback(() => {
    if (isMounted.current) {
      setIsOpen(false);
    }
  }, []);
  
  // Helper to format suggestions with highlighting and scoring
  const getHighlightedText = useCallback((text: string): AutocompleteOption => {
    if (!inputValue) {
      return { text, highlighted: false };
    }
    
    // Find matching suggestion to get its score
    const matchedSuggestion = SAMPLE_SUGGESTIONS.find(s => s.text === text);
    const score = matchedSuggestion?.score || 0.5;
    
    return {
      text,
      highlighted: text.toLowerCase().includes(inputValue.toLowerCase()),
      score
    };
  }, [inputValue]);
  
  // Format suggestions with highlighting and relevance scoring
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
    performSearch: () => ({ results: [], relevanceScores: {} }) // Empty search function
  };
};
