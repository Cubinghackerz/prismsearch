
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, History, Star } from 'lucide-react';
import { PopularSearch, SearchCategory } from './types';
import { getPopularSearches } from '../../services/searchService';

interface PopularSearchesProps {
  onSelectSearch: (query: string) => void;
  currentQuery?: string;
}

const PopularSearches = ({
  onSelectSearch,
  currentQuery
}: PopularSearchesProps) => {
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory | 'All'>('All');
  
  useEffect(() => {
    const fetchPopularSearches = async () => {
      try {
        const searches = await getPopularSearches(currentQuery);
        setPopularSearches(searches);
      } catch (error) {
        console.error('Failed to fetch popular searches:', error);
      }
    };
    
    fetchPopularSearches();
  }, [currentQuery]);
  
  const categories = ['All', ...Object.values(SearchCategory)];
  const filteredSearches = selectedCategory === 'All' 
    ? popularSearches 
    : popularSearches.filter(search => search.category === selectedCategory);

  // Group searches by trending status
  const trendingSearches = filteredSearches.filter(search => search.trending);
  const regularSearches = filteredSearches.filter(search => !search.trending);
  
  if (popularSearches.length === 0) {
    return null;
  }
  
  return (
    <motion.div 
      className="w-full backdrop-blur-md rounded-xl border border-orange-500/30 p-5 shadow-lg mb-6 bg-orange-500/5 glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-orange-400" />
          <h2 className="text-lg font-medium text-white font-playfair">Popular Searches</h2>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <motion.button 
              key={category} 
              onClick={() => setSelectedCategory(category as SearchCategory | 'All')}
              className={`px-3 py-1 text-xs rounded-full transition-all border ${
                selectedCategory === category 
                  ? 'bg-orange-600 text-white border-orange-500/50' 
                  : 'bg-orange-500/20 text-orange-200 hover:bg-orange-500/30 border-orange-500/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        {trendingSearches.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-orange-300" />
              <h3 className="text-sm font-medium text-orange-200 font-playfair">Trending Now</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {trendingSearches.map((search, index) => (
                <TrendingSearchItem key={index} search={search} onClick={() => onSelectSearch(search.query)} index={index} />
              ))}
            </div>
          </div>
        )}
        
        {regularSearches.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Star className="h-4 w-4 text-orange-300" />
              <h3 className="text-sm font-medium text-orange-200 font-playfair">Popular Searches</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {regularSearches.map((search, index) => (
                <RegularSearchItem key={index} search={search} onClick={() => onSelectSearch(search.query)} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface SearchItemProps {
  search: PopularSearch;
  onClick: () => void;
  index: number;
}

const TrendingSearchItem = ({ search, onClick, index }: SearchItemProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick} 
      className="p-3 rounded-lg cursor-pointer transition-all bg-gradient-to-br from-orange-600/80 to-orange-700/80 border border-orange-500/30 shadow-md hover:shadow-orange-500/20"
    >
      <div className="flex items-start justify-between">
        <span className="text-white font-medium truncate font-inter">{search.query}</span>
        <div className="flex items-center space-x-1 text-orange-200 text-xs bg-orange-500/30 px-2 py-0.5 rounded-full">
          <TrendingUp className="h-3 w-3" />
          <span>+{Math.round(search.recency * 100)}%</span>
        </div>
      </div>
      <div className="flex items-center mt-2 text-xs text-orange-200">
        <Users className="h-3 w-3 mr-1" />
        <span>{formatNumber(search.frequency)} searches</span>
        {search.category && (
          <span className="ml-auto bg-orange-500/20 px-2 py-0.5 rounded text-orange-200 border border-orange-500/10">
            {search.category}
          </span>
        )}
      </div>
    </motion.div>
  );
};

const RegularSearchItem = ({ search, onClick, index }: SearchItemProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      whileHover={{ scale: 1.05, x: 3 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick} 
      className="px-3 py-2 rounded-lg cursor-pointer transition-all flex items-center space-x-2 bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 hover:border-orange-500/30"
    >
      <History className="h-3 w-3 text-orange-300" />
      <span className="text-white text-sm font-inter">{search.query}</span>
      {search.category && (
        <span className="text-xs bg-orange-500/20 px-2 py-0.5 rounded text-orange-200 border border-orange-500/10">
          {search.category}
        </span>
      )}
    </motion.div>
  );
};

// Helper function to format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export default PopularSearches;
