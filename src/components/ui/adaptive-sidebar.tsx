
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  MessageSquare, 
  Search, 
  Shield, 
  Calculator, 
  Code2, 
  Atom, 
  Beaker, 
  Zap, 
  FileText,
  Home,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  category: 'primary' | 'tools' | 'creative';
}

const AdaptiveSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>('primary');
  const location = useLocation();

  const navItems: NavItem[] = [
    { name: 'Home', href: '/', icon: Home, category: 'primary' },
    { name: 'Deep Search', href: '/deep-search', icon: Search, category: 'primary', badge: '2.0' },
    { name: 'Chat', href: '/chat', icon: MessageSquare, category: 'primary' },
    { name: 'Vault', href: '/vault', icon: Shield, category: 'primary', badge: 'Pro' },
    { name: 'Math Suite', href: '/math', icon: Calculator, category: 'tools', badge: 'Pro' },
    { name: 'Physics Lab', href: '/physics', icon: Atom, category: 'tools' },
    { name: 'Chemistry Lab', href: '/chemistry', icon: Beaker, category: 'tools', badge: 'Advanced' },
    { name: 'Code Editor', href: '/code', icon: Code2, category: 'tools' },
    { name: 'Graphing', href: '/graphing', icon: Zap, category: 'tools' },
    { name: 'Documents', href: '/docs', icon: FileText, category: 'creative' },
  ];

  const categories = {
    primary: navItems.filter(item => item.category === 'primary'),
    tools: navItems.filter(item => item.category === 'tools'),
    creative: navItems.filter(item => item.category === 'creative'),
  };

  const isActive = (path: string) => location.pathname === path;

  const getCategoryItems = () => {
    if (!activeCategory) return [];
    return categories[activeCategory as keyof typeof categories] || [];
  };

  return (
    <TooltipProvider>
      <div className={cn(
        "flex flex-col h-full bg-card border-r border-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" 
                alt="Prism Logo" 
                className="h-6 w-6"
              />
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Prism 2.0
              </span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Category Selector */}
        {!isCollapsed && (
          <div className="p-2 border-b border-border">
            <div className="flex space-x-1">
              {Object.keys(categories).map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                  className="text-xs capitalize flex-1"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {(isCollapsed ? navItems.filter(item => item.category === 'primary') : getCategoryItems()).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              const navButton = (
                <Button
                  key={item.href}
                  variant={active ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-10",
                    isCollapsed ? "px-2" : "px-3",
                    active && "bg-accent text-accent-foreground font-medium"
                  )}
                  asChild
                >
                  <Link to={item.href}>
                    <Icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.name}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Link>
                </Button>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      {navButton}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <div className="flex items-center space-x-2">
                        <span>{item.name}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return navButton;
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => {/* Add settings handler */}}
          >
            <MoreHorizontal className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
            {!isCollapsed && "More Options"}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AdaptiveSidebar;
