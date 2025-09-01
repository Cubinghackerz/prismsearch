
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  path: string;
  title: string;
  isActive: boolean;
}

const WorkspaceTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [nextId, setNextId] = useState(1);

  const getPageTitle = (path: string) => {
    const titles: Record<string, string> = {
      '/': 'Home',
      '/deep-search': 'Deep Search',
      '/vault': 'Vault',
      '/math': 'Math',
      '/physics': 'Physics',
      '/chemistry': 'Chemistry',
      '/code': 'Code',
      '/graphing': 'Graphing',
      '/docs': 'Documents',
      '/chat': 'Chat',
    };
    return titles[path] || 'Prism';
  };

  useEffect(() => {
    const currentPath = location.pathname;
    const existingTab = tabs.find(tab => tab.path === currentPath);
    
    if (!existingTab) {
      const newTab: Tab = {
        id: `tab-${nextId}`,
        path: currentPath,
        title: getPageTitle(currentPath),
        isActive: true,
      };
      
      setTabs(prev => [
        ...prev.map(tab => ({ ...tab, isActive: false })),
        newTab,
      ]);
      setNextId(prev => prev + 1);
    } else {
      setTabs(prev => prev.map(tab => ({
        ...tab,
        isActive: tab.path === currentPath,
      })));
    }
  }, [location.pathname]);

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const tabToClose = tabs.find(tab => tab.id === tabId);
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    
    if (tabToClose?.isActive && newTabs.length > 0) {
      const nextActiveTab = newTabs[newTabs.length - 1];
      navigate(nextActiveTab.path);
    } else if (newTabs.length === 0) {
      navigate('/');
    }
    
    setTabs(newTabs);
  };

  const switchTab = (path: string) => {
    navigate(path);
  };

  if (tabs.length === 0) return null;

  return (
    <div className="flex items-center bg-muted/30 border-b border-border px-2 py-1 min-h-[40px]">
      <div className="flex items-center space-x-1 flex-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => switchTab(tab.path)}
            className={cn(
              "flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              "hover:bg-accent/50 group relative min-w-0",
              tab.isActive
                ? "bg-background text-foreground border border-border shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="truncate max-w-32">{tab.title}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive"
              onClick={(e) => closeTab(tab.id, e)}
            >
              <X className="h-3 w-3" />
            </Button>
          </button>
        ))}
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 ml-2 shrink-0"
        onClick={() => navigate('/')}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default WorkspaceTabs;
