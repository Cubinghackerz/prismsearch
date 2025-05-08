
import { useState, useEffect, useCallback, useRef } from 'react';
import { searchIndex, initializeSearchIndex } from '../utils/searchIndex';

export interface AutocompleteOption {
  text: string;
  highlighted: boolean;
  score?: number; // Added relevance score
}

interface UseAutocompleteOptions {
  minChars?: number;
  maxSuggestions?: number;
  debounceMs?: number;
  fuzzyMatch?: boolean;
  fields?: string[];
  useBM25?: boolean;
  proximityBoost?: boolean;
  phraseMatching?: boolean;
}

export const useAutocomplete = (options: UseAutocompleteOptions = {}) => {
  const { 
    minChars = 1, 
    maxSuggestions = 5, 
    debounceMs = 150,
    fuzzyMatch = true,
    fields = [],
    useBM25 = true,
    proximityBoost = true,
    phraseMatching = true
  } = options;
  
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);
  
  // Initialize the search index
  useEffect(() => {
    initializeSearchIndex();
    
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Get suggestions based on input with enhanced relevance ranking
  const getSuggestions = useCallback((value: string) => {
    if (value.length < minChars) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    
    // Use the enhanced search capabilities for better suggestions
    // including fuzzy matching, field-specific boosting, and n-gram matching
    const { results } = searchIndex.search(value, {
      fuzzy: fuzzyMatch,
      fields: fields,
      boostFresh: true,
      boostPopular: true,
      useBM25: useBM25,
      proximityBoost: proximityBoost,
      phraseMatching: phraseMatching
    });
    
    // For autocomplete, we want the direct suggestions from the trie
    // but enhanced with the quality signals from search
    const newSuggestions = searchIndex.findSuggestions(value, maxSuggestions);
    
    if (isMounted.current) {
      setSuggestions(newSuggestions);
      setIsOpen(newSuggestions.length > 0);
      setHighlightedIndex(-1);
    }
  }, [minChars, maxSuggestions, fuzzyMatch, fields, useBM25, proximityBoost, phraseMatching]);
  
  // Debounced input handler with optimized performance
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new timer with cancelable timeout
    debounceTimer.current = setTimeout(() => {
      if (isMounted.current) {
        getSuggestions(value);
      }
    }, debounceMs);
  }, [getSuggestions, debounceMs]);
  
  // Handle keyboard navigation with improved accessibility
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
          // Record the search in our index with boost for selected items
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
  
  // Handle selecting a suggestion with analytics tracking
  const handleSelectSuggestion = useCallback((suggestion: string) => {
    setInputValue(suggestion);
    setIsOpen(false);
    // Record the selection to improve future autocomplete
    searchIndex.recordSearch(suggestion);
  }, []);
  
  // Close the suggestions on outside click
  const handleClickOutside = useCallback(() => {
    if (isMounted.current) {
      setIsOpen(false);
    }
  }, []);
  
  // Perform a search using the enhanced search capabilities
  const performSearch = useCallback((query: string) => {
    return searchIndex.search(query, {
      fuzzy: fuzzyMatch,
      fields: fields,
      boostFresh: true,
      boostPopular: true,
      useBM25: useBM25,
      proximityBoost: proximityBoost,
      phraseMatching: phraseMatching
    });
  }, [fuzzyMatch, fields, useBM25, proximityBoost, phraseMatching]);
  
  // Helper to highlight matching text with enhanced scoring
  const getHighlightedText = useCallback((text: string): AutocompleteOption => {
    if (!inputValue) {
      return { text, highlighted: false };
    }
    
    // Calculate a relevance score for this suggestion
    const { relevanceScores } = searchIndex.search(inputValue, {
      fuzzy: fuzzyMatch,
      boostPopular: true
    });
    
    // Find document IDs containing this term
    const docIds = searchIndex.getDocument(text)?.id 
      ? [searchIndex.getDocument(text)!.id] 
      : Object.keys(searchIndex.getIndexStats()).slice(0, 3);
    
    // Average the relevance scores if available
    let score = 0;
    let count = 0;
    for (const id of docIds) {
      if (relevanceScores[id]) {
        score += relevanceScores[id];
        count++;
      }
    }
    
    const finalScore = count > 0 ? score / count : (
      text.toLowerCase().includes(inputValue.toLowerCase()) ? 0.7 : 0.3
    );
    
    return {
      text,
      highlighted: text.toLowerCase().includes(inputValue.toLowerCase()),
      score: finalScore
    };
  }, [inputValue, fuzzyMatch]);
  
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
    performSearch,
  };
};
