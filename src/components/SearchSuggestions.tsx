
import React from 'react';
import { motion } from 'framer-motion';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { MessageSquare, Search, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface SearchSuggestionsProps {
  query: string;
  onSelectSuggestion: (suggestion: string) => void;
  visible: boolean;
}

// Popular searches that will be shown when the user starts typing
const popularSearches = [
  'artificial intelligence news',
  'best programming languages 2025',
  'web development trends',
  'machine learning tutorials',
  'cryptocurrency market today'
];

// Chat prompts that will be suggested for Prism Chat
const chatPrompts = [
  'Explain quantum computing in simple terms',
  'Compare React vs Vue vs Angular',
  'Write a short story about AI',
  'Help me debug my JavaScript code',
  'Create a meal plan for the week'
];

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({ 
  query, 
  onSelectSuggestion,
  visible 
}) => {
  const navigate = useNavigate();
  
  // Filter suggestions based on the query
  const filteredSearches = popularSearches.filter(search => 
    search.toLowerCase().includes(query.toLowerCase())
  );
  
  const filteredPrompts = chatPrompts.filter(prompt => 
    prompt.toLowerCase().includes(query.toLowerCase())
  );

  if (!visible) return null;
  
  const handleChatPromptClick = (prompt: string) => {
    // Navigate to chat page with the prompt encoded in the URL
    navigate(`/chat?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#1A1F2C]/95 backdrop-blur-xl 
        rounded-xl border border-purple-500/30 shadow-lg shadow-purple-900/20 overflow-hidden"
    >
      <Command className="border-0 bg-transparent">
        <CommandList className="max-h-[300px] overflow-y-auto py-2">
          {query && (
            <CommandGroup heading="Search for">
              <CommandItem 
                onSelect={() => onSelectSuggestion(query)}
                className="flex items-center gap-2 px-4 py-2 cursor-pointer text-purple-100 hover:bg-purple-500/20"
              >
                <Search className="h-4 w-4 text-purple-400" />
                <span>{query}</span>
              </CommandItem>
            </CommandGroup>
          )}
          
          {filteredSearches.length > 0 && (
            <CommandGroup heading="Popular searches">
              {filteredSearches.map((search, index) => (
                <CommandItem 
                  key={`search-${index}`}
                  onSelect={() => onSelectSuggestion(search)}
                  className="flex items-center gap-2 px-4 py-2 cursor-pointer text-purple-100 hover:bg-purple-500/20"
                >
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                  <span>{search}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {filteredPrompts.length > 0 && (
            <CommandGroup heading="Try in Prism Chat">
              {filteredPrompts.map((prompt, index) => (
                <CommandItem 
                  key={`prompt-${index}`}
                  onSelect={() => handleChatPromptClick(prompt)}
                  className="flex items-center gap-2 px-4 py-2 cursor-pointer text-blue-100 hover:bg-blue-500/20"
                >
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                  <span>{prompt}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {query && !(filteredSearches.length || filteredPrompts.length) && (
            <div className="px-4 py-6 text-center text-gray-400">
              No suggestions found
            </div>
          )}
        </CommandList>
      </Command>
    </motion.div>
  );
};

export default SearchSuggestions;
