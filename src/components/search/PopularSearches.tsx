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
  const filteredSearches = selectedCategory === 'All' ? popularSearches : popularSearches.filter(search => search.category === selectedCategory);

  // Group searches by trending status
  const trendingSearches = filteredSearches.filter(search => search.trending);
  const regularSearches = filteredSearches.filter(search => !search.trending);
  if (popularSearches.length === 0) {
    return null;
  }
  return <div className="w-full bg-[#1A1F2C]/95 backdrop-blur-md rounded-xl border border-purple-500/30 p-5 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-purple-400" />
          <h2 className="text-lg font-medium text-white">Popular Searches</h2>
        </div>
        
        <div className="flex space-x-2">
          {categories.map(category => <button key={category} onClick={() => setSelectedCategory(category as SearchCategory | 'All')} className={`px-3 py-1 text-xs rounded-full transition-all ${selectedCategory === category ? 'bg-purple-600 text-white' : 'bg-purple-500/20 text-purple-200 hover:bg-purple-500/30'}`}>
              {category}
            </button>)}
        </div>
      </div>
      
      <div className="space-y-4">
        {trendingSearches.length > 0 && <div>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-300" />
              <h3 className="text-sm font-medium text-purple-200">Trending Now</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {trendingSearches.map((search, index) => <TrendingSearchItem key={index} search={search} onClick={() => onSelectSearch(search.query)} />)}
            </div>
          </div>}
        
        {regularSearches.length > 0 && <div>
            <div className="flex items-center space-x-2 mb-2">
              <Star className="h-4 w-4 text-purple-300" />
              <h3 className="text-sm font-medium text-purple-200">Popular Searches</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {regularSearches.map((search, index) => <RegularSearchItem key={index} search={search} onClick={() => onSelectSearch(search.query)} />)}
            </div>
          </div>}
      </div>
    </div>;
};
interface SearchItemProps {
  search: PopularSearch;
  onClick: () => void;
}
const TrendingSearchItem = ({
  search,
  onClick
}: SearchItemProps) => {
  return <motion.div whileHover={{
    scale: 1.03
  }} whileTap={{
    scale: 0.98
  }} onClick={onClick} className="p-3 rounded-lg cursor-pointer transition-all bg-[4169e1] bg-stone-700">
      <div className="flex items-start justify-between">
        <span className="text-white font-medium truncate">{search.query}</span>
        <div className="flex items-center space-x-1 text-purple-300 text-xs bg-purple-700/50 px-2 py-0.5 rounded-full">
          <TrendingUp className="h-3 w-3" />
          <span>+{Math.round(search.recency * 100)}%</span>
        </div>
      </div>
      <div className="flex items-center mt-2 text-xs text-purple-200">
        <Users className="h-3 w-3 mr-1" />
        <span>{formatNumber(search.frequency)} searches</span>
        {search.category && <span className="ml-auto bg-purple-800/40 px-2 py-0.5 rounded text-purple-200">
            {search.category}
          </span>}
      </div>
    </motion.div>;
};
const RegularSearchItem = ({
  search,
  onClick
}: SearchItemProps) => {
  return <motion.div whileHover={{
    scale: 1.05
  }} whileTap={{
    scale: 0.95
  }} onClick={onClick} className="bg-purple-500/20 hover:bg-purple-500/30 px-3 py-2 rounded-lg cursor-pointer transition-all flex items-center space-x-2">
      <History className="h-3 w-3 text-purple-300" />
      <span className="text-white text-sm">{search.query}</span>
      {search.category && <span className="text-xs bg-purple-800/40 px-2 py-0.5 rounded text-purple-200">
          {search.category}
        </span>}
    </motion.div>;
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