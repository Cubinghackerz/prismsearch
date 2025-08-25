
import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import SearchResults from '@/components/SearchResults';
import PopularSearches from '@/components/search/PopularSearches';
import AtomicThinkingAnimation from '@/components/search/AtomicThinkingAnimation';
import SearchTransitionAnimation from '@/components/search/SearchTransitionAnimation';
import LoadingSkeleton from '@/components/search/LoadingSkeleton';
import { useSearchService } from '@/services/searchService';
import CountUp from '@/components/CountUp';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const searchService = useSearchService();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setSearchQuery(query);
    setShowThinking(true);
    setIsLoading(true);
    setHasSearched(false);
    
    // Scroll to search container
    if (searchContainerRef.current) {
      searchContainerRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }

    try {
      const results = await searchService.searchAllEngines(query);
      
      // Show thinking animation for at least 2 seconds
      setTimeout(() => {
        setShowThinking(false);
        setShowTransition(true);
        
        // Show transition animation for 1 second before showing results
        setTimeout(() => {
          setShowTransition(false);
          setSearchResults(results);
          setIsLoading(false);
          setHasSearched(true);
        }, 1000);
      }, 2000);
      
    } catch (error) {
      console.error('Search failed:', error);
      setShowThinking(false);
      setShowTransition(false);
      setIsLoading(false);
      setHasSearched(true);
      setSearchResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-prism-bg via-prism-dark-bg to-prism-surface">
      <Navigation />
      
      <main className="pt-20">
        {!hasSearched && !isLoading && (
          <section className="container mx-auto px-4 py-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <Search className="h-16 w-16 text-prism-primary animate-pulse" />
                  <Sparkles className="h-6 w-6 text-prism-accent absolute -top-2 -right-2 animate-bounce" />
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-prism-text mb-6 font-fira-code">
                Search with <span className="bg-gradient-to-r from-prism-primary to-prism-accent bg-clip-text text-transparent">Prism</span>
              </h1>
              
              <p className="text-xl text-prism-text-muted mb-12 max-w-2xl mx-auto">
                Advanced multi-engine search with AI-powered insights. Get comprehensive results from multiple sources instantly.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-16"
              >
                <SearchBar 
                  onSearch={handleSearch} 
                  placeholder="Search across the web with AI intelligence..."
                  className="max-w-2xl mx-auto"
                />
              </motion.div>

              <PopularSearches onSearchSelect={handleSearch} />

              {/* Stats Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
              >
                <div className="text-center p-6 rounded-xl bg-prism-surface/30 border border-prism-border backdrop-blur-sm">
                  <Zap className="h-8 w-8 text-prism-accent mx-auto mb-3" />
                  <div className="text-3xl font-bold text-prism-text mb-2">
                    <CountUp end={5} duration={2000} />+
                  </div>
                  <p className="text-prism-text-muted">Search Engines</p>
                </div>
                
                <div className="text-center p-6 rounded-xl bg-prism-surface/30 border border-prism-border backdrop-blur-sm">
                  <Search className="h-8 w-8 text-prism-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-prism-text mb-2">
                    <CountUp end={1000000} duration={2500} />+
                  </div>
                  <p className="text-prism-text-muted">Searches Powered</p>
                </div>
                
                <div className="text-center p-6 rounded-xl bg-prism-surface/30 border border-prism-border backdrop-blur-sm">
                  <Sparkles className="h-8 w-8 text-prism-accent mx-auto mb-3" />
                  <div className="text-3xl font-bold text-prism-text mb-2">
                    <CountUp end={99} duration={2000} />%
                  </div>
                  <p className="text-prism-text-muted">Accuracy Rate</p>
                </div>
              </motion.div>
            </motion.div>
          </section>
        )}

        <div ref={searchContainerRef}>
          {(isLoading || hasSearched) && (
            <section className="container mx-auto px-4 py-8">
              <div className="max-w-4xl mx-auto">
                <SearchBar 
                  onSearch={handleSearch} 
                  initialQuery={searchQuery}
                  className="mb-8"
                />
                
                {showThinking && <AtomicThinkingAnimation />}
                {showTransition && <SearchTransitionAnimation />}
                {isLoading && !showThinking && !showTransition && <LoadingSkeleton />}
                {hasSearched && !isLoading && (
                  <SearchResults 
                    results={searchResults} 
                    query={searchQuery}
                  />
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
