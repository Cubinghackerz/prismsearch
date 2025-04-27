import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import SearchResults, { SearchResult } from '../components/SearchResults';
import AISearchResponse from '../components/AISearchResponse';
import { searchAcrossEngines } from '../services/searchService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import ParticleBackground from '../components/ParticleBackground';
import ScrollToTop from '../components/ScrollToTop';
import FooterWave from '../components/FooterWave';
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
      <ParticleBackground />
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
      }} className="text-center relative">
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
          
          <motion.h1 className={`text-4xl font-bold bg-clip-text text-transparent 
              bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 
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
      }} className="mt-4 backdrop-blur-md bg-white/5 p-6 rounded-xl border border-purple-500/20 
              shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_rgba(155,135,245,0.1)] 
              transition-all duration-300">
            {/* Add AI Search Response component here */}
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
              {['Google', 'Bing', 'DuckDuckGo', 'Brave', 'You.com'].map(engine => <motion.div key={engine} className="text-center cursor-pointer" whileHover={{
            scale: 1.1,
            y: -5
          }} transition={{
            type: "spring",
            stiffness: 400,
            damping: 10
          }}>
                  <div className={`w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center 
                    backdrop-blur-md border border-white/10
                    ${engine === 'Google' ? 'bg-blue-500/80' : engine === 'Bing' ? 'bg-blue-700/80' : engine === 'DuckDuckGo' ? 'bg-yellow-600/80' : engine === 'Brave' ? 'bg-orange-500/80' : 'bg-purple-500/80'} 
                    hover:border-white/20 transition-all duration-300
                    shadow-lg hover:shadow-xl`}>
                    <span className="text-xl font-bold text-white">{engine.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-100 opacity-90 hover:opacity-100 transition-opacity">
                    {engine}
                  </span>
                </motion.div>)}
            </div>
            <motion.p initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.7
        }} className="mt-12 text-gray-400">
              Type your query above to search across all engines simultaneously
            </motion.p>
          </motion.div>}
      </main>
      
      <footer className="relative py-6 text-center">
        <FooterWave />
        <p className="relative z-10 text-gray-400 text-sm">
          © 2025 Prism Search. All rights reserved.
        </p>
      </footer>
    </div>;
};
export default Index;