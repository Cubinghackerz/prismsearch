
import { useState } from 'react';
import { motion } from 'framer-motion';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import { SearchResult } from '../components/search/types';
import AISearchResponse from '../components/AISearchResponse';
import { searchAcrossEngines } from '../services/searchService';
import { useToast } from '@/hooks/use-toast';
import ParticleBackground from '../components/ParticleBackground';
import ScrollToTop from '../components/ScrollToTop';
import FooterWave from '../components/FooterWave';
import { SearchEngine } from '../components/search/SearchEngineSettings';
import Header from '../components/search/Header';
import Welcome from '../components/search/Welcome';
import { DEFAULT_ENGINES } from '../components/search/constants';

const Index = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedEngines, setSelectedEngines] = useState<SearchEngine[]>(DEFAULT_ENGINES);
  const { toast } = useToast();

  const handleEngineToggle = (engine: SearchEngine) => {
    setSelectedEngines(prev => {
      if (prev.includes(engine)) {
        if (prev.length <= 5) {
          toast({
            title: "Minimum Engines Required",
            description: "Please keep at least 5 search engines selected.",
            variant: "destructive"
          });
          return prev;
        }
        return prev.filter(e => e !== engine);
      } else {
        return [...prev, engine];
      }
    });
  };

  const handleSearch = async (searchQuery: string) => {
    try {
      setQuery(searchQuery);
      setIsSearching(true);
      setHasSearched(true);
      const searchResults = await searchAcrossEngines(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: "Search Error",
        description: "Failed to fetch search results. Please try again.",
        variant: "destructive"
      });
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBackClick = () => {
    setHasSearched(false);
    setResults([]);
    setQuery('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ParticleBackground />
      <ScrollToTop />
      
      <header className="py-6 px-4 relative z-10">
        <Header 
          hasSearched={hasSearched}
          selectedEngines={selectedEngines}
          onEngineToggle={handleEngineToggle}
          onBackClick={handleBackClick}
        />
      </header>
      
      <main className="flex-1 px-4 container mx-auto max-w-[98vw]">
        <motion.div 
          className={`transition-all duration-500 ${hasSearched ? 'mt-4' : 'mt-28'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SearchBar 
            onSearch={handleSearch} 
            isSearching={isSearching} 
            expanded={hasSearched} 
          />
        </motion.div>
        
        {hasSearched ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-4 backdrop-blur-md bg-white/5 p-6 rounded-xl border border-purple-500/20 
              shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_rgba(155,135,245,0.1)] 
              transition-all duration-300"
          >
            <AISearchResponse query={query} />
            <SearchResults 
              results={results} 
              isLoading={isSearching} 
              query={query} 
            />
          </motion.div>
        ) : (
          <Welcome />
        )}
      </main>
      
      <footer className="relative py-6 text-center">
        <FooterWave />
        <p className="relative z-10 text-gray-400 text-sm">
          © 2025 Prism Search. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Index;
