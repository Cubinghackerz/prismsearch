
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import { SearchResult } from '../components/search/types';
import AISearchResponse from '../components/AISearchResponse';
import { searchAcrossEngines } from '../services/searchService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import ParticleBackground from '../components/ParticleBackground';
import ScrollToTop from '../components/ScrollToTop';
import FooterWave from '../components/FooterWave';
const engineUrls = {
  'Google': 'https://www.google.com',
  'Bing': 'https://www.bing.com',
  'DuckDuckGo': 'https://duckduckgo.com',
  'Brave': 'https://search.brave.com',
  'You.com': 'https://you.com'
};
const Index = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const {
    toast
  } = useToast();
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
  return <div className="min-h-screen flex flex-col">
      {/* Changed ParticleBackground to have purple particles */}
      <ParticleBackground color="#9b87f5" />
      <ScrollToTop />
      
      <header className="py-6 px-4 relative z-10">
        <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }} className="text-center relative flex justify-between items-center max-w-7xl mx-auto">
          {hasSearched && <motion.div initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} className="absolute left-4 top-1/2 -translate-y-1/2">
              <Button variant="ghost" onClick={() => {
            setHasSearched(false);
            setResults([]);
            setQuery('');
          }} className="text-white bg-transparent">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </motion.div>}
          
          <div className="flex-1">
            <motion.h1 className={`text-4xl font-bold bg-clip-text text-transparent 
                bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 
                animate-gradient-text mb-2 ${hasSearched ? 'text-2xl' : ''}`} animate={{
            backgroundPosition: ['0% 50%', '100% 50%']
          }} transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'reverse'
          }}>
              Prism Search
            </motion.h1>
            <motion.p initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            delay: 0.2
          }} className={`text-gray-100 max-w-lg mx-auto ${hasSearched ? 'hidden' : ''}`}>
              Search across the web's top engines for comprehensive results in one place
            </motion.p>
          </div>

          <Link to="/chat" className="absolute right-4 top-1/2 -translate-y-1/2">
            <Button variant="ghost" className="text-white bg-transparent">
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat Mode
            </Button>
          </Link>
        </motion.div>
      </header>
      
      <main className="flex-1 px-4 container mx-auto max-w-[98vw]">
        <motion.div className={`transition-all duration-500 ${hasSearched ? 'mt-4' : 'mt-28'}`} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
          <SearchBar onSearch={handleSearch} isSearching={isSearching} expanded={hasSearched} />
        </motion.div>
        
        {hasSearched && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        duration: 0.5
      }} className="mt-4 backdrop-blur-md bg-purple-500/5 p-6 rounded-xl border border-purple-500/20 
              shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_rgba(155,135,245,0.15)] 
              transition-all duration-300">
            <AISearchResponse query={query} />
            <SearchResults results={results} isLoading={isSearching} query={query} />
          </motion.div>}

        {!hasSearched && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.5,
        duration: 0.5
      }} className="mt-20 text-center">
            <div className="flex justify-center space-x-6">
              {['Google', 'Bing', 'DuckDuckGo', 'Brave', 'You.com'].map(engine => <motion.a key={engine} href={engineUrls[engine as keyof typeof engineUrls]} target="_blank" rel="noopener noreferrer" className="text-center cursor-pointer" whileHover={{
            scale: 1.1,
            y: -5
          }} transition={{
            type: "spring",
            stiffness: 400,
            damping: 10
          }}>
                  <div className={`w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center 
                    backdrop-blur-md border border-purple-200/10
                    ${engine === 'Google' ? 'bg-purple-500/80' : engine === 'Bing' ? 'bg-purple-700/80' : engine === 'DuckDuckGo' ? 'bg-purple-600/80' : engine === 'Brave' ? 'bg-purple-500/80' : 'bg-purple-500/80'} 
                    hover:border-purple-300/20 transition-all duration-300
                    shadow-lg shadow-purple-800/10 hover:shadow-xl hover:shadow-purple-700/20`}>
                    <span className="text-xl font-bold text-white">{engine.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-100 opacity-90 hover:opacity-100 transition-opacity">
                    {engine}
                  </span>
                </motion.a>)}
            </div>
            <motion.p initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.7
        }} className="mt-12 text-purple-100/70">
              Type your query above to search across all engines simultaneously
            </motion.p>
          </motion.div>}
      </main>
      
      <footer className="relative py-6 text-center">
        <FooterWave color="#9b87f5" />
        <p className="relative z-10 text-purple-200/70 text-sm">
          © 2025 Prism Search. All rights reserved.
        </p>
      </footer>
    </div>;
};
export default Index;
