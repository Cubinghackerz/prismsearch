
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookmarkPlus, Search, MessageSquare, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MainNavigationProps {
  onOpenBookmarks: () => void;
  bookmarksCount: number;
  variant?: 'full' | 'compact';
}

const MainNavigation = ({ onOpenBookmarks, bookmarksCount, variant = 'full' }: MainNavigationProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Define navigation items
  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: <Home className="h-4 w-4" />,
      showOnCompact: true,
    },
    {
      name: 'Search',
      path: '/search',
      icon: <Search className="h-4 w-4" />,
      showOnCompact: true,
    },
    {
      name: 'Chat',
      path: '/chat',
      icon: <MessageSquare className="h-4 w-4" />,
      showOnCompact: true,
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {navItems.map((item) => (
        (variant === 'full' || item.showOnCompact) && (
          <Link
            key={item.path}
            to={item.path}
            aria-label={item.name}
            aria-current={currentPath === item.path ? 'page' : undefined}
          >
            <Button
              variant="ghost"
              size="sm"
              className={`relative ${
                currentPath === item.path
                  ? 'bg-orange-500/30 text-orange-50 hover:bg-orange-500/40'
                  : 'text-orange-100 bg-orange-500/10 hover:bg-orange-500/20'
              } transition-all duration-300 focus-visible:ring-2 focus-visible:ring-orange-400`}
            >
              {item.icon}
              {variant === 'full' && <span className="ml-2">{item.name}</span>}
              {currentPath === item.path && (
                <motion.span
                  className="absolute -bottom-[3px] left-0 right-0 h-0.5 bg-orange-400"
                  layoutId="navigation-underline"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Button>
          </Link>
        )
      ))}
      
      <Button 
        variant="ghost" 
        onClick={onOpenBookmarks}
        className="text-orange-100 bg-orange-500/10 hover:bg-orange-500/20 relative focus-visible:ring-2 focus-visible:ring-orange-400"
        size="sm"
        aria-label="Bookmarks"
      >
        <BookmarkPlus className="h-4 w-4" />
        {variant === 'full' && <span className="ml-2">Bookmarks</span>}
        {bookmarksCount > 0 && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 rounded-full text-xs flex items-center justify-center text-white">
            {bookmarksCount}
          </span>
        )}
      </Button>
    </div>
  );
};

export default MainNavigation;
