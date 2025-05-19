
import { motion } from 'framer-motion';
import { ExternalLink, BookmarkPlus, Calendar, Tag, BookmarkCheck } from 'lucide-react';
import { SearchResult } from './types';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';

interface SearchResultCardProps {
  result: SearchResult;
  index: number;
  hoverBorderColor: string;
  viewMode?: 'grid' | 'list';
  onBookmark?: (result: SearchResult) => void;
}

const SearchResultCard = ({ result, index, hoverBorderColor, viewMode = 'grid', onBookmark }: SearchResultCardProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Check if the result is already bookmarked on mount
  useEffect(() => {
    const existingBookmarks = localStorage.getItem('prism_bookmarks');
    if (existingBookmarks) {
      const bookmarks = JSON.parse(existingBookmarks);
      setIsBookmarked(bookmarks.some((bookmark: SearchResult) => bookmark.url === result.url));
    }
  }, [result.url]);

  // Extract domain from URL for display
  const getDomainFromURL = (url: string) => {
    try {
      const domain = new URL(url);
      return domain.hostname.replace('www.', '');
    } catch (error) {
      return url;
    }
  };

  // Format date if available
  const getFormattedDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return null;
    }
  };

  const formattedDate = getFormattedDate(result.date);
  
  // Handle bookmark toggle with visual feedback
  const handleBookmark = () => {
    if (onBookmark) {
      onBookmark(result);
      // Toggle the bookmark state for visual feedback
      setIsBookmarked(!isBookmarked);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      className={`result-card p-4 rounded-lg border border-orange-500/20
                bg-orange-500/5 hover:bg-orange-500/10 transition-all duration-300
                shadow-md hover:shadow-lg hover:shadow-orange-500/10 relative overflow-hidden group
                ${viewMode === 'list' ? 'flex gap-4' : 'flex flex-col'}`}
      whileHover={{
        y: -3,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
    >
      {/* Improved gradient overlay for better visual effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-300/5 via-orange-500/10 to-teal-400/5 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out pointer-events-none"></div>
      
      <div className={viewMode === 'list' ? "min-w-0 flex-1" : "flex flex-col h-full"}>
        {/* URL source with improved visual indicator */}
        <div className="flex items-center mb-2 text-xs text-orange-300/80">
          <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-2 opacity-70"></span>
          {getDomainFromURL(result.url)}
          
          {/* Show date if available */}
          {formattedDate && (
            <div className="ml-3 flex items-center text-orange-300/70">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>
        
        {/* Title with improved readability */}
        <h3 className={`font-medium text-orange-100 mb-2 transition-colors line-clamp-2 font-inter
                      ${viewMode === 'list' ? 'text-lg' : 'text-base'}`}>
          <a href={result.url} target="_blank" rel="noopener noreferrer" className="focus:outline-1 focus:outline-orange-500/50 rounded-sm">
            {result.title}
          </a>
        </h3>
        
        {/* Snippet with improved readability */}
        <p className={`text-sm text-orange-200/90 font-inter leading-relaxed
                     ${viewMode === 'list' ? 'line-clamp-2 mb-3' : 'line-clamp-3 mb-4'}`}>
          {result.snippet}
        </p>

        {/* Category tag if available */}
        {result.category && (
          <div className="flex items-center text-xs text-orange-300/70 mb-3">
            <Tag className="h-3 w-3 mr-1" />
            <span>{result.category}</span>
          </div>
        )}
        
        <div className={`${viewMode === 'list' ? '' : 'mt-auto'} pt-2 flex justify-between items-center`}>
          {/* Enhanced button with better hover effects */}
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs bg-orange-600/80 
                     hover:bg-orange-500/80 text-white px-3 py-1.5 rounded-md transition-all
                     duration-200 border border-orange-500/30 shadow-sm hover:shadow
                     hover:translate-y-[-1px]"
          >
            View result <ExternalLink className="h-3 w-3 ml-1" />
          </a>
          
          <div className="flex items-center gap-2">
            {/* Bookmark button - Updated with visual feedback */}
            {onBookmark && (
              <motion.button
                onClick={handleBookmark}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`text-xs flex items-center gap-1 px-2 py-1.5 rounded-md 
                        transition-all duration-300 border ${isBookmarked 
                          ? 'bg-orange-500/30 text-orange-100 border-orange-500/40' 
                          : 'bg-orange-500/10 text-orange-300/80 hover:text-orange-200 hover:bg-orange-500/20 border-orange-500/20'}`}
                aria-label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
              >
                {isBookmarked ? (
                  <>
                    <BookmarkCheck className="h-3 w-3" />
                    <span className="hidden sm:inline">Saved</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="h-3 w-3" />
                    <span className="hidden sm:inline">Save</span>
                  </>
                )}
              </motion.button>
            )}
            
            {/* Search engine indicator with improved styling */}
            {result.engine && (
              <span className="text-xs bg-orange-500/15 px-2 py-0.5 rounded-full text-orange-300/90 border border-orange-500/10">
                {result.engine}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchResultCard;
