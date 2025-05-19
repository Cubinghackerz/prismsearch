
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookmarkPlus, X, Trash2, Search, ArrowUpRight, Filter, SortDesc, SortAsc, 
  Calendar, Tag, ExternalLink, Clock 
} from 'lucide-react';
import { SearchResult } from './search/types';
import { formatDistanceToNow } from 'date-fns';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookmarksDrawer = ({ isOpen, onClose }: BookmarksDrawerProps) => {
  const [bookmarks, setBookmarks] = useState<SearchResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  // Load bookmarks from localStorage
  useEffect(() => {
    if (isOpen) {
      const storedBookmarks = localStorage.getItem('prism_bookmarks');
      if (storedBookmarks) {
        try {
          setBookmarks(JSON.parse(storedBookmarks));
        } catch (error) {
          console.error('Error parsing bookmarks:', error);
          toast({
            title: "Error loading bookmarks",
            description: "There was an issue loading your saved searches.",
            variant: "destructive",
          });
        }
      }
    }
  }, [isOpen, toast]);

  // Extract unique categories
  const categories = Array.from(
    new Set(bookmarks.map(bookmark => bookmark.category || 'Uncategorized'))
  );

  // Filter and sort bookmarks
  const filteredBookmarks = bookmarks
    .filter(bookmark => {
      // Filter by search term
      const matchesSearch = searchTerm === '' || 
        bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        bookmark.snippet?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by category
      const matchesCategory = selectedCategory === null || 
        (bookmark.category || 'Uncategorized') === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Sort by selected field
      if (sortBy === 'date') {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });

  // Handle bookmark deletion
  const handleDeleteBookmark = (id: string) => {
    setIsDeleting(id);
    setTimeout(() => {
      const updatedBookmarks = bookmarks.filter(bookmark => bookmark.id !== id);
      setBookmarks(updatedBookmarks);
      localStorage.setItem('prism_bookmarks', JSON.stringify(updatedBookmarks));
      setIsDeleting(null);
      
      toast({
        title: "Bookmark removed",
        description: "The saved result has been removed from your bookmarks.",
        variant: "default",
      });
    }, 300);
  };

  // Clear all bookmarks
  const handleClearAllBookmarks = () => {
    if (window.confirm('Are you sure you want to delete all bookmarks?')) {
      localStorage.removeItem('prism_bookmarks');
      setBookmarks([]);
      toast({
        title: "All bookmarks cleared",
        description: "Your saved searches have been removed.",
        variant: "default",
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full md:w-[500px] lg:w-[600px] bg-[#1A1F2C] border-l border-orange-500/30 
                      shadow-xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-orange-500/20 flex justify-between items-center bg-gradient-to-r from-orange-900/30 to-orange-800/30">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="h-5 w-5 text-orange-400" />
                <h2 className="text-xl font-semibold text-orange-100">Saved Results</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-orange-500/20 text-orange-300 hover:text-orange-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Search and Filters */}
            <div className="p-4 border-b border-orange-500/20 bg-orange-900/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-300" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search your bookmarks..."
                  className="w-full bg-[#1A1F2C]/80 border border-orange-500/30 rounded-lg pl-10 pr-4 py-2 text-orange-100 
                          placeholder:text-orange-300/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {/* Category filters */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-orange-300 flex items-center">
                    <Filter className="h-3 w-3 mr-1" /> Filter:
                  </span>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`text-xs px-2 py-1 rounded-full transition-colors
                            ${selectedCategory === null 
                              ? 'bg-orange-500/30 text-orange-100'
                              : 'bg-orange-500/10 text-orange-200 hover:bg-orange-500/20'}`}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`text-xs px-2 py-1 rounded-full transition-colors
                              ${selectedCategory === category 
                                ? 'bg-orange-500/30 text-orange-100'
                                : 'bg-orange-500/10 text-orange-200 hover:bg-orange-500/20'}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                
                {/* Sort options */}
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-orange-300 flex items-center">
                    {sortOrder === 'asc' ? <SortAsc className="h-3 w-3 mr-1" /> : <SortDesc className="h-3 w-3 mr-1" />}
                    Sort:
                  </span>
                  <button
                    onClick={() => setSortBy('date')}
                    className={`text-xs px-2 py-1 rounded-full transition-colors
                            ${sortBy === 'date'
                              ? 'bg-orange-500/30 text-orange-100'
                              : 'bg-orange-500/10 text-orange-200 hover:bg-orange-500/20'}`}
                  >
                    Date
                  </button>
                  <button
                    onClick={() => setSortBy('title')}
                    className={`text-xs px-2 py-1 rounded-full transition-colors
                            ${sortBy === 'title'
                              ? 'bg-orange-500/30 text-orange-100'
                              : 'bg-orange-500/10 text-orange-200 hover:bg-orange-500/20'}`}
                  >
                    Title
                  </button>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="text-xs p-1 rounded-full bg-orange-500/10 text-orange-300 hover:bg-orange-500/20 transition-colors"
                  >
                    {sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Bookmarks List */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredBookmarks.length === 0 ? (
                <div className="text-center py-10">
                  <BookmarkPlus className="h-12 w-12 mx-auto text-orange-500/30 mb-4" />
                  {bookmarks.length === 0 ? (
                    <p className="text-orange-300/70">You haven't saved any results yet.</p>
                  ) : (
                    <p className="text-orange-300/70">No bookmarks match your current filters.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookmarks.map((bookmark) => (
                    <motion.div
                      key={bookmark.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 rounded-lg border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 
                              transition-all group relative overflow-hidden"
                    >
                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteBookmark(bookmark.id)}
                        disabled={isDeleting === bookmark.id}
                        className="absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 
                                bg-orange-500/10 hover:bg-orange-500/30 text-orange-300 hover:text-orange-100
                                transition-all transform hover:scale-110"
                        aria-label="Delete bookmark"
                      >
                        {isDeleting === bookmark.id ? (
                          <div className="h-4 w-4 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>

                      {/* Metadata */}
                      <div className="flex items-center gap-2 mb-2 text-xs text-orange-300/70">
                        {bookmark.source && (
                          <span className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-orange-500 mr-1"></span>
                            {bookmark.source}
                          </span>
                        )}
                        
                        {bookmark.date && (
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(bookmark.date), { addSuffix: true })}
                          </span>
                        )}
                        
                        {bookmark.category && (
                          <span className="flex items-center ml-auto">
                            <Tag className="h-3 w-3 mr-1" />
                            {bookmark.category}
                          </span>
                        )}
                      </div>
                      
                      {/* Title */}
                      <h3 className="font-medium text-lg text-orange-100 mb-2 line-clamp-2">
                        <a 
                          href={bookmark.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline focus:outline-none focus:ring-2 focus:ring-orange-500/50 rounded-sm"
                        >
                          {bookmark.title}
                        </a>
                      </h3>
                      
                      {/* Snippet */}
                      {bookmark.snippet && (
                        <p className="text-sm text-orange-200/90 mb-3 line-clamp-2">
                          {bookmark.snippet}
                        </p>
                      )}
                      
                      {/* Actions */}
                      <div className="flex justify-between items-center mt-2">
                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs bg-orange-600/60 hover:bg-orange-500
                                  text-white px-3 py-1.5 rounded-md transition-all hover:translate-y-[-1px]"
                        >
                          Visit <ArrowUpRight className="h-3 w-3 ml-1" />
                        </a>
                        
                        <div className="text-xs text-orange-300/70 truncate max-w-[50%]">
                          {new URL(bookmark.url).hostname.replace('www.', '')}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-orange-500/20 bg-orange-900/10 flex justify-between items-center">
              <div className="text-sm text-orange-300/70">
                {filteredBookmarks.length} {filteredBookmarks.length === 1 ? 'result' : 'results'} saved
              </div>
              
              {bookmarks.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleClearAllBookmarks}
                  className="text-xs border-orange-500/30 text-orange-300 hover:bg-orange-500/20 hover:text-orange-100"
                >
                  <Trash2 className="h-3 w-3 mr-1" /> Clear All
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BookmarksDrawer;
