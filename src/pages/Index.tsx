import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageSquare, BookmarkPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import SearchTransitionAnimation from '../components/search/SearchTransitionAnimation';
import { SearchResult } from '../components/search/types';
import AISearchResponse from '../components/AISearchResponse';
import { searchAcrossEngines } from '../services/searchService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import ParticleBackground from '../components/ParticleBackground';
import ScrollToTop from '../components/ScrollToTop';
import Footer from '../components/Footer';
import PopularSearches from '../components/search/PopularSearches';
import BookmarksDrawer from '../components/BookmarksDrawer';

// Search engine information with logo URLs
const engineInfo = {
  'Google': {
    url: 'https://www.google.com',
    logo: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png'
  },
  'Bing': {
    url: 'https://www.bing.com',
    logo: 'https://www.bing.com/sa/simg/bing_p_rr_teal_min.ico'
  },
  'DuckDuckGo': {
    url: 'https://duckduckgo.com',
    logo: 'https://duckduckgo.com/assets/logo_header.v108.svg'
  },
  'Brave': {
    url: 'https://search.brave.com',
    logo: 'https://brave.com/static-assets/images/brave-logo-sans-text.svg'
  },
  'You.com': {
    url: 'https://you.com',
    logo: 'https://you.com/favicon.ico'
  }
};
const Index = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showTransitionAnimation, setShowTransitionAnimation] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [bookmarksCount, setBookmarksCount] = useState<number>(0);
  const {
    toast
  } = useToast();

  // Load bookmarks count
  useState(() => {
    const storedBookmarks = localStorage.getItem('prism_bookmarks');
    if (storedBookmarks) {
      try {
        const bookmarks = JSON.parse(storedBookmarks);
        setBookmarksCount(bookmarks.length);
      } catch (e) {
        console.error('Error loading bookmarks:', e);
      }
    }
  });
  const handleSearch = async (searchQuery: string) => {
    try {
      setQuery(searchQuery);
      setIsSearching(true);
      setHasSearched(true);
      setShowResults(false);

      // Show transition animation
      setShowTransitionAnimation(true);

      // Fetch results in the background
      const searchResults = await searchAcrossEngines(searchQuery);
      setResults(searchResults);

      // Animation will call handleAnimationComplete when finished
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: "Search Error",
        description: "Failed to fetch search results. Please try again.",
        variant: "destructive"
      });
      setResults([]);
      setShowTransitionAnimation(false);
      setIsSearching(false);
    }
  };
  const handleAnimationComplete = () => {
    setShowTransitionAnimation(false);
    setShowResults(true);
    setIsSearching(false);
  };
  const handleViewBookmarks = () => {
    setIsBookmarksOpen(true);
  };

  // Update bookmarks count when drawer closes
  const handleCloseBookmarks = () => {
    setIsBookmarksOpen(false);
    const storedBookmarks = localStorage.getItem('prism_bookmarks');
    if (storedBookmarks) {
      try {
        const bookmarks = JSON.parse(storedBookmarks);
        setBookmarksCount(bookmarks.length);
      } catch (e) {
        console.error('Error loading bookmarks:', e);
      }
    }
  };
  return <div className="min-h-screen flex flex-col bg-[#1A1F2C]">
      {/* Changed ParticleBackground to have orange particles */}
      <ParticleBackground color="#FF9E2C" />
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
            setShowResults(false);
          }} className="text-orange-100 bg-orange-500/20 hover:bg-orange-500/30">
                <ArrowLeft className="mr-2 h-4 w-4" />
                New Search
              </Button>
            </motion.div>}
          
          <div className="flex-1 flex justify-center items-center flex-col">
            {/* Logo added */}
            <Link to="/" className="flex items-center gap-2">
              <img src="/lovable-uploads/aeaad4a8-0dc2-4d4b-b2b3-cb248e0843db.png" alt="Prism Search Logo" className={`transition-all duration-300 ${hasSearched ? 'h-8 w-8' : 'h-10 w-10'}`} />
              <motion.h1 className={`text-4xl font-bold bg-clip-text text-transparent 
                  bg-gradient-to-r from-orange-300 via-orange-500 to-orange-700 
                  animate-gradient-text mb-2 ${hasSearched ? 'text-2xl' : ''}`} animate={{
              backgroundPosition: ['0% 50%', '100% 50%']
            }} transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse'
            }}>
                Prism Search
              </motion.h1>
            </Link>
            <motion.p initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            delay: 0.2
          }} className={`text-orange-200 max-w-lg mx-auto text-center ${hasSearched ? 'hidden' : ''}`}>
              Search across the web's top engines for comprehensive results in one place
            </motion.p>
          </div>

          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Button variant="ghost" onClick={handleViewBookmarks} className="text-orange-100 bg-orange-500/20 hover:bg-orange-500/30 relative">
              <BookmarkPlus className="mr-2 h-4 w-4" />
              {bookmarksCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full text-xs flex items-center justify-center">
                  {bookmarksCount}
                </span>}
              <span className="hidden sm:inline">Bookmarks</span>
            </Button>
            
            <Link to="/chat">
              <Button variant="ghost" className="text-orange-100 bg-orange-500/20 hover:bg-orange-500/30">
                <MessageSquare className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Chat Mode</span>
              </Button>
            </Link>
          </div>
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

        {/* Transition animation */}
        <AnimatePresence>
          {showTransitionAnimation && <SearchTransitionAnimation query={query} onComplete={handleAnimationComplete} />}
        </AnimatePresence>
        
        {/* Search results - now shown after animation completes */}
        <AnimatePresence>
          {hasSearched && showResults && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 0.5
        }} className="mt-4 backdrop-blur-md bg-orange-500/5 p-6 rounded-xl border border-orange-500/20 
                shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_rgba(255,158,44,0.15)] 
                transition-all duration-300">
              <AISearchResponse query={query} />
              <SearchResults results={results} isLoading={false} query={query} />
            </motion.div>}
        </AnimatePresence>

        {!hasSearched && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.5,
        duration: 0.5
      }} className="mt-6 text-center">
            {/* Add Popular Searches component */}
            <PopularSearches onSelectSearch={handleSearch} />
            
            <div className="flex justify-center space-x-6 mt-8">
              {Object.entries(engineInfo).map(([engine, info]) => <motion.a key={engine} href={info.url} target="_blank" rel="noopener noreferrer" className="text-center cursor-pointer" whileHover={{
            scale: 1.1,
            y: -5
          }} transition={{
            type: "spring",
            stiffness: 400,
            damping: 10
          }}>
                  <div className={`w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center 
                      backdrop-blur-md border border-orange-200/10
                      ${engine === 'Google' ? 'bg-orange-500/80' : engine === 'Bing' ? 'bg-orange-700/80' : engine === 'DuckDuckGo' ? 'bg-orange-600/80' : engine === 'Brave' ? 'bg-orange-500/80' : 'bg-orange-500/80'} 
                      hover:border-orange-300/20 transition-all duration-300
                      shadow-lg shadow-orange-800/10 hover:shadow-xl hover:shadow-orange-700/20 glow-button`}>
                    <img src={info.logo} alt={`${engine} logo`} onError={e => {
                // Fallback to first letter if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML += `<span class="text-xl font-bold text-white">${engine[0]}</span>`;
              }} className="w-8 h-8 object-contain" />
                  </div>
                  <span className="text-sm font-medium text-orange-100 opacity-90 hover:opacity-100 transition-opacity">
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
        }} className="mt-12 text-orange-100/70 color-changing-text">
              Type your query above to search across all engines simultaneously
            </motion.p>
          </motion.div>}
      </main>
      
      <footer>
        <Footer />
      </footer>

      {/* Bookmarks Drawer */}
      <BookmarksDrawer isOpen={isBookmarksOpen} onClose={handleCloseBookmarks} />
    </div>;
};
export default Index;