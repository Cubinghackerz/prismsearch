
import { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingAnimation from './LoadingAnimation';
import SearchSuggestions, { SearchSuggestion } from './SearchSuggestions';
import { useToast } from '@/hooks/use-toast';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  expanded: boolean;
}

const SearchBar = ({ onSearch, isSearching, expanded }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Placeholder trending searches and chat prompts - in a real app, these would come from analytics
  const trendingSearches = [
    'artificial intelligence',
    'machine learning algorithms',
    'quantum computing basics',
    'web development tools',
    'data visualization techniques'
  ];

  const chatPrompts = [
    { text: 'Explain quantum computing like I\'m five', description: 'Simple explanations' },
    { text: 'Help me brainstorm ideas for my project about sustainability', description: 'Creative thinking' },
    { text: 'Write a professional email requesting a meeting', description: 'Email drafting' },
    { text: 'Compare React vs Angular for enterprise applications', description: 'Technical comparison' },
    { text: 'Generate a content strategy for my new blog', description: 'Marketing help' }
  ];

  // Mock search suggestions function - would connect to backend in a real app
  const generateSuggestions = (input: string): SearchSuggestion[] => {
    if (!input.trim()) {
      // When input is empty, only show trending and chat prompts
      const trend = trendingSearches
        .slice(0, 3)
        .map(text => ({ type: 'trending' as const, text }));
        
      const chat = chatPrompts
        .slice(0, 3)
        .map(({ text, description }) => ({ 
          type: 'chat-prompt' as const, 
          text,
          description
        }));
      
      return [...trend, ...chat];
    }
    
    const lowerInput = input.toLowerCase();
    
    // Generate autocomplete suggestions
    const autoComplete = [
      ...trendingSearches.filter(text => text.toLowerCase().includes(lowerInput)),
      `${lowerInput} tutorial`,
      `${lowerInput} examples`,
      `${lowerInput} best practices`,
      `how to learn ${lowerInput}`
    ]
    .slice(0, 5)
    .map(text => {
      // Find all occurrences of the input in the suggestion
      const indices: [number, number][] = [];
      let startIndex = text.toLowerCase().indexOf(lowerInput);
      while (startIndex !== -1) {
        indices.push([startIndex, startIndex + lowerInput.length]);
        startIndex = text.toLowerCase().indexOf(lowerInput, startIndex + 1);
      }
      
      return {
        type: 'autocomplete' as const,
        text,
        highlightIndices: indices
      };
    });
    
    // Filter trending searches
    const trend = trendingSearches
      .filter(text => text.toLowerCase().includes(lowerInput))
      .slice(0, 3)
      .map(text => {
        const startIndex = text.toLowerCase().indexOf(lowerInput);
        return {
          type: 'trending' as const,
          text,
          highlightIndices: [[startIndex, startIndex + lowerInput.length]] as [number, number][]
        };
      });
    
    // Filter chat prompts
    const chat = chatPrompts
      .filter(({ text }) => 
        text.toLowerCase().includes(lowerInput) || 
        // Also match if the description contains the input
        (text.toLowerCase().description || '').includes(lowerInput)
      )
      .slice(0, 3)
      .map(({ text, description }) => {
        const startIndex = text.toLowerCase().indexOf(lowerInput);
        return {
          type: 'chat-prompt' as const,
          text,
          description,
          highlightIndices: startIndex >= 0 ? [[startIndex, startIndex + lowerInput.length]] as [number, number][] : undefined
        };
      });
    
    return [...autoComplete, ...trend, ...chat];
  };

  // Update suggestions whenever query changes
  useEffect(() => {
    setSuggestions(generateSuggestions(query));
  }, [query]);

  // Reset highlighted index when suggestions change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === 'Enter' && highlightedIndex >= 0) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[highlightedIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      } else if (e.key === 'Enter' && query.trim()) {
        handleSearch();
      }
    } else if (e.key === 'Enter' && query.trim()) {
      handleSearch();
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
      setShowSuggestions(false);
      
      // Log the search for analytics
      console.log("Search performed:", query);
    }
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'chat-prompt') {
      // For chat prompts, navigate to chat page and pre-fill the prompt
      console.log("Chat prompt selected:", suggestion.text);
      navigate(`/chat?prompt=${encodeURIComponent(suggestion.text)}`);
      toast({
        title: "Chat prompt selected",
        description: "Redirecting to Prism Chat with your prompt"
      });
    } else {
      // For autocomplete and trending, perform search
      setQuery(suggestion.text);
      onSearch(suggestion.text);
      console.log(`${suggestion.type} selected:`, suggestion.text);
    }
    setShowSuggestions(false);
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
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setIsFocused(true);
                setShowSuggestions(true);
              }}
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
              autoComplete="off"
            />
            {query && !isSearching && (
              <button
                onClick={handleClear}
                className="absolute right-28 h-8 w-8 flex items-center justify-center text-purple-300/70 
                  hover:text-purple-200 transition-all duration-300 rounded-full 
                  hover:bg-purple-500/10 hover:scale-110
                  active:scale-95"
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
            >
              {isSearching ? (
                <div className="flex items-center justify-center">
                  <LoadingAnimation color="purple" size="small" />
                </div>
              ) : 'Search'}
            </button>
          </div>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && (
          <div ref={suggestionsRef}>
            <SearchSuggestions
              suggestions={suggestions}
              highlightedIndex={highlightedIndex}
              onSelectSuggestion={handleSelectSuggestion}
              onKeyDown={handleKeyDown}
              visible={showSuggestions}
            />
          </div>
        )}
        
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
