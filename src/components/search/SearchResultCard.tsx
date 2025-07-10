
import { motion } from 'framer-motion';
import { ExternalLink, BookmarkPlus, Calendar, Tag, BookmarkCheck } from 'lucide-react';
import { SearchResult } from './types';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect, useCallback, useMemo } from 'react';

interface SearchResultCardProps {
  result: SearchResult;
  index: number;
  hoverBorderColor: string;
  viewMode?: 'grid' | 'list';
  onBookmark?: (result: SearchResult) => void;
}

const SearchResultCard = ({ result, index, hoverBorderColor, viewMode = 'grid', onBookmark }: SearchResultCardProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Memoize domain extraction
  const domain = useMemo(() => {
    try {
      const url = new URL(result.url);
      return url.hostname.replace('www.', '');
    } catch (error) {
      return result.url;
    }
  }, [result.url]);

  // Memoize formatted date
  const formattedDate = useMemo(() => {
    if (!result.date) return null;
    try {
      const date = new Date(result.date);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return null;
    }
  }, [result.date]);

  // Check if the result is already bookmarked on mount
  useEffect(() => {
    const existingBookmarks = localStorage.getItem('prism_bookmarks');
    if (existingBookmarks) {
      const bookmarks = JSON.parse(existingBookmarks);
      setIsBookmarked(bookmarks.some((bookmark: SearchResult) => bookmark.url === result.url));
    }
  }, [result.url]);
  
  // Optimize bookmark handler
  const handleBookmark = useCallback(() => {
    if (onBookmark) {
      onBookmark(result);
      setIsBookmarked(!isBookmarked);
    }
  }, [onBookmark, result, isBookmarked]);

  // Optimize external link handler
  const handleExternalClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.2, delay: index * 0.02, ease: "easeOut" }}
      className={`result-card p-4 rounded-lg border border-border
                bg-card hover:bg-card/80 transition-all duration-200
                shadow-sm hover:shadow-md hover:shadow-primary/5 relative overflow-hidden group
                ${viewMode === 'list' ? 'flex gap-4' : 'flex flex-col'}`}
      whileHover={{
        y: -1,
        transition: { duration: 0.15, ease: "easeOut" }
      }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/2 via-primary/5 to-accent/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
      
      <div className={viewMode === 'list' ? "min-w-0 flex-1" : "flex flex-col h-full"}>
        {/* URL source */}
        <div className="flex items-center mb-2 text-xs text-primary/80">
          <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2 opacity-70"></span>
          {domain}
          
          {formattedDate && (
            <div className="ml-3 flex items-center text-primary/70">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>
        
        {/* Title */}
        <h3 className={`font-medium text-foreground mb-2 transition-colors line-clamp-2 font-inter
                      ${viewMode === 'list' ? 'text-lg' : 'text-base'}`}>
          <a 
            href={result.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="focus:outline-1 focus:outline-primary/50 rounded-sm hover:text-primary transition-colors duration-200"
            onClick={handleExternalClick}
          >
            {result.title}
          </a>
        </h3>
        
        {/* Snippet */}
        <p className={`text-sm text-muted-foreground font-inter leading-relaxed
                     ${viewMode === 'list' ? 'line-clamp-2 mb-3' : 'line-clamp-3 mb-4'}`}>
          {result.snippet}
        </p>

        {/* Category tag */}
        {result.category && (
          <div className="flex items-center text-xs text-primary/70 mb-3">
            <Tag className="h-3 w-3 mr-1" />
            <span>{result.category}</span>
          </div>
        )}
        
        <div className={`${viewMode === 'list' ? '' : 'mt-auto'} pt-2 flex justify-between items-center`}>
          {/* View result button */}
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleExternalClick}
            className="inline-flex items-center gap-2 text-xs bg-primary/80 
                     hover:bg-primary text-white px-3 py-1.5 rounded-md transition-all
                     duration-200 border border-primary/30 shadow-sm hover:shadow
                     hover:translate-y-[-1px]"
          >
            View result <ExternalLink className="h-3 w-3 ml-1" />
          </a>
          
          <div className="flex items-center gap-2">
            {/* Bookmark button */}
            {onBookmark && (
              <motion.button
                onClick={handleBookmark}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`text-xs flex items-center gap-1 px-2 py-1.5 rounded-md transition-all duration-200
                        border ${isBookmarked 
                          ? 'bg-primary/20 text-primary border-primary/40' 
                          : 'bg-card text-primary/80 hover:text-primary hover:bg-primary/10 border-border'}`}
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
            
            {/* Search engine indicator */}
            {result.engine && (
              <span className="text-xs bg-primary/10 px-2 py-0.5 rounded-full text-primary/90 border border-border">
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
